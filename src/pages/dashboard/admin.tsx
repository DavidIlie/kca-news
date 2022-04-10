import React, { useState } from "react";
import { NextSeo } from "next-seo";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { Tab } from "@headlessui/react";
import { LoadingOverlay } from "@mantine/core";

import prisma from "../../lib/prisma";
import DashboardStatistics from "../../components/DashboardStatistics";
import { Statistics } from "./writer";
import { Article } from "../../types/Article";
import { User } from "../../types/User";
import { Comment } from "../../types/Comment";

interface Props {
   statistics: Statistics;
   articles: Article[];
   users: User[];
   comments: Comment[];
}

function classNames(...classes: any) {
   return classes.filter(Boolean).join(" ");
}

const AdminPage: React.FC<Props> = ({
   statistics,
   articles,
   users,
   comments,
}) => {
   const [bigLoading, setBigLoading] = useState<boolean>(false);

   const [statisticsState, setStatisticsState] =
      useState<Statistics>(statistics);

   const [articlesState, setArticlesState] = useState<Article[]>(articles);
   const [usersState, setUsersState] = useState<User[]>(users);
   const [commentsState, setCommentsState] = useState<Comment[]>(comments);

   const options = ["Articles", "Users", "Comments"];

   return (
      <>
         <NextSeo title="Admin" />
         <LoadingOverlay visible={bigLoading} />
         <div className="flex flex-grow px-4 pt-10 dark:bg-dark-bg sm:pt-32">
            <div className="mx-auto">
               <DashboardStatistics
                  isAdmin={true}
                  {...statisticsState}
                  className="mx-auto max-w-7xl lg:px-8"
               />
               <Tab.Group as="div" className="mx-8 mt-12">
                  <Tab.List className="flex space-x-1 rounded-xl border-2 border-gray-200 bg-gray-100 p-1 dark:border-gray-800 dark:bg-foot">
                     {options.map((option, index) => (
                        <Tab
                           key={index}
                           className={({ selected }) =>
                              classNames(
                                 "w-full rounded-lg py-2.5 text-sm font-medium leading-5 duration-150",
                                 "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                                 selected
                                    ? "bg-white text-gray-800 shadow dark:bg-dark-bg dark:text-gray-100"
                                    : "text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                              )
                           }
                        >
                           {option}
                        </Tab>
                     ))}
                  </Tab.List>
                  <Tab.Panels>
                     <Tab.Panel>Content 1</Tab.Panel>
                     <Tab.Panel>Content 2</Tab.Panel>
                     <Tab.Panel>Content 3</Tab.Panel>
                  </Tab.Panels>
               </Tab.Group>
            </div>
         </div>
      </>
   );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
   const session = await getSession({ req });

   if (!session || !session?.user?.isAdmin)
      return {
         redirect: {
            destination: "/",
            permanent: false,
         },
      };

   const totalArticles = await prisma.article.count();
   const publishedArticles = await prisma.article.count({
      where: { published: true },
   });
   const totalComments = await prisma.comment.count();
   const totalUpvotes = await prisma.upvote.count();
   const totalDownvotes = await prisma.downvote.count();

   const articles = await prisma.article.findMany({
      include: {
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
      },
      orderBy: {
         createdAt: "desc",
      },
   });

   const users = prisma.user.findMany({
      where: { NOT: { id: session?.user?.id } },
   });

   const comments = await prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
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
         users: JSON.parse(JSON.stringify(users)),
         comments: JSON.parse(JSON.stringify(comments)),
      },
   };
};

export default AdminPage;
