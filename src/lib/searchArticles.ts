import { Article } from "../types/Article";
import { User } from "../types/User";
import prisma from "./prisma";

export const searchArticles = async (
   q: string | string[],
   user?: User
): Promise<Article[]> => {
   const extraWhere = user?.isAdmin
      ? {}
      : user?.isWriter
      ? { user: user.id }
      : { underReview: false, published: true };

   return JSON.parse(
      JSON.stringify(
         await prisma.article.findMany({
            where: {
               title: {
                  contains: q as string,
                  mode: "insensitive",
               },
               ...extraWhere,
            },
            include: {
               writer: true,
            },
            orderBy: [
               {
                  createdAt: "desc",
               },
            ],
         })
      )
   ) as any as Article[];
};
