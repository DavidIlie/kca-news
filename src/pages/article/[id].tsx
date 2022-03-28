import React, { useState } from "react";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";
import { format, parseISO } from "date-fns";
import Image from "next/image";
import { useSession, signIn, getSession } from "next-auth/react";
import { Slide } from "react-awesome-reveal";
import { Formik, Field, Form } from "formik";
import { Popover, Transition } from "@headlessui/react";
import { useNotifications } from "@mantine/notifications";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

const Editor = dynamic(() => import("rich-markdown-editor"), { ssr: false });

import {
   AiOutlineLike,
   AiOutlineDislike,
   AiFillLike,
   AiFillDislike,
   AiOutlineCheck,
   AiOutlineClose,
} from "react-icons/ai";

import prisma from "../../lib/prisma";
import type { Article } from "../../types/Article";
import type { User } from "../../types/User";
import type { Comment } from "../../types/Comment";
import { shimmer } from "../../lib/shimmer";
import { crudCommentSchema } from "../../schema/comment";

import { Button } from "../../ui/Button";
import ArticleBadge from "../../components/ArticleBadge";
import ErrorMessage from "../../ui/ErrorMessage";
import SuccessMessage from "../../ui/SuccessMessage";
import ConfirmModal from "../../ui/ConfirmModal";

interface Props {
   article: Article;
   writer: User;
   notFound?: boolean;
   upvotes: {
      count: number;
      self: boolean;
   };
   downvotes: {
      count: number;
      self: boolean;
   };
   comments: Comment[];
}

