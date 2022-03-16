import React from "react";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";

import prisma from "../../lib/prisma";
import type { Article } from "../../types/Article";
import { Button } from "../../ui/Button";

interface Props {
    article: Article;
    notFound?: boolean;
}

const ArticleViewer: React.FC<Props> = ({ article, notFound }) => {
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
                <div className="container mx-auto mt-10 max-w-7xl"></div>
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

    return {
        props: {
            article: JSON.parse(JSON.stringify(article)),
        },
    };
};

export default ArticleViewer;
