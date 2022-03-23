import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";
import { VscChevronLeft, VscChevronRight } from "react-icons/vsc";
import { Slide } from "react-awesome-reveal";
import { formatDistance } from "date-fns";
import { useShortcut } from "litkey";

import prisma from "../lib/prisma";
import { Article } from "../types/Article";
import { shimmer } from "../lib/shimmer";

interface Props {
    featuredPosts: Article[];
}

const Home: React.FC<Props> = ({ featuredPosts }) => {
    const [index, setSelectedIndex] = useState<number>(0);

    useShortcut("left", () => index !== 0 && setSelectedIndex(index - 1));
    useShortcut(
        "right",
        () => index !== featuredPosts.length - 1 && setSelectedIndex(index + 1)
    );

    return (
        <>
            <NextSeo title="Home" />
            <div className="flex min-h-screen flex-grow items-center">
                <div className="-ml-20 mt-20 flex w-full justify-center gap-24">
                    <Slide cascade triggerOnce direction="left">
                        <div className="relative -mr-96 flex items-center gap-4">
                            <button
                                className="cursor-pointer rounded-full bg-gray-100 p-4 duration-150 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 disabled:cursor-not-allowed disabled:text-gray-400 hover:disabled:bg-gray-100"
                                disabled={index === 0}
                                onClick={() => setSelectedIndex(index - 1)}
                                title="Back"
                            >
                                <VscChevronLeft size={30} />
                            </button>
                            <Link href={`/article/${featuredPosts[index].id}`}>
                                <a className="w-[50%]">
                                    <h1 className="absolute top-0 left-0 z-50 ml-[4.9rem] w-[50%] rounded-t-md bg-gray-900 bg-opacity-70 py-2 px-4 text-lg font-medium text-white">
                                        {featuredPosts[index].title} -{" "}
                                        <span className="font-normal italic text-gray-300">
                                            {formatDistance(
                                                new Date(
                                                    featuredPosts[
                                                        index
                                                    ].createdAt
                                                ),
                                                new Date(),
                                                { addSuffix: true }
                                            )}
                                        </span>
                                    </h1>
                                    <div className="h-26 absolute bottom-0 z-50 mb-1.5 w-[50%] rounded-b-md bg-gray-900 bg-opacity-70 py-2 px-4 text-lg text-white">
                                        <h1 className="line-clamp-3">
                                            <span className="text-2xl font-bold">
                                                BREAKING NEWS:
                                            </span>{" "}
                                            {featuredPosts[index].description}
                                        </h1>
                                    </div>
                                    <Image
                                        src={featuredPosts[index].cover}
                                        className="aspect-[3/2] rounded-md object-cover"
                                        placeholder="blur"
                                        blurDataURL={shimmer(1000, 750)}
                                        width={1000}
                                        height={750}
                                    />
                                </a>
                            </Link>
                            <button
                                className="cursor-pointer rounded-full bg-gray-100 p-4 duration-150 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 disabled:cursor-not-allowed disabled:text-gray-400 hover:disabled:bg-gray-100"
                                disabled={index === featuredPosts.length - 1}
                                onClick={() => setSelectedIndex(index + 1)}
                                title="Next"
                            >
                                <VscChevronRight size={30} />
                            </button>
                        </div>
                    </Slide>
                    <Slide cascade triggerOnce direction="down">
                        <div className="mt-6 text-center">
                            <h1 className="text-4xl font-medium">
                                Latest Posts:
                            </h1>
                        </div>
                    </Slide>
                </div>
            </div>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async () => {
    const featuredPosts = await prisma.article.findMany({
        where: { published: true, underReview: false },
        orderBy: {
            createdAt: "desc",
        },
        take: 5,
    });

    return {
        props: {
            featuredPosts: JSON.parse(JSON.stringify(featuredPosts)),
        },
    };
};

export default Home;
