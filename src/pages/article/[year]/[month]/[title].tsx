import React, { useState } from "react";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";
import { format } from "date-fns";
import Image from "next/image";
import { useSession, signIn, getSession } from "next-auth/react";
import { Slide } from "react-awesome-reveal";
import { Formik, Field, Form } from "formik";
import { useNotifications } from "@mantine/notifications";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import { validate } from "uuid";

const Editor = dynamic(() => import("@davidilie/markdown-editor"), {
   ssr: false,
});

import {
   AiOutlineLike,
   AiOutlineDislike,
   AiFillLike,
   AiFillDislike,
   AiOutlineCheck,
   AiOutlineClose,
} from "react-icons/ai";

import prisma from "@/lib/prisma";
import type { Article } from "@/types/Article";
import type { Comment } from "@/types/Comment";
import { shimmer } from "@/lib/shimmer";
import { crudCommentSchema } from "@/schema/comment";

import { Button } from "@/ui/Button";
import ArticleBadge from "@/components/ArticleBadge";
import ErrorMessage from "@/ui/ErrorMessage";
import SuccessMessage from "@/ui/SuccessMessage";
import ConfirmModal from "@/ui/ConfirmModal";
import ArticleWriterInfo from "@/components/ArticleWriterInfo";
import { computeKCAName } from "@/lib/computeKCAName";
import Linkify from "@/components/Linkify";

