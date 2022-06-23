import { Article } from "@/types/Article";

export const createArticleUrl = (article: Article): string => {
   const date = new Date(article.createdAt).toISOString().split("-");
   return `/article/${date[0]}/${date[1]}/${
      article.published ? article.slug : article.id
   }`;
};
