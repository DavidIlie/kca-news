import Link from "next/link";
import { GetServerSideProps } from "next";
import React from "react";
import { Slide } from "react-awesome-reveal";
import { getSession } from "next-auth/react";

import prisma from "../../../lib/prisma";
import { Button } from "../../../ui/Button";

const CreatePage: React.FC = () => {
   return (
      <div className="flex min-h-screen flex-grow items-center justify-center">
         <Slide triggerOnce direction="down">
            <div>
               <h1 className="mb-4 text-6xl font-bold text-red-500">
                  Error creating article.
               </h1>
               <Link href="/">
                  <a>
                     <Button className="mx-auto">Go Home</Button>
                  </a>
               </Link>
            </div>
         </Slide>
      </div>
   );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
   const session = await getSession({ req });

   if (!session || (session?.user?.isAdmin ? false : !session?.user?.isWriter))
      return {
         redirect: {
            destination: "/",
            permanent: false,
         },
      };

   try {
      const unnamedArticles = await prisma.article.count({
         where: {
            title: {
               contains: "Untitled Article",
               mode: "insensitive",
            },
         },
      });

      const createdArticle = await prisma.article.create({
         data: {
            title:
               unnamedArticles === 0
                  ? "Untitled Article"
                  : `Untitled Article #${unnamedArticles}`,
            user: session?.user?.id,
            mdx: `# Welcome to the template article`,
            cover: "https://cdn.davidilie.com/kca-news/kings-alicante-1.jpg",
            description:
               "This is an example of the description for the untitled article. This can be modified from the menu or the right or by simply editing this text field.",
         },
      });

      return {
         redirect: {
            destination: `/dashboard/writer/edit/${createdArticle.id}`,
            permanent: false,
         },
      };
   } catch (error) {
      return {
         props: {},
      };
   }
};

export default CreatePage;