const ArticleViewer: React.FC<Props> = ({
   article,
   writer,
   notFound,
   upvotes,
   downvotes,
   comments,
}) => {
   if (notFound) {
      return (
         <div className="flex min-h-screen flex-grow items-center justify-center">
            <Slide triggerOnce direction="down">
               <div>
                  <h1 className="mb-4 text-6xl font-bold text-red-500">
                     404 not found.
                  </h1>
                  <Link href="/">
                     <a>
                        <Button className="mx-auto">Go Home</Button>
                     </a>
                  </Link>
               </div>
            </Slide>
         </div>
      );
   }

   const notifications = useNotifications();
   const router = useRouter();

   const { data } = useSession();

   const [upvoteCount, setUpvoteCount] = useState<number>(upvotes.count);
   const [selfUpvote, setSelfUpvote] = useState<boolean>(upvotes.self);

   const [downvoteCount, setDownvoteCount] = useState<number>(downvotes.count);
   const [selfDownvote, setSelfDownvote] = useState<boolean>(downvotes.self);

   const [commentsState, setComments] = useState<Array<Comment>>(comments);

   const [formSuccess, setFormSuccess] = useState<boolean>(false);

   const [openConfirmModal, setOpenConfirmModal] = useState<boolean>(false);
   const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);

   const handleOpinion = async (s: "upvote" | "downvote") => {
      if (!data?.user) return signIn("google");

      const id = notifications.showNotification({
         loading: true,
         title: "Opinion",
         message:
            s === "upvote" ? "Liking this article" : "Disliking this article",
         autoClose: false,
         disallowClose: true,
      });

      const r = await fetch(`/api/article/${article.id}/${s}`, {
         credentials: "include",
      });
      if (r.status === 200) {
         if (s === "upvote") {
            if (selfDownvote) {
               setSelfDownvote(false);
               setDownvoteCount(downvoteCount - 1);
            }
            if (selfUpvote) {
               setSelfUpvote(false);
               setUpvoteCount(upvoteCount - 1);
            } else {
               setSelfUpvote(true);
               setUpvoteCount(upvoteCount + 1);
            }
         } else {
            if (selfUpvote) {
               setSelfUpvote(false);
               setUpvoteCount(upvoteCount - 1);
            }
            if (selfDownvote) {
               setSelfDownvote(false);
               setDownvoteCount(downvoteCount - 1);
            } else {
               setSelfDownvote(true);
               setDownvoteCount(downvoteCount + 1);
            }
         }
         notifications.updateNotification(id, {
            id,
            color: s === "upvote" ? "teal" : "red",
            title: "Opinion",
            message:
               s === "upvote"
                  ? !selfUpvote
                     ? "Liked this article successfully!"
                     : "Unliked this article successfully!"
                  : !selfDownvote
                  ? "Disliked this article successfully!"
                  : "Un-Disliked this article successfully!",
            icon: <AiOutlineCheck />,
            autoClose: 2000,
         });
      } else {
         const response = await r.json();

         notifications.updateNotification(id, {
            id,
            color: "red",
            title: "Opinion - Error",
            message: response.message || "Unknown Error",
            icon: <AiOutlineClose />,
            autoClose: 5000,
         });
      }
   };

   const deleteComment = async () => {
      const id = notifications.showNotification({
         loading: true,
         title: "Comment",
         message: "Deleting your comment...",
         autoClose: false,
         disallowClose: true,
      });

      const r = await fetch(
         `/api/article/${article.id}/comment/${deleteCommentId}`,
         {
            credentials: "include",
            method: "DELETE",
         }
      );
      if (r.status === 200) {
         let finalArray = [] as Array<Comment>;
         commentsState.map(
            (comment) =>
               comment.id !== deleteCommentId && finalArray.push(comment)
         );
         setComments(finalArray);
         notifications.updateNotification(id, {
            id,
            color: "teal",
            title: "Comment",
            message: "Deleted this comment successfully!",
            icon: <AiOutlineCheck />,
            autoClose: 2000,
         });
      } else {
         const response = await r.json();
         notifications.updateNotification(id, {
            id,
            color: "red",
            title: "Comment - Error",
            message: response.message || "Unknown Error",
            icon: <AiOutlineClose />,
            autoClose: 2000,
         });
      }
   };

   return (
      <>
         <NextSeo
            title={article.title}
            description={article.description}
            canonical={`https://davidilie.com/${router.asPath}`}
            twitter={{
               cardType: "summary_large_image",
               site: "@KCAlicante",
            }}
            openGraph={{
               title: article.title,
               site_name: "KCA News",
               article: {
                  publishedTime: new Date(article.createdAt).toDateString(),
                  authors:
                     article.coWriters.length !== 0
                        ? [
                             `https://davidilie.com/profile/${article.writer?.id}`,
                             ...article.coWriters?.map(
                                (co) => `https://davidilie.com/profile/${co.id}`
                             ),
                          ]
                        : [
                             `https://davidilie.com/profile/${article.writer?.id}`,
                          ],
                  tags: article.categoryId,
               },
               description: `${article.description} ${
                  article.published
                     ? ` ${upvoteCount} like${
                          upvoteCount > 1 || upvoteCount === 0 ? "s" : ""
                       } - ${downvoteCount} dislike${
                          downvoteCount > 1 || downvoteCount === 0 ? "s" : ""
                       } - ${commentsState.length} comment${
                          commentsState.length > 1 || commentsState.length === 0
                             ? "s"
                             : ""
                       }`
                     : ""
               }`,
               url: `https://davidilie.com/${router.asPath}`,
               type: "article",
               images: [
                  {
                     url: article.cover,
                  },
               ],
            }}
         />
         <div className="sm:pt-42 mb-20 flex flex-grow px-4 md:pt-36 lg:px-0 xl:pt-24">
            <Slide
               triggerOnce
               className="mx-auto"
               direction="up"
               duration={500}
            >
               <div className="container mx-auto mt-10 max-w-4xl">
                  <div className="mb-2 flex w-full flex-wrap justify-start px-3">
                     {article.categoryId.map((category, index) => (
                        <ArticleBadge tag={category} key={index} />
                     ))}
                  </div>
                  <div className="flex justify-between border-b-2 pb-2">
                     <h1 className="px-4 text-4xl font-semibold">
                        {article.title}
                     </h1>
                     {article.published && (
                        <div className="grid grid-cols-2 divide-x-2 divide-gray-500">
                           <div className="mr-4 flex items-center justify-center gap-1">
                              {selfUpvote && data ? (
                                 <AiFillLike
                                    size="30"
                                    className="cursor-pointer text-blue-500 duration-150 hover:text-blue-500"
                                    onClick={() => handleOpinion("upvote")}
                                 />
                              ) : (
                                 <AiOutlineLike
                                    size="30"
                                    className="cursor-pointer duration-150 hover:text-blue-500"
                                    onClick={() => handleOpinion("upvote")}
                                 />
                              )}
                              <p className="select-none font-medium">
                                 {upvoteCount}
                              </p>
                           </div>
                           <div className="flex items-center justify-center gap-1 pl-4">
                              {selfDownvote && data ? (
                                 <AiFillDislike
                                    size="30"
                                    className="cursor-pointer text-red-500 duration-150 hover:text-red-500"
                                    onClick={() => handleOpinion("downvote")}
                                 />
                              ) : (
                                 <AiOutlineDislike
                                    size="30"
                                    className="cursor-pointer duration-150 hover:text-red-500"
                                    onClick={() => handleOpinion("downvote")}
                                 />
                              )}
                              <p className="select-none font-medium">
                                 {downvoteCount}
                              </p>
                           </div>
                        </div>
                     )}
                  </div>
                  <div className="ml-4 mt-1 flex items-center">
                     <span className="inline-flex items-center justify-center rounded-md py-2 text-xs font-medium leading-none">
                        <Image
                           className="rounded-full"
                           src={
                              article.anonymous ? "/no-pfp.jpg" : writer.image
                           }
                           width="25px"
                           height="25px"
                           blurDataURL={shimmer(1920, 1080)}
                           alt={`${
                              article.anonymous
                                 ? "KCA News"
                                 : writer.name.split(" ")[0]
                           }'s profile image`}
                        />
                        <span className="ml-2 mr-1 text-lg">
                           {article.anonymous ? (
                              "KCA News Team"
                           ) : (
                              <div className="flex gap-2">
                                 <Link href={`/profile/${writer.id}`}>
                                    <a className="duration-150 hover:text-blue-500">
                                       {writer.name}
                                    </a>
                                 </Link>
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
                     {(data?.user?.isAdmin ||
                        article.writer?.id === data?.user?.id) && (
                        <h1 className="ml-2 flex items-center text-blue-500">
                           {" / "}
                           <div className="ml-2">
                              <Link
                                 href={`/dashboard/writer/edit/${article.id}`}
                              >
                                 <a>Edit Article</a>
                              </Link>
                           </div>
                        </h1>
                     )}
                  </div>
                  <div className="mx-4 mt-2 mb-6 flex justify-center">
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
                  <p className="w-full max-w-5xl px-4 text-justify">
                     {article.description}
                  </p>
                  <div className="mt-4 ml-4 border-t-2" />
                  <div className="px-4">
                     {/*
                        // @ts-ignore */}
                     <Editor defaultValue={article.mdx} readOnly />
                  </div>
                  <div className="mt-6 border-t-2 pt-4" />
                  {article.published && (
                     <div className="px-4">
                        <h1 className="text-4xl font-semibold">
                           What do you think?
                        </h1>
                        <div className="my-4 w-full rounded border border-gray-200 bg-gray-50 p-6">
                           <h5 className="text-lg font-semibold text-gray-900 md:text-xl">
                              Leave a comment
                           </h5>
                           <p className="my-1 text-gray-800">
                              Share your opinion regarding this article for
                              other students/teachers to see.
                           </p>
                           {!data ? (
                              <a
                                 className="my-4 flex h-8 w-28 cursor-pointer items-center justify-center rounded bg-gray-200 font-bold text-gray-900 duration-150 hover:bg-gray-300"
                                 onClick={() => signIn("google")}
                              >
                                 Login
                              </a>
                           ) : (
                              <div className="mt-2">
                                 <Formik
                                    validateOnChange={false}
                                    validateOnBlur={false}
                                    validationSchema={crudCommentSchema}
                                    initialValues={{
                                       message: "",
                                    }}
                                    onSubmit={async (
                                       data,
                                       {
                                          setSubmitting,
                                          setFieldError,
                                          resetForm,
                                       }
                                    ) => {
                                       setSubmitting(true);

                                       const r = await fetch(
                                          `/api/article/${article.id}/comment`,
                                          {
                                             method: "POST",
                                             body: JSON.stringify(data),
                                             credentials: "include",
                                          }
                                       );
                                       const response = await r.json();

                                       if (r.status !== 200) {
                                          setFieldError(
                                             "message",
                                             response.message
                                          );
                                       } else {
                                          resetForm();
                                          setFormSuccess(true);
                                          setInterval(
                                             () => setFormSuccess(false),
                                             2000
                                          );
                                          setComments([
                                             response,
                                             ...commentsState,
                                          ]);
                                       }

                                       setSubmitting(false);
                                    }}
                                 >
                                    {({ errors, isSubmitting }) => (
                                       <Form>
                                          <Field
                                             as="input"
                                             aria-label="Your comment"
                                             placeholder="Your comment..."
                                             required
                                             name="message"
                                             className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-gray-100 py-2 pl-4 pr-32 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                          />
                                          <Button
                                             className="mt-2 mb-2 w-full"
                                             type="submit"
                                             disabled={isSubmitting}
                                             loading={isSubmitting}
                                          >
                                             Comment
                                          </Button>
                                          {errors.message ? (
                                             <ErrorMessage>
                                                {errors.message}
                                             </ErrorMessage>
                                          ) : formSuccess ? (
                                             <SuccessMessage>
                                                Created successfully!
                                             </SuccessMessage>
                                          ) : (
                                             <p className="text-sm text-gray-800">
                                                Your information is only used to
                                                display your name and reply by
                                                email.
                                             </p>
                                          )}
                                       </Form>
                                    )}
                                 </Formik>
                              </div>
                           )}
                        </div>
                        <div id="comments">
                           {commentsState.map((comment, index) => (
                              <div
                                 className={`flex gap-4 rounded-md border border-gray-200 bg-gray-50 py-4 px-4 ${
                                    index !== commentsState.length - 1 && "mb-4"
                                 }`}
                                 key={index}
                              >
                                 <Image
                                    src={comment.user?.image || "/no-pfp.jpg"}
                                    width={55}
                                    height={24}
                                    blurDataURL={shimmer(10, 10)}
                                    placeholder="blur"
                                    className="rounded-full object-cover"
                                    alt={`${
                                       comment.user?.name.split(" ")[0]
                                    }'s profile image`}
                                 />
                                 <div className="flex flex-col space-y-2 ">
                                    <div className="w-full">
                                       {comment.comment}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                       <p className="text-sm text-gray-500">
                                          {comment.user?.name}
                                       </p>
                                       <span className=" text-gray-800">/</span>
                                       <p className="text-sm text-gray-400">
                                          {format(
                                             new Date(comment.createdAt),
                                             "d MMM yyyy 'at' h:mm bb"
                                          )}
                                       </p>
                                       {data?.user &&
                                          comment.userId === data.user?.id && (
                                             <>
                                                <span className="text-gray-200">
                                                   /
                                                </span>
                                                <button
                                                   className="text-sm text-red-600"
                                                   onClick={() => {
                                                      setDeleteCommentId(
                                                         comment.id
                                                      );
                                                      setOpenConfirmModal(true);
                                                   }}
                                                >
                                                   Delete
                                                </button>
                                             </>
                                          )}
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </Slide>
         </div>
         <ConfirmModal
            isOpen={openConfirmModal}
            updateModalState={() => setOpenConfirmModal(!openConfirmModal)}
            successFunction={deleteComment}
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

   const article = await prisma.article.findFirst({
      where: session?.user?.isAdmin
         ? { id: id as string }
         : session?.user?.isWriter
         ? { id: id as string, user: session?.user?.id }
         : { id: id as string, published: true, underReview: false },
      include: {
         coWriters: true,
         comments: {
            include: {
               user: true,
            },
            orderBy: {
               createdAt: "desc",
            },
         },
         upvotes: true,
         downvotes: true,
         writer: true,
      },
   });

   if (!article)
      return {
         props: {
            notFound: true,
         },
      };

   let hasSelfUpvoted = false;
   let hasSelfDownvoted = false;

   article.upvotes.forEach(
      (s) => s.votedBy === session?.user?.id && (hasSelfUpvoted = true)
   );
   article.downvotes.forEach(
      (s) => s.votedBy === session?.user?.id && (hasSelfDownvoted = true)
   );

   return {
      props: {
         article: JSON.parse(JSON.stringify(article)),
         writer: article.anonymous
            ? false
            : JSON.parse(JSON.stringify(article.writer)),
         upvotes: {
            count: article.upvotes.length,
            self: hasSelfUpvoted,
         },
         downvotes: {
            count: article.downvotes.length,
            self: hasSelfDownvoted,
         },
         comments: JSON.parse(JSON.stringify(article.comments)),
      },
   };
};

export default ArticleViewer;
