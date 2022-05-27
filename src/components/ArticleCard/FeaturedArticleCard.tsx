import React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistance } from "date-fns";

import { Article } from "../../types/Article";
import { shimmer } from "../../lib/shimmer";
import ArticleBadge from "../ArticleBadge";
import { computeKCAName } from "../../lib/computeKCAName";

interface Props {
   article: Article;
   latest?: boolean;
   solo?: boolean;
}

const FeaturedArticleCard: React.FC<Props> = ({
   article,
   latest = false,
   solo = false,
}) => {
   return (
      <Link href={`/article/${article.id}`}>
         <a className={`${latest && "hoverItem"} relative duration-200`}>
            {latest && !solo && (
               <h1
                  className="absolute -top-[2.1rem] left-[0.13rem] z-10 rounded-t bg-blue-200 py-1 px-4 text-lg font-semibold text-blue-900 dark:bg-blue-400 dark:bg-opacity-50 dark:text-blue-100"
                  style={{
                     border:
                        "2px solid rgba(29, 78, 216, var(--tw-border-opacity)",
                  }}
               >
                  Latest Post
               </h1>
            )}
            <div
               className={`mb-6 rounded-lg ${
                  latest && !solo ? "rounded-tl-none" : "hoverItem"
               } border-2 border-gray-100 bg-gray-50 shadow-md duration-200 dark:border-gray-800 dark:bg-foot`}
            >
               <div className="md:flex-shrink-0">
                  <Image
                     src={article.cover}
                     alt="Post picture"
                     width={latest ? (solo ? "1400px" : "1200px") : "500px"}
                     height={latest ? "400px" : "350px"}
                     blurDataURL={shimmer(1920, 1080)}
                     placeholder="blur"
                     className={`rounded-lg rounded-b-none ${
                        latest && !solo && "rounded-tl-none"
                     }  object-cover`}
                  />
               </div>
               <div className="-mt-1.5 border-t-2 border-gray-700 px-4 py-2">
                  <h2 className="text-2xl font-semibold tracking-normal line-clamp-1">
                     {article.title}
                  </h2>
                  <p className="text-md mt-2 mb-3 h-24 text-gray-800 line-clamp-3 dark:text-gray-200">
                     {article.description}
                  </p>
                  {article.categoryId.splice(0, 3).map((tag, i) => (
                     <ArticleBadge tag={tag} key={i} />
                  ))}
                  <div className="mt-1 mb-1 mr-1 flex items-center gap-2">
                     <span
                        className={`-mb-0.5 ${
                           solo ? "text-lg" : "text-sm"
                        } text-gray-700 dark:text-gray-200`}
                     >
                        {article.anonymous
                           ? "KCA News Team"
                           : computeKCAName(article.writer!)}{" "}
                        <span className="text-gray-800 dark:text-gray-300">
                           /{" "}
                           {formatDistance(
                              new Date(article.createdAt),
                              new Date(),
                              {
                                 addSuffix: true,
                              }
                           )}
                        </span>
                     </span>
                  </div>
               </div>
            </div>
         </a>
      </Link>
   );
};
export default FeaturedArticleCard;
