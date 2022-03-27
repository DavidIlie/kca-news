import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

import prisma from "../../../../lib/prisma";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
   const { id } = req.query;

   const session = await getSession({ req });

   if (!session) return res.status(401).json({ message: "not authenticated" });

   const article = await prisma.article.findFirst({
      where: { id: id as string },
   });

   if (!article) return res.status(404).json({ message: "article not found" });

   if (!article.published)
      return res
         .status(400)
         .json({ message: "this article has not been published yet." });

   const downvoteCheck = await prisma.downvote.findFirst({
      where: { articleId: article.id, votedBy: session?.user?.id },
   });

   if (downvoteCheck) {
      await prisma.downvote.delete({ where: { id: downvoteCheck.id } });
   } else {
      const upvoteCheck = await prisma.upvote.findFirst({
         where: { articleId: article.id, votedBy: session?.user?.id },
      });
      if (upvoteCheck)
         await prisma.upvote.delete({ where: { id: upvoteCheck.id } });

      await prisma.downvote.create({
         data: {
            articleId: article.id,
            votedBy: session?.user!.id,
         },
      });
   }

   return res.status(200).json({ message: "ok" });
};

export default handler;
