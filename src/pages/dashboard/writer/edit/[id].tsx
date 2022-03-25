import React, { useState } from "react";
import { GetServerSideProps } from "next";
import { DefaultSeo } from "next-seo";
import { getSession } from "next-auth/react";
import { AiOutlineCloseCircle, AiOutlineMenu } from "react-icons/ai";

import prisma from "../../../../lib/prisma";
import { Article } from "../../../../types/Article";
import { User } from "../../../../types/User";

interface Props {
   user: User;
   article: Article;
}

const ArticleEditor: React.FC<Props> = ({ user, article }) => {
   const [openSidebar, setOpenSidebar] = useState<boolean>(true);

   return (
      <>
         <DefaultSeo title={article.title} />
         <div className="mt-[5.5rem] flex flex-grow">
            <div className={`h-full ${openSidebar ? "w-4/5" : "w-full"}`}></div>
            {!openSidebar && (
               <AiOutlineMenu
                  className="absolute right-0 top-0 mt-24 mr-5 cursor-pointer rounded-full border-2 border-gray-100 bg-gray-50 p-2 text-5xl duration-150 hover:bg-gray-100"
                  title="Open Menu"
                  onClick={() => setOpenSidebar(true)}
               />
            )}
            <div
               className={`h-full ${
                  openSidebar ? "w-1/5" : "hidden"
               } border-l-2 py-3`}
            >
               <div className="flex items-center justify-center gap-2 border-b-2 pb-3">
                  <h1 className="text-2xl font-semibold">Settings</h1>
                  <AiOutlineCloseCircle
                     size="25"
                     className="mt-1 cursor-pointer duration-150 hover:text-blue-600"
                     title="Close"
                     onClick={() => setOpenSidebar(false)}
                  />
               </div>
            </div>
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
