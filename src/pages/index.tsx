import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";
import { Slide } from "react-awesome-reveal";
import { getSession } from "next-auth/react";

import { Article } from "../types/Article";
import { getArticles } from "../lib/getArticles";
import {
   fullLocations,
   getFormmatedLocation,
   Locations,
} from "../lib/categories";
import { Button } from "../ui/Button";
import CategorySection from "../components/CategorySection";

interface IndividualArticleType {
   location: Locations;
   articles: Article[];
}

interface Props {
   featuredPosts: Article[];
   individualArticles: IndividualArticleType[];
}

const Home: React.FC<Props> = ({ featuredPosts, individualArticles }) => {
   const { reload } = useRouter();

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
         <div className="container mx-auto mt-12 max-w-7xl px-4 sm:mt-32">
            <CategorySection articles={featuredPosts}>Latest</CategorySection>
         </div>
         <div className="container mx-auto mt-6 max-w-7xl px-4">
            {individualArticles.map((parsedLocation, index) => (
               <div
                  className={index !== featuredPosts.length - 1 ? "mb-6" : ""}
                  key={index}
               >
                  <CategorySection articles={parsedLocation.articles}>
                     {getFormmatedLocation(parsedLocation.location)} -{" "}
                     <Link href={`/${parsedLocation.location}`}>
                        <a className="cursor-pointer font-normal text-blue-500 duration-150 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-600">
                           See More
                        </a>
                     </Link>
                  </CategorySection>
               </div>
            ))}
         </div>
      </>
   );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
   const session = await getSession({ req });

   const featuredPosts = await getArticles(
      session?.user,
      null,
      {
         take: 4,
      },
      true
   );

   const individualArticles: IndividualArticleType[] = await Promise.all(
      fullLocations.map(
         async (location): Promise<IndividualArticleType> => ({
            location,
            articles: await getArticles(
               session?.user,
               { location },
               {
                  take: 4,
               },
               true,
               null
            ),
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
