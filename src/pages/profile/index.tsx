import React from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";

import prisma from "../../lib/prisma";
import { User } from "../../types/User";
import ProfileViewer from "../../components/ProfileViewer";

interface Props {
   user: User;
}

const PersonalProfileViewer: React.FC<Props> = ({ user }) => {
   return (
      <div className="my-12 flex flex-grow items-center justify-center px-4 sm:pt-20 lg:px-0">
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
