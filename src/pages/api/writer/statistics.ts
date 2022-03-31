import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

import prisma from "../../../lib/prisma";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
   try {
      const session = await getSession({ req });

      if (
         !session ||
         (session?.user?.isAdmin ? false : !session?.user?.isWriter)
      )
         return res.status(401).json({ message: "not authenticated" });

      const totalArticles = session?.user?.isAdmin
         ? await prisma.article.count()
         : await prisma.article.count({
              where: { user: session?.user?.id },
           });

      const publishedArticles = session?.user?.isAdmin
         ? await prisma.article.count({ where: { published: true } })
         : await prisma.article.count({
              where: { published: true, user: session?.user?.id },
           });

      const totalComments = await prisma.comment.count();
      const totalUpvotes = await prisma.upvote.count();
      const totalDownvotes = await prisma.downvote.count();

      return res.json({
         statistics: {
            totalArticles,
            publishedArticles,
            totalComments,
            totalUpvotes,
            totalDownvotes,
         },
      });
   } catch (error: any) {
      return res.status(400).json({ message: error.message });
   }
};

export default handler;
