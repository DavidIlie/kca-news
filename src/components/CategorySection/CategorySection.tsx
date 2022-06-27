import React from "react";
import Image from "next/image";
import { useMediaQuery } from "@mantine/hooks";

import ArticleCard from "../ArticleCard";
import FeaturedArticleCard from "../ArticleCard/FeaturedArticleCard";
import { Article } from "../../types/Article";
import { shimmer } from "@/lib/shimmer";

interface CategorySectionProps {
   articles?: Article[];
   loading?: boolean;
}

const CategorySection: React.FC<CategorySectionProps> = ({
   children,
   articles,
   loading = false,
}) => {
   const desktop = useMediaQuery("(min-width: 640px)");

   return (
      <>
         <h1 className="pb-4 text-2xl font-semibold border-b-2 sm:text-4xl">
            {children}
         </h1>
         {loading ? (
            <div className="grid grid-cols-2 gap-4 mt-6 sm:grid-cols-4">
               <Skeleton />
               <Skeleton />
               {desktop && (
                  <>
                     <Skeleton />
                     <Skeleton />
                  </>
               )}
            </div>
         ) : !articles || articles.length === 0 ? (
            <div className="mt-6 text-center">
               <h1 className="text-2xl font-semibold text-red-500 sm:text-4xl">
                  Woah! No posts?
               </h1>
               <p className="mt-2 mb-3 text-sm sm:text-base">
                  Looks like this category needs some motivation...
               </p>
            </div>
         ) : (
            <>
               <div
                  className={`mt-6 ${
                     articles.length !== 1 && "grid"
                  } sm:grid-cols-${articles.length} grid-cols-2 gap-4`}
               >
                  {articles.length === 1 ? (
                     <>
                        <div className="hidden sm:block">
                           <ArticleCard article={articles[0]} />
                        </div>
                        <div className="block sm:hidden">
                           <FeaturedArticleCard article={articles[0]} />
                        </div>
                     </>
                  ) : (
                     articles.map((article, index) => (
                        <FeaturedArticleCard
                           article={article}
                           key={index}
                           solo={articles.length < 3}
                           latest={articles.length < 3}
                        />
                     ))
                  )}
               </div>
            </>
         )}
      </>
   );
};

const Skeleton: React.FC = () => (
   <div className="mb-6 duration-200 border-2 border-gray-100 rounded-lg shadow-md bg-gray-50 dark:border-gray-800 dark:bg-foot">
      <div className="md:flex-shrink-0">
         <Image
            src={shimmer(1920, 1080)}
            alt="Post picture"
            width={"500px"}
            height={"350px"}
            className={`rounded-lg rounded-b-none object-cover`}
         />
      </div>
      <div className="-mt-1.5 border-t-2 border-gray-700 px-4 py-2">
         <div className="w-full h-3 mt-2 bg-gray-200 animate-pulse dark:bg-gray-900" />
         <div className="w-full h-3 mt-2 bg-gray-200 animate-pulse dark:bg-gray-900" />
         <div className="mt-2 mb-2 h-[7.1rem] w-full" />
         <div
            className={`mr-2 inline-flex h-6 w-32 animate-pulse items-center justify-center bg-gray-200 px-2 py-2 text-sm font-bold leading-none text-gray-200 dark:bg-gray-900 dark:text-gray-900`}
         />
         <div className="flex items-center gap-2 mt-1 mb-1 mr-1"></div>
      </div>
   </div>
);

export default CategorySection;
