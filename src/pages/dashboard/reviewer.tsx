import React, { useState } from "react";
import Link from "next/link";
import { NextSeo } from "next-seo";
import { GetServerSideProps } from "next";
import { getSession, useSession } from "next-auth/react";
import { LoadingOverlay } from "@mantine/core";
import { Tab } from "@headlessui/react";

import DashboardStatistics from "../../components/DashboardStatistics";

import prisma from "../../lib/prisma";
import { Statistics } from "./writer";
import classNames from "../../lib/classNames";
import { Article } from "../../types/Article";
import { Comment } from "../../types/Comment";

interface Props {
   statistics: Statistics;
   articles: Article[];
   comments: Comment[];
}

const ReviewerPage: React.FC<Props> = ({ statistics, articles, comments }) => {
   const { data } = useSession();
   const [bigLoading, setBigLoading] = useState<boolean>(false);

   return (
      <>
         <NextSeo title="Reviewer Panel" />
         <LoadingOverlay visible={bigLoading} />
         <div className="flex flex-grow px-4 pt-10 dark:bg-dark-bg sm:pt-32">
            <div className="mx-auto">
               <DashboardStatistics
                  isAdmin={true}
                  {...statistics}
                  className="mx-auto max-w-7xl lg:px-8"
               />
               <Tab.Group
                  as="div"
                  className="mx-2 mt-6 mb-8 sm:mx-8"
                  defaultIndex={data!.user!.isAdmin ? 1 : 0}
               >
                  <Tab.List
                     className={`flex ${
                        data!.user!.isAdmin && "flex-row-reverse"
                     } space-x-1 rounded-xl border-2 border-gray-200 bg-gray-100 p-1 dark:border-gray-800 dark:bg-foot`}
                  >
                     {data!.user!.isAdmin ? (
                        <Link href="/dashboard/writer">
                           <a
                              className={classNames(
                                 "w-full rounded-lg py-2.5 text-center text-sm font-medium leading-5 duration-150",
                                 "text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-dark-bg dark:hover:bg-opacity-60"
                              )}
                           >
                              Articles
                           </a>
                        </Link>
                     ) : (
                        <Tab
                           className={({ selected }) =>
                              classNames(
                                 "w-full rounded-lg py-2.5 text-sm font-medium leading-5 duration-150",
                                 selected
                                    ? "bg-white text-gray-800 shadow dark:bg-dark-bg dark:text-gray-100"
                                    : "text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-dark-bg dark:hover:bg-opacity-60"
                              )
                           }
                        >
                           Articles
                        </Tab>
                     )}
                     <Tab
                        className={({ selected }) =>
                           classNames(
                              "w-full rounded-lg py-2.5 text-sm font-medium leading-5 duration-150",
                              selected
                                 ? "bg-white text-gray-800 shadow dark:bg-dark-bg dark:text-gray-100"
                                 : "text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-dark-bg dark:hover:bg-opacity-60"
                           )
                        }
                     >
                        Comments
                     </Tab>
                  </Tab.List>
                  <Tab.Panels>
                     <Tab.Panel>
                        {data!.user!.isAdmin ? (
                           <CommentList comments={comments} />
                        ) : (
                           <ArticleList articles={articles} />
                        )}
                     </Tab.Panel>
                     <Tab.Panel>
                        {data!.user!.isAdmin ? (
                           <ArticleList articles={articles} />
                        ) : (
                           <CommentList comments={comments} />
                        )}
                     </Tab.Panel>
                  </Tab.Panels>
               </Tab.Group>
            </div>
         </div>
      </>
   );
};

interface ArticleListProps {
   articles: Article[];
}

const ArticleList: React.FC<ArticleListProps> = ({ articles }) => {
   return <>articles</>;
};

interface CommentListProps {
   comments: Comment[];
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
   const [commentsState, setCommentsState] = useState<Comment[]>(comments);

   return (
      <div className="mt-4">
         {commentsState.map((comment, index) => (
            <div
               className={`flex items-center justify-between rounded-md border-2 border-gray-100 bg-gray-50 px-6 py-2 dark:border-gray-800 dark:bg-foot ${
                  index !== commentsState.length - 1 && "mb-2"
               }`}
               key={index}
            ></div>
         ))}
      </div>
   );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
   const session = await getSession({ req });

   if (
      !session ||
      (session?.user?.isAdmin ? false : !session?.user?.isReviewer)
   )
      return {
         redirect: {
            destination: "/",
            permanent: false,
         },
      };

   const totalArticles = session?.user?.isAdmin
      ? await prisma.article.count()
      : await prisma.article.count({
           where: {
              location: {
                 in: session?.user?.department,
              },
           },
        });

   const publishedArticles = session?.user?.isAdmin
      ? await prisma.article.count({ where: { published: true } })
      : await prisma.article.count({
           where: {
              published: true,
              location: {
                 in: session?.user?.department,
              },
           },
        });
   const totalComments = session?.user?.isAdmin
      ? await prisma.comment.count()
      : await prisma.comment.count({
           where: {
              article: {
                 published: true,
                 location: { in: session?.user?.department },
              },
           },
        });
   const totalUpvotes = session?.user?.isAdmin
      ? await prisma.upvote.count()
      : await prisma.upvote.count({
           where: {
              article: {
                 published: true,
                 location: { in: session?.user?.department },
              },
           },
        });
   const totalDownvotes = session?.user?.isAdmin
      ? await prisma.downvote.count()
      : await prisma.downvote.count({
           where: {
              article: {
                 published: true,
                 location: { in: session?.user?.department },
              },
           },
        });

   const includeParams = {
      coWriters: true,
      comments: {
         take: 1,
         orderBy: {
            createdAt: "desc",
         },
         include: {
            user: true,
         },
      },
      writer: true,
      upvotes: true,
      downvotes: true,
   };

   const articles = session?.user?.isAdmin
      ? await prisma.article.findMany({
           include: includeParams as any,
           orderBy: {
              createdAt: "desc",
           },
           where: {
              underReview: true,
           },
        })
      : await prisma.article.findMany({
           include: includeParams as any,
           where: {
              user: session?.user?.id,
              location: { in: session?.user?.department },
              underReview: true,
           },
           orderBy: {
              createdAt: "desc",
           },
        });

   const comments = session?.user?.isAdmin
      ? await prisma.comment.findMany({
           include: { user: true, article: true },
           orderBy: { createdAt: "desc" },
        })
      : await prisma.comment.findMany({
           include: { user: true, article: true },
           orderBy: { createdAt: "desc" },
           where: {
              article: {
                 is: {
                    location: {
                       in: session?.user?.department,
                    },
                 },
              },
           },
        });

   return {
      props: {
         statistics: {
            totalArticles,
            publishedArticles,
            totalComments,
            totalUpvotes,
            totalDownvotes,
         },
         articles: JSON.parse(JSON.stringify(articles)),
         comments: JSON.parse(JSON.stringify(comments)),
      },
   };
};

export default ReviewerPage;
