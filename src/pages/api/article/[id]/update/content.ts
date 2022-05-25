import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

import prisma from "../../../../../lib/prisma";
import { updateArticleSchema } from "../../../../../schema/article";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
   try {
      const session = await getSession({ req });

      if (
         !session ||
         (session?.user?.isAdmin || session?.user?.isEditorial
            ? false
            : !session?.user?.isWriter)
      )
         return res.status(401).json({ message: "not authenticated" });

      const { id } = req.query;

      const article =
         session?.user?.isAdmin || session?.user?.isEditorial
            ? await prisma.article.findFirst({
                 where: {
                    id: id as string,
                 },
              })
            : await prisma.article.findFirst({
                 where: { id: id as string, user: session?.user?.id },
              });

      if (!article)
         return res.status(404).json({ message: "article not found" });

      const body = await updateArticleSchema.validate(req.body);

      const newArticle = await prisma.article.update({
         where: { id: article.id },
         data: {
            title: body.title,
            description: body.description,
            mdx: body.content,
            published:
               session?.user?.isAdmin || session?.user?.isEditorial
                  ? article.published
                  : false,
            underReview:
               session?.user?.isAdmin || session?.user?.isEditorial
                  ? article.underReview
                  : article.published
                  ? true
                  : false,
         },
         include: {
            writer: true,
            coWriters: true,
         },
      });

      return res.status(200).json({ article: newArticle });
   } catch (error: any) {
      return res.status(400).json({ message: error.message });
   }
};

export default handler;
