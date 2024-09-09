import React from "react";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import { NextSeo } from "next-seo";
import { Slide } from "react-awesome-reveal";
import { useQueries } from "react-query";

import { fullLocations, getFormmatedLocation } from "@/lib/categories";
import { Button } from "@/ui/Button";
import CategorySection from "@/components/CategorySection";
import { trpc } from "@/lib/trpc";
import { createSlug } from "@/lib/createSlug";

const Home: React.FC = () => {
   const { reload } = useRouter();

   const { client } = trpc.useContext();
   const featuredArticlesQuery = trpc.useQuery(["featured-posts"]);
   const individualArticlesQuery = useQueries(
      fullLocations.map((location) => ({
         queryKey: [`location-posts-${location}`, { location }],
         queryFn: (args: any) =>
            client.query("location-posts", args.queryKey[1]),
      }))
   );

   if (featuredArticlesQuery.data?.articles.length === 0) {
      return (
         <div className="flex items-center justify-center flex-grow px-4 my-24 sm:pt-20 lg:px-0">
            <Slide triggerOnce direction="down">
               <div>
                  <h1 className="text-4xl font-semibold text-center text-red-500 sm:text-6xl">
                     How did i get here?
                  </h1>
                  <p className="mt-4 mb-3 text-base text-center sm:text-lg">
                     Looks like there are no articles, embarrising... 🙄
                  </p>
                  <div className="flex justify-center mt-2 text-gray-800">
                     <Button onClick={reload}>Reload</Button>
                  </div>
               </div>
            </Slide>
         </div>
      );
   }

   return (
      <>
         <NextSeo title="Home" />
         <div className="container px-4 mx-auto mt-12 max-w-7xl sm:mt-32">
            <CategorySection
               articles={featuredArticlesQuery.data?.articles}
               loading={featuredArticlesQuery.isLoading}
            >
               Latest
            </CategorySection>
         </div>
         <div className="container px-4 mx-auto mt-3 mb-6 max-w-7xl sm:mb-12">
            {individualArticlesQuery.map((location, index) => (
               <CategorySection
                  loading={location.isLoading}
                  articles={location.data?.articles}
                  key={index}
               >
                  {getFormmatedLocation(fullLocations[index])} -{" "}
                  <Link href={`/${fullLocations[index]}`}>
                     <a className="font-normal text-blue-500 duration-150 cursor-pointer hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-600">
                        See More
                     </a>
                  </Link>
               </CategorySection>
            ))}
         </div>
      </>
   );
};

for special purposes
export const getServerSideProps: GetServerSideProps = async ({ req }) => {
   return {
      redirect: {
         destination: "https://workroad.app",
         permanent: false,
      },
   };
};

export default Home;
