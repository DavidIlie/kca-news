import React, { useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";
import { VscChevronLeft, VscChevronRight } from "react-icons/vsc";
import { Slide } from "react-awesome-reveal";
import { formatDistance } from "date-fns";
import { useHotkeys } from "@mantine/hooks";
import { getSession } from "next-auth/react";

import { Article } from "../types/Article";
import { shimmer } from "../lib/shimmer";
import FeaturedArticleCard from "../components/ArticleCard/FeaturedArticleCard";
import { getArticles } from "../lib/getArticles";
import {
   fullLocations,
   getFormmatedLocation,
   Locations,
} from "../lib/categories";
import { Button } from "../ui/Button";
import ArticleCard from "../components/ArticleCard";

interface IndividualArticleType {
   location: Locations;
   articles: Article[];
}

interface Props {
   featuredPosts: Article[];
   individualArticles: IndividualArticleType[];
}

const Home: React.FC<Props> = ({ featuredPosts, individualArticles }) => {
   const [index, setSelectedIndex] = useState<number>(0);
   const { reload } = useRouter();
   const { resolvedTheme } = useTheme();

   useHotkeys([
      ["ArrowLeft", () => index !== 0 && setSelectedIndex(index - 1)],
      [
         "ArrowRight",
         () =>
            index !== featuredPosts.length - 1 && setSelectedIndex(index + 1),
      ],
   ]);

   if (featuredPosts.length === 0) {
      return (
         <div className="my-24 flex flex-grow items-center justify-center px-4 sm:pt-20 lg:px-0">
            <Slide triggerOnce direction="down">
               <div>
                  <h1 className="text-center text-4xl font-semibold text-red-500 sm:text-6xl">
                     How did i get here?
                  </h1>
                  <p className="mb-3 mt-4 text-center text-base sm:text-lg">
                     Looks like there are no articles, embarrising... 🙄
                  </p>
                  <div className="mt-2 flex justify-center text-gray-800">
                     <Button onClick={() => reload()}>Reload</Button>
                  </div>
               </div>
            </Slide>
         </div>
      );
   }

   return (
      <>
         <NextSeo title="Home" />
         <div className="mb-24 mt-20 flex items-center justify-center px-4 sm:pt-20 lg:mt-28 lg:px-0">
            <div className="flex w-full justify-center lg:-ml-32 lg:gap-6">
               <Slide cascade triggerOnce direction="left">
                  <div className="relative -mr-96 hidden items-center gap-4 lg:flex">
                     <button
                        className="cursor-pointer rounded-full border bg-gray-100 p-4 duration-150 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 disabled:cursor-not-allowed disabled:text-gray-400 hover:disabled:bg-gray-100 dark:border-gray-800 dark:bg-foot dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:disabled:bg-foot dark:disabled:bg-opacity-50 dark:disabled:text-gray-500"
                        disabled={index === 0}
                        onClick={() => setSelectedIndex(index - 1)}
                        title="Back"
                     >
                        <VscChevronLeft size={30} />
                     </button>
                     <Link href={`/article/${featuredPosts[index].id}`}>
                        <a className="w-[50%]">
                           <h1 className="absolute top-0 left-0 z-50 ml-[5rem] w-[50%] rounded-t-md bg-gray-600 bg-opacity-70 py-2 px-4 text-lg font-medium text-white dark:bg-gray-900 dark:bg-opacity-70">
                              {featuredPosts[index].title} -{" "}
                              <span className="font-normal italic text-gray-300">
                                 {formatDistance(
                                    new Date(featuredPosts[index].createdAt),
                                    new Date(),
                                    { addSuffix: true }
                                 )}
                              </span>
                           </h1>
                           <div className="h-26 absolute bottom-0 z-50 mb-[0.3rem] w-[50%] rounded-b-md bg-gray-600 bg-opacity-70 py-2 px-4 text-lg text-white dark:bg-gray-900 dark:bg-opacity-70">
                              <h1
                                 className="line-clamp-3"
                                 title={featuredPosts[index].description}
                              >
                                 <span className="text-2xl font-bold">
                                    BREAKING NEWS:
                                 </span>{" "}
                                 {featuredPosts[index].description}
                              </h1>
                           </div>
                           <Image
                              src={featuredPosts[index].cover}
                              className="aspect-[3/2] rounded-md object-cover"
                              placeholder="blur"
                              blurDataURL={shimmer(1000, 750)}
                              width={1000}
                              height={750}
                           />
                        </a>
                     </Link>
                     <button
                        className="cursor-pointer rounded-full border bg-gray-100 p-4 duration-150 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 disabled:cursor-not-allowed disabled:text-gray-400 hover:disabled:bg-gray-100 dark:border-gray-800 dark:bg-foot dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:disabled:bg-foot dark:disabled:bg-opacity-50 dark:disabled:text-gray-500"
                        disabled={index === featuredPosts.length - 1}
                        onClick={() => setSelectedIndex(index + 1)}
                        title="Next"
                     >
                        <VscChevronRight size={30} />
                     </button>
                  </div>
               </Slide>
               <Slide cascade triggerOnce direction="down">
                  <div className="text-center lg:mt-6">
                     <h1 className="text-4xl font-medium text-black dark:text-gray-200">
                        Latest Posts:
                     </h1>
                     <div className="mb-6" />
                     {featuredPosts.map((article, index) => (
                        <div
                           className={`hoverItem duration-150 ${
                              index !== featuredPosts.length - 1 && "mb-6"
                           }`}
                           key={index}
                        >
                           <Link href={`/article/${article.id}`}>
                              <a
                                 className="container max-w-md cursor-pointer truncate rounded-md border-2 border-gray-200 bg-gray-50 px-16 py-1 text-xl dark:border-gray-800 dark:bg-foot"
                                 key={index}
                              >
                                 {article.title} -{" "}
                                 <span className="text-base font-normal italic text-gray-700 dark:text-gray-300">
                                    {formatDistance(
                                       new Date(featuredPosts[index].createdAt),
                                       new Date(),
                                       { addSuffix: true }
                                    )}
                                 </span>
                              </a>
                           </Link>
                        </div>
                     ))}
                  </div>
               </Slide>
            </div>
         </div>
         <div className="container mx-auto max-w-7xl px-4">
            {individualArticles.map((parsedLocation, index) => (
               <div
                  className={index !== featuredPosts.length - 1 ? "mb-12" : ""}
                  key={index}
               >
                  <h1 className="border-b-2 pb-4 text-2xl font-semibold sm:text-4xl">
                     {getFormmatedLocation(parsedLocation.location)} -{" "}
                     <Link href={`/${parsedLocation.location}`}>
                        <a className="cursor-pointer font-normal text-blue-500 duration-150 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-600">
                           See More
                        </a>
                     </Link>
                  </h1>
                  <div
                     className={`mt-6 ${
                        parsedLocation.articles.length !== 1 && "grid"
                     } grid-cols-${parsedLocation.articles.length} gap-4`}
                  >
                     {parsedLocation.articles.length === 1 ? (
                        <>
                           <div className="hidden sm:block">
                              <ArticleCard
                                 article={parsedLocation.articles[0]}
                              />
                           </div>
                           <div className="block sm:hidden">
                              <FeaturedArticleCard
                                 article={parsedLocation.articles[0]}
                              />
                           </div>
                        </>
                     ) : (
                        parsedLocation.articles.map((article, index) => (
                           <FeaturedArticleCard
                              article={article}
                              key={index}
                              solo={parsedLocation.articles.length < 3}
                              latest={parsedLocation.articles.length < 3}
                           />
                        ))
                     )}
                  </div>
                  {parsedLocation.articles.length === 0 && (
                     <div className="text-center">
                        <h1 className="text-2xl font-semibold text-red-500 sm:text-4xl">
                           Woah! No posts?
                        </h1>
                        <p className="mb-3 mt-2 text-sm sm:text-base">
                           Looks like this category needs some motivation...
                        </p>
                     </div>
                  )}
               </div>
            ))}
         </div>
      </>
   );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
   const session = await getSession({ req });

   const featuredPosts = await getArticles(session?.user, null, null, {
      take: 5,
   });

   const individualArticles: IndividualArticleType[] = await Promise.all(
      fullLocations.map(
         async (location): Promise<IndividualArticleType> => ({
            location,
            articles: await getArticles(session?.user, { location }, null, {
               take: 4,
            }),
         })
      )
   );

   return {
      props: {
         featuredPosts,
         individualArticles,
      },
   };
};

export default Home;
