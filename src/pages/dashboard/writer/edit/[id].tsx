import React, { useState } from "react";
import { GetServerSideProps } from "next";
import { DefaultSeo } from "next-seo";
import { getSession } from "next-auth/react";
import {
   AiOutlineClose,
   AiOutlineCloseCircle,
   AiOutlineMenu,
} from "react-icons/ai";
import { RiRestartLine } from "react-icons/ri";
import ContentEditable from "react-contenteditable";
import { useNotifications } from "@mantine/notifications";
import { useLocalStorage } from "@mantine/hooks";
import {
   MultiSelect,
   TextInput,
   Tooltip,
   LoadingOverlay,
   Textarea,
} from "@mantine/core";

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
import Radio from "../../../../ui/Radio";
import ArticleUnderReviewCard from "../../../../components/ArticleUnderReviewCard";
import ConfirmModal from "../../../../ui/ConfirmModal";

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
   const [loadingContentUpdate, setLoadingContentUpdate] =
      useState<boolean>(false);
   const [loadingRest, setLoadingRest] = useState<boolean>(false);
   const [openConfirmModalUnderReview, setOpenConfirmModalUnderReview] =
      useState<boolean>(false);

   const notifications = useNotifications();

   const canSave =
      article.title !== title ||
      article.description !== description ||
      hasEditedMarkdown;

   const canSaveRest =
      JSON.stringify(categories) !== JSON.stringify(article.categoryId) &&
      categories.length !== 0;

   const handleEdit = async () => {
      console.log("updating content...");
      setLoadingContentUpdate(true);

      const r = await fetch(`/api/article/${article.id}/update/content`, {
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
         setArticle(response.article);
         if (hasEditedMarkdown) setHasEditedMarkdown(false);
      } else {
         notifications.showNotification({
            color: "red",
            title: "Edit - Error",
            message: response.message || "Unknown Error",
            icon: <AiOutlineClose />,
            autoClose: 5000,
         });
      }

      setLoadingContentUpdate(false);
   };

   const handleSetUnderReview = async () => {
      if (article.underReview && !user.isAdmin) return;
      setLoadingRest(true);

      const r = await fetch(`/api/article/${article.id}/update/underReview`, {
         credentials: "include",
      });
      const response = await r.json();

      if (r.status === 200) {
         setArticle(response.article);
      } else {
         notifications.showNotification({
            color: "red",
            title: "Under Review - Error",
            message: response.message || "Unknown Error",
            icon: <AiOutlineClose />,
            autoClose: 5000,
         });
      }
      setLoadingRest(false);
   };

   const handleUpdateRest = async () => {
      setLoadingRest(true);

      const r = await fetch(`/api/article/${article.id}/update/rest`, {
         method: "POST",
         credentials: "include",
         body: JSON.stringify({
            categories,
         }),
      });
      const response = await r.json();

      if (r.status === 200) {
         setArticle(response.article);
      } else {
         notifications.showNotification({
            color: "red",
            title: "Edit - Error",
            message: response.message || "Unknown Error",
            icon: <AiOutlineClose />,
            autoClose: 5000,
         });
      }

      setLoadingRest(false);
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
               <LoadingOverlay visible={loadingContentUpdate} />
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
                     disabled={!canSave ? !canSaveRest : false}
                     onClick={() => {
                        if (canSave) {
                           if (canSave && canSaveRest) {
                              handleEdit();
                              handleUpdateRest();
                           }
                           handleEdit();
                        } else {
                           handleUpdateRest();
                        }
                     }}
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
               <LoadingOverlay visible={loadingRest && !loadingContentUpdate} />
               <div className="flex items-center justify-between gap-2 border-b-2 px-4 pb-4">
                  <h1 className="text-2xl font-semibold">Settings</h1>
                  <AiOutlineCloseCircle
                     size="25"
                     className="mt-1 cursor-pointer duration-150 hover:text-blue-600"
                     title="Close"
                     onClick={() => setOpenSidebar(false)}
                  />
               </div>
               <EditorSettingsDisclosure name="Visibility">
                  <TextInput
                     label="Title"
                     onChange={(e) => setTitle(e.currentTarget.value)}
                     value={title}
                     required
                  />
                  <div className="mt-2 flex justify-between text-left">
                     <h1 className="font-semibold">Status:</h1>
                     <h1 className="text-blue-500">
                        {article.published
                           ? "Published"
                           : article.underReview
                           ? "Under Review"
                           : "Not published"}
                     </h1>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                     <Tooltip
                        label="Places article under review to be moderated by an administrator. This cannot be undone by you once changed."
                        wrapLines
                        width={220}
                        withArrow
                        transition="fade"
                        transitionDuration={200}
                        disabled={article.underReview || user.isAdmin}
                     >
                        <Radio
                           label="Pending review"
                           checked={article.underReview}
                           labelSize="md"
                           disabled={article.underReview && !user.isAdmin}
                           onChange={() => {
                              if (!user.isAdmin) {
                                 setOpenConfirmModalUnderReview(
                                    !openConfirmModalUnderReview
                                 );
                              } else {
                                 handleSetUnderReview();
                              }
                           }}
                        />
                     </Tooltip>
                     {article.underReview && !user.isAdmin && (
                        <ArticleUnderReviewCard />
                     )}
                  </div>
                  {user.isAdmin && (
                     <div className="mt-2 flex items-center gap-2">
                        <Radio
                           label="Publish"
                           labelSize="md"
                           checked={article.published}
                           disabled={
                              article.underReview ||
                              article.categoryId.length === 0
                           }
                           labelDisabled={
                              article.underReview ||
                              article.categoryId.length === 0
                           }
                           onChange={async () => {
                              setLoadingRest(true);

                              const r = await fetch(
                                 `/api/article/${article.id}/update/publish`,
                                 {
                                    credentials: "include",
                                 }
                              );
                              const response = await r.json();

                              if (r.status === 200) {
                                 setArticle(response.article);
                              } else {
                                 notifications.showNotification({
                                    color: "red",
                                    title: "Publish - Error",
                                    message:
                                       response.message || "Unknown Error",
                                    icon: <AiOutlineClose />,
                                    autoClose: 5000,
                                 });
                              }

                              setLoadingRest(false);
                           }}
                        />
                     </div>
                  )}
                  <Button
                     color="secondary"
                     className="mt-3 -ml-1 w-full"
                     disabled={article.underReview || article.published}
                  >
                     Delete
                  </Button>
               </EditorSettingsDisclosure>
               <EditorSettingsDisclosure
                  name="Description"
                  warning={description === ""}
               >
                  {description === "" && (
                     <h1 className="-mt-2 mb-2 px-1 font-medium text-red-500">
                        You need a description in order to publish
                     </h1>
                  )}
                  <Textarea
                     placeholder="Description"
                     required
                     onChange={(e) => setDescription(e.currentTarget.value)}
                     value={description}
                     minRows={4}
                     maxRows={8}
                  />
               </EditorSettingsDisclosure>
               <EditorSettingsDisclosure
                  name="Categories"
                  warning={categories.length === 0}
               >
                  {categories.length === 0 && (
                     <h1 className="-mt-2 mb-2 px-1 font-medium text-red-500">
                        At least one category is needed to publish.
                     </h1>
                  )}
                  <MultiSelect
                     data={links.map((l) => {
                        return { value: l.id, label: l.name.toLowerCase() };
                     })}
                     placeholder="Pick all the appropiate categories"
                     onChange={setCategories}
                     value={categories}
                     searchable
                     nothingFound="Nothing found"
                     clearable
                     maxDropdownHeight={160}
                  />
               </EditorSettingsDisclosure>
               <EditorSettingsDisclosure name="Filter">
                  <h1>yo</h1>
               </EditorSettingsDisclosure>
               <EditorSettingsDisclosure name="Cover">
                  <h1>yo</h1>
               </EditorSettingsDisclosure>
               <div className="absolute bottom-0 w-full px-2 py-4">
                  <Button
                     className="w-full"
                     disabled={!canSave ? !canSaveRest : false}
                     onClick={() => {
                        if (canSave) {
                           if (canSave && canSaveRest) {
                              handleEdit();
                              handleUpdateRest();
                           }
                           handleEdit();
                        } else {
                           handleUpdateRest();
                        }
                     }}
                  >
                     Save
                  </Button>
               </div>
            </div>
         </div>
         <ConfirmModal
            isOpen={openConfirmModalUnderReview}
            successFunction={handleSetUnderReview}
            updateModalState={() =>
               setOpenConfirmModalUnderReview(!openConfirmModalUnderReview)
            }
         />
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
