import React from "react";
import { DefaultSeo } from "next-seo";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";

import { User } from "../../types/User";
import prisma from "../../lib/prisma";
import { computeKCAName } from "../../lib/computeKCAName";
import ProfileViewer from "../../components/ProfileViewer";

interface Props {
   user: User;
}

const ProfileViewerPage: React.FC<Props> = ({ user }) => {
   return (
      <>
         <DefaultSeo title={computeKCAName(user)} />
         <div className="flex flex-grow items-center justify-center px-4 sm:pt-12 lg:px-0">
            <ProfileViewer user={user} />
         </div>
      </>
   );
};

export const getServerSideProps: GetServerSideProps = async ({
   query,
   req,
}) => {
   const session = await getSession({ req });
   const { id } = query;

   const user = await prisma.user.findFirst({
      where: { id: id as string },
      include: {
         comments: true,
         upvotes: true,
         downvotes: true,
      },
   });

   if (!user)
      return {
         redirect: {
            destination: req.headers.referer || "/",
            permanent: false,
         },
      };

   if (user.id === session?.user?.id)
      return { redirect: { destination: "/profile", permanent: false } };

   return {
      props: {
         user: JSON.parse(JSON.stringify(user)),
      },
   };
};

export default ProfileViewerPage;
