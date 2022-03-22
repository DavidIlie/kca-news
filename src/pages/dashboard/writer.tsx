import React from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { DefaultSeo } from "next-seo";

import { MdArticle, MdPublish } from "react-icons/md";
import { AiFillLike, AiFillDislike } from "react-icons/ai";
import { FaCommentDots } from "react-icons/fa";

import prisma from "../../lib/prisma";
import { Article } from "../../types/Article";
import { Button } from "../../ui/Button";
import StatisticCard from "../../components/StatisticCard";

interface Props {
    statistics: {
        totalArticles: number;
        publishedArticles: number;
        totalComments: number;
        totalUpvotes: number;
        totalDownvotes: number;
    };
    articles: Article[];
}

const WriterPanel: React.FC<Props> = ({ statistics, articles }) => {
    return (
        <>
            <DefaultSeo title="Writer Panel" />
            <div className="mb-20 flex min-h-screen flex-grow px-4 sm:pt-32">
                <div className="mx-auto">
                    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-2 md:grid-cols-4 lg:grid-cols-5 lg:px-8">
                        <StatisticCard
                            title="Total Articles"
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
                            Your Articles
                        </h1>
                        <div className="flex items-center gap-2">
                            <Button>Create Article</Button>
                            <Button disabled color="sky">
                                Update Article
                            </Button>
                            <Button disabled color="secondary">
                                Delete Article
                            </Button>
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

    if (!user?.isWriter || !user?.isAdmin)
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
        ? await prisma.article.count()
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
