import React, { useState } from "react";
import { GetServerSideProps } from "next";
import Image from "next/image";
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
import {
   useLocalStorage,
   useElementSize,
   useViewportSize,
} from "@mantine/hooks";
import {
   MultiSelect,
   TextInput,
   Tooltip,
   LoadingOverlay,
   Textarea,
   Alert,
   ScrollArea,
} from "@mantine/core";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Popover, Transition } from "@headlessui/react";
import { format, parseISO } from "date-fns";

const Editor = dynamic(() => import("rich-markdown-editor"), { ssr: false });

import prisma from "../../../../lib/prisma";
import { Article } from "../../../../types/Article";
import { User } from "../../../../types/User";
import { Button } from "../../../../ui/Button";
import EditorSettingsDisclosure from "../../../../components/EditorSettingsDisclosure";
import ArticleBadge from "../../../../components/ArticleBadge";
import { links } from "../../../../lib/categories";
import Radio from "../../../../ui/Radio";
import ArticleUnderReviewCard from "../../../../components/ArticleUnderReviewCard";
import ConfirmModal from "../../../../ui/ConfirmModal";
import { shimmer } from "../../../../lib/shimmer";
import { Consumer } from "../../../../components/CustomSidebar/CustomSidebar";
import CustomSidebar from "../../../../components/CustomSidebar";
import { usePreventUserFromLosingData } from "../../../../lib/usePreventUserFromLosingData";

interface Props {
   user: User;
   articleServer: Article;
}

