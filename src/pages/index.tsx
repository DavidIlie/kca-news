import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";
import { VscChevronLeft, VscChevronRight } from "react-icons/vsc";
import { Slide } from "react-awesome-reveal";
import { formatDistance } from "date-fns";
import { useHotkeys } from "@mantine/hooks";
import { getSession } from "next-auth/react";

import prisma from "../lib/prisma";
import { Article } from "../types/Article";
import { shimmer } from "../lib/shimmer";
import ErrorPage from "../components/ErrorPage";

interface Props {
   featuredPosts: Article[];
}

const Home: React.FC<Props> = ({ featuredPosts }) => {
   const [index, setSelectedIndex] = useState<number>(0);

   useHotkeys([
      ["ArrowLeft", () => index !== 0 && setSelectedIndex(index - 1)],
      [
         "ArrowRight",
         () =>
            index !== featuredPosts.length - 1 && setSelectedIndex(index + 1),
      ],
   ]);

   if (featuredPosts.length === 0) {
      return <ErrorPage />;
   }

   return (
      <>
         <NextSeo title="Home" />
         <div className="flex min-h-screen items-center justify-center px-4 sm:pt-20 lg:px-0">
            <div className="-ml-32 flex w-full justify-center gap-6">
               <Slide cascade triggerOnce direction="left">
                  <div className="relative -mr-96 flex items-center gap-4">
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
                           <h1 className="absolute top-0 left-0 z-50 ml-[5rem] w-[50%] rounded-t-md bg-gray-900 bg-opacity-70 py-2 px-4 text-lg font-medium text-white">
                              {featuredPosts[index].title} -{" "}
                              <span className="font-normal italic text-gray-300">
                                 {formatDistance(
                                    new Date(featuredPosts[index].createdAt),
                                    new Date(),
                                    { addSuffix: true }
                                 )}
                              </span>
                           </h1>
                           <div className="h-26 absolute bottom-0 z-50 mb-[0.3rem] w-[50%] rounded-b-md bg-gray-900 bg-opacity-70 py-2 px-4 text-lg text-white">
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
                  <div className="mt-6 text-center">
                     <h1 className="text-4xl font-medium text-black dark:text-gray-200">
                        Latest Posts:
                     </h1>
                     <div className="mb-6" />
                     {featuredPosts.map((article, index) => (
                        <div className="hoverItem duration-150">
                           <Link href={`/article/${article.id}`}>
                              <a
                                 className="w-full cursor-pointer rounded-md border-2 border-gray-200 bg-white px-16 text-xl dark:border-gray-800 dark:bg-foot"
                                 key={index}
                              >
                                 {article.title} -{" "}
                                 <span className="font-normal italic text-gray-300">
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
      </>
   );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
   const session = await getSession({ req });

   const featuredPosts = session?.user?.isAdmin
      ? await prisma.article.findMany({
           orderBy: {
              createdAt: "desc",
           },
           take: 5,
        })
      : session?.user?.isWriter
      ? await prisma.article.findMany({
           where: { user: session?.user?.id },
           orderBy: {
              createdAt: "desc",
           },
           take: 5,
        })
      : await prisma.article.findMany({
           where: { published: true, underReview: false },
           orderBy: {
              createdAt: "desc",
           },
           take: 5,
        });

   return {
      props: {
         featuredPosts: JSON.parse(JSON.stringify(featuredPosts)),
      },
   };
};

export default Home;
