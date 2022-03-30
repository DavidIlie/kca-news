import React, { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { DefaultSeo } from "next-seo";
import { Disclosure } from "@headlessui/react";
import { Select, TextInput } from "@mantine/core";

import {
   AiOutlineArrowDown,
   AiOutlineArrowUp,
   AiOutlineLike,
   AiOutlineDislike,
   AiOutlineSearch,
   AiOutlineFilter,
} from "react-icons/ai";

import prisma from "../../../lib/prisma";
import { shimmer } from "../../../lib/shimmer";
import { Article } from "../../../types/Article";
import { Button } from "../../../ui/Button";
import { User } from "../../../types/User";
import Radio from "../../../ui/Radio";
import ArticleBadge from "../../../components/ArticleBadge";
import ArticleUnderReviewCard from "../../../components/ArticleUnderReviewCard";
import DashboardStatistics from "../../../components/DashboardStatistics";

interface Props {
   user: User;
   statistics: {
      totalArticles: number;
      publishedArticles: number;
      totalComments: number;
      totalUpvotes: number;
      totalDownvotes: number;
   };
   articles: Article[];
}

const WriterPanel: React.FC<Props> = ({ user, statistics, articles }) => {
   const [selected, setSelected] = useState<Article | null>(null);

   const { push } = useRouter();

   const [filteredArticles, setFilteredArticles] =
      useState<Article[]>(articles);
   const [articlesState, setArticles] = useState<Article[]>(filteredArticles);
   const [searchQuery, setSearchQuery] = useState<string>("");
   const [hasSearched, setHasSearched] = useState<boolean>(false);
   const [filter, setFilter] = useState<string | null>(null);

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
               articles.sort(
                  (a, b) =>
                     new Date(b.createdAt).getTime() -
                     new Date(a.createdAt).getTime()
               )
            );
            break;
         case "oldest":
            setArticles(
               articles.sort(
                  (a, b) =>
                     new Date(a.createdAt).getTime() -
                     new Date(b.createdAt).getTime()
               )
            );
            break;
         case "most-likes":
            setArticles(
               articles.sort((a, b) => b.upvotes!.length - a.upvotes!.length)
            );
            break;
         case "least-likes":
            setArticles(
               articles.sort((a, b) => a.upvotes!.length - b.upvotes!.length)
            );
            break;
         case "most-dislikes":
            setArticles(
               articles.sort(
                  (a, b) => b.downvotes!.length - a.downvotes!.length
               )
            );
            break;
         case "least-dislikes":
            setArticles(
               articles.sort(
                  (a, b) => a.downvotes!.length - b.downvotes!.length
               )
            );
            break;
         case "published":
            setArticles(articles.filter((article) => article.published));
            break;
         case "not-published":
            setArticles(articles.filter((article) => !article.published));
            break;
         case "review":
            setArticles(articles.filter((article) => article.underReview));
            break;
         case "not-review":
            setArticles(articles.filter((article) => !article.underReview));
            break;
         default:
            setFilteredArticles(articles);
            break;
      }
   };

   return (
      <>
         <DefaultSeo title="Writer Panel" />
         <div className="flex flex-grow px-4 pt-10 dark:bg-gray-900 sm:pt-32">
            <div className="mx-auto">
               <DashboardStatistics
                  isAdmin={user.isAdmin}
                  {...statistics}
                  className="mx-auto max-w-7xl lg:px-8"
               />
               <div className="container mt-4 max-w-7xl px-2 sm:px-8">
                  <h1 className="mb-4 text-4xl font-semibold">
                     {user.isAdmin ? "Total" : "Your"} Articles
                  </h1>
                  <div className="dasrk:border-blue-900 flex justify-between border-b-2 border-gray-300 pb-4">
                     <div className="flex items-center gap-2">
                        <Link href="/dashboard/writer/create">
                           <a>
                              <Button>Create Article</Button>
                           </a>
                        </Link>
                        <Button
                           disabled={selected === null}
                           color="sky"
                           onClick={() =>
                              selected !== null &&
                              push(`/dashboard/writer/edit/${selected.id}`)
                           }
                        >
                           Edit Article
                        </Button>
                        <Button
                           disabled={
                              selected === null ||
                              (articles.length === 1 && user.isAdmin) ||
                              selected.underReview ||
                              selected.published
                           }
                           color="secondary"
                        >
                           Delete Article
                        </Button>
                     </div>
                     <div className="flex items-center gap-2">
                        <TextInput
                           icon={<AiOutlineSearch />}
                           placeholder="Search"
                           value={searchQuery}
                           onChange={handleSearch}
                           error={articlesState.length === 0 && hasSearched}
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
                        />
                     </div>
                  </div>
                  <div className="my-4 mb-20 dark:bg-gray-900">
                     {articlesState.length === 0 && (
                        <h1 className="text-center text-4xl font-semibold">
                           No articles...
                        </h1>
                     )}
                     {articlesState.map((article, index) => (
                        <Disclosure
                           as="div"
                           className={`rounded-md border-2 border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800 ${
                              index !== articles.length - 1 && "mb-4"
                           }`}
                           key={article.id}
                        >
                           <div className="flex items-center gap-2">
                              <Disclosure.Button className="cursor-pointer text-lg">
                                 {({ open }) =>
                                    open ? (
                                       <AiOutlineArrowUp title="Less Details" />
                                    ) : (
                                       <AiOutlineArrowDown title="More Details" />
                                    )
                                 }
                              </Disclosure.Button>
                              <Radio
                                 checked={selected === article}
                                 onChange={() => {
                                    selected === article
                                       ? setSelected(null)
                                       : setSelected(article);
                                 }}
                                 className="focus:none"
                              />
                              <div className="flex w-full items-center justify-between">
                                 <h1 className="-ml-2">
                                    {article.title}
                                    {article.writer?.id !== user?.id && (
                                       <span>
                                          {" - by "}
                                          <Link
                                             href={`/profile/${article.writer?.id}`}
                                          >
                                             <a className="hover:underline">
                                                {article.writer?.name}
                                             </a>
                                          </Link>
                                       </span>
                                    )}
                                    {article.published &&
                                       !article.underReview && (
                                          <span className="font-semibold">
                                             {" "}
                                             (published)
                                          </span>
                                       )}{" "}
                                    {" - "}
                                    <Link href={`/article/${article.id}`}>
                                       <a className="font-semibold text-blue-600 duration-150 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-600">
                                          See article
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
                                    <div>
                                       {article.categoryId.map((tag, i) => (
                                          <ArticleBadge tag={tag} key={i} />
                                       ))}
                                    </div>
                                    {article.underReview && (
                                       <div className="flex items-center gap-2">
                                          <ArticleUnderReviewCard />
                                          <h1 className="font-semibold">
                                             Under Review
                                          </h1>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>
                           <Disclosure.Panel className="relative mt-4 flex justify-evenly gap-4 border-t-2 border-blue-500 pt-4">
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
                              <div className="relative w-full max-w-lg">
                                 <h1 className="mb-2 border-b-2 pb-2 text-3xl font-semibold">
                                    Description
                                 </h1>
                                 <p className=" mb-2 text-justify">
                                    {article.description}
                                 </p>
                                 <h1 className="mb-2 border-b-2 pb-2 text-3xl font-semibold">
                                    Extra Details
                                 </h1>
                                 {article.coWriters.length !== 0 && (
                                    <p>
                                       <span className="font-semibold">
                                          Co Writers:
                                       </span>{" "}
                                       {article.coWriters.map(
                                          (writer, index) => (
                                             <Link
                                                href={`/profile/${writer.id}`}
                                             >
                                                <a
                                                   key={index}
                                                   className="font-semibold text-blue-600 duration-150 hover:text-blue-800"
                                                >
                                                   {writer.name}
                                                   {index !==
                                                      article.coWriters.length -
                                                         1 && (
                                                      <span className="text-black">
                                                         ,{" "}
                                                      </span>
                                                   )}
                                                </a>
                                             </Link>
                                          )
                                       )}
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
                                          href={`/profile/${
                                             article.comments![0].user?.id
                                          }`}
                                       >
                                          <a className="text-blue-600 duration-150 hover:text-blue-800">
                                             {article.comments![0].user?.name}
                                          </a>
                                       </Link>
                                       ,{" "}
                                       <Link
                                          href={`/article/${article.id}#comments`}
                                       >
                                          <a className="text-blue-600 duration-150 hover:text-blue-800">
                                             see rest
                                          </a>
                                       </Link>
                                    </>
                                 )}
                                 <div className="absolute bottom-0 mb-0.5 flex w-full items-center gap-2">
                                    <Link
                                       href={`/dashboard/writer/edit/${article.id}`}
                                    >
                                       <a className="w-1/3">
                                          <Button className="w-full">
                                             Edit
                                          </Button>
                                       </a>
                                    </Link>
                                    {user.isAdmin || !article.underReview ? (
                                       <Link
                                          href={`/dashboard/writer/edit/${article.id}?menu=true&visibility=true`}
                                       >
                                          <a className="w-1/3">
                                             <Button
                                                className="w-full"
                                                color="sky"
                                                disabled={
                                                   !user.isAdmin &&
                                                   article.underReview
                                                }
                                             >
                                                Change Visibility
                                             </Button>
                                          </a>
                                       </Link>
                                    ) : (
                                       <Button
                                          className="w-1/3"
                                          color="sky"
                                          disabled={article.underReview}
                                       >
                                          Change Visibility
                                       </Button>
                                    )}

                                    <div className="w-1/3">
                                       <Button
                                          className="w-full"
                                          color="secondary"
                                          disabled={
                                             article.underReview ||
                                             article.published
                                          }
                                       >
                                          Delete
                                       </Button>
                                    </div>
                                 </div>
                              </div>
                           </Disclosure.Panel>
                        </Disclosure>
                     ))}
                  </div>
               </div>
            </div>
         </div>
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

   const totalComments = await prisma.comment.count();
   const totalUpvotes = await prisma.upvote.count();
   const totalDownvotes = await prisma.downvote.count();

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
        })
      : await prisma.article.findMany({
           include: includeParams as any,
           where: { user: session?.user?.id },
           orderBy: {
              createdAt: "desc",
           },
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
