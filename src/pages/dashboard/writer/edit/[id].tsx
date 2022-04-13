import React, { useState, useEffect, forwardRef } from "react";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { DefaultSeo } from "next-seo";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
   AiFillTag,
   AiOutlineCheck,
   AiOutlineClose,
   AiOutlineCloseCircle,
   AiOutlineMenu,
   AiOutlineUser,
} from "react-icons/ai";
import { RiRestartLine } from "react-icons/ri";
import ContentEditable from "react-contenteditable";
import { useNotifications } from "@mantine/notifications";
import {
   useLocalStorage,
   useElementSize,
   useViewportSize,
   useClipboard,
} from "@mantine/hooks";
import {
   MultiSelect,
   TextInput,
   Tooltip,
   LoadingOverlay,
   Textarea,
   Alert,
   ScrollArea,
   Select,
} from "@mantine/core";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTheme } from "next-themes";
import { BiCategory } from "react-icons/bi";
import { BsTrash } from "react-icons/bs";
import { useBeforeUnload } from "react-use";

const Editor = dynamic(() => import("rich-markdown-editor"), { ssr: false });

import prisma from "../../../../lib/prisma";
import { Article } from "../../../../types/Article";
import { User } from "../../../../types/User";
import { Button } from "../../../../ui/Button";
import EditorSettingsDisclosure from "../../../../components/EditorSettingsDisclosure";
import ArticleBadge from "../../../../components/ArticleBadge";
import {
   fullLocations,
   getFormmatedLocation,
   links,
   Locations,
} from "../../../../lib/categories";
import Radio from "../../../../ui/Radio";
import ArticleUnderReviewCard from "../../../../components/ArticleUnderReviewCard";
import ConfirmModal from "../../../../ui/ConfirmModal";
import { shimmer } from "../../../../lib/shimmer";
import { Consumer } from "../../../../components/CustomSidebar/CustomSidebar";
import CustomSidebar from "../../../../components/CustomSidebar";
import useDetermineCustomQueryEditor from "../../../../hooks/useDetermineCustomQueryEditor";
import ArticleWriterInfo from "../../../../components/ArticleWriterInfo";
import ArticleCoverUploader, {
   ModalArticleCoverUploaderWrapper,
} from "../../../../components/ArticleCoverUploader/ArticleCoverUploader";
import sendPost from "../../../../lib/sendPost";
import { computeKCAName } from "../../../../lib/computeKCAName";

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

   useEffect(() => setOpenSidebar((menu as any as boolean) || openSidebar), []);

   const finalUrl = useDetermineCustomQueryEditor("menu");

   const { resolvedTheme } = useTheme();
   const notifications = useNotifications();
   const { height: viewportHeight } = useViewportSize();
   const { ref: restEmptyRef, height: restEmptyHeight } = useElementSize();
   const { ref, height } = useElementSize();
   const clipboard = useClipboard({ timeout: 2000 });
   const secondClipboard = useClipboard({ timeout: 2000 });

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

   const [openChangeCoverModal, setOpenChangeCoverModal] =
      useState<boolean>(false);
   const toggleChangeCoverModal = () =>
      setOpenChangeCoverModal(!openChangeCoverModal);

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
               className="fixed right-0 top-0 z-[200] mt-[55%] mr-5 cursor-pointer rounded-full border-2 border-gray-100 bg-gray-50 p-2 text-[3rem] duration-150 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-900 sm:mt-[6%]"
               title="Open Settings"
               onClick={() => setOpenSidebar(true)}
            />
         )}
         <div className="mt-4 flex flex-grow sm:mt-[5.4rem]">
            <LoadingOverlay visible={loadingContentUpdate || bigLoad} />
            <ScrollArea
               ref={ref}
               className={`mx-auto ${contentHeightSystem} px-4 pb-5 sm:pt-[1.75rem] ${
                  openSidebar ? "w-4/5" : "w-full"
               }`}
            >
               <div className="container mx-auto max-w-4xl">
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
                              <a className="font-semibold text-blue-500 duration-150 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-600">
                                 See article
                              </a>
                           </Link>
                        </Alert>
                     )}
                     <div className="mb-2 flex w-full flex-wrap justify-start">
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
                        className="text-4xl font-semibold"
                        html={title}
                        onChange={(e) => setTitle(e.target.value)}
                     />
                  </div>
                  <ArticleWriterInfo article={article} user={user} />
                  <div className="items-center justify-evenly gap-4 sm:flex">
                     <div className="relative mt-1 flex justify-center sm:w-2/3">
                        <div className="absolute top-0 right-0 z-50 mt-2 mr-4 flex items-center gap-4">
                           <Button
                              color="cyan"
                              onClick={toggleChangeCoverModal}
                           >
                              Replace
                           </Button>
                        </div>
                        <Image
                           alt="Post picture"
                           className="rounded-xl shadow-xl"
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
                                 className="absolute right-0 -mr-10 mt-5 cursor-pointer text-2xl"
                                 onClick={() => {
                                    setDescription(article.description);
                                 }}
                              />
                           </div>
                        )}
                        <ContentEditable
                           tagName="p"
                           className="mt-4"
                           html={description}
                           onChange={(e) => setDescription(e.target.value)}
                        />
                     </div>
                  </div>
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
                     dark={resolvedTheme === "dark"}
                     onImageUploadStart={() => setBigLoad(true)}
                     onImageUploadStop={() => setBigLoad(false)}
                     uploadImage={async (file) => {
                        const formData = new FormData();
                        formData.append("image", file);

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
                  <div className="mt-7 border-t-2 pt-4">
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
                  } relative border-l-2 borderColor py-4 flex h-full flex-col flex-grow`,
               }}
            >
               <Consumer>
                  {({ mobile }) => (
                     <>
                        <LoadingOverlay
                           visible={loadingRest && !loadingContentUpdate}
                        />
                        {!mobile && (
                           <div className="borderColor flex items-center justify-between gap-2 border-b-2 px-4 pb-4">
                              <h1 className="text-2xl font-semibold">
                                 Settings
                              </h1>
                              <AiOutlineCloseCircle
                                 size="25"
                                 className="mt-1 cursor-pointer text-black duration-150 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
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
                              <h1 className="-mt-2 mb-2 px-1 font-medium text-red-500">
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
                              classNames={{
                                 filledVariant:
                                    "dark:bg-foot border-2 dark:border-gray-800 border-gray-300",
                              }}
                           />
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
                              <h1 className="-mt-2 mb-2 px-1 font-medium text-red-500">
                                 You need a category in order to publish
                              </h1>
                           )}
                           {categories.length === 0 && location !== null && (
                              <h1 className="-mt-2 mb-2 px-1 font-medium text-red-500">
                                 At least one sub category is needed to publish.
                              </h1>
                           )}
                           <Select
                              data={fullLocations.map((location) => ({
                                 value: location,
                                 label: getFormmatedLocation(location),
                              }))}
                              value={location}
                              onChange={(e) => setLocation(e as any)}
                              placeholder="Pick all the appropiate category"
                              label="Category"
                              required
                              clearable
                              nothingFound="Nothing found"
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
                                 <div className="flex select-none items-center gap-2">
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
                              <div className="mt-3" />

                              {article.shared && (
                                 <>
                                    <Button
                                       className="w-full"
                                       onClick={() =>
                                          clipboard.copy(
                                             `${process.env.NEXT_PUBLIC_APP_URL}/article/${article.id}?share=${article.sharedId}`
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
                                       className="mt-2 w-full"
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
                                                `${process.env.NEXT_PUBLIC_APP_URL}/article/${article.id}?share=${article.sharedId}`
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
      </>
   );
};

const WrappedArticleBadge = ({ value }: { value: string }) => (
   <ArticleBadge tag={value} className="mb-1 mt-1" />
);

const CoWriterUser = forwardRef<HTMLDivElement, any>(
   ({ user, ...rest }: { user: User }, ref) => (
      <div
         ref={ref}
         {...rest}
         className="flex cursor-pointer select-none items-center gap-2 py-2 px-2 duration-150 hover:bg-gray-300 dark:hover:bg-dark-bg"
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
