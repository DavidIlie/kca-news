import React from "react";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { Slide } from "react-awesome-reveal";
import Link from "next/link";

import prisma from "../lib/prisma";
import { Article } from "../types/Article";
import {
   fullLocations,
   getFormmatedLocation,
   Locations,
} from "../lib/categories";
import { Button } from "../ui/Button";

interface Props {
   location: Locations;
   articles: Article[];
}

const LocationArticleShowcase: React.FC<Props> = ({ articles, location }) => {
   const router = useRouter();

   if (articles.length === 0) {
      return (
         <>
            <NextSeo title={getFormmatedLocation(location)} />
            <div className="my-24 flex flex-grow items-center justify-center px-4 sm:pt-20 lg:px-0">
               <Slide triggerOnce direction="down">
                  <div>
                     <h1 className="text-6xl font-bold text-red-500">
                        Woah! No posts?
                     </h1>
                     <p className="mb-3 mt-2 text-center text-lg">
                        Looks like this category needs some motivation...
                     </p>
                     {router.query.category ? (
                        <Link href={`/${location}`}>
                           <a>
                              <Button className="mx-auto">
                                 Go to {getFormmatedLocation(location)}
                              </Button>
                           </a>
                        </Link>
                     ) : (
                        <Link href={`/`}>
                           <a>
                              <Button className="mx-auto">Go Home</Button>
                           </a>
                        </Link>
                     )}
                  </div>
               </Slide>
            </div>
         </>
      );
   }

   return (
      <>
         <NextSeo title={getFormmatedLocation(location)} />
         <div className="mb-20 flex flex-grow px-4 sm:pt-32 lg:px-0"></div>
      </>
   );
};

export const getServerSideProps: GetServerSideProps = async ({
   query,
   req,
}) => {
   const { location, category } = query;

   if (!fullLocations.includes(location as any))
      return {
         notFound: true,
      };

   const session = await getSession({ req });

   const includeData = {
      upvotes: true,
      downvotes: true,
      comments: true,
   };

   const customWhere = category
      ? {
           location: location as string,
           OR: [
              {
                 categoryId: {
                    hasSome: (category as string) || "",
                 },
              },
           ],
        }
      : {
           location: location as string,
        };

   const articles = session?.user?.isAdmin
      ? await prisma.article.findMany({
           where: customWhere as any,
           orderBy: {
              createdAt: "desc",
           },
           include: includeData as any,
        })
      : session?.user?.isWriter
      ? await prisma.article.findMany({
           where: {
              ...customWhere,
              user: session?.user!.id,
           },
           orderBy: {
              createdAt: "desc",
           },
           include: includeData as any,
        })
      : await prisma.article.findMany({
           where: {
              ...customWhere,
              published: true,
              underReview: false,
           },
           orderBy: {
              createdAt: "desc",
           },
           include: includeData as any,
        });

   return {
      props: {
         location,
         articles: JSON.parse(JSON.stringify(articles)),
      },
   };
};

export default LocationArticleShowcase;
