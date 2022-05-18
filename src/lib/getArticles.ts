import { User } from "../types/User";
import prisma from "./prisma";
import { Article } from "../types/Article";

export const getArticles = async (
   user?: User,
   where?: any,
   include?: any,
   extra?: any
): Promise<Article[]> => {
   const includeValues = {
      writer: true,
      ...include,
   };

   return user?.isAdmin
      ? JSON.parse(
           JSON.stringify(
              await prisma.article.findMany({
                 where: { ...where },
                 orderBy: {
                    createdAt: "desc",
                 },
                 ...extra,
                 include: includeValues as any,
              })
           )
        )
      : user?.isReviewer
      ? JSON.parse(
           JSON.stringify(
              await prisma.article.findMany({
                 where: { location: { in: user?.department }, ...where },
                 orderBy: {
                    createdAt: "desc",
                 },
                 ...extra,
                 include: includeValues as any,
              })
           )
        )
      : user?.isWriter
      ? JSON.parse(
           JSON.stringify(
              await prisma.article.findMany({
                 where: {
                    OR: [{ user: user?.id }, { published: true }],
                    ...where,
                 },
                 orderBy: {
                    createdAt: "desc",
                 },
                 ...extra,
                 include: includeValues as any,
              })
           )
        )
      : JSON.parse(
           JSON.stringify(
              await prisma.article.findMany({
                 where: { published: true, underReview: false, ...where },
                 orderBy: {
                    createdAt: "desc",
                 },
                 ...extra,
                 include: includeValues as any,
              })
           )
        );
};
