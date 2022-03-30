import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Popover, Transition } from "@headlessui/react";

import { Article } from "../../types/Article";
import { User } from "../../types/User";
import { shimmer } from "../../lib/shimmer";
import { format, parseISO } from "date-fns";

interface ArticleWriterInfoProps {
   article: Article;
   user?: User;
   showEdit?: boolean;
   className?: string;
}

const ArticleWriterInfo: React.FC<ArticleWriterInfoProps> = ({
   article,
   user,
   showEdit = false,
   className,
}) => {
   return (
      <div className={`${className} flex items-center`}>
         <span className="inline-flex items-center justify-center rounded-md py-2 text-xs font-medium leading-none">
            <Image
               className="rounded-full"
               src={article.anonymous ? "/no-pfp.jpg" : article.writer!.image}
               width="25px"
               height="25px"
               blurDataURL={shimmer(1920, 1080)}
               alt={`${
                  article.anonymous
                     ? "KCA News"
                     : article.writer!.name.split(" ")[0]
               }'s profile image`}
            />
            <span className="ml-2 mr-1 text-lg">
               {article.anonymous ? (
                  "KCA News Team"
               ) : (
                  <div className="flex gap-2">
                     {showEdit ? (
                        <Link href={`/profile/${article.writer!.id}`}>
                           <a className="duration-150 hover:text-blue-500">
                              {article.writer!.name}
                           </a>
                        </Link>
                     ) : (
                        <span>{article.writer!.name}</span>
                     )}
                     {article.coWriters.length !== 0 && (
                        <Popover className="relative">
                           <Popover.Button
                              as="span"
                              className="cursor-pointer select-none duration-150 hover:text-blue-500"
                           >
                              {" "}
                              and {article.coWriters.length} other
                              {article.coWriters.length > 1 && "s"}
                           </Popover.Button>
                           <Transition
                              as={React.Fragment}
                              enter="transition ease-out duration-200"
                              enterFrom="opacity-0 translate-y-1"
                              enterTo="opacity-100 translate-y-0"
                              leave="transition ease-in duration-150"
                              leaveFrom="opacity-100 translate-y-0"
                              leaveTo="opacity-0 translate-y-1"
                           >
                              <Popover.Panel className="absolute z-10 w-[20rem] rounded-md border-2 border-gray-100 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
                                 {article.coWriters.map((co, index) => (
                                    <Link href={`/profile/${co.id}`}>
                                       <a
                                          key={index}
                                          className="flex select-none items-center gap-2 py-3 px-4 duration-150 hover:bg-gray-100 hover:text-blue-500 dark:border-gray-900 dark:hover:bg-gray-900 dark:hover:text-white"
                                       >
                                          <Image
                                             className="rounded-full"
                                             src={co.image}
                                             width="25px"
                                             height="25px"
                                             blurDataURL={shimmer(1920, 1080)}
                                             alt={`${
                                                co.name.split(" ")[0]
                                             }'s profile image`}
                                          />
                                          <span> {co.name}</span>
                                       </a>
                                    </Link>
                                 ))}
                              </Popover.Panel>
                           </Transition>
                        </Popover>
                     )}
                  </div>
               )}
            </span>
         </span>
         <h1 className="ml-1 flex items-center text-gray-800 dark:text-gray-100">
            {" / "}
            <div className="ml-2">
               {format(
                  parseISO(new Date(article.createdAt).toISOString()),
                  "MMMM dd, yyyy"
               )}
            </div>
         </h1>
         {(user?.isAdmin || article.writer?.id === user?.id) && showEdit && (
            <h1 className="ml-2 flex items-center text-blue-500 dark:text-blue-300">
               {" / "}
               <div className="ml-2">
                  <Link href={`/dashboard/writer/edit/${article.id}`}>
                     <a>Edit Article</a>
                  </Link>
               </div>
            </h1>
         )}
      </div>
   );
};

export default ArticleWriterInfo;
