import React, { useState } from "react";
import { LoadingOverlay } from "@mantine/core";
import Link from "next/link";
import Image from "next/image";
import { Disclosure } from "@headlessui/react";
import { useNotifications } from "@mantine/notifications";
import {
   AiOutlineArrowUp,
   AiOutlineArrowDown,
   AiOutlineLike,
   AiOutlineDislike,
   AiOutlineClose,
} from "react-icons/ai";
import { useMediaQuery } from "@mantine/hooks";
import { useSession } from "next-auth/react";

import Radio from "../../ui/Radio";
import ArticleBadge from "../ArticleBadge";
import ArticleUnderReviewCard from "../ArticleUnderReviewCard";
import ConfirmModal from "../../ui/ConfirmModal";

import { computeKCAName } from "../../lib/computeKCAName";
import type { Article } from "../../types/Article";
import { shimmer } from "../../lib/shimmer";
import { Button } from "../../ui/Button";
import { getFormmatedLocation } from "../../lib/categories";

interface Props {
   article: Article;
   selected?: Article | null;
   setSelected?: React.Dispatch<React.SetStateAction<Article | null>>;
   setSelectedId?: React.Dispatch<React.SetStateAction<string>>;
   className?: string;
   deleteArticle?: () => void;
   handleRemoveArticle?: (id: string) => void;
}

