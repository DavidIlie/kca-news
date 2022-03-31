import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { getObjectsByMetadata, minioClient } from "../../../../lib/minio";

import prisma from "../../../../lib/prisma";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
   const session = await getSession({ req });

   if (!session || (session?.user?.isAdmin ? false : !session?.user?.isWriter))
      return res.status(401).json({ message: "not authenticated" });

   const { id } = req.query;

   const article = await prisma.article.findFirst({
      where: { id: id as string },
   });

   if (!article) return res.status(404).json({ message: "article not found" });

   if (article.underReview || article.published)
      return res.status(405).json({
         message: "can't delete an article which is published or under review",
      });

   try {
      const objects = await getObjectsByMetadata("article-image", {
         "X-Amz-Meta-Article": article.id,
      });

      let names = [] as Array<string>;
      objects.forEach((object) => names.push(object.name));
      await minioClient.removeObjects("article-image", names);
   } catch (error) {
      return res
         .status(503)
         .json({ message: "failed to remove uploaded images" });
   }

   await prisma.article.delete({ where: { id: article.id } });

   return res.status(200).json({ message: "ok" });
};

export default handler;
