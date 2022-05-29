import { User } from "../types/User";
import prisma from "./prisma";
import { Article } from "../types/Article";

export const getArticles = async (
   user?: User,
   where?: any,
   extra?: any,
   excludeContent = false,
   select?: any
): Promise<Article[]> => {
   const defaultSelect = {
      categoryId: true,
      createdAt: true,
      title: true,
      description: true,
      cover: true,
      tags: true,
      id: true,
      slug: true,
      published: true,
      ...select,
   };

   const extraData = excludeContent
      ? {
           select: {
              writer: true,
              mdx: false,
              ...defaultSelect,
           },
           ...extra,
        }
      : {
           select: {
              writer: true,
              mdx: false,
              ...defaultSelect,
           },
           ...extra,
        };

   return user?.isAdmin
      ? JSON.parse(
           JSON.stringify(
              await prisma.article.findMany({
                 where: { ...where },
                 orderBy: {
                    createdAt: "desc",
                 },
                 ...extraData,
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
                 ...extraData,
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
                 ...extraData,
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
                 ...extraData,
              })
           )
        );
};
