import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { DefaultSeo } from "next-seo";
import { LoadingOverlay, Select, TextInput } from "@mantine/core";
import { useNotifications } from "@mantine/notifications";
import {
   AiOutlineSearch,
   AiOutlineFilter,
   AiOutlineClose,
} from "react-icons/ai";

import prisma from "../../../lib/prisma";
import { Button } from "../../../ui/Button";
import { User } from "../../../types/User";
import DashboardStatistics from "../../../components/DashboardStatistics";
import ConfirmModal from "../../../ui/ConfirmModal";
import ArticleDashboardCard from "../../../components/ArticleDashboardCard";
import { Article } from "../../../types/Article";

export interface Statistics {
   totalArticles: number;
   publishedArticles: number;
   totalComments: number;
   totalUpvotes: number;
   totalDownvotes: number;
}

interface Props {
   user: User;
   statistics: Statistics;
   articles: Article[];
}

const WriterPanel: React.FC<Props> = ({ user, statistics, articles }) => {
   const [selected, setSelected] = useState<Article | null>(null);

   const notifications = useNotifications();
   const { push } = useRouter();

   const [statisticsState, setStatistics] = useState<Statistics>(statistics);
   const [baseArticles, setBaseArticles] = useState<Article[]>(articles);
   const [filteredArticles, setFilteredArticles] =
      useState<Article[]>(baseArticles);
   const [articlesState, setArticles] = useState<Article[]>(filteredArticles);
   const [searchQuery, setSearchQuery] = useState<string>("");
   const [hasSearched, setHasSearched] = useState<boolean>(false);
   const [filter, setFilter] = useState<string | null>(null);
   const [openConfirmModal, setOpenConfirmModal] = useState<boolean>(false);
   const [bigLoading, setBigLoading] = useState<boolean>(false);
   const [selectedId, setSelectedId] = useState<string>("");

   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;

      setHasSearched(true);
      setSearchQuery(val);

      setArticles(
         filteredArticles.filter(
            (article) =>
               article.title.toLowerCase().includes(val.toLowerCase()) ||
               article.writer?.name.toLowerCase().includes(val.toLowerCase()) ||
               article.writer?.email.toLowerCase().includes(val.toLowerCase())
         )
      );
   };

   const handleFilter = (v: string) => {
      setFilter(v);
      setSearchQuery("");
      setArticles(filteredArticles);

      switch (v) {
         case "newest":
            setArticles(
               baseArticles.sort(
                  (a, b) =>
                     new Date(b.createdAt).getTime() -
                     new Date(a.createdAt).getTime()
               )
            );
            break;
         case "oldest":
            setArticles(
               baseArticles.sort(
                  (a, b) =>
                     new Date(a.createdAt).getTime() -
                     new Date(b.createdAt).getTime()
               )
            );
            break;
         case "most-likes":
            setArticles(
               baseArticles
                  .filter((s) => s.published)
                  .sort((a, b) => b.upvotes!.length - a.upvotes!.length)
            );
            break;
         case "least-likes":
            setArticles(
               baseArticles
                  .filter((s) => s.published)
                  .sort((a, b) => a.upvotes!.length - b.upvotes!.length)
            );
            break;
         case "most-dislikes":
            setArticles(
               baseArticles
                  .filter((s) => s.published)
                  .sort((a, b) => b.downvotes!.length - a.downvotes!.length)
            );
            break;
         case "least-dislikes":
            setArticles(
               baseArticles
                  .filter((s) => s.published)
                  .sort((a, b) => a.downvotes!.length - b.downvotes!.length)
            );
            break;
         case "published":
            setArticles(baseArticles.filter((article) => article.published));
            break;
         case "not-published":
            setArticles(baseArticles.filter((article) => !article.published));
            break;
         case "review":
            setArticles(baseArticles.filter((article) => article.underReview));
            break;
         case "not-review":
            setArticles(baseArticles.filter((article) => !article.underReview));
            break;
         default:
            setFilteredArticles(baseArticles);
            break;
      }
   };

   const deleteArticle = async () => {
      setBigLoading(true);

      const id = selected?.id || selectedId;

      const r = await fetch(`/api/article/${id}/delete`, {
         method: "DELETE",
         credentials: "include",
      });
      const response = await r.json();

      if (r.status === 200) {
         setSelected(null);

         const filtered = baseArticles.filter((article) => article.id !== id);

         setBaseArticles(filtered);
         setFilteredArticles(filtered);
         setArticles(filtered);

         const r = await fetch(`/api/writer/statistics`, {
            credentials: "include",
         });
         const response = await r.json();

         if (r.status === 200) {
            setStatistics(response.statistics);
         } else {
            notifications.showNotification({
               color: "red",
               title: "Statistics - Error",
               message: response.message || "Unknown Error",
               icon: <AiOutlineClose />,
               autoClose: 5000,
            });
         }
      } else {
         notifications.showNotification({
            color: "red",
            title: "Delete - Error",
            message: response.message || "Unknown Error",
            icon: <AiOutlineClose />,
            autoClose: 5000,
         });
      }

      setSelectedId("");
      setBigLoading(false);
   };

   return (
      <>
         <DefaultSeo title="Writer Panel" />
         <LoadingOverlay visible={bigLoading} className="fixed" />
         <div className="flex flex-grow px-4 pt-10 dark:bg-dark-bg sm:pt-32">
            <div className="mx-auto">
               <DashboardStatistics
                  isAdmin={user.isAdmin}
                  {...statisticsState}
                  className="mx-auto max-w-7xl lg:px-8"
               />
               <div className="container mt-4 max-w-7xl px-2 sm:px-8">
                  <div className="borderColor justify-between border-b-2 pb-4 sm:flex">
                     <div className="mb-4 mt-1 flex items-center gap-2 sm:mb-0">
                        <Link href="/dashboard/writer/create">
                           <a className="w-1/3 sm:w-auto">
                              <Button className="w-full">
                                 Create
                                 <span className="hidden sm:ml-1 sm:block">
                                    Article
                                 </span>
                              </Button>
                           </a>
                        </Link>
                        <Button
                           disabled={selected === null}
                           color="sky"
                           onClick={() =>
                              selected !== null &&
                              push(`/dashboard/writer/edit/${selected.id}`)
                           }
                           className="w-1/3 sm:w-auto"
                        >
                           Edit{" "}
                           <span className="hidden sm:ml-1 sm:block">
                              {" "}
                              Article
                           </span>
                        </Button>
                        <Button
                           disabled={
                              selected === null ||
                              selected.underReview ||
                              selected.published
                           }
                           color="secondary"
                           onClick={() => setOpenConfirmModal(true)}
                           className="w-1/3 sm:w-auto"
                        >
                           Delete
                           <span className="hidden sm:ml-1 sm:block">
                              {" "}
                              Article
                           </span>
                        </Button>
                     </div>
                     <div className="flex items-center gap-2">
                        <TextInput
                           icon={<AiOutlineSearch />}
                           placeholder="Search"
                           value={searchQuery}
                           onChange={handleSearch}
                           error={articlesState.length === 0 && hasSearched}
                           classNames={{
                              filledVariant:
                                 "dark:bg-foot border-2 dark:border-gray-800 border-gray-300",
                           }}
                        />
                        <Select
                           placeholder="Filter"
                           clearable
                           allowDeselect
                           nothingFound="No options"
                           maxDropdownHeight={180}
                           icon={<AiOutlineFilter />}
                           data={[
                              { value: "newest", label: "Newest" },
                              { value: "oldest", label: "Oldest" },
                              { value: "most-likes", label: "Most Likes" },
                              { value: "least-likes", label: "Least Likes" },
                              {
                                 value: "most-dislikes",
                                 label: "Most Dislikes",
                              },
                              {
                                 value: "least-dislikes",
                                 label: "Least Dislikes",
                              },
                              { value: "published", label: "Published" },
                              {
                                 value: "not-published",
                                 label: "Not Published",
                              },
                              { value: "review", label: "Under Review" },
                              {
                                 value: "not-review",
                                 label: "Not Under Review",
                              },
                           ]}
                           value={filter}
                           onChange={handleFilter}
                           classNames={{
                              filledVariant:
                                 "dark:bg-foot border-2 dark:border-gray-800 border-gray-300",
                              dropdown:
                                 "dark:bg-foot border-2 dark:border-gray-800 border-gray-300",
                           }}
                        />
                     </div>
                  </div>
                  <div className="my-4 mb-10 dark:bg-dark-bg">
                     {articlesState.length === 0 && (
                        <h1 className="text-center text-4xl font-semibold">
                           No articles...
                        </h1>
                     )}
                     {articlesState.map((article, index) => (
                        <ArticleDashboardCard
                           article={article}
                           selected={selected}
                           setSelected={setSelected}
                           setSelectedId={setSelectedId}
                           deleteArticle={deleteArticle}
                           className={
                              index !== articlesState.length - 1 ? "mb-4" : ""
                           }
                           key={article.id}
                        />
                     ))}
                  </div>
               </div>
            </div>
         </div>
         <ConfirmModal
            isOpen={openConfirmModal}
            successFunction={deleteArticle}
            updateModalState={() => setOpenConfirmModal(!openConfirmModal)}
         />
      </>
   );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
   const session = await getSession({ req });

   if (!session || (session?.user?.isAdmin ? false : !session?.user?.isWriter))
      return {
         redirect: {
            destination: "/",
            permanent: false,
         },
      };

   const totalArticles = session?.user?.isAdmin
      ? await prisma.article.count()
      : await prisma.article.count({
           where: { user: session?.user?.id },
        });

   const publishedArticles = session?.user?.isAdmin
      ? await prisma.article.count({ where: { published: true } })
      : await prisma.article.count({
           where: { published: true, user: session?.user?.id },
        });

   const params = {
      article: {
         is: {
            writer: {
               is: {
                  id: session!.user!.id,
               },
            },
         },
      },
   };

   const totalComments = session?.user?.isAdmin
      ? await prisma.comment.count()
      : await prisma.comment.count({
           where: params as any,
        });

   const totalUpvotes = session?.user?.isAdmin
      ? await prisma.upvote.count()
      : await prisma.upvote.count({
           where: params as any,
        });

   const totalDownvotes = session?.user?.isAdmin
      ? await prisma.downvote.count()
      : await prisma.downvote.count({
           where: params as any,
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

   let articles =
      session?.user?.isAdmin || session?.user?.isEditorial
         ? await prisma.article.findMany({
              include: includeParams as any,
              orderBy: {
                 createdAt: "desc",
              },
           })
         : await prisma.article.findMany({
              include: includeParams as any,
              where: { user: session?.user?.id },
              orderBy: {
                 createdAt: "desc",
              },
           });

   articles.forEach((article) => {
      //@ts-ignore
      delete article.mdx;
   });

   return {
      props: {
         user: session?.user,
         statistics: {
            totalArticles,
            publishedArticles,
            totalComments,
            totalUpvotes,
            totalDownvotes,
         },
         articles: JSON.parse(JSON.stringify(articles)),
      },
   };
};

export default WriterPanel;
