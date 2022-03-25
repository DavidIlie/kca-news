import React, { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { DefaultSeo } from "next-seo";
import { Disclosure, Popover, Transition } from "@headlessui/react";
import { Tooltip } from "@mantine/core";

import { MdArticle, MdPublish } from "react-icons/md";
import {
   AiFillLike,
   AiFillDislike,
   AiOutlineArrowDown,
   AiOutlineArrowUp,
   AiOutlineLike,
   AiOutlineDislike,
} from "react-icons/ai";
import { FaCommentDots } from "react-icons/fa";
import { GrCircleInformation } from "react-icons/gr";

import prisma from "../../lib/prisma";
import { shimmer } from "../../lib/shimmer";
import { Article } from "../../types/Article";
import { Button } from "../../ui/Button";
import StatisticCard from "../../components/StatisticCard";
import { User } from "../../types/User";
import Radio from "../../ui/Radio";
import ArticleBadge from "../../components/ArticleBadge";
import ArticleUnderReviewCard from "../../components/ArticleUnderReviewCard";

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

   return (
      <>
         <DefaultSeo title="Writer Panel" />
         <div className="mb-20 flex min-h-screen flex-grow px-4 pt-10 sm:pt-32">
            <div className="mx-auto">
               <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-2 md:grid-cols-4 lg:grid-cols-5 lg:px-8">
                  <StatisticCard
                     title={`${user.isAdmin ? "Total" : "Your"} Articles`}
                     value={statistics.totalArticles}
                     icon={MdArticle}
                  />
                  <StatisticCard
                     title="Published"
                     value={statistics.publishedArticles}
                     icon={MdPublish}
                  />
                  <StatisticCard
                     title="Comments"
                     value={statistics.totalComments}
                     icon={FaCommentDots}
                  />
                  <StatisticCard
                     title="Total Likes"
                     value={statistics.totalUpvotes}
                     icon={AiFillLike}
                  />
                  <StatisticCard
                     title="Total Dislikes"
                     value={statistics.totalDownvotes}
                     icon={AiFillDislike}
                  />
               </div>
               <div className="container mt-8 max-w-7xl px-2 sm:px-8">
                  <h1 className="mb-4 text-4xl font-semibold">
                     {user.isAdmin ? "Total" : "Your"} Articles
                  </h1>
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
                           selected.underReview
                        }
                        color="secondary"
                     >
                        Delete Article
                     </Button>
                  </div>
                  <div className="mt-4">
                     {articles.map((article, index) => (
                        <Disclosure
                           as="div"
                           className={`rounded-md border-2 border-gray-100 bg-gray-50 px-6 py-4 ${
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
                                    {article.title}{" "}
                                    {article.published &&
                                       !article.underReview && (
                                          <span className="font-semibold">
                                             (published)
                                          </span>
                                       )}{" "}
                                    {" - "}
                                    <Link href={`/article/${article.id}`}>
                                       <a className="font-semibold text-blue-600 duration-150 hover:text-blue-800 hover:underline">
                                          See article
                                       </a>
                                    </Link>
                                 </h1>
                                 <div className="flex items-center gap-2">
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
                              <div className="relative max-w-lg">
                                 <h1 className="mb-2 border-b-2 pb-2 text-3xl font-semibold">
                                    Description
                                 </h1>
                                 <p className="mb-2 text-justify">
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
                                    <div className="w-1/3">
                                       <Button
                                          className="w-full"
                                          color="sky"
                                          disabled={article.underReview}
                                       >
                                          Change Visibility
                                       </Button>
                                    </div>
                                    <div className="w-1/3">
                                       <Button
                                          className="w-full"
                                          color="secondary"
                                          disabled={article.underReview}
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

   if (!session || session?.user?.isAdmin ? false : !session?.user?.isWriter)
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
      upvotes: true,
      downvotes: true,
   };

   const articles = session?.user?.isAdmin
      ? await prisma.article.findMany({
           include: includeParams as any,
           where: { user: session?.user?.id },
        })
      : await prisma.article.findMany({ include: includeParams as any });

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
