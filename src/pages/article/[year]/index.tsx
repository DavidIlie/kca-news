import React from "react";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";
import { Slide } from "react-awesome-reveal";
import Link from "next/link";

import prisma from "../../../lib/prisma";
import { Button } from "../../../ui/Button";
import { createSlug } from "../../../lib/createSlug";

const ArticleURLConverter: React.FC = () => {
   return (
      <>
         <NextSeo title="Error" />
         <div className="my-24 flex flex-grow items-center justify-center px-4 sm:pt-20 lg:px-0">
            <Slide triggerOnce direction="down">
               <div>
                  <h1 className="mb-4 text-6xl font-bold text-red-500">
                     Error loading article.
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

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
   try {
      let test = await prisma.article.findFirst({
         where: { id: query.year as string },
         select: {
            title: true,
            createdAt: true,
            id: true,
            slug: true,
            published: true,
         },
      });

      if (!test)
         return {
            props: {
               notFound: true,
            },
         };

      if (!test.slug) {
         test = await prisma.article.update({
            where: { id: test.id },
            data: { slug: createSlug(test.title) },
            select: {
               title: true,
               createdAt: true,
               id: true,
               slug: true,
               published: true,
            },
         });
      }

      const date = new Date(test.createdAt).toISOString().split("-");

      return {
         redirect: {
            destination: `/article/${date[0]}/${date[1]}/${
               test.published ? test.slug : test.id
            }`,
            permanent: false,
         },
      };
   } catch (error) {
      return { props: {} };
   }
};

export default ArticleURLConverter;
