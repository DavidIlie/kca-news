import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

import prisma from "../../../../../lib/prisma";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
   const session = await getSession({ req });

   if (!session || session?.user?.isAdmin ? false : !session?.user?.isWriter)
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

   if (article.underReview && !session?.user?.isAdmin)
      return res.status(401).json({ message: "no permission to update" });

   const newArticle = await prisma.article.update({
      where: { id: article.id },
      data: {
         underReview: !article.underReview,
         published: !article.underReview
            ? article.published
               ? false
               : false
            : article.published,
      },
      include: {
         writer: true,
      },
   });

   return res.json({ article: newArticle });
};

export default handler;
