import React, { useState } from "react";
import { NextSeo } from "next-seo";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";

import prisma from "../../lib/prisma";
import DashboardStatistics from "../../components/DashboardStatistics";
import { Statistics } from "./writer";
import { LoadingOverlay } from "@mantine/core";

interface Props {
   statistics: Statistics;
}

const AdminPage: React.FC<Props> = ({ statistics }) => {
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
                  isAdmin={false}
                  {...statisticsState}
                  className="mx-auto max-w-7xl lg:px-8"
               />
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
