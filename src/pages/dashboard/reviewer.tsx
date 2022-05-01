import React, { useState } from "react";
import { NextSeo } from "next-seo";
import { GetServerSideProps } from "next";
import { getSession, useSession } from "next-auth/react";
import { LoadingOverlay } from "@mantine/core";
import { Tab } from "@headlessui/react";

import DashboardStatistics from "../../components/DashboardStatistics";

import prisma from "../../lib/prisma";
import { Statistics } from "./writer";
import classNames from "../../lib/classNames";

interface Props {
   statistics: Statistics;
}

const AdminPage: React.FC<Props> = ({ statistics }) => {
   const { data } = useSession();

   const [bigLoading, setBigLoading] = useState<boolean>(false);
   const [statisticsState, setStatisticsState] =
      useState<Statistics>(statistics);

   return (
      <>
         <NextSeo title="Reviewer Panel" />
         <LoadingOverlay visible={bigLoading} />
         <div className="flex flex-grow px-4 pt-10 dark:bg-dark-bg sm:pt-32">
            <div className="mx-auto">
               <DashboardStatistics
                  isAdmin={data!.user!.isAdmin}
                  {...statisticsState}
                  className="mx-auto max-w-7xl lg:px-8"
               />
               <Tab.Group as="div" className="mx-2 mt-6 mb-8 sm:mx-8">
                  <Tab.List className="flex space-x-1 rounded-xl border-2 border-gray-200 bg-gray-100 p-1 dark:border-gray-800 dark:bg-foot">
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
               </Tab.Group>
            </div>
         </div>
      </>
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

   const totalArticles = await prisma.article.count({
      where: {
         location: {
            in: session?.user?.department,
         },
      },
   });
   const publishedArticles = await prisma.article.count({
      where: {
         published: true,
         location: {
            in: session?.user?.department,
         },
      },
   });
   const totalComments = await prisma.comment.count();
   const totalUpvotes = await prisma.upvote.count();
   const totalDownvotes = await prisma.downvote.count();

   return {
      props: {
         statistics: {
            totalArticles,
            publishedArticles,
            totalComments,
            totalUpvotes,
            totalDownvotes,
         },
      },
   };
};

export default AdminPage;
