import React, { useState, useEffect, forwardRef, useCallback } from "react";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { DefaultSeo } from "next-seo";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
   AiFillSave,
   AiFillTag,
   AiOutlineCheck,
   AiOutlineClose,
   AiOutlineCloseCircle,
   AiOutlineDislike,
   AiOutlineLike,
   AiOutlineMenu,
   AiOutlineUser,
} from "react-icons/ai";
import { RiRestartLine } from "react-icons/ri";
import { useNotifications } from "@mantine/notifications";
import { formatDistance } from "date-fns";
import {
   useLocalStorage,
   useElementSize,
   useViewportSize,
   useClipboard,
   useDebouncedValue,
   useMediaQuery,
   useHotkeys,
} from "@mantine/hooks";
import {
   MultiSelect,
   TextInput,
   Tooltip,
   LoadingOverlay,
   Alert,
   ScrollArea,
   Select,
   Tabs,
} from "@mantine/core";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTheme } from "next-themes";
import { BiCategory } from "react-icons/bi";
import { BsKeyboardFill, BsTrash } from "react-icons/bs";
import { useBeforeUnload } from "react-use";
import readingTime from "reading-time";
import ContentEditable from "react-contenteditable";

const Editor = dynamic(() => import("@davidilie/markdown-editor"), {
   ssr: false,
});

import { Downvote, Upvote } from "@prisma/client";
import prisma from "@/lib/prisma";
import { Article } from "@/types/Article";
import { User } from "@/types/User";
import { Button } from "@/ui/Button";
import EditorSettingsDisclosure from "@/components/EditorSettingsDisclosure";
import ArticleBadge from "@/components/ArticleBadge";
import {
   fullLocations,
   getFormmatedLocation,
   links,
   Locations,
} from "@/lib/categories";
import Radio from "@/ui/Radio";
import ArticleUnderReviewCard from "@/components/ArticleUnderReviewCard";
import ConfirmModal from "@/ui/ConfirmModal";
import { shimmer } from "@/lib/shimmer";
import { Consumer } from "@/components/CustomSidebar/CustomSidebar";
import CustomSidebar from "@/components/CustomSidebar";
import useDetermineCustomQueryEditor from "@/hooks/useDetermineCustomQueryEditor";
import ArticleWriterInfo from "@/components/ArticleWriterInfo";
import ArticleCoverUploader, {
   ModalArticleCoverUploaderWrapper,
} from "@/components/ArticleCoverUploader/ArticleCoverUploader";
import sendPost from "@/lib/sendPost";
import { computeKCAName } from "@/lib/computeKCAName";
import EditorWordCount from "@/components/EditorWordCount";
import useContextMenu from "@/hooks/useContextMenu";
import { createArticleUrl } from "@/lib/createArticleUrl";

interface Props {
   user: User;
   articleServer: Article;
}

