import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { DefaultSeo } from "next-seo";
import { Disclosure, Popover, Transition } from "@headlessui/react";

import { MdArticle, MdPublish } from "react-icons/md";
import {
   AiFillLike,
   AiFillDislike,
   AiOutlineArrowDown,
   AiOutlineArrowUp,
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
                     <Button>Create Article</Button>
                     <Button disabled={selected === null} color="sky">
                        Edit Article
                     </Button>
                     <Button
                        disabled={
                           selected === null ||
                           (articles.length === 1 && user.isAdmin)
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
                           className={`rounded-md border-2 border-gray-200 bg-gray-100 px-6 py-4 ${
                              index !== articles.length - 1 && "mb-4"
                           }`}
                           key={article.id}
                        >
                           <div className="flex items-center gap-4">
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
                                 <div className="flex items-center gap-3">
                                    <h1>
                                       {article.title}{" "}
                                       {article.published &&
                                          !article.underReview && (
                                             <span className="font-semibold">
                                                (published)
                                             </span>
                                          )}{" "}
                                       {" - "}
                                       <Link href={`/article/${article.id}`}>
                                          <a className="font-semibold text-blue-500 duration-150 hover:text-blue-600 hover:underline">
                                             See article
                                          </a>
                                       </Link>
                                    </h1>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <div>
                                       {article.categoryId.map((tag, i) => (
                                          <ArticleBadge tag={tag} key={i} />
                                       ))}
                                    </div>
                                    {article.underReview && (
                                       <div className="flex items-center gap-2">
                                          <h1 className="font-semibold">
                                             Under Review
                                          </h1>
                                          <Popover className="relative">
                                             <Popover.Button
                                                as={GrCircleInformation}
                                                className="mt-0.5"
                                                title="What's this?"
                                             />
                                             <Transition
                                                as={React.Fragment}
                                                enter="transition ease-out duration-200"
                                                enterFrom="opacity-0 translate-y-1"
                                                enterTo="opacity-100 translate-y-0"
                                                leave="transition ease-in duration-150"
                                                leaveFrom="opacity-100 translate-y-0"
                                                leaveTo="opacity-0 translate-y-1"
                                             >
                                                <Popover.Panel className="absolute right-0 z-10 -mr-12 w-96 rounded-md border-2 border-gray-200 bg-white p-4 shadow-md">
                                                   This can be for any number of
                                                   reasons: your article is
                                                   pending to be published, your
                                                   article has been taken down
                                                   for moderation, etc. To see
                                                   more information{" "}
                                                   <a
                                                      href="#"
                                                      target="_blank"
                                                      rel="noreferrer"
                                                      className="text-blue-500 duration-150 hover:text-blue-600"
                                                   >
                                                      click here
                                                   </a>
                                                   .
                                                </Popover.Panel>
                                             </Transition>
                                          </Popover>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>
                           <Disclosure.Panel className="mt-4 flex justify-evenly gap-4 border-t-2 border-blue-500 pt-4">
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
                              <div className="max-w-lg">
                                 <h1 className="mb-2 border-b-2 pb-2 text-3xl font-semibold">
                                    Description
                                 </h1>
                                 <p className="mb-2 text-justify">
                                    {article.description}
                                 </p>
                                 <h1 className="mb-2 border-b-2 pb-2 text-3xl font-semibold">
                                    Extra Details
                                 </h1>
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

   const user = await prisma.user.findFirst({
      where: { id: session?.user?.id },
   });

   if (!user?.isWriter || (!user?.isWriter && !user.isAdmin))
      return {
         redirect: {
            destination: "/",
            permanent: false,
         },
      };

   const totalArticles = user?.isAdmin
      ? await prisma.article.count()
      : await prisma.article.count({
           where: { user: session?.user?.id },
        });

   const publishedArticles = user?.isAdmin
      ? await prisma.article.count({ where: { published: true } })
      : await prisma.article.count({
           where: { published: true, user: session?.user?.id },
        });

   const totalComments = await prisma.comment.count();
   const totalUpvotes = await prisma.upvote.count();
   const totalDownvotes = await prisma.downvote.count();

   const articles = user?.isAdmin
      ? await prisma.article.findMany()
      : await prisma.article.findMany({
           where: { user: session?.user?.id },
        });

   return {
      props: {
         user,
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