const ArticleDashboardCard: React.FC<Props> = ({
   article,
   selected,
   setSelected,
   setSelectedId,
   deleteArticle,
   className,
   handleRemoveArticle,
   ...rest
}) => {
   const { data } = useSession();
   const notifications = useNotifications();
   const [bigLoading, setBigLoading] = useState<boolean>(false);
   const [openConfirmModal, setOpenConfirmModal] = useState<boolean>(false);

   const desktop = useMediaQuery("(min-width: 1240px)");

   const deleteArticleNormal = async () => {
      setBigLoading(true);

      const r = await fetch(`/api/article/${article.id}/delete`, {
         method: "DELETE",
         credentials: "include",
      });
      const response = await r.json();

      if (r.status === 200) {
         handleRemoveArticle!(article.id);
      } else {
         notifications.showNotification({
            color: "red",
            title: "Delete - Error",
            message: response.message || "Unknown Error",
            icon: <AiOutlineClose />,
            autoClose: 5000,
         });
      }

      setBigLoading(false);
   };

   return (
      <>
         <LoadingOverlay visible={bigLoading} className="fixed" />
         <Disclosure
            as="div"
            className={`rounded-md border-2 border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-foot ${className}`}
            {...rest}
         >
            <div className="flex items-center gap-2">
               <Disclosure.Button
                  className={`cursor-pointer text-lg ${!setSelected && "mr-2"}`}
               >
                  {({ open }) =>
                     open ? (
                        <AiOutlineArrowUp title="Less Details" />
                     ) : (
                        <AiOutlineArrowDown title="More Details" />
                     )
                  }
               </Disclosure.Button>
               {setSelected && (
                  <Radio
                     checked={selected === article}
                     onChange={() => {
                        selected === article
                           ? setSelected!(null)
                           : setSelected!(article);
                     }}
                     className="focus:none"
                  />
               )}
               <div className="flex w-full items-center justify-between">
                  <h1 className="-ml-2">
                     <Link href={`/dashboard/writer/edit/${article.id}`}>
                        <a className="duration-150 hover:text-blue-500">
                           {article.title}
                        </a>
                     </Link>
                     {article.writer?.id !== data!.user?.id && (
                        <span>
                           {" - by "}
                           <Link href={`/profile/${article.writer?.id}`}>
                              <a className="hover:underline">
                                 {computeKCAName(article.writer!)}
                              </a>
                           </Link>
                        </span>
                     )}
                     {article.published && !article.underReview && (
                        <span className="font-semibold"> (published)</span>
                     )}{" "}
                     <Link href={`/article/${article.id}`}>
                        <a className="hidden font-semibold text-blue-600 duration-150 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-600 sm:inline-flex">
                           {" - "} See article
                        </a>
                     </Link>
                  </h1>
                  <div className="flex items-center gap-2">
                     {article.published ? (
                        <div className="mr-2 grid grid-cols-2 divide-x-2 divide-gray-500">
                           <div className="mr-2 flex items-center justify-center gap-1">
                              <AiOutlineLike size="25" />
                              <p className="font-medium">
                                 {article.upvotes?.length || 0}
                              </p>
                           </div>
                           <div className="flex items-center justify-center gap-1 pl-2">
                              <AiOutlineDislike size="25" />
                              <p className="font-medium">
                                 {article.downvotes?.length || 0}
                              </p>
                           </div>
                        </div>
                     ) : (
                        <h1
                           className={`font-semibold ${
                              (article.categoryId.length > 0 ||
                                 article.underReview) &&
                              "mr-2"
                           }`}
                        >
                           not published
                        </h1>
                     )}
                     <div className="hidden sm:block">
                        {article.categoryId.map((tag, i) => (
                           <ArticleBadge tag={tag} key={i} />
                        ))}
                     </div>
                     {article.underReview && (
                        <div className="flex items-center gap-2">
                           <ArticleUnderReviewCard />
                           <h1 className="font-semibold">Under Review</h1>
                        </div>
                     )}
                  </div>
               </div>
            </div>
            <Disclosure.Panel className="relative mt-4 flex justify-evenly gap-4 border-t-2 border-blue-500 pt-4">
               <div className="hidden sm:block">
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
               </div>
               <div className="relative w-full max-w-lg">
                  <h1 className="mb-2 border-b-2 pb-2 text-3xl font-semibold">
                     Description
                  </h1>
                  <p className=" mb-2 text-justify line-clamp-5">
                     {article.description}
                  </p>
                  <h1 className="mb-2 border-b-2 pb-2 text-3xl font-semibold">
                     Extra Details
                  </h1>
                  <p>
                     <span className="font-semibold">Department:</span>{" "}
                     {getFormmatedLocation(article.location)}
                  </p>
                  {article.coWriters.length !== 0 && (
                     <p>
                        <span className="font-semibold">Co Writers:</span>{" "}
                        {article.coWriters.map((writer, index) => (
                           <Link href={`/profile/${writer.id}`}>
                              <a
                                 key={index}
                                 className="font-semibold text-blue-600 duration-150 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600"
                              >
                                 {writer.name}
                                 {index !== article.coWriters.length - 1 && (
                                    <span className="text-black dark:text-white">
                                       ,{" "}
                                    </span>
                                 )}
                              </a>
                           </Link>
                        ))}
                     </p>
                  )}
                  {article.comments?.length !== 0 && (
                     <>
                        <div className="line-clamp-1">
                           <span className="font-semibold">
                              Latest Comment:
                           </span>{" "}
                           {article.comments![0].comment}
                        </div>
                        by{" "}
                        <Link
                           href={`/profile/${article.comments![0].user?.id}`}
                        >
                           <a className="text-blue-600 duration-150 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600">
                              {article.comments![0].user?.name}
                           </a>
                        </Link>
                        ,{" "}
                        <Link href={`/article/${article.id}#comments`}>
                           <a className="text-blue-600 duration-150 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600">
                              see rest
                           </a>
                        </Link>
                     </>
                  )}
                  <div className="bottom-0 mb-0.5 mt-4 flex w-full items-center gap-2 sm:absolute sm:mt-0">
                     <Link href={`/dashboard/writer/edit/${article.id}`}>
                        <a className="w-1/2 sm:w-1/3">
                           <Button className="w-full">Edit</Button>
                        </a>
                     </Link>
                     {desktop &&
                        (data!.user!.isAdmin || !article.underReview ? (
                           <Link
                              href={`/dashboard/writer/edit/${article.id}?menu=true&visibility=true`}
                           >
                              <a className="w-1/3">
                                 <Button
                                    className="w-full"
                                    color="sky"
                                    disabled={
                                       !data!.user!.isAdmin &&
                                       article.underReview
                                    }
                                 >
                                    Edit Visibility
                                 </Button>
                              </a>
                           </Link>
                        ) : (
                           <Button
                              className="w-1/3"
                              color="sky"
                              disabled={article.underReview}
                           >
                              Edit Visibility
                           </Button>
                        ))}
                     <div className="w-1/2 sm:w-1/3">
                        <Button
                           className="w-full"
                           color="secondary"
                           disabled={
                              article.underReview ||
                              article.published ||
                              (!setSelected &&
                                 data!.user!.isReviewer &&
                                 article.writer?.id !== data!.user?.id)
                           }
                           onClick={() => {
                              if (setSelected) {
                                 setSelectedId!(article.id);
                              }
                              setOpenConfirmModal(true);
                           }}
                        >
                           Delete
                        </Button>
                     </div>
                  </div>
               </div>
            </Disclosure.Panel>
         </Disclosure>
         <ConfirmModal
            isOpen={openConfirmModal}
            successFunction={setSelected ? deleteArticle! : deleteArticleNormal}
            updateModalState={() => setOpenConfirmModal(!openConfirmModal)}
         />
      </>
   );
};

export default ArticleDashboardCard;
