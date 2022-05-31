import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { Popover, Transition } from "@headlessui/react";
import { DatePicker } from "@mantine/dates";
import { LoadingOverlay } from "@mantine/core";
import { useNotifications } from "@mantine/notifications";
import { AiOutlineClose } from "react-icons/ai";

import { Article } from "../../types/Article";
import { User } from "../../types/User";
import { shimmer } from "../../lib/shimmer";
import { format, parseISO } from "date-fns";
import { computeKCAName } from "../../lib/computeKCAName";

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
   const { asPath } = useRouter();

   const notifications = useNotifications();
   const [openLoading, setOpenLoading] = useState<boolean>(false);
   const ref = useRef<HTMLInputElement>();
   const [date, setDate] = useState<Date>(article.createdAt);

   useEffect(() => {
      const makeRequest = async () => {
         setOpenLoading(true);
         const r = await fetch(`/api/article/${article.id}/update/date`, {
            method: "POST",
            body: JSON.stringify({ date }),
         });
         if (r.status !== 200) {
            const response = await r.json();
            notifications.showNotification({
               color: "red",
               title: "Search - Error",
               message: response.message || "Unknown Error",
               icon: <AiOutlineClose />,
               autoClose: 5000,
            });
         }
         setOpenLoading(false);
      };

      if (date !== article.createdAt) makeRequest();
   }, [date]);

   return (
      <div className={`${className} flex items-center`}>
         <LoadingOverlay className="fixed" visible={openLoading} />
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
                     : article.writer?.names[article.writer?.nameIndex]
               }'s profile image`}
            />
            <span className="ml-2 mr-1 text-lg">
               {article.anonymous ? (
                  "KCA News Team"
               ) : (
                  <div className="flex gap-2">
                     <Link href={`/profile/${article.writer!.id}`}>
                        <a className="duration-150 hover:text-blue-500">
                           {computeKCAName(article.writer!)}
                        </a>
                     </Link>
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
                              <Popover.Panel className="absolute z-10 w-[20rem] rounded-md border-2 border-gray-100 bg-white shadow-md dark:border-gray-800 dark:bg-foot">
                                 {article.coWriters.map((co, index) => (
                                    <Link
                                       href={`/profile/${co.id}`}
                                       key={index}
                                    >
                                       <a className="flex select-none items-center gap-2 py-3 px-4 duration-150 hover:bg-gray-100 hover:text-blue-500 dark:border-gray-900 dark:hover:bg-gray-900 dark:hover:text-white">
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
                                          <span>{computeKCAName(co)}</span>
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
         <div className="sm:flex">
            <h1 className="relative ml-1 flex items-center text-gray-800 dark:text-gray-100">
               <div className="hidden sm:block">{" / "}</div>
               <DatePicker
                  ref={ref as any}
                  maxDate={new Date()}
                  className="hidden"
                  dropdownType="modal"
                  value={date}
                  onChange={(v: Date) => setDate(v)}
                  minDate={
                     new Date(`${new Date().getFullYear()}-01-01T00:00:00.000Z`)
                  }
               />
               <div
                  className={`ml-2 ${!showEdit && "cursor-pointer"}`}
                  onClick={() => !showEdit && ref.current?.click()}
               >
                  {" "}
                  {format(
                     parseISO(new Date(date).toISOString()),
                     "MMMM do, yyyy"
                  )}
               </div>
            </h1>
            {(user?.isAdmin || article.writer?.id === user?.id) && showEdit && (
               <h1 className="ml-1 flex items-center text-blue-500 dark:text-blue-300 sm:ml-2">
                  <div className="hidden sm:block">{" / "}</div>
                  <div className="ml-2">
                     <Link href={`/dashboard/writer/edit/${article.id}`}>
                        <a>Edit Article</a>
                     </Link>
                  </div>
               </h1>
            )}
            {asPath.includes("/dashboard/writer/edit") && (
               <h1 className="ml-1 flex items-center text-blue-500 dark:text-blue-300 sm:ml-2">
                  <div className="hidden sm:block">{" / "}</div>
                  <div className="ml-2">
                     <Link href={`/article/${article.id}`}>
                        <a>See Article</a>
                     </Link>
                  </div>
               </h1>
            )}
         </div>
      </div>
   );
};

export default ArticleWriterInfo;
