import React from "react";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";
import { format, parseISO } from "date-fns";
import Image from "next/image";

import {
    AiOutlineLike,
    AiOutlineDislike,
    AiFillLike,
    AiFillDislike,
} from "react-icons/ai";

import prisma from "../../lib/prisma";
import type { Article } from "../../types/Article";
import type { User } from "../../types/User";
import { shimmer } from "../../lib/shimmer";

import { Button } from "../../ui/Button";
import ArticleBadge from "../../components/ArticleBadge";

interface Props {
    article: Article;
    writer: User;
    notFound?: boolean;
}

const ArticleViewer: React.FC<Props> = ({ article, writer, notFound }) => {
    if (notFound) {
        return (
            <div className="flex min-h-screen flex-grow items-center justify-center">
                <div>
                    <h1 className="mb-4 text-6xl font-bold text-red-500">
                        404 not found.
                    </h1>
                    <Link href="/">
                        <a>
                            <Button className="mx-auto">Go Home</Button>
                        </a>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <NextSeo title={article.title} />
            <div className="mb-20 flex flex-grow px-4 sm:pt-24 lg:px-0">
                <div className="container mx-auto mt-10 max-w-4xl">
                    <div className="mb-4 flex w-full flex-wrap justify-start px-3">
                        {article.categoryId.map((category, index) => (
                            <ArticleBadge
                                tag={category.toUpperCase()}
                                key={index}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between border-b-2 pb-2">
                        <h1 className="px-4 text-4xl font-semibold md:text-4xl">
                            {article.title}
                        </h1>
                        <div className="grid grid-cols-2 divide-x-2 divide-gray-500">
                            <div className="mr-4 flex items-center justify-center gap-1">
                                <AiOutlineLike
                                    size="40"
                                    className="cursor-pointer duration-150 hover:text-blue-500"
                                />
                                <p className="font-medium">0</p>
                            </div>
                            <div className="flex items-center justify-center gap-1 pl-4">
                                <AiOutlineDislike
                                    size="40"
                                    className="cursor-pointer duration-150 hover:text-red-500"
                                />
                                <p className="font-medium">0</p>
                            </div>
                        </div>
                    </div>
                    <div className="ml-4 mt-1 flex items-center">
                        <span className="inline-flex items-center justify-center rounded-md py-2 text-xs font-medium leading-none">
                            <Image
                                className="rounded-full"
                                src={writer.image}
                                width="25px"
                                height="25px"
                                blurDataURL={shimmer(1920, 1080)}
                                alt={`${
                                    writer.name.split(" ")[0]
                                }'s profile image`}
                            />
                            <span className="ml-1 mr-1 text-lg">
                                {writer.name}
                            </span>
                        </span>
                        <h1 className="text-gray-800">
                            {" / "}
                            {format(
                                parseISO(
                                    new Date(article.createdAt).toISOString()
                                ),
                                "MMMM dd, yyyy"
                            )}
                        </h1>
                    </div>
                    <div className="mt-6 mb-12 flex justify-center">
                        <Image
                            alt="Post picture"
                            className="rounded-xl shadow-xl"
                            src={article.cover}
                            width={1280 / 2}
                            height={720 / 2}
                            blurDataURL={shimmer(1920, 1080)}
                            placeholder="blur"
                        />
                    </div>
                    <p className="mb-10 w-full max-w-5xl px-2 text-justify text-lg">
                        {article.description}
                    </p>
                    <object
                        data={article.pdf}
                        type={article.pdf}
                        style={{
                            height: "80vh",
                            width: "96%",
                            margin: "0 auto",
                        }}
                    >
                        <embed
                            src={article.pdf}
                            style={{ height: "80vh", width: "100%" }}
                            type="application/pdf"
                        />
                    </object>
                    <div className="mt-4 ml-4">
                        <h1 className="text-4xl font-semibold">
                            What do you think?
                        </h1>
                    </div>
                </div>
            </div>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
    const { id } = query;

    const article = await prisma.article.findFirst({
        where: { id: id as string, published: true },
    });

    if (!article)
        return {
            props: {
                notFound: true,
            },
        };

    const user = await prisma.account.findFirst({
        where: { id: article.writer },
    });

    if (!user)
        return {
            props: {
                notFound: true,
            },
        };

    const writer = await prisma.user.findFirst({ where: { id: user?.userId } });

    return {
        props: {
            article: JSON.parse(JSON.stringify(article)),
            writer: JSON.parse(JSON.stringify(writer)),
        },
    };
};

export default ArticleViewer;
