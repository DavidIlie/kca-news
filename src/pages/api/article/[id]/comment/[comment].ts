import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

import prisma from "@/lib/prisma";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
   if (req.method !== "DELETE")
      return res.status(400).json({ message: "wrong method" });

   const { id, comment } = req.query;

   const session = await getSession({ req });

   if (!session) return res.status(401).json({ message: "not authenticated" });

   const article = await prisma.article.findFirst({
      where: { id: id as string },
   });

   if (!article) return res.status(404).json({ message: "article not found" });

   if (!article.published)
      return res
         .status(404)
         .json({ message: "this article has not been published yet." });

   const commentCheck = session?.user?.isAdmin
      ? await prisma.comment.findFirst({
           where: { articleId: article.id, id: comment as string },
        })
      : await prisma.comment.findFirst({
           where: {
              articleId: article.id,
              id: comment as string,
              userId: session!.user!.id,
           },
        });
   if (!commentCheck)
      return res.status(404).json({ message: "comment not found" });

   await prisma.comment.delete({ where: { id: commentCheck.id } });

   return res.json({ message: "ok" });
};

export default handler;
