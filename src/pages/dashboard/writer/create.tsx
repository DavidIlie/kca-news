import Link from "next/link";
import { NextSeo } from "next-seo";
import { GetServerSideProps } from "next";
import React from "react";
import { Slide } from "react-awesome-reveal";
import { getSession } from "next-auth/react";

import prisma from "@/lib/prisma";
import { Button } from "@/ui/Button";
import { createSlug } from "@/lib/createSlug";

const CreatePage: React.FC = () => {
   return (
      <>
         <NextSeo title="Error" />
         <div className="flex items-center justify-center flex-grow px-4 my-24 sm:pt-20 lg:px-0">
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
      </>
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
            user: session?.user?.id,
            title: {
               contains: "Untitled Article",
               mode: "insensitive",
            },
         },
      });

      const title =
         unnamedArticles === 0
            ? "Untitled Article"
            : `Untitled Article #${unnamedArticles}`;

      const createdArticle = await prisma.article.create({
         data: {
            title,
            user: session?.user?.id,
            mdx: `## This is an example of the actual content for your article\n\nStart writing here… Use / on a new line to insert headings, etc.`,
            description:
               "This is an example of the description for your article. The purpose of this section is to write a rough summary of what your article is about, as this is what is displayed on the main page before a reader clicks on the article.",
            slug: createSlug(title),
            cover: "https://cdn.kcanews.org/news-covers/default-cover.jpg",
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
