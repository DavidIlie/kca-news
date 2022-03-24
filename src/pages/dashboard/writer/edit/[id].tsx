import React from "react";
import { GetServerSideProps } from "next";
import { DefaultSeo } from "next-seo";
import { getSession } from "next-auth/react";

import prisma from "../../../../lib/prisma";
import { Article } from "../../../../types/Article";
import { User } from "../../../../types/User";

interface Props {
   user: User;
   article: Article;
}

const ArticleEditor: React.FC<Props> = ({ user, article }) => {
   return (
      <>
         <DefaultSeo title={article.title} />
         <div className="flex min-h-screen">
            <div className="h-full w-4/5 bg-gray-500"></div>
            <div className="h-full w-1/5 bg-blue-500"></div>
         </div>
      </>
   );
};

export const getServerSideProps: GetServerSideProps = async ({
   query,
   req,
}) => {
   const { id } = query;
   const session = await getSession({ req });

   if (!session || session?.user?.isAdmin ? false : !session?.user?.isWriter)
      return {
         redirect: {
            destination: "/",
            permanent: false,
         },
      };

   const article = session?.user?.isAdmin
      ? await prisma.article.findFirst({
           where: {
              id: id as string,
           },
        })
      : await prisma.article.findFirst({
           where: { id: id as string, user: session?.user?.id },
        });

   if (!article)
      return {
         redirect: {
            destination: "/dashboard/writer",
            permanent: false,
         },
      };

   return {
      props: {
         user: session?.user,
         article: JSON.parse(JSON.stringify(article)),
      },
   };
};

export default ArticleEditor;
