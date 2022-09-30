import React from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";

import { User } from "@/types/User";
import prisma from "@/lib/prisma";
import ProfileViewer from "@/components/ProfileViewer";

const ProfileViewerPage: React.FC<{user: User}> = ({ user }) => {
   return (
      <div className="flex items-center justify-center flex-grow px-4 my-12 sm:pt-20 lg:px-0">
         <ProfileViewer user={user} />
      </div>
   );
};

export const getServerSideProps: GetServerSideProps = async ({
   query,
   req,
}) => {
   const session = await getSession({ req });
   const { id } = query;

   if (id === session?.user?.id)
      return { redirect: { destination: "/profile", permanent: false } };

   const user = await prisma.user.findUnique({
      where: { id: id as string },
      include: {
         comments: {
            include: {
               user: true,
               article: true,
            },
            orderBy: {
               createdAt: "desc",
            },
            take: 1,
         },
         upvotes: true,
         downvotes: true,
         articles: {
            include: {
               writer: true,
            },
            orderBy: {
               upvotes: {
                  _count: "desc",
               },
            },
            take: 3,
            where: {
               published: true,
            },
         },
         _count: {
            select: {
               articles: true,
               coArticles: true,
               comments: true,
               upvotes: true,
               downvotes: true,
            },
         },
      },
   });

   if (!user)
      return {
         redirect: {
            destination: req.headers.referer || "/",
            permanent: false,
         },
      };

   return {
      props: {
         user: JSON.parse(JSON.stringify(user)),
      },
   };
};

export default ProfileViewerPage;
