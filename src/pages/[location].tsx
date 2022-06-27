import React from "react";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { Slide } from "react-awesome-reveal";
import Link from "next/link";

import { Article } from "@/types/Article";
import {
   fullLocations,
   getFormmatedLocation,
   Locations,
} from "@/lib/categories";
import { Button } from "@/ui/Button";
import ArticleCard from "@/components/ArticleCard";
import FeaturedArticleCard from "@/components/ArticleCard/FeaturedArticleCard";
import { getArticles } from "@/lib/getArticles";

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
            <div className="flex items-center justify-center flex-grow px-4 my-24 sm:pt-20 lg:px-0">
               <Slide triggerOnce direction="down">
                  <div>
                     <h1 className="text-6xl font-semibold text-red-500">
                        Woah! No posts?
                     </h1>
                     <p className="mt-2 mb-3 text-lg text-center">
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
         <div className="flex flex-grow px-4 mb-20 sm:pt-32 lg:px-0">
            <div className="container max-w-5xl mx-auto">
               <div className="mb-16">
                  <h1 className="pb-4 text-4xl font-semibold border-b-2">
                     {getFormmatedLocation(location)}{" "}
                     {router.query.category && (
                        <span className="text-gray-800 dark:text-gray-200">
                           {" "}
                           -{" "}
                           {(router.query.category as any as string)
                              .split("-")
                              .map(
                                 (s) => s.charAt(0).toUpperCase() + s.slice(1)
                              )
                              .join(" ")}
                        </span>
                     )}
                  </h1>
               </div>
               <div className="flex items-center gap-4">
                  <FeaturedArticleCard article={articles[0]} latest={true} />
                  {articles.length > 1 && (
                     <div className="w-[56%]">
                        <FeaturedArticleCard article={articles[1]} />
                     </div>
                  )}
               </div>
               {articles
                  .filter((_a, index) =>
                     articles.length > 2 ? index > 1 : index < 0
                  )
                  .reverse()
                  .map((article, index) => (
                     <ArticleCard article={article} key={index} />
                  ))}
            </div>
         </div>
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

   const articles = await getArticles(
      session?.user,
      category
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
           },
      null,
      true,
      { upvotes: true, downvotes: true, comments: true, writer: true }
   );

   return {
      props: {
         location,
         articles,
      },
   };
};

export default LocationArticleShowcase;