interface Props {
   article: Article;
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
   upvotes,
   downvotes,
   comments,
}) => {
   const notifications = useNotifications();
   const router = useRouter();
   const { resolvedTheme } = useTheme();

   const { data } = useSession();

   const [upvoteCount, setUpvoteCount] = useState<number>(upvotes.count || 0);
   const [selfUpvote, setSelfUpvote] = useState<boolean>(upvotes.self);

   const [downvoteCount, setDownvoteCount] = useState<number>(
      downvotes.count || 0
   );
   const [selfDownvote, setSelfDownvote] = useState<boolean>(downvotes.self);

   const [commentsState, setComments] = useState<Comment[]>(comments);

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
         setComments(commentsState.filter((v) => v.id !== deleteCommentId));

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

   const description = `${article.description} ${
      article.published
         ? ` ${upvoteCount} like${
              upvoteCount > 1 || upvoteCount === 0 ? "s" : ""
           } - ${downvoteCount} dislike${
              downvoteCount > 1 || downvoteCount === 0 ? "s" : ""
           } - ${commentsState.length} comment${
              commentsState.length > 1 || commentsState.length === 0 ? "s" : ""
           }`
         : ""
   }`;

   return (
      <>
         <NextSeo
            title={article.title}
            description={description}
            canonical={`${process.env.NEXT_PUBLIC_APP_URL}/${router.asPath}`}
            openGraph={{
               title: article.title,
               site_name: "KCA News",
               article: {
                  publishedTime: new Date(article.createdAt).toDateString(),
                  authors:
                     article.coWriters.length !== 0
                        ? [
                             `${process.env.NEXT_PUBLIC_APP_URL}/profile/${article.writer?.id}`,
                             ...article.coWriters?.map(
                                (co) =>
                                   `${process.env.NEXT_PUBLIC_APP_URL}/profile/${co.id}`
                             ),
                          ]
                        : [
                             `${process.env.NEXT_PUBLIC_APP_URL}/profile/${article.writer?.id}`,
                          ],
                  tags: article.categoryId,
               },
               description: description,
               url: `${process.env.NEXT_PUBLIC_APP_URL}/${router.asPath}`,
               type: "article",
               images: [
                  {
                     url: article.cover,
                  },
               ],
            }}
         />
         <div className="flex flex-grow dark:bg-dark-bg sm:pt-32 md:pt-36 lg:px-0 xl:pt-20">
            <Slide
               triggerOnce
               className="mx-auto"
               direction="up"
               duration={500}
            >
               <div className="container max-w-4xl mx-auto mt-10">
                  <div className="flex flex-wrap justify-start w-full px-3 mb-2">
                     {article.categoryId
                        .concat(article.tags)
                        .map((category, index) => (
                           <ArticleBadge tag={category} key={index} />
                        ))}
                  </div>
                  <div className="flex justify-between px-4 pb-2">
                     <h1 className="text-2xl font-semibold leading-[3rem] sm:text-4xl">
                        {article.title}
                     </h1>
                     {article.published && (
                        <div className="grid grid-cols-2 divide-x-2 divide-gray-500">
                           <div className="flex items-center justify-center gap-1 mr-4">
                              {selfUpvote && data ? (
                                 <AiFillLike
                                    size="30"
                                    className="text-blue-500 duration-150 cursor-pointer hover:text-blue-500"
                                    onClick={() => handleOpinion("upvote")}
                                 />
                              ) : (
                                 <AiOutlineLike
                                    size="30"
                                    className="duration-150 cursor-pointer hover:text-blue-500"
                                    onClick={() => handleOpinion("upvote")}
                                 />
                              )}
                              <p className="font-medium select-none">
                                 {upvoteCount}
                              </p>
                           </div>
                           <div className="flex items-center justify-center gap-1 pl-4">
                              {selfDownvote && data ? (
                                 <AiFillDislike
                                    size="30"
                                    className="text-red-500 duration-150 cursor-pointer hover:text-red-500"
                                    onClick={() => handleOpinion("downvote")}
                                 />
                              ) : (
                                 <AiOutlineDislike
                                    size="30"
                                    className="duration-150 cursor-pointer hover:text-red-500"
                                    onClick={() => handleOpinion("downvote")}
                                 />
                              )}
                              <p className="font-medium select-none">
                                 {downvoteCount}
                              </p>
                           </div>
                        </div>
                     )}
                  </div>
                  <div className="mx-4 border-b-2" />
                  <ArticleWriterInfo
                     article={article}
                     user={data?.user}
                     showEdit={true}
                     className="mt-1 ml-4"
                  />
                  <div className="items-center gap-3 mx-4 mt-2 mb-6 justify-evenly sm:flex">
                     <div className="sm:w-2/3">
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
                     <div className="sm:h-[300px] sm:w-1/2 sm:pt-2">
                        {/*
                        // @ts-ignore */}
                        <Editor
                           defaultValue={article.description}
                           readOnly
                           dark={resolvedTheme === "dark"}
                        />
                     </div>
                  </div>
                  <div className="mx-4 mt-4 mb-1 border-t-2" />
                  <div className="px-4">
                     <Editor
                        defaultValue={article.mdx}
                        readOnly
                        dark={resolvedTheme === "dark"}
                     />
                  </div>
                  <div
                     className={`mx-4 mt-6 border-t-2 pt-4 ${
                        !article.published && "mb-20"
                     }`}
                  />
                  {article.published && (
                     <div className="px-4 pb-10">
                        <h1 className="text-4xl font-semibold">
                           What do you think?
                        </h1>
                        <div className="w-full p-6 my-4 border border-gray-200 rounded bg-gray-50 dark:border-gray-800 dark:bg-foot">
                           <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100 md:text-xl">
                              Leave a comment
                           </h5>
                           <p className="my-1 text-gray-800 dark:text-gray-200">
                              Share your opinion regarding this article for
                              other students/teachers to see.
                           </p>
                           {!data ? (
                              <Button
                                 onClick={() => signIn("google")}
                                 className="mt-2"
                              >
                                 Login
                              </Button>
                           ) : !data?.user?.canComment ? (
                              <>
                                 <p className="mt-2 font-semibold text-red-500">
                                    You are currently restricted from
                                    commenting.
                                 </p>
                              </>
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
                                             response.comment,
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
                                             className="block w-full py-2 pl-4 pr-32 mt-1 text-gray-900 bg-gray-100 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500 dark:border-gray-800 dark:bg-dark-bg dark:text-gray-100 dark:focus:border-blue-900 dark:focus:ring-blue-900"
                                          />
                                          <Button
                                             className="w-full mt-2 mb-2"
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
                                                Success! Your comment will be
                                                published once reviewed by an
                                                moderator.
                                             </SuccessMessage>
                                          ) : (
                                             <p className="text-sm text-gray-800 dark:text-gray-200">
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
                                 className={`flex gap-4 rounded-md border border-gray-200 bg-gray-50 py-4 px-4 dark:border-gray-800 dark:bg-foot ${
                                    index !== commentsState.length - 1 && "mb-4"
                                 }`}
                                 key={index}
                              >
                                 <img
                                    src={comment.user?.image || "/no-pfp.jpg"}
                                    width={55}
                                    height={24}
                                    // blurDataURL={shimmer(10, 10)}
                                    placeholder="blur"
                                    className="object-cover rounded-full"
                                    alt={`${
                                       comment.user?.names[
                                          comment.user?.nameIndex
                                       ]
                                    }'s profile image`}
                                 />
                                 <div className="space-y-1">
                                    <div className="w-full">
                                       <Linkify>{comment.comment}</Linkify>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                       <Link
                                          href={`/profile/${comment.user?.id}`}
                                       >
                                          <a className="text-sm text-gray-500 duration-150 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-500">
                                             {computeKCAName(comment.user!)}
                                          </a>
                                       </Link>
                                       <span className="text-gray-800 dark:text-gray-200">
                                          /
                                       </span>
                                       <p className="text-sm text-gray-400 dark:text-gray-300">
                                          {format(
                                             new Date(comment.createdAt),
                                             "d MMM yyyy 'at' h:mm bb"
                                          )}
                                       </p>
                                       {(comment.userId === data?.user?.id ||
                                          data?.user?.isAdmin) && (
                                          <>
                                             <span className="text-gray-800 dark:text-gray-200">
                                                /
                                             </span>
                                             <button
                                                className="text-sm text-red-600 dark:text-red-500"
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
   const { year, month, title } = query;

   if (!year && !month && !title)
      return {
         props: {
            notFound: true,
         },
      };

   const dynamicCheck = await prisma.article.findFirst({
      where: validate(title as string)
         ? {
              id: title as string,
           }
         : {
              createdAt: {
                 gte: new Date(`${year}-${month}-01T00:00:00.000Z`),
                 lte: new Date(`${year}-${month}-31T23:59:59.000Z`),
              },
              slug: title as string,
           },
      select: { id: true },
   });

   if (!dynamicCheck)
      return {
         props: {
            notFound: true,
         },
      };

   const id = dynamicCheck.id;
   const { share } = query;
   const session = await getSession({ req });

   const article = await prisma.article.findFirst({
      where:
         session?.user?.isAdmin || session?.user?.isEditorial
            ? { id: id as string }
            : session?.user?.isReviewer
            ? {
                 id: id as string,
                 OR: [
                    { sharedId: share as string },
                    { user: session?.user?.id },
                    { location: { in: session?.user?.department } },
                 ],
              }
            : session?.user?.isWriter
            ? {
                 id: id as string,
                 OR: [
                    { sharedId: share as string },
                    { user: session?.user?.id },
                    { published: true },
                 ],
              }
            : {
                 id: id as string,
                 OR:
                    share !== undefined
                       ? [
                            {
                               sharedToTeam: false,
                               sharedId: share as string,
                               shared: true,
                            },
                         ]
                       : [{ published: true, underReview: false }],
              },
      include: {
         coWriters: true,
         comments: {
            include: {
               user: true,
            },
            orderBy: {
               createdAt: "desc",
            },
            where: session
               ? session?.user?.isAdmin ||
                 session?.user?.isEditorial ||
                 session?.user?.isReviewer
                  ? {}
                  : {
                       OR: [
                          { userId: session?.user?.id },
                          { underReview: false },
                       ],
                    }
               : {
                    underReview: false,
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
         upvotes: {
            count: article.upvotes.length || 0,
            self: hasSelfUpvoted,
         },
         downvotes: {
            count: article.downvotes.length || 0,
            self: hasSelfDownvoted,
         },
         comments: JSON.parse(JSON.stringify(article.comments)),
      },
   };
};

export default ArticleViewer;
