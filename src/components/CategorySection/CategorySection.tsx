import React from "react";
import ArticleCard from "../ArticleCard";
import FeaturedArticleCard from "../ArticleCard/FeaturedArticleCard";
import { Article } from "../../types/Article";

interface CategorySectionProps {
   articles: Article[];
}

const CategorySection: React.FC<CategorySectionProps> = ({
   children,
   articles,
}) => {
   return (
      <>
         <h1 className="border-b-2 pb-4 text-2xl font-semibold sm:text-4xl">
            {children}
         </h1>
         <div
            className={`mt-6 ${articles.length !== 1 && "grid"} grid-cols-${
               articles.length
            } gap-4`}
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
         {articles.length === 0 && (
            <div className="text-center">
               <h1 className="text-2xl font-semibold text-red-500 sm:text-4xl">
                  Woah! No posts?
               </h1>
               <p className="mb-3 mt-2 text-sm sm:text-base">
                  Looks like this category needs some motivation...
               </p>
            </div>
         )}
      </>
   );
};

export default CategorySection;
