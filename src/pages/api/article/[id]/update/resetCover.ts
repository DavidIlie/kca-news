import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { getObjectsByMetadata, minioClient } from "../../../../../lib/minio";

import prisma from "../../../../../lib/prisma";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
   const session = await getSession({ req });

   if (!session || !session?.user?.isAdmin)
      return res.status(401).json({ message: "not authenticated" });

   const { id } = req.query;

   const article = session?.user?.isAdmin
      ? await prisma.article.findFirst({
           where: {
              id: id as string,
           },
        })
      : await prisma.article.findFirst({
           where: { id: id as string, user: session?.user?.id },
        });

   if (!article) return res.status(404).json({ message: "article not found" });

   const objects = await getObjectsByMetadata("news-covers", {
      "X-Amz-Meta-Article": article.id,
   });

   let names = [] as Array<string>;
   objects.forEach((object) => names.push(object.name));
   await minioClient.removeObjects("news-covers", names);

   const newArticle = await prisma.article.update({
      where: { id: article.id },
      data: {
         cover: "https://cdn.davidilie.com/kca-news/kings-alicante-1.jpg",
      },
      include: {
         writer: true,
         coWriters: true,
      },
   });

   return res.json({ article: newArticle });
};

export default handler;
