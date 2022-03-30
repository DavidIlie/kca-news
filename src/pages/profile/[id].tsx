import React from "react";
import { DefaultSeo } from "next-seo";
import { GetServerSideProps } from "next";

import { User } from "../../types/User";
import prisma from "../../lib/prisma";
import { computeKCAName } from "../../lib/computeKCAName";

interface Props {
   user: User;
}

const ProfileViewerPage: React.FC<Props> = ({ user }) => {
   return (
      <>
         <DefaultSeo title={computeKCAName(user)} />
         <div className="mt-10 flex flex-grow px-4 sm:pt-24 lg:px-0"></div>
      </>
   );
};

export const getServerSideProps: GetServerSideProps = async ({
   query,
   req,
}) => {
   const { id } = query;

   const user = await prisma.user.findFirst({ where: { id: id as string } });

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
