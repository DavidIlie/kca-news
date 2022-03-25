import React, { useState } from "react";
import { GetServerSideProps } from "next";
import { DefaultSeo } from "next-seo";
import { getSession } from "next-auth/react";
import { AiOutlineCloseCircle, AiOutlineMenu } from "react-icons/ai";

import prisma from "../../../../lib/prisma";
import { Article } from "../../../../types/Article";
import { User } from "../../../../types/User";
import { Button } from "../../../../ui/Button";
import EditorSettingsDisclosure from "../../../../components/EditorSettingsDisclosure";

interface Props {
   user: User;
   article: Article;
}

const ArticleEditor: React.FC<Props> = ({ user, article }) => {
   const [openSidebar, setOpenSidebar] = useState<boolean>(true);

   return (
      <>
         <DefaultSeo title={article.title} />
         <div className="mt-[5.4rem] flex flex-grow">
            <div className={`h-full ${openSidebar ? "w-4/5" : "w-full"}`}></div>
            {!openSidebar && (
               <AiOutlineMenu
                  className="absolute right-0 top-0 mt-24 mr-5 cursor-pointer rounded-full border-2 border-gray-100 bg-gray-50 p-2 text-[3rem] duration-150 hover:bg-gray-100"
                  title="Open Settings"
                  onClick={() => setOpenSidebar(true)}
               />
            )}
            <div
               className={`h-full ${
                  openSidebar ? "w-1/5" : "hidden"
               } relative border-l-2 py-4`}
            >
               <div className="flex items-center justify-between gap-2 border-b-2 px-4 pb-4">
                  <h1 className="text-2xl font-semibold">Settings</h1>
                  <AiOutlineCloseCircle
                     size="25"
                     className="mt-1 cursor-pointer duration-150 hover:text-blue-600"
                     title="Close"
                     onClick={() => setOpenSidebar(false)}
                  />
               </div>
               <EditorSettingsDisclosure name="Status & Visibility">
                  <h1>yo</h1>
               </EditorSettingsDisclosure>
               <EditorSettingsDisclosure name="Description">
                  <h1>yo</h1>
               </EditorSettingsDisclosure>
               <EditorSettingsDisclosure name="Categories">
                  <h1>yo</h1>
               </EditorSettingsDisclosure>
               <EditorSettingsDisclosure name="Filter">
                  <h1>yo</h1>
               </EditorSettingsDisclosure>
               <EditorSettingsDisclosure name="Misc">
                  <h1>yo</h1>
               </EditorSettingsDisclosure>
               <div className="absolute bottom-0 w-full px-2 py-4">
                  <Button className="w-full" disabled>
                     Save
                  </Button>
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
