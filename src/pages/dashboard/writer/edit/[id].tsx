import React, { useState } from "react";
import { GetServerSideProps } from "next";
import { DefaultSeo } from "next-seo";
import { getSession } from "next-auth/react";
import {
   AiOutlineCheck,
   AiOutlineClose,
   AiOutlineCloseCircle,
   AiOutlineMenu,
} from "react-icons/ai";
import { RiRestartLine } from "react-icons/ri";
import ContentEditable from "react-contenteditable";
import { useNotifications } from "@mantine/notifications";
import { useLocalStorage } from "@mantine/hooks";
import { MultiSelect } from "@mantine/core";

//@ts-ignore
import MarkdownIt from "markdown-it";

import prisma from "../../../../lib/prisma";
import { Article } from "../../../../types/Article";
import { User } from "../../../../types/User";
import { Button } from "../../../../ui/Button";
import EditorSettingsDisclosure from "../../../../components/EditorSettingsDisclosure";
import ArticleBadge from "../../../../components/ArticleBadge";
import RichTextEditor from "../../../../components/RichTextEditor";
import { links } from "../../../../lib/categories";

interface Props {
   user: User;
   articleServer: Article;
   html: string;
}

const ArticleEditor: React.FC<Props> = ({ user, articleServer, html }) => {
   const [openSidebar, setOpenSidebar] = useLocalStorage<boolean>({
      key: "editorOpenSidebar",
      defaultValue: true,
   });

   const [article, setArticle] = useState<Article>(articleServer);
   const [categories, setCategories] = useState<string[]>(article.categoryId);
   const [title, setTitle] = useState<string>(article.title);
   const [description, setDescription] = useState<string>(article.description);
   const [markdownValue, changeMarkdownValue] = useState<string>(html);
   const [hasEditedMarkdown, setHasEditedMarkdown] = useState<boolean>(false);
   const [loading, setLoading] = useState<boolean>(false);

   const notifications = useNotifications();

   const canSave =
      article.title !== title ||
      article.description !== description ||
      hasEditedMarkdown;

   const handleEdit = async () => {
      setLoading(true);

      const id = notifications.showNotification({
         loading: true,
         title: "Edit",
         message: "Processing your request...",
         autoClose: false,
         disallowClose: true,
      });

      const r = await fetch(`/api/article/${article.id}/update`, {
         method: "POST",
         credentials: "include",
         body: JSON.stringify({
            title,
            description,
            content: markdownValue,
         }),
      });
      const response = await r.json();

      if (r.status === 200) {
         notifications.updateNotification(id, {
            id,
            color: "teal",
            title: "Edit",
            message: "Updated successfully!",
            icon: <AiOutlineCheck />,
            autoClose: 2000,
         });
         setArticle(response.newArticle);
      } else {
         notifications.updateNotification(id, {
            id,
            color: "red",
            title: "Edit - Error",
            message: response.message || "Unknown Error",
            icon: <AiOutlineClose />,
            autoClose: 5000,
         });
      }

      setLoading(false);
   };

   return (
      <>
         <DefaultSeo title={title} />
         <div className="mt-[5.4rem] flex flex-grow">
            <div
               className={`container mx-auto h-full max-w-4xl pt-16 ${
                  openSidebar ? "w-4/5" : "w-full"
               }`}
            >
               <div className="border-b-2 pb-4">
                  <div className="mb-2 flex w-full flex-wrap justify-start">
                     {categories.map((category, index) => (
                        <ArticleBadge tag={category} key={index} />
                     ))}
                     {categories.length === 0 && (
                        <div className="invisible">
                           <ArticleBadge tag="i love surds" />
                        </div>
                     )}
                  </div>
                  {title !== article.title && (
                     <RiRestartLine
                        className="absolute -ml-10 mt-[0.9rem] cursor-pointer text-2xl"
                        onClick={() => {
                           setTitle(article.title);
                        }}
                     />
                  )}
                  <ContentEditable
                     tagName="h1"
                     className="text-4xl font-semibold"
                     html={title}
                     onChange={(e) => setTitle(e.target.value)}
                  />
               </div>
               {description !== article.description && (
                  <RiRestartLine
                     className="absolute -ml-10 mt-5 cursor-pointer text-2xl"
                     onClick={() => {
                        setDescription(article.description);
                     }}
                  />
               )}
               <ContentEditable
                  tagName="p"
                  className="mt-4 text-justify"
                  html={description}
                  onChange={(e) => setDescription(e.target.value)}
               />
               {!openSidebar && (
                  <AiOutlineMenu
                     className="absolute right-0 top-0 mt-24 mr-5 cursor-pointer rounded-full border-2 border-gray-100 bg-gray-50 p-2 text-[3rem] duration-150 hover:bg-gray-100"
                     title="Open Settings"
                     onClick={() => setOpenSidebar(true)}
                  />
               )}
               <div className="mt-4" />
               <RichTextEditor
                  value={markdownValue}
                  onChange={changeMarkdownValue}
                  onFocus={() => {
                     setHasEditedMarkdown(true);
                  }}
               />
               <div className="mt-4 border-t-2 pt-4">
                  <Button
                     className="w-full"
                     disabled={!canSave || loading}
                     loading={loading}
                     onClick={handleEdit}
                  >
                     Save
                  </Button>
               </div>
            </div>
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
               <EditorSettingsDisclosure
                  name="Categories"
                  warning={categories.length === 0}
               >
                  {categories.length === 0 && (
                     <h1 className="-mt-2 mb-2 px-1 font-medium">
                        At least one category is needed to publish.
                     </h1>
                  )}
                  <MultiSelect
                     data={links.map((l) => {
                        return { value: l.id, label: l.name };
                     })}
                     placeholder="Pick all the appropiate categories"
                     onChange={setCategories}
                     value={categories}
                  />
               </EditorSettingsDisclosure>
               <EditorSettingsDisclosure name="Filter">
                  <h1>yo</h1>
               </EditorSettingsDisclosure>
               <EditorSettingsDisclosure name="Cover">
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

   const markdown: MarkdownIt = MarkdownIt({
      html: true,
   });
   const html = await markdown.render(article.mdx);

   return {
      props: {
         user: session?.user,
         articleServer: JSON.parse(JSON.stringify(article)),
         html,
      },
   };
};

export default ArticleEditor;