const ArticleEditor: React.FC<Props> = ({ user, articleServer }) => {
   const router = useRouter();
   const { menu } = router.query;

   const [openSidebar, setOpenSidebar] = useLocalStorage<boolean>({
      key: "editorOpenSidebar",
      defaultValue: (menu as any as boolean) || true,
   });

   const [openWordCountOverlay] = useLocalStorage<boolean>({
      key: "wordCountOverlay",
      defaultValue: false,
   });

   useEffect(() => setOpenSidebar((menu as any as boolean) || openSidebar), []);

   const finalUrl = useDetermineCustomQueryEditor("menu");

   const { resolvedTheme } = useTheme();
   const notifications = useNotifications();
   const { height: viewportHeight } = useViewportSize();
   const { ref: restEmptyRef, height: restEmptyHeight } = useElementSize();
   const { ref, height } = useElementSize();
   const clipboard = useClipboard({ timeout: 2000 });
   const secondClipboard = useClipboard({ timeout: 2000 });
   const bigScreen = useMediaQuery("(min-width: 1800px)");

   const [article, setArticle] = useState<Article>(articleServer);
   const [categories, setCategories] = useState<string[]>(article.categoryId);
   const [tags, setTags] = useState<string[]>(article.tags);
   const [title, setTitle] = useState<string>(article.title);
   const [description, setDescription] = useState<string>(article.description);
   const [markdownValue, changeMarkdownValue] = useState<string>(article.mdx);
   const [coWriters, setCoWriters] = useState<User[]>(article.coWriters);
   const [location, setLocation] = useState<Locations | null>(article.location);
   const [coWriterSearch, setCoWriterSearch] = useState<User[]>([]);
   const [loadingContentUpdate, setLoadingContentUpdate] =
      useState<boolean>(false);
   const [loadingRest, setLoadingRest] = useState<boolean>(false);
   const [openConfirmModalUnderReview, setOpenConfirmModalUnderReview] =
      useState<boolean>(false);
   const [displayAlert, setDisplayAlert] = useState<boolean>(false);
   const [bigLoad, setBigLoad] = useState<boolean>(false);
   const [deleteConfirmModal, setDeleteConfirmModal] = useState<boolean>(false);
   const [coWriterSearchValue, setCoWriterSearchValue] = useState<any>();
   const [loadingSearch, setLoadingSearchWriter] = useState<boolean>(false);
   const [key, setKey] = useState<number>(0);
   const [lastSaved, setLastSaved] = useState<Date | null>(null);
   const [openWordCountModal, setOpenWordCountModal] = useState<boolean>(false);
   const readingTimeInfo = readingTime(markdownValue);
   const [openChangeCoverModal, setOpenChangeCoverModal] =
      useState<boolean>(false);
   const toggleChangeCoverModal = () =>
      setOpenChangeCoverModal(!openChangeCoverModal);

   // const { anchorPoint, showContextMenu } = useContextMenu(
   //    !(
   //       openWordCountModal ||
   //       openConfirmModalUnderReview ||
   //       deleteConfirmModal ||
   //       openChangeCoverModal
   //    )
   // );

   useHotkeys([
      ["mod+shift+c", () => setOpenWordCountModal(true)],
      ["mod+s", () => !canBeAttemptedSave && attemptToSave()],
   ]);

   // useDebouncedValue(async () => {
   //    if (!canSave) return;

   //    const r = await fetch(`/api/article/${article.id}/update/content`, {
   //       method: "POST",
   //       credentials: "include",
   //       body: JSON.stringify({
   //          title,
   //          description,
   //          content: markdownValue,
   //       }),
   //    });
   //    const response = await r.json();
   //    if (r.status !== 200) {
   //       notifications.showNotification({
   //          color: "red",
   //          title: "Auto Save - Error",
   //          message: response.message || "Unknown Error",
   //          icon: <AiOutlineClose />,
   //          autoClose: 5000,
   //       });
   //    } else {
   //       setLastSaved(new Date());
   //       setArticle(article);
   //    }
   // }, 1000);

   const canSave =
      (article.title !== title && title !== "") ||
      (article.description !== description && description !== "") ||
      (article.mdx !== markdownValue && markdownValue.length > 2);

   const canSaveRest =
      (location !== null && location !== article.location) ||
      (JSON.stringify(categories) !== JSON.stringify(article.categoryId) &&
         categories.length !== 0) ||
      JSON.stringify(tags) !== JSON.stringify(article.tags) ||
      JSON.stringify(coWriters) !== JSON.stringify(article.coWriters);

   useBeforeUnload(
      canSave || canSaveRest,
      "Are you sure want to leave this page?"
   );

   const canBeAttemptedSave = !canSave ? !canSaveRest : false;

   const combinedMethods = () => {
      handleEdit();
      handleUpdateRest();
   };
   const attemptToSave = () =>
      canSave
         ? canSave && canSaveRest
            ? combinedMethods()
            : handleEdit()
         : handleUpdateRest();

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
         setLastSaved(new Date());
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
      if (article.underReview && !(user.isAdmin || user.isEditorial)) return;
      setLoadingRest(true);

      const r = await fetch(`/api/article/${article.id}/update/underReview`, {
         credentials: "include",
      });
      const response = await r.json();

      if (r.status === 200) {
         setArticle(response.article);
         if (!(user.isAdmin || user.isEditorial)) {
            setDisplayAlert(true);
         }
         setLastSaved(new Date());
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

      if (JSON.stringify(coWriters) !== JSON.stringify(article.coWriters)) {
         const r = await fetch(`/api/article/${article.id}/cowriter/update`, {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
               coWriters: coWriters.map((writer) => writer.id),
            }),
         });

         if (r.status !== 200) {
            const response = await r.json();
            notifications.showNotification({
               color: "red",
               title: "Co Writer - Error",
               message: response.message || "Unknown Error",
               icon: <AiOutlineClose />,
               autoClose: 5000,
            });
         } else {
            setLastSaved(new Date());
         }
      }

      const r = await fetch(`/api/article/${article.id}/update/rest`, {
         method: "POST",
         credentials: "include",
         body: JSON.stringify({
            location,
            categories,
            tags,
         }),
      });
      const response = await r.json();

      if (r.status === 200) {
         setArticle(response.article);
         setDisplayAlert(true);
         setLastSaved(new Date());
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

   const closeSidebar = () => {
      if (menu as any as boolean)
         router.push(finalUrl, "", {
            shallow: true,
         });
      setOpenSidebar(false);
   };

   const handleDeleteArticle = async () => {
      setLoadingContentUpdate(true);

      const r = await fetch(`/api/article/${article.id}/delete`, {
         method: "DELETE",
         credentials: "include",
      });
      const response = await r.json();

      if (r.status === 200) {
         notifications.showNotification({
            color: "teal",
            title: "Delete",
            message: "Article Deleted successfully!",
            icon: <AiOutlineCheck />,
            autoClose: 2000,
         });
         router.push("/dashboard/writer");
      } else {
         notifications.showNotification({
            color: "red",
            title: "Delete - Error",
            message: response.message || "Unknown Error",
            icon: <AiOutlineClose />,
            autoClose: 5000,
         });
      }
   };

   return (
      <>
         <DefaultSeo title={article.title} />
         {!openSidebar && (
            <AiOutlineMenu
               className="fixed right-0 top-0 z-[200] mr-5 mt-[175px] cursor-pointer rounded-full border-2 border-gray-100 bg-gray-50 p-2 text-[3rem] duration-150 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-900 sm:mt-[100px]"
               title="Open Settings"
               onClick={() => setOpenSidebar(true)}
            />
         )}
         {openWordCountOverlay && (
            <div
               className="borderColor fixed left-0 bottom-0 z-[100] mb-[25px] ml-5 cursor-pointer rounded-md border bg-white px-3 py-2 shadow-2xl dark:bg-foot"
               onClick={() => setOpenWordCountModal(!openWordCountModal)}
            >
               <span className="font-medium">
                  {(readingTimeInfo as any).words}
               </span>{" "}
               Words
            </div>
         )}
         {/* {showContextMenu && (
            <div
               className="borderColor container absolute z-50 max-w-[10rem] rounded border-2 bg-white shadow-xl dark:bg-foot"
               style={{
                  top: anchorPoint.y,
                  left: anchorPoint.x,
               }}
            >
               <div
                  className={`flex items-center justify-between py-2 px-3 duration-150 ${
                     !canBeAttemptedSave
                        ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-bg"
                        : "cursor-not-allowed opacity-50"
                  }`}
                  onClick={() => !canBeAttemptedSave && attemptToSave()}
               >
                  <p>Save</p>
                  <AiFillSave />
               </div>
               <div
                  className="flex items-center justify-between px-3 py-2 duration-150 cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-bg"
                  onClick={() => setOpenWordCountModal(true)}
               >
                  <p>Word Count</p>
                  <BsKeyboardFill />
               </div>
            </div>
         )} */}
         <div className="mt-4 flex flex-grow sm:mt-[5.1rem]">
            <LoadingOverlay
               visible={loadingContentUpdate || bigLoad}
               className="fixed"
            />
            <ScrollArea
               ref={ref}
               className={`mx-auto ${contentHeightSystem} px-4 pb-5 sm:pt-[1.75rem] ${
                  openSidebar ? "w-4/5" : "w-full"
               }`}
            >
               <div className="container max-w-4xl mx-auto">
                  <div className="pb-4 border-b-2">
                     {displayAlert && (
                        <Alert
                           icon={<AiOutlineCheck />}
                           title="Perfect!"
                           color="green"
                           className="mb-4"
                           withCloseButton
                           onClose={() => setDisplayAlert(false)}
                        >
                           {`${
                              article.writer!.id === user.id ? "Your" : "This"
                           } article
                     has successfully been updated!`}{" "}
                           <Link href={createArticleUrl(article)}>
                              <a className="font-semibold text-blue-500 duration-150 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-600">
                                 See article
                              </a>
                           </Link>
                        </Alert>
                     )}
                     <div className="flex flex-wrap justify-start w-full mb-2">
                        {categories.concat(tags).map((category, index) => (
                           <ArticleBadge tag={category} key={index} />
                        ))}
                        {categories.length === 0 && (
                           <div className="invisible">
                              <ArticleBadge tag="i love surds" />
                           </div>
                        )}
                     </div>
                     {title !== article.title && (
                        <div className="relative hidden sm:block">
                           <RiRestartLine
                              className="absolute -ml-10 mt-[0.9rem] cursor-pointer text-2xl"
                              onClick={() => {
                                 setTitle(article.title);
                              }}
                           />
                        </div>
                     )}
                     <ContentEditable
                        tagName="h1"
                        className="text-2xl font-semibold leading-[3rem] sm:text-4xl"
                        html={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onPaste={(e) => {
                           let clipboardData, pastedData;
                           e.stopPropagation();
                           e.preventDefault();
                           clipboardData = e.clipboardData;
                           pastedData = clipboardData.getData("Text");
                           setTitle(pastedData);
                        }}
                     />
                  </div>
                  <ArticleWriterInfo article={article} user={user} />
                  <div className="items-center gap-3 justify-evenly sm:flex">
                     <div className="relative flex justify-center mt-1 sm:w-2/3">
                        <div className="absolute top-0 right-0 z-[1] mt-2 mr-4 flex items-center gap-4">
                           <Button
                              color="cyan"
                              onClick={toggleChangeCoverModal}
                           >
                              Replace
                           </Button>
                        </div>
                        <Image
                           alt="Post picture"
                           className="shadow-xl rounded-xl"
                           src={article.cover}
                           width={1280}
                           height={720}
                           blurDataURL={shimmer(1920, 1080)}
                           placeholder="blur"
                           objectFit="cover"
                        />
                     </div>
                     <div className="sm:h-[300px] sm:w-1/2">
                        {description !== article.description && (
                           <div className="relative hidden sm:block">
                              <RiRestartLine
                                 className="absolute right-0 mt-5 -mr-10 text-2xl cursor-pointer select-none"
                                 onClick={() => {
                                    setDescription(article.description);
                                    setKey(key + 1);
                                 }}
                              />
                           </div>
                        )}
                        <Editor
                           placeholder="Write description..."
                           onChange={(markdown) => setDescription(markdown())}
                           defaultValue={description}
                           key={key}
                           className="z-0 mt-2"
                           dark={resolvedTheme === "dark"}
                           maxLength={400}
                           disableExtensions={[
                              "heading",
                              "image",
                              "table",
                              "bullet_list",
                              "ordered_list",
                              "checkbox_list",
                              "blockquote",
                           ]}
                        />
                     </div>
                  </div>
                  <div
                     className={`mt-6 ${
                        markdownValue.length < 2 && "-mb-1"
                     } border-t-2`}
                  />
                  <Editor
                     placeholder="Start typing..."
                     onChange={(markdown) => changeMarkdownValue(markdown())}
                     defaultValue={markdownValue}
                     className="z-0"
                     dark={resolvedTheme === "dark"}
                     onImageUploadStart={() => setBigLoad(true)}
                     onImageUploadStop={() => setBigLoad(false)}
                     uploadMedia={async (media) => {
                        const formData = new FormData();
                        formData.append("image", media);
                        try {
                           const { statusCode, response } = await sendPost(
                              `/api/article/${article.id}/image`,
                              formData,
                              true
                           );
                           if (statusCode !== 200) {
                              notifications.showNotification({
                                 color: "red",
                                 title: "Image - Error",
                                 message: response.message || "Unknown Error",
                                 icon: <AiOutlineClose />,
                                 autoClose: 5000,
                              });
                           } else {
                              return response.url;
                           }
                        } catch (error) {
                           notifications.showNotification({
                              color: "red",
                              title: "Image - Error",
                              message: "Error uploading",
                              icon: <AiOutlineClose />,
                              autoClose: 5000,
                           });
                        }
                     }}
                  />
                  <div className="pt-4 border-t-2 mt-7">
                     <Button
                        className="w-full"
                        disabled={canBeAttemptedSave}
                        onClick={attemptToSave}
                     >
                        Save
                     </Button>
                  </div>
               </div>
            </ScrollArea>
            <CustomSidebar
               drawerProps={{
                  opened: openSidebar,
                  onClose: closeSidebar,
               }}
               normalProps={{
                  className: `${
                     openSidebar ? "w-1/5" : "hidden"
                  } relative border-l-2 borderColor flex h-full flex-col flex-grow`,
               }}
            >
               <Consumer>
                  {({ mobile }) => (
                     <>
                        <LoadingOverlay
                           visible={loadingRest && !loadingContentUpdate}
                           className="fixed"
                        />
                        {!mobile && (
                           <div className="flex items-center justify-between gap-2 px-4 py-4 border-b-2 borderColor">
                              <div className={`${lastSaved && "-mb-2"}`}>
                                 <h1 className="text-2xl font-semibold">
                                    Settings
                                 </h1>
                                 {lastSaved && (
                                    <Tooltip
                                       label="Save now"
                                       disabled={!canSave}
                                    >
                                       <span
                                          className={`text-xs font-normal text-gray-300 ${
                                             canSave &&
                                             "cursor-pointer hover:underline"
                                          }`}
                                          onClick={() =>
                                             !canBeAttemptedSave &&
                                             attemptToSave()
                                          }
                                       >
                                          Saved{" "}
                                          {formatDistance(
                                             lastSaved,
                                             new Date(),
                                             {
                                                addSuffix: true,
                                             }
                                          )}
                                       </span>
                                    </Tooltip>
                                 )}
                              </div>
                              <AiOutlineCloseCircle
                                 size="25"
                                 className="mt-1 text-black duration-150 cursor-pointer hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                                 title="Close"
                                 onClick={closeSidebar}
                              />
                           </div>
                        )}
                        <EditorSettingsDisclosure
                           name="Visibility"
                           defaultOpen={title === ""}
                           warning={title === ""}
                        >
                           {title === "" && (
                              <h1 className="px-1 mb-2 -mt-2 font-medium text-red-500">
                                 You need a title in order to publish
                              </h1>
                           )}
                           <TextInput
                              label="Title"
                              onChange={(e) => setTitle(e.currentTarget.value)}
                              value={title}
                              required
                              classNames={{
                                 filledVariant:
                                    "dark:bg-foot border-2 dark:border-gray-800 border-gray-300",
                              }}
                           />
                           <div className="flex justify-between mt-2 text-left">
                              <h1 className="font-semibold">Status:</h1>
                              <h1 className="text-blue-500">
                                 {article.published
                                    ? "Published"
                                    : article.underReview
                                    ? "Under Review"
                                    : article.readyToPublish
                                    ? "Ready To Publish"
                                    : "Not published"}
                              </h1>
                           </div>
                           <div className="flex items-center gap-2 mt-2">
                              <Tooltip
                                 label="Places article under review to be moderated by an administrator. This cannot be undone by you once changed."
                                 wrapLines
                                 width={220}
                                 withArrow
                                 transition="fade"
                                 transitionDuration={200}
                                 disabled={
                                    location === null ||
                                    (article.underReview &&
                                       !(user.isAdmin || user.isEditorial))
                                 }
                              >
                                 <Radio
                                    label="Pending review"
                                    checked={article.underReview}
                                    labelSize="md"
                                    disabled={
                                       location === null ||
                                       (article.underReview &&
                                          !(user.isAdmin || user.isEditorial))
                                    }
                                    labelDisabled={
                                       location === null ||
                                       (article.underReview &&
                                          !(user.isAdmin || user.isEditorial))
                                    }
                                    onChange={() => {
                                       if (
                                          !(user.isAdmin || user.isEditorial)
                                       ) {
                                          setOpenConfirmModalUnderReview(
                                             !openConfirmModalUnderReview
                                          );
                                       } else {
                                          handleSetUnderReview();
                                       }
                                    }}
                                 />
                              </Tooltip>
                              {article.underReview &&
                                 !(user.isAdmin || user.isEditorial) && (
                                    <ArticleUnderReviewCard />
                                 )}
                           </div>
                           {(article.underReview || article.readyToPublish) &&
                              (user?.isAdmin || user?.isEditorial) && (
                                 <div className="mt-1">
                                    <Radio
                                       label="Ready to Publish"
                                       labelSize="md"
                                       checked={article.readyToPublish}
                                       onChange={async () => {
                                          setLoadingRest(true);
                                          const r = await fetch(
                                             `/api/article/${article.id}/update/readyToPublish`,
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
                           {user.isAdmin && (
                              <div className="flex items-center gap-2 mt-1">
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
                              className="w-full mt-3 -ml-1"
                              disabled={
                                 article.underReview || article.published
                              }
                              title={
                                 article.underReview
                                    ? "You can't delete an article when it is under review"
                                    : "Delete this article"
                              }
                              onClick={() => setDeleteConfirmModal(true)}
                           >
                              Delete
                           </Button>
                        </EditorSettingsDisclosure>
                        <EditorSettingsDisclosure
                           name="Categories"
                           warning={
                              location === null ||
                              (categories.length === 0 && location !== null)
                           }
                           defaultOpen={
                              location === null ||
                              (categories.length === 0 && location !== null)
                           }
                        >
                           {location === null && (
                              <h1 className="px-1 mb-2 -mt-2 font-medium text-red-500">
                                 You need a category in order to publish
                              </h1>
                           )}
                           {categories.length === 0 && location !== null && (
                              <h1 className="px-1 mb-2 -mt-2 font-medium text-red-500">
                                 At least one sub category is needed to publish.
                              </h1>
                           )}
                           <Select
                              data={
                                 user.isAdmin
                                    ? fullLocations.map((location: any) => ({
                                         value: location,
                                         label: getFormmatedLocation(location),
                                      }))
                                    : user.department.map((location: any) => ({
                                         value: location,
                                         label: getFormmatedLocation(location),
                                      }))
                              }
                              value={location}
                              onChange={(e) => setLocation(e as any)}
                              placeholder="Pick all the appropiate category"
                              label="Category"
                              required
                              clearable
                              nothingFound="Contact an administrator to add your correct department(s)."
                              icon={<BiCategory />}
                              classNames={{
                                 filledVariant:
                                    "dark:bg-foot border-2 dark:border-gray-800 border-gray-300",
                                 dropdown:
                                    "dark:bg-foot border-2 dark:border-gray-800 border-gray-300",
                              }}
                              className={location !== null ? "mb-2" : ""}
                           />
                           {location !== null && (
                              <MultiSelect
                                 data={links
                                    .filter((s) =>
                                       s.location.includes(location)
                                    )
                                    .map((l) => ({
                                       value: l.id,
                                       label: l.name.toLowerCase(),
                                    }))}
                                 placeholder="Pick all the appropiate sub categories"
                                 onChange={setCategories}
                                 value={categories}
                                 searchable
                                 nothingFound="Nothing found"
                                 clearable
                                 maxDropdownHeight={160}
                                 maxSelectedValues={3}
                                 valueComponent={WrappedArticleBadge}
                                 label="Sub Categories (max 3)"
                                 required
                                 icon={<BiCategory />}
                                 classNames={{
                                    filledVariant:
                                       "dark:bg-foot border-2 dark:border-gray-800 border-gray-300",
                                    dropdown:
                                       "dark:bg-foot border-2 dark:border-gray-800 border-gray-300",
                                 }}
                              />
                           )}
                        </EditorSettingsDisclosure>
                        <EditorSettingsDisclosure name="Tags">
                           <MultiSelect
                              data={tags}
                              value={tags}
                              placeholder="Create custom tags"
                              searchable
                              onChange={(v) => {
                                 if (v.length === 0 || v.length < tags.length)
                                    setTags(v);
                              }}
                              clearable
                              maxDropdownHeight={160}
                              maxSelectedValues={2}
                              valueComponent={WrappedArticleBadge}
                              label="Tags (max 2)"
                              creatable
                              getCreateLabel={(query) => `+ Create ${query}`}
                              onCreate={(query) => {
                                 setTags((current) => [...current, query]);
                              }}
                              icon={<AiFillTag />}
                              classNames={{
                                 filledVariant:
                                    "dark:bg-foot border-2 dark:border-gray-800 border-gray-300",
                                 dropdown:
                                    "dark:bg-foot border-2 dark:border-gray-800 border-gray-300",
                              }}
                           />
                        </EditorSettingsDisclosure>
                        <EditorSettingsDisclosure name="Cover">
                           <ArticleCoverUploader
                              article={article}
                              updateArticle={setArticle}
                              setMainLoading={setBigLoad}
                           />
                        </EditorSettingsDisclosure>
                        <EditorSettingsDisclosure name="Co Writers">
                           <MultiSelect
                              data={coWriterSearch.map((co) => ({
                                 label: computeKCAName(co),
                                 value: co.id,
                                 user: co,
                              }))}
                              onChange={(e) => {
                                 if (e.length === 0)
                                    return setCoWriterSearchValue([]);
                                 if (e.length > 1)
                                    return setCoWriterSearchValue([]);

                                 setCoWriterSearchValue(e);

                                 const found = e[0];
                                 const user = coWriterSearch.filter(
                                    (co) => co.id === found
                                 )[0] as any as User;

                                 if (
                                    coWriters.filter((w) => w.id === user.id)
                                       .length > 0
                                 )
                                    return setCoWriterSearchValue([]);

                                 if (user) {
                                    setCoWriters([...coWriters, user]);
                                    setCoWriterSearchValue([]);
                                    setCoWriterSearch(
                                       coWriters.filter((u) => u.id === user.id)
                                    );
                                 }
                              }}
                              searchable
                              nothingFound={
                                 loadingSearch
                                    ? "Loading..."
                                    : coWriterSearch.length === 0
                                    ? "Write something..."
                                    : "No writer found"
                              }
                              icon={<AiOutlineUser />}
                              maxSelectedValues={1}
                              value={coWriterSearchValue}
                              itemComponent={CoWriterUser}
                              placeholder="Select a Co Writer"
                              onSearchChange={async (v) => {
                                 if (coWriterSearch.length > 0) return;

                                 setLoadingSearchWriter(true);

                                 const r = await fetch(
                                    `/api/article/${
                                       article.id
                                    }/cowriter/search?query=${encodeURIComponent(
                                       v
                                    )}`,
                                    {
                                       method: "POST",
                                       credentials: "include",
                                    }
                                 );
                                 const response = await r.json();

                                 if (r.status === 200) {
                                    const users = response.users as User[];

                                    let final = [] as User[];

                                    users.forEach((user) => {
                                       coWriters.forEach((writer) => {
                                          if (user.id !== writer.id)
                                             final.push(user);
                                       });
                                    });

                                    setCoWriterSearch(
                                       coWriters.length === 0 ? users : final
                                    );
                                 } else {
                                    notifications.showNotification({
                                       color: "red",
                                       title: "Search - Error",
                                       message:
                                          response.message || "Unknown Error",
                                       icon: <AiOutlineClose />,
                                       autoClose: 5000,
                                    });
                                 }

                                 setLoadingSearchWriter(false);
                              }}
                              classNames={{
                                 filledVariant:
                                    "dark:bg-foot border-2 dark:border-gray-800 border-gray-300",
                                 dropdown:
                                    "dark:bg-foot border-2 dark:border-gray-800 border-gray-300",
                              }}
                           />
                           {coWriters.length > 0 && <div className="mt-4" />}
                           {coWriters.map((writer, index) => (
                              <div
                                 className={`mr-4 ml-2 flex items-center justify-between ${
                                    index !== coWriters.length - 1 && "mb-4"
                                 }`}
                                 key={index}
                              >
                                 <div className="flex items-center gap-2 select-none">
                                    <Image
                                       className="rounded-full"
                                       src={writer.image}
                                       width="25px"
                                       height="25px"
                                       blurDataURL={shimmer(1920, 1080)}
                                       alt={`${
                                          writer.name.split(" ")[0]
                                       }'s profile image`}
                                    />
                                    <span>{computeKCAName(writer)}</span>
                                 </div>
                                 <BsTrash
                                    className="cursor-pointer"
                                    onClick={() => {
                                       setCoWriterSearch([]);
                                       setCoWriters(
                                          coWriters.filter(
                                             (user) => user.id !== writer.id
                                          )
                                       );
                                    }}
                                 />
                              </div>
                           ))}
                        </EditorSettingsDisclosure>
                        {!article.published && (
                           <EditorSettingsDisclosure name="Sharing">
                              <Radio
                                 label="Share this article"
                                 checked={article.shared}
                                 labelSize="md"
                                 onChange={async () => {
                                    setBigLoad(true);

                                    const r = await fetch(
                                       `/api/article/${article.id}/share`,
                                       { credentials: "include" }
                                    );
                                    const response = await r.json();

                                    if (r.status === 200) {
                                       setArticle(response.article);
                                    } else {
                                       notifications.showNotification({
                                          color: "red",
                                          title: "Share - Error",
                                          message:
                                             response.message ||
                                             "Unknown Error",
                                          icon: <AiOutlineClose />,
                                          autoClose: 5000,
                                       });
                                    }

                                    setBigLoad(false);
                                 }}
                              />
                              <div className="mt-2" />
                              <Tooltip
                                 label="Only give access to reviewers, writers or administrators"
                                 disabled={!article.shared}
                              >
                                 <Radio
                                    label="Only to team members"
                                    checked={article.sharedToTeam}
                                    labelSize="md"
                                    disabled={!article.shared}
                                    labelDisabled={!article.shared}
                                    onChange={async () => {
                                       setBigLoad(true);

                                       const r = await fetch(
                                          `/api/article/${article.id}/share/team`,
                                          { credentials: "include" }
                                       );
                                       const response = await r.json();

                                       if (r.status === 200) {
                                          setArticle(response.article);
                                       } else {
                                          notifications.showNotification({
                                             color: "red",
                                             title: "Share - Error",
                                             message:
                                                response.message ||
                                                "Unknown Error",
                                             icon: <AiOutlineClose />,
                                             autoClose: 5000,
                                          });
                                       }

                                       setBigLoad(false);
                                    }}
                                 />
                              </Tooltip>
                              {article.shared && <div className="mt-3" />}
                              {article.shared && (
                                 <>
                                    <Button
                                       className="w-full"
                                       onClick={() =>
                                          clipboard.copy(
                                             `${
                                                process.env.NEXT_PUBLIC_APP_URL
                                             }${createArticleUrl(
                                                article
                                             )}?share=${article.sharedId}`
                                          )
                                       }
                                       color={
                                          clipboard.copied ? "green" : "primary"
                                       }
                                    >
                                       {clipboard.copied
                                          ? "Copied!"
                                          : "Copy Link"}
                                    </Button>
                                    <Button
                                       className="w-full mt-2"
                                       color="secondary"
                                       onClick={async () => {
                                          setBigLoad(true);

                                          const r = await fetch(
                                             `/api/article/${article.id}/share/gen`,
                                             { credentials: "include" }
                                          );
                                          const response = await r.json();

                                          if (r.status === 200) {
                                             setArticle(response.article);
                                             secondClipboard.copy(
                                                `${
                                                   process.env
                                                      .NEXT_PUBLIC_APP_URL
                                                }${createArticleUrl(
                                                   article
                                                )}?share=${article.sharedId}`
                                             );
                                             notifications.showNotification({
                                                color: "teal",
                                                title: "Share",
                                                message: "Copied new link!",
                                                icon: <AiOutlineCheck />,
                                                autoClose: 2000,
                                             });
                                          } else {
                                             notifications.showNotification({
                                                color: "red",
                                                title: "Share - Error",
                                                message:
                                                   response.message ||
                                                   "Unknown Error",
                                                icon: <AiOutlineClose />,
                                                autoClose: 5000,
                                             });
                                          }

                                          setBigLoad(false);
                                       }}
                                    >
                                       Reset Link
                                    </Button>
                                 </>
                              )}
                           </EditorSettingsDisclosure>
                        )}
                        {(user?.isAdmin || user?.isEditorial) &&
                           user.id !== article.writer?.id && (
                              <EditorSettingsDisclosure name="Contact Information">
                                 <>
                                    <h1>
                                       <span className="font-medium">
                                          Name:
                                       </span>{" "}
                                       {article.writer?.names.join(" ") ||
                                          article.writer?.name}
                                    </h1>
                                    <h1>
                                       <span className="font-medium">
                                          Year Group:
                                       </span>{" "}
                                       {article.writer?.year.split("Year ")[1]}
                                    </h1>
                                    <h1>
                                       <span className="font-medium">
                                          Email:
                                       </span>{" "}
                                       <a
                                          href={`mailto:${article.writer?.email}`}
                                          className="duration-150 hover:text-blue-500"
                                       >
                                          {article.writer?.email}
                                       </a>
                                    </h1>
                                 </>
                              </EditorSettingsDisclosure>
                           )}
                        {(article.upvotes!.length > 0 ||
                           article.downvotes!.length) > 0 && (
                           <EditorSettingsDisclosure name="Opinion">
                              <>
                                 <h1>
                                    {article.writer!.id !== user.id
                                       ? "This"
                                       : "Your"}{" "}
                                    article has {article.upvotes!.length} like
                                    {article.upvotes!.length !== 1 &&
                                       "s"} and {article.downvotes!.length}{" "}
                                    dislike
                                    {article.downvotes!.length !== 1 && "s"}.
                                 </h1>

                                 <Tabs
                                    className="mt-1 -px-1"
                                    grow
                                    position="center"
                                 >
                                    <Tabs.Tab
                                       label="Likes"
                                       icon={<AiOutlineLike />}
                                    >
                                       {article.upvotes!.length === 0 ? (
                                          <p className="text-gray-700 dark:text-gray-300">
                                             What? Show this article around!
                                          </p>
                                       ) : (
                                          <div
                                             className={`mt-1 grid ${
                                                bigScreen || mobile
                                                   ? "grid-cols-2"
                                                   : "grid-cols-1"
                                             } gap-2`}
                                          >
                                             {article.upvotes!.map(
                                                (
                                                   upvote: Upvote & {
                                                      user?: User;
                                                   },
                                                   index
                                                ) => (
                                                   <div
                                                      className={`flex items-center gap-2 ${
                                                         index !==
                                                            article.upvotes!
                                                               .length -
                                                               1 && "mb-2"
                                                      }`}
                                                      key={index}
                                                   >
                                                      <Image
                                                         width={50}
                                                         height={50}
                                                         placeholder="blur"
                                                         blurDataURL={shimmer(
                                                            100,
                                                            100
                                                         )}
                                                         src={
                                                            upvote.user!.image
                                                         }
                                                         className="w-[20%] rounded-full"
                                                      />
                                                      <Link
                                                         href={`/profile/${
                                                            upvote.user!.id
                                                         }`}
                                                      >
                                                         <a className="font-medium truncate duration-150 hover:text-blue-500">
                                                            {computeKCAName(
                                                               upvote.user!
                                                            )}
                                                         </a>
                                                      </Link>
                                                   </div>
                                                )
                                             )}
                                          </div>
                                       )}
                                    </Tabs.Tab>
                                    <Tabs.Tab
                                       label="Dislikes"
                                       icon={<AiOutlineDislike />}
                                       color="red"
                                    >
                                       {article.downvotes!.length === 0 ? (
                                          <p className="text-gray-700 dark:text-gray-300">
                                             Woohoo! No dislikes!
                                          </p>
                                       ) : (
                                          <div
                                             className={`mt-1 grid ${
                                                bigScreen || mobile
                                                   ? "grid-cols-2"
                                                   : "grid-cols-1"
                                             } gap-2`}
                                          >
                                             {article.downvotes!.map(
                                                (
                                                   downvote: Downvote & {
                                                      user?: User;
                                                   },
                                                   index
                                                ) => (
                                                   <div
                                                      className={`flex items-center gap-2 ${
                                                         index !==
                                                            article.upvotes!
                                                               .length -
                                                               1 && "mb-2"
                                                      }`}
                                                      key={index}
                                                   >
                                                      <Image
                                                         width={50}
                                                         height={50}
                                                         placeholder="blur"
                                                         blurDataURL={shimmer(
                                                            100,
                                                            100
                                                         )}
                                                         src={
                                                            downvote.user!.image
                                                         }
                                                         className="w-[20%] rounded-full"
                                                      />
                                                      <Link
                                                         href={`/profile/${
                                                            downvote.user!.id
                                                         }`}
                                                      >
                                                         <a className="font-medium duration-150 hover:text-blue-500">
                                                            {computeKCAName(
                                                               downvote.user!
                                                            )}
                                                         </a>
                                                      </Link>
                                                   </div>
                                                )
                                             )}
                                          </div>
                                       )}
                                    </Tabs.Tab>
                                 </Tabs>
                              </>
                           </EditorSettingsDisclosure>
                        )}
                        <div
                           className={viewportHeight > 550 ? "flex-grow" : ""}
                           ref={restEmptyRef}
                        >
                           <div
                              className={`${
                                 restEmptyHeight > 100
                                    ? "fixed bottom-0 w-[20%]"
                                    : "w-full"
                              } select-none px-2 py-4`}
                           >
                              <Button
                                 className="w-full"
                                 disabled={canBeAttemptedSave}
                                 onClick={attemptToSave}
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
            isOpen={openConfirmModalUnderReview || deleteConfirmModal}
            successFunction={() => {
               if (openConfirmModalUnderReview) return handleSetUnderReview();
               if (deleteConfirmModal) return handleDeleteArticle();
            }}
            updateModalState={() => {
               if (openConfirmModalUnderReview)
                  return setOpenConfirmModalUnderReview(
                     !openConfirmModalUnderReview
                  );
               if (deleteConfirmModal)
                  return setDeleteConfirmModal(!deleteConfirmModal);
            }}
         />
         <ModalArticleCoverUploaderWrapper
            isOpen={openChangeCoverModal}
            updateModalState={toggleChangeCoverModal}
            article={article}
            updateArticle={(v) => {
               setArticle(v);
               setDisplayAlert(true);
            }}
            setMainLoading={setBigLoad}
         />
         <EditorWordCount
            content={markdownValue}
            isOpen={openWordCountModal}
            toggleIsOpen={() => setOpenWordCountModal(!openWordCountModal)}
         />
      </>
   );
};

const WrappedArticleBadge = ({ value }: { value: string }) => (
   <ArticleBadge tag={value} className="mt-1 mb-1" />
);

const CoWriterUser = forwardRef<HTMLDivElement, any>(
   ({ user, ...rest }: { user: User }, ref) => (
      <div
         ref={ref}
         {...rest}
         className="flex items-center gap-2 px-2 py-2 duration-150 cursor-pointer select-none hover:bg-gray-300 dark:hover:bg-dark-bg"
      >
         <Image
            className="rounded-full"
            src={user.image}
            width="25px"
            height="25px"
            blurDataURL={shimmer(1920, 1080)}
            alt={`${user.name.split(" ")[0]}'s profile image`}
         />
         <span>{computeKCAName(user)}</span>
      </div>
   )
);

export const getServerSideProps: GetServerSideProps = async ({
   query,
   req,
}) => {
   const { id } = query;
   const session = await getSession({ req });

   if (
      !session ||
      (session?.user?.isAdmin || session?.user?.isEditorial
         ? false
         : !session?.user?.isWriter)
   )
      return {
         redirect: {
            destination: "/",
            permanent: false,
         },
      };

   const article =
      session?.user?.isAdmin || session?.user?.isEditorial
         ? await prisma.article.findFirst({
              where: {
                 id: id as string,
              },
              include: {
                 writer: true,
                 coWriters: true,
                 upvotes: {
                    include: {
                       user: true,
                    },
                 },
                 downvotes: {
                    include: {
                       user: true,
                    },
                 },
              },
           })
         : await prisma.article.findFirst({
              where: { id: id as string, user: session?.user?.id },
              include: {
                 writer: true,
                 coWriters: true,
                 upvotes: {
                    include: {
                       user: true,
                    },
                 },
                 downvotes: {
                    include: {
                       user: true,
                    },
                 },
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
