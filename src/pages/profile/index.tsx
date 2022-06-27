import React from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";

import prisma from "@/lib/prisma";
import { User } from "@/types/User";
import ProfileViewer from "@/components/ProfileViewer";

interface Props {
   user: User;
}

const PersonalProfileViewer: React.FC<Props> = ({ user }) => {
   return (
      <div className="flex items-center justify-center flex-grow px-4 my-12 sm:pt-20 lg:px-0">
         <ProfileViewer user={user} editable={true} />
      </div>
   );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
   const session = await getSession({ req });

   if (!session)
      return {
         redirect: {
            destination: "/api/auth/signin",
            permanent: false,
         },
      };

   const user = await prisma.user.findUnique({
      where: { id: session.user!.id },
      include: {
         comments: {
            where: {
               article: {
                  published: true,
               },
            },
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
            where: { published: true },
            orderBy: {
               upvotes: {
                  _count: "desc",
               },
            },
            take: 3,
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

   return {
      props: {
         user: JSON.parse(JSON.stringify(user)),
      },
   };
};

export default PersonalProfileViewer;
