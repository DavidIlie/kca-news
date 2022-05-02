import React, { useState, Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { NextSeo } from "next-seo";
import { GetServerSideProps } from "next";
import { getSession, useSession } from "next-auth/react";
import { LoadingOverlay, Select, TextInput } from "@mantine/core";
import { useNotifications } from "@mantine/notifications";
import { Tab, Menu, Transition } from "@headlessui/react";
import { format } from "date-fns";
import {
   AiOutlineClose,
   AiOutlineDelete,
   AiOutlineFilter,
   AiOutlineSearch,
} from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";
import { HiLockClosed } from "react-icons/hi";
import { RiArticleLine } from "react-icons/ri";

import DashboardStatistics from "../../components/DashboardStatistics";
import NextLink from "../../ui/NextLink";
import DropdownElement from "../../ui/DropdownElement";

import prisma from "../../lib/prisma";
import { Statistics } from "./writer";
import classNames from "../../lib/classNames";
import { Article } from "../../types/Article";
import { Comment } from "../../types/Comment";
import { computeKCAName } from "../../lib/computeKCAName";
import { shimmer } from "../../lib/shimmer";

interface Props {
   statistics: Statistics;
   articles: Article[];
   comments: Comment[];
}

const ReviewerPage: React.FC<Props> = ({ statistics, articles, comments }) => {
   const { data } = useSession();
   const [bigLoading, setBigLoading] = useState<boolean>(false);
   const [statisticsState, setStatisticsState] =
      useState<Statistics>(statistics);

   return (
      <>
         <NextSeo title="Reviewer Panel" />
         <LoadingOverlay visible={bigLoading} className="fixed" />
         <div className="flex flex-grow px-4 pt-10 dark:bg-dark-bg sm:pt-32">
            <div className="mx-auto">
               <DashboardStatistics
                  isAdmin={true}
                  {...statisticsState}
                  className="mx-auto max-w-7xl lg:px-8"
               />
               <Tab.Group
                  as="div"
                  className="mx-2 mt-6 mb-8 sm:mx-8"
                  defaultIndex={data!.user!.isAdmin ? 1 : 0}
               >
                  <Tab.List
                     className={`flex ${
                        data!.user!.isAdmin && "flex-row-reverse"
                     } space-x-1 rounded-xl border-2 border-gray-200 bg-gray-100 p-1 dark:border-gray-800 dark:bg-foot`}
                  >
                     {data!.user!.isAdmin ? (
                        <Link href="/dashboard/writer">
                           <a
                              className={classNames(
                                 "w-full rounded-lg py-2.5 text-center text-sm font-medium leading-5 duration-150",
                                 "text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-dark-bg dark:hover:bg-opacity-60"
                              )}
                           >
                              Articles
                           </a>
                        </Link>
                     ) : (
                        <Tab
                           className={({ selected }) =>
                              classNames(
                                 "w-full rounded-lg py-2.5 text-sm font-medium leading-5 duration-150",
                                 selected
                                    ? "bg-white text-gray-800 shadow dark:bg-dark-bg dark:text-gray-100"
                                    : "text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-dark-bg dark:hover:bg-opacity-60"
                              )
                           }
                        >
                           Articles
                        </Tab>
                     )}
                     <Tab
                        className={({ selected }) =>
                           classNames(
                              "w-full rounded-lg py-2.5 text-sm font-medium leading-5 duration-150",
                              selected
                                 ? "bg-white text-gray-800 shadow dark:bg-dark-bg dark:text-gray-100"
                                 : "text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-dark-bg dark:hover:bg-opacity-60"
                           )
                        }
                     >
                        Comments
                     </Tab>
                  </Tab.List>
                  <div className="mt-4" />
                  <Tab.Panels>
                     <Tab.Panel>
                        {data!.user!.isAdmin ? (
                           <CommentList
                              comments={comments}
                              setLoad={setBigLoading}
                              statistics={statistics}
                              setStatistics={setStatisticsState}
                           />
                        ) : (
                           <ArticleList
                              articles={articles}
                              setLoad={setBigLoading}
                              statistics={statistics}
                              setStatistics={setStatisticsState}
                           />
                        )}
                     </Tab.Panel>
                     <Tab.Panel>
                        {data!.user!.isAdmin ? (
                           <ArticleList
                              articles={articles}
                              setLoad={setBigLoading}
                              statistics={statistics}
                              setStatistics={setStatisticsState}
                           />
                        ) : (
                           <CommentList
                              comments={comments}
                              setLoad={setBigLoading}
                              statistics={statistics}
                              setStatistics={setStatisticsState}
                           />
                        )}
                     </Tab.Panel>
                  </Tab.Panels>
               </Tab.Group>
            </div>
         </div>
      </>
   );
};

interface BaseListProps {
   setLoad: React.Dispatch<React.SetStateAction<boolean>>;
   statistics: Statistics;
   setStatistics: React.Dispatch<React.SetStateAction<Statistics>>;
}

interface ArticleListProps extends BaseListProps {
   articles: Article[];
}

const ArticleList: React.FC<ArticleListProps> = ({
   articles,
   setLoad,
   setStatistics,
}) => {
   return <>articles</>;
};

interface CommentListProps extends BaseListProps {
   comments: Comment[];
}

const CommentList: React.FC<CommentListProps> = ({
   comments,
   setLoad,
   statistics,
   setStatistics,
}) => {
   const { data } = useSession();
   const notifications = useNotifications();
   const [baseComments, setBaseComments] = useState<Comment[]>(comments);
   const [commentsState, setCommentsState] = useState<Comment[]>(comments);

   const [searchQuery, setSearchQuery] = useState<string>("");
   const [hasSearched, setHasSearched] = useState<boolean>(false);
   const [filter, setFilter] = useState<string | null>(null);

   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;

      setHasSearched(true);
      setSearchQuery(val);

      setCommentsState(
         baseComments.filter(
            (comment) =>
               comment.comment.toLowerCase().includes(val.toLowerCase()) ||
               comment.user!.email.toLowerCase().includes(val.toLowerCase())
         )
      );
   };

   const handleFilter = (v: string) => {
      setFilter(v);
      setSearchQuery("");
      setCommentsState(baseComments);

      switch (v) {
         case "a-z":
            setCommentsState(
               baseComments.sort((a, b) => a.comment.localeCompare(b.comment))
            );
            break;
         case "z-a":
            setCommentsState(
               baseComments.sort((a, b) => b.comment.localeCompare(a.comment))
            );
            break;
         case "newest":
            setCommentsState(
               baseComments.sort(
                  (a, b) =>
                     new Date(b.createdAt).getTime() -
                     new Date(a.createdAt).getTime()
               )
            );
            break;
         case "oldest":
            setCommentsState(
               baseComments.sort(
                  (a, b) =>
                     new Date(a.createdAt).getTime() -
                     new Date(b.createdAt).getTime()
               )
            );
            break;
         default:
            setCommentsState(
               baseComments.sort(
                  (a, b) =>
                     new Date(b.createdAt).getTime() -
                     new Date(a.createdAt).getTime()
               )
            );
            break;
      }
   };

   return (
      <>
         <div className="mt-4 mb-2 flex items-center gap-2">
            <TextInput
               icon={<AiOutlineSearch />}
               placeholder="Search"
               value={searchQuery}
               onChange={handleSearch}
               error={commentsState.length === 0 && hasSearched}
               classNames={{
                  filledVariant:
                     "dark:bg-foot border-2 dark:border-gray-800 border-gray-300",
               }}
               className="w-full sm:w-auto"
            />
            <Select
               placeholder="Filter"
               clearable
               allowDeselect
               nothingFound="No options"
               maxDropdownHeight={180}
               icon={<AiOutlineFilter />}
               data={[
                  { value: "a-z", label: "A-Z" },
                  { value: "z-a", label: "Z-A" },
                  { value: "newest", label: "Newest" },
                  { value: "oldest", label: "Oldest" },
               ]}
               value={filter}
               onChange={handleFilter}
               classNames={{
                  filledVariant:
                     "dark:bg-foot border-2 dark:border-gray-800 border-gray-300",
                  dropdown:
                     "dark:bg-foot border-2 dark:border-gray-800 border-gray-300",
               }}
               className="w-full sm:w-auto"
            />
         </div>
         {commentsState.length === 0 && (
            <h1 className="mt-6 text-center text-4xl font-semibold">
               No comments...
            </h1>
         )}
         {commentsState.map((comment, index) => (
            <div
               className={`flex items-center justify-between rounded-md border-2 border-gray-100 bg-gray-50 px-6 py-2 dark:border-gray-800 dark:bg-foot ${
                  index !== commentsState.length - 1 && "mb-2"
               }`}
               key={index}
            >
               <div className="flex items-center gap-4">
                  <Image
                     src={comment.user?.image || "/no-pfp.jpg"}
                     width={55}
                     height={55}
                     blurDataURL={shimmer(10, 10)}
                     placeholder="blur"
                     className="rounded-full object-cover"
                     alt={`${
                        comment.user?.names[comment.user?.nameIndex]
                     }'s profile image`}
                  />
                  <div className="flex flex-col items-center space-y-2">
                     <div className="w-full">{comment.comment}</div>
                     <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-500 dark:text-gray-300">
                           {computeKCAName(comment.user!)}
                        </p>
                        <span className="text-gray-800 dark:text-gray-200">
                           /
                        </span>
                        <p className="text-sm text-gray-400 dark:text-gray-300">
                           {format(
                              new Date(comment.createdAt),
                              "d MMM yyyy 'at' h:mm bb"
                           )}
                        </p>
                     </div>
                  </div>
               </div>
               <Menu as="div" className="relative">
                  <Menu.Button
                     as={BsThreeDotsVertical}
                     size={25}
                     className="cursor-pointer"
                  />
                  <Transition
                     as={Fragment}
                     enter="transition ease-out duration-100"
                     enterFrom="transform opacity-0 scale-95"
                     enterTo="transform opacity-100 scale-100"
                     leave="transition ease-in duration-75"
                     leaveFrom="transform opacity-100 scale-100"
                     leaveTo="transform opacity-0 scale-95"
                  >
                     <Menu.Items className="absolute right-0 z-10 mt-2 -mr-4 w-36 rounded-md border-2 border-gray-200 bg-gray-50 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:border-gray-800 dark:bg-foot">
                        <Menu.Item
                           as={NextLink}
                           href={`/article/${comment.article?.id}`}
                        >
                           <DropdownElement>
                              <RiArticleLine className="mx-0.5 text-xl" />
                              View Article
                           </DropdownElement>
                        </Menu.Item>
                        {data!.user!.isAdmin && (
                           <Menu.Item
                              onClick={async () => {
                                 setLoad(true);

                                 const r = await fetch(
                                    `/api/admin/setMute?id=${comment?.user?.id}`
                                 );

                                 if (r.status !== 200) {
                                    const response = await r.json();
                                    notifications.showNotification({
                                       color: "red",
                                       title: "Mute User - Error",
                                       message:
                                          response.message || "Unknown Error",
                                       icon: <AiOutlineClose />,
                                       autoClose: 5000,
                                    });
                                 }

                                 setLoad(false);
                              }}
                           >
                              <DropdownElement>
                                 <HiLockClosed className="mx-0.5 text-xl" />
                                 Toggle Mute
                              </DropdownElement>
                           </Menu.Item>
                        )}
                        <Menu.Item
                           onClick={async () => {
                              setLoad(true);

                              const r = await fetch(
                                 `/api/article/${comment.article?.id}/comment/${comment.id}`,
                                 { credentials: "include", method: "DELETE" }
                              );
                              const response = await r.json();

                              if (r.status === 200) {
                                 setBaseComments(
                                    baseComments.filter(
                                       (v) => v.id !== comment.id
                                    )
                                 );
                                 setCommentsState(
                                    baseComments.filter(
                                       (v) => v.id !== comment.id
                                    )
                                 );

                                 let newStats = statistics;
                                 newStats.totalComments =
                                    newStats.totalComments - 1;
                                 setStatistics(newStats);
                              } else {
                                 notifications.showNotification({
                                    color: "red",
                                    title: "Delete Comment - Error",
                                    message:
                                       response.message || "Unknown Error",
                                    icon: <AiOutlineClose />,
                                    autoClose: 5000,
                                 });
                              }

                              setLoad(false);
                           }}
                        >
                           <DropdownElement color="red">
                              <AiOutlineDelete className="mx-0.5 text-xl" />
                              Delete
                           </DropdownElement>
                        </Menu.Item>
                     </Menu.Items>
                  </Transition>
               </Menu>
            </div>
         ))}
      </>
   );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
   const session = await getSession({ req });

   if (
      !session ||
      (session?.user?.isAdmin ? false : !session?.user?.isReviewer)
   )
      return {
         redirect: {
            destination: "/",
            permanent: false,
         },
      };

   const totalArticles = session?.user?.isAdmin
      ? await prisma.article.count()
      : await prisma.article.count({
           where: {
              location: {
                 in: session?.user?.department,
              },
           },
        });

   const publishedArticles = session?.user?.isAdmin
      ? await prisma.article.count({ where: { published: true } })
      : await prisma.article.count({
           where: {
              published: true,
              location: {
                 in: session?.user?.department,
              },
           },
        });
   const totalComments = session?.user?.isAdmin
      ? await prisma.comment.count()
      : await prisma.comment.count({
           where: {
              article: {
                 published: true,
                 location: { in: session?.user?.department },
              },
           },
        });
   const totalUpvotes = session?.user?.isAdmin
      ? await prisma.upvote.count()
      : await prisma.upvote.count({
           where: {
              article: {
                 published: true,
                 location: { in: session?.user?.department },
              },
           },
        });
   const totalDownvotes = session?.user?.isAdmin
      ? await prisma.downvote.count()
      : await prisma.downvote.count({
           where: {
              article: {
                 published: true,
                 location: { in: session?.user?.department },
              },
           },
        });

   const includeParams = {
      coWriters: true,
      comments: {
         take: 1,
         orderBy: {
            createdAt: "desc",
         },
         include: {
            user: true,
         },
      },
      writer: true,
      upvotes: true,
      downvotes: true,
   };

   const articles = session?.user?.isAdmin
      ? await prisma.article.findMany({
           include: includeParams as any,
           orderBy: {
              createdAt: "desc",
           },
           where: {
              underReview: true,
           },
        })
      : await prisma.article.findMany({
           include: includeParams as any,
           where: {
              user: session?.user?.id,
              location: { in: session?.user?.department },
              underReview: true,
           },
           orderBy: {
              createdAt: "desc",
           },
        });

   const comments = session?.user?.isAdmin
      ? await prisma.comment.findMany({
           include: { user: true, article: true },
           orderBy: { createdAt: "desc" },
        })
      : await prisma.comment.findMany({
           include: { user: true, article: true },
           orderBy: { createdAt: "desc" },
           where: {
              article: {
                 is: {
                    location: {
                       in: session?.user?.department,
                    },
                 },
              },
           },
        });

   return {
      props: {
         statistics: {
            totalArticles,
            publishedArticles,
            totalComments,
            totalUpvotes,
            totalDownvotes,
         },
         articles: JSON.parse(JSON.stringify(articles)),
         comments: JSON.parse(JSON.stringify(comments)),
      },
   };
};

export default ReviewerPage;
