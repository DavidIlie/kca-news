import React from "react";
import { GetServerSideProps } from "next";
import { DefaultSeo } from "next-seo";
import { getSession } from "next-auth/react";

import prisma from "../../../../lib/prisma";
import { Article } from "../../../../types/Article";

interface Props {
   article: Article;
}

const ArticleEditor: React.FC<Props> = ({ article }) => {
   return (
      <>
         <DefaultSeo title={article.title} />
         <div className="flex">
            <div className="h-full w-2/3 bg-gray-500"></div>
            <div className="h-full w-1/3 bg-blue-500"></div>
         </div>
      </>
   );
};

export const getServerSideProps: GetServerSideProps = async ({
   query,
   req,
}) => {
   const session = await getSession({ req });

   if (!session || session?.user?.isAdmin ? false : !session?.user?.isWriter)
      return {
         redirect: {
            destination: "/",
            permanent: false,
         },
      };

   const article = await prisma.article.findFirst({ where: {} });
};

export default ArticleEditor;