const ArticleEditor: React.FC<Props> = ({ user, articleServer }) => {
   const [openSidebar, setOpenSidebar] = useLocalStorage<boolean>({
      key: "editorOpenSidebar",
      defaultValue: true,
   });

   const { height: viewportHeight } = useViewportSize();
   const { ref: restEmptyRef, height: restEmptyHeight } = useElementSize();
   const { ref, height } = useElementSize();

   const [article, setArticle] = useState<Article>(articleServer);
   const [categories, setCategories] = useState<string[]>(article.categoryId);
   const [title, setTitle] = useState<string>(article.title);
   const [description, setDescription] = useState<string>(article.description);
   const [markdownValue, changeMarkdownValue] = useState<string>(article.mdx);
   const [loadingContentUpdate, setLoadingContentUpdate] =
      useState<boolean>(false);
   const [loadingRest, setLoadingRest] = useState<boolean>(false);
   const [openConfirmModalUnderReview, setOpenConfirmModalUnderReview] =
      useState<boolean>(false);
   const [displayAlert, setDisplayAlert] = useState<boolean>(false);

   const notifications = useNotifications();

   const canSave =
      (article.title !== title && title !== "") ||
      (article.description !== description && description !== "") ||
      (article.mdx !== markdownValue && markdownValue.length > 2);

   const canSaveRest =
      JSON.stringify(categories) !== JSON.stringify(article.categoryId) &&
      categories.length !== 0;

   // usePreventUserFromLosingData(canSave || canSaveRest);

   const handleEdit = async () => {
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
         setDisplayAlert(true);
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
         if (!user.isAdmin) {
            setDisplayAlert(true);
         }
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
         setDisplayAlert(true);
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

   const contentHeightSystem = `${
      height > 1100
         ? "h-[93vh]"
         : height > 1000
         ? "h-[92vh]"
         : height > 900
         ? "h-[91vh]"
         : height > 800
         ? "h-[90vh]"
         : "h-[89vh]"
   }`;

   return (
      <>
         <DefaultSeo title={title} />
         <div className="mt-4 flex flex-grow sm:mt-[5.4rem]">
            {!openSidebar && (
               <AiOutlineMenu
                  className="absolute right-0 top-0 z-50 mt-[75%] mr-5 cursor-pointer rounded-full border-2 border-gray-100 bg-gray-50 p-2 text-[3rem] duration-150 hover:bg-gray-100 sm:mt-24"
                  title="Open Settings"
                  onClick={() => setOpenSidebar(true)}
               />
            )}
            <ScrollArea
               ref={ref}
               className={`mx-auto ${contentHeightSystem} px-4 pb-5 sm:pt-10 ${
                  openSidebar ? "w-4/5" : "w-full"
               }`}
            >
               <div className="container mx-auto max-w-4xl">
                  <LoadingOverlay visible={loadingContentUpdate} />
                  <div className="border-b-2 pb-4">
                     {displayAlert && (
                        <Alert
                           icon={<AiOutlineCheck />}
                           title="Perfect!"
                           color="green"
                           className="mb-4"
                           withCloseButton
                           onClose={() => setDisplayAlert(false)}
                        >
                           {article.underReview && !article.published
                              ? "Your article has been put under review so that your changes can be moderated."
                              : `                     ${
                                   article.writer!.id === user.id
                                      ? "Your"
                                      : "This"
                                } article
                     has successfully been updated!`}{" "}
                           <Link href={`/article/${article.id}`}>
                              <a className="font-semibold text-blue-500 duration-150 hover:text-blue-800">
                                 See article
                              </a>
                           </Link>
                        </Alert>
                     )}
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
                  <div className="flex items-center">
                     <span className="inline-flex items-center justify-center rounded-md py-2 text-xs font-medium leading-none">
                        <Image
                           className="rounded-full"
                           src={
                              article.anonymous
                                 ? "/no-pfp.jpg"
                                 : article.writer?.image || "/no-pfp.jpg"
                           }
                           width="25px"
                           height="25px"
                           blurDataURL={shimmer(1920, 1080)}
                           alt={`${
                              article.anonymous
                                 ? "KCA News"
                                 : article.writer?.name.split(" ")[0]
                           }'s profile image`}
                        />
                        <span className="ml-2 mr-1 text-lg">
                           {article.anonymous ? (
                              "KCA News Team"
                           ) : (
                              <div className="flex gap-2">
                                 <a>{article.writer?.name}</a>
                                 {article.coWriters.length !== 0 && (
                                    <Popover className="relative">
                                       <Popover.Button
                                          as="span"
                                          className="cursor-pointer select-none duration-150 hover:text-blue-500"
                                       >
                                          {" "}
                                          and {article.coWriters.length} other
                                          {article.coWriters.length > 1 && "s"}
                                       </Popover.Button>
                                       <Transition
                                          as={React.Fragment}
                                          enter="transition ease-out duration-200"
                                          enterFrom="opacity-0 translate-y-1"
                                          enterTo="opacity-100 translate-y-0"
                                          leave="transition ease-in duration-150"
                                          leaveFrom="opacity-100 translate-y-0"
                                          leaveTo="opacity-0 translate-y-1"
                                       >
                                          <Popover.Panel className="absolute z-10 w-[20rem] rounded-md border-2 border-gray-100 bg-white shadow-md">
                                             {article.coWriters.map(
                                                (co, index) => (
                                                   <Link
                                                      href={`/profile/${co.id}`}
                                                   >
                                                      <a
                                                         key={index}
                                                         className="flex select-none items-center gap-2 py-3 px-4 duration-150 hover:bg-gray-100 hover:text-blue-500"
                                                      >
                                                         <Image
                                                            className="rounded-full"
                                                            src={co.image}
                                                            width="25px"
                                                            height="25px"
                                                            blurDataURL={shimmer(
                                                               1920,
                                                               1080
                                                            )}
                                                            alt={`${
                                                               co.name.split(
                                                                  " "
                                                               )[0]
                                                            }'s profile image`}
                                                         />
                                                         <span> {co.name}</span>
                                                      </a>
                                                   </Link>
                                                )
                                             )}
                                          </Popover.Panel>
                                       </Transition>
                                    </Popover>
                                 )}
                              </div>
                           )}
                        </span>
                     </span>
                     <h1 className="ml-1 flex items-center text-gray-800">
                        {" / "}
                        <div className="ml-2">
                           {format(
                              parseISO(
                                 new Date(article.createdAt).toISOString()
                              ),
                              "MMMM dd, yyyy"
                           )}
                        </div>
                     </h1>
                  </div>
                  <div className="relative mt-1 flex justify-center">
                     <div className="absolute top-0 right-0 z-50 mt-2 mr-4 flex items-center gap-4">
                        <Button
                           color="cyan"
                           onClick={() =>
                              notifications.showNotification({
                                 title: "Cover Photo",
                                 message: "Not available yet!",
                                 autoClose: 2000,
                              })
                           }
                        >
                           Replace
                        </Button>
                     </div>
                     <Image
                        alt="Post picture"
                        className="rounded-xl shadow-xl"
                        src={article.cover}
                        width={1280}
                        height={720 / 2}
                        blurDataURL={shimmer(1920, 1080)}
                        placeholder="blur"
                        objectFit="cover"
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
                  <div
                     className={`mt-6 ${
                        markdownValue.length < 2 && "-mb-1"
                     } border-t-2`}
                  />
                  {/*
                  // @ts-ignore */}
                  <Editor
                     placeholder="Start typing..."
                     onChange={(markdown) => changeMarkdownValue(markdown())}
                     defaultValue={markdownValue}
                     className="z-0"
                  />
                  <div className="mt-7 border-t-2 pt-4">
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
            </ScrollArea>
            <CustomSidebar
               drawerProps={{
                  opened: openSidebar,
                  onClose: () => setOpenSidebar(!openSidebar),
               }}
               normalProps={{
                  className: `${
                     openSidebar ? "w-1/5" : "hidden"
                  } relative border-l-2 py-4 flex h-full flex-col flex-grow`,
               }}
            >
               <Consumer>
                  {({ mobile }) => (
                     <>
                        <LoadingOverlay
                           visible={loadingRest && !loadingContentUpdate}
                        />
                        {!mobile && (
                           <div className="flex items-center justify-between gap-2 border-b-2 px-4 pb-4">
                              <h1 className="text-2xl font-semibold">
                                 Settings
                              </h1>
                              <AiOutlineCloseCircle
                                 size="25"
                                 className="mt-1 cursor-pointer duration-150 hover:text-blue-600"
                                 title="Close"
                                 onClick={() => setOpenSidebar(false)}
                              />
                           </div>
                        )}
                        <EditorSettingsDisclosure
                           name="Visibility"
                           defaultOpen={title === ""}
                           warning={title === ""}
                        >
                           {title === "" && (
                              <h1 className="-mt-2 mb-2 px-1 font-medium text-red-500">
                                 You need a title in order to publish
                              </h1>
                           )}
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
                                    disabled={
                                       article.underReview && !user.isAdmin
                                    }
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
                                          setDisplayAlert(true);
                                       } else {
                                          notifications.showNotification({
                                             color: "red",
                                             title: "Publish - Error",
                                             message:
                                                response.message ||
                                                "Unknown Error",
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
                              disabled={
                                 !user.isAdmin
                                    ? article.underReview || article.published
                                    : false
                              }
                              title={
                                 article.underReview
                                    ? "You can't delete an article when it is under review"
                                    : "Delete this article"
                              }
                           >
                              Delete
                           </Button>
                        </EditorSettingsDisclosure>
                        <EditorSettingsDisclosure
                           name="Description"
                           warning={description === ""}
                           defaultOpen={description === ""}
                        >
                           {description === "" && (
                              <h1 className="-mt-2 mb-2 px-1 font-medium text-red-500">
                                 You need a description in order to publish
                              </h1>
                           )}
                           <Textarea
                              placeholder="Description"
                              required
                              onChange={(e) =>
                                 setDescription(e.currentTarget.value)
                              }
                              value={description}
                              minRows={4}
                              maxRows={8}
                           />
                        </EditorSettingsDisclosure>
                        <EditorSettingsDisclosure
                           name="Categories"
                           warning={categories.length === 0}
                           defaultOpen={categories.length === 0}
                        >
                           {categories.length === 0 && (
                              <h1 className="-mt-2 mb-2 px-1 font-medium text-red-500">
                                 At least one category is needed to publish.
                              </h1>
                           )}
                           <MultiSelect
                              data={links.map((l) => ({
                                 value: l.id,
                                 label: l.name.toLowerCase(),
                              }))}
                              placeholder="Pick all the appropiate categories"
                              onChange={setCategories}
                              value={categories}
                              searchable
                              nothingFound="Nothing found"
                              clearable
                              maxDropdownHeight={160}
                              maxSelectedValues={5}
                              valueComponent={WrappedArticleBadge}
                           />
                        </EditorSettingsDisclosure>
                        <EditorSettingsDisclosure name="Filter">
                           <h1>yo</h1>
                        </EditorSettingsDisclosure>
                        <EditorSettingsDisclosure name="Cover">
                           <h1>yo</h1>
                        </EditorSettingsDisclosure>
                        <div
                           className={viewportHeight > 550 ? "flex-grow" : ""}
                           ref={restEmptyRef}
                        >
                           <div
                              className={`${
                                 restEmptyHeight > 100
                                    ? "fixed bottom-0 w-[20%]"
                                    : "w-full"
                              } px-2 py-4`}
                           >
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
                     </>
                  )}
               </Consumer>
            </CustomSidebar>
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

const WrappedArticleBadge = ({ value }: { value: string }) => (
   <ArticleBadge tag={value} className="mb-1 mt-1" />
);

export const getServerSideProps: GetServerSideProps = async ({
   query,
   req,
}) => {
   const { id } = query;
   const session = await getSession({ req });

   if (!session || (session?.user?.isAdmin ? false : !session?.user?.isWriter))
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
           include: {
              writer: true,
              coWriters: true,
           },
        })
      : await prisma.article.findFirst({
           where: { id: id as string, user: session?.user?.id },
           include: {
              writer: true,
              coWriters: true,
           },
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
         articleServer: JSON.parse(JSON.stringify(article)),
      },
   };
};

export default ArticleEditor;
