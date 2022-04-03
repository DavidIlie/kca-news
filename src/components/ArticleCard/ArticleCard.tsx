import React from "react";
import Link from "next/link";
import Image from "next/image";

import type { Article } from "../../types/Article";
import { shimmer } from "../../lib/shimmer";
import ArticleBadge from "../ArticleBadge";
import { formatDistance } from "date-fns";
import { computeKCAName } from "../../lib/computeKCAName";

interface ArticleCardProps {
   article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
   return (
      <Link href={`/article/${article.id}`}>
         <a className="hoverItem t-11 mb-4 flex cursor-pointer gap-4 rounded-xl border-2 border-gray-100 bg-gray-50 duration-200 dark:border-gray-800 dark:bg-foot md:flex-nowrap md:px-3 md:py-2">
            <Image
               alt="Post picture"
               className="rounded shadow-xl"
               src={article.cover}
               width={1000 / 2}
               height={700 / 2}
               blurDataURL={shimmer(1905 / 2, 957 / 2)}
               placeholder="blur"
               objectFit="cover"
            />
            <div className="relative py-1 md:max-w-xl md:px-0">
               {article.categoryId.concat(article.tags).map((tag, i) => (
                  <ArticleBadge tag={tag} key={i} />
               ))}
               <h1 className="text-section mt-1 mb-1 font-semibold md:text-2xl xl:text-2xl">
                  {article.title}
               </h1>
               <p className="text-gray-800 line-clamp-6 dark:text-gray-100">
                  {article.description}
               </p>
               <div className="bottom-0 flex items-center sm:absolute">
                  <span className="flex items-center justify-center rounded-md py-2 text-xs leading-none">
                     <Image
                        className="rounded-full"
                        src={
                           article.anonymous
                              ? "/no-pfp.jpg"
                              : article.writer!.image
                        }
                        width="40px"
                        height="40px"
                        blurDataURL={shimmer(1920, 1080)}
                        alt={`${
                           article.anonymous
                              ? "KCA News"
                              : article.writer!.names[article.writer!.nameIndex]
                        }'s profile image`}
                     />
                     <div className="ml-2">
                        <span className="text-base text-gray-700 dark:text-gray-200">
                           {article.anonymous
                              ? "KCA News Team"
                              : computeKCAName(article.writer!)}
                        </span>
                        <h1 className="mt-0.5 text-gray-800 dark:text-gray-300">
                           {formatDistance(
                              new Date(article.createdAt),
                              new Date(),
                              {
                                 addSuffix: true,
                              }
                           )}
                        </h1>
                     </div>
                  </span>
               </div>
            </div>
         </a>
      </Link>
   );
};

export default ArticleCard;
