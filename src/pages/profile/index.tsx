import React from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { DefaultSeo } from "next-seo";

import prisma from "../../lib/prisma";
import { User } from "../../types/User";

interface Props {
   user: User;
}

const PersonalProfileViewer: React.FC<Props> = ({ user }) => {
   return (
      <>
         <DefaultSeo title="Profile" />
         <div className="mt-10 flex flex-grow px-4 sm:pt-24 lg:px-0"></div>
      </>
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
   });

   return {
      props: {
         user: JSON.parse(JSON.stringify(user)),
      },
   };
};

export default PersonalProfileViewer;
