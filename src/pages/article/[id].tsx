import React, { useState } from "react";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";
import { format, parseISO } from "date-fns";
import Image from "next/image";
import { useSession, signIn, getSession } from "next-auth/react";
import { Slide } from "react-awesome-reveal";
import toast from "react-hot-toast";

import {
    AiOutlineLike,
    AiOutlineDislike,
    AiFillLike,
    AiFillDislike,
} from "react-icons/ai";

import prisma from "../../lib/prisma";
import type { Article } from "../../types/Article";
import type { User } from "../../types/User";
import type { Comment } from "../../types/Comment";
import { shimmer } from "../../lib/shimmer";

import { Button } from "../../ui/Button";
import ArticleBadge from "../../components/ArticleBadge";

interface Props {
    article: Article;
    writer: User;
    notFound?: boolean;
    upvotes: {
        count: number;
        self: boolean;
    };
    downvotes: {
        count: number;
        self: boolean;
    };
    comments: Array<Comment>;
}

const ArticleViewer: React.FC<Props> = ({
    article,
    writer,
    notFound,
    upvotes,
    downvotes,
    comments,
}) => {
    if (notFound) {
        return (
            <div className="flex min-h-screen flex-grow items-center justify-center">
                <Slide triggerOnce direction="down">
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
                </Slide>
            </div>
        );
    }

    const { data } = useSession();

    const [upvoteCount, setUpvoteCount] = useState<number>(upvotes.count);
    const [selfUpvote, setSelfUpvote] = useState<boolean>(upvotes.self);

    const [downvoteCount, setDownvoteCount] = useState<number>(downvotes.count);
    const [selfDownvote, setSelfDownvote] = useState<boolean>(downvotes.self);

    const [commentsState, setComments] = useState<Array<Comment>>(comments);

    const handleOpinion = async (s: "upvote" | "downvote") => {
        if (!data?.user) return signIn("google");
        const upvotePromise = new Promise<string>(async (resolve, reject) => {
            const r = await fetch(`/api/article/${article.id}/${s}`, {
                credentials: "include",
            });
            if (r.status === 200) {
                if (s === "upvote") {
                    if (selfDownvote) {
                        setSelfDownvote(false);
                        setDownvoteCount(downvoteCount - 1);
                    }
                    if (selfUpvote) {
                        setSelfUpvote(false);
                        setUpvoteCount(upvoteCount - 1);
                    } else {
                        setSelfUpvote(true);
                        setUpvoteCount(upvoteCount + 1);
                    }
                } else {
                    if (selfUpvote) {
                        setSelfUpvote(false);
                        setUpvoteCount(upvoteCount - 1);
                    }
                    if (selfDownvote) {
                        setSelfDownvote(false);
                        setDownvoteCount(downvoteCount - 1);
                    } else {
                        setSelfDownvote(true);
                        setDownvoteCount(downvoteCount + 1);
                    }
                }
                resolve("");
            } else {
                reject("");
            }
        });

        return toast.promise(
            upvotePromise,
            {
                loading: "Loading",
                success: "Updated sucessfully!",
                error: "Error when fetching!",
            },
            { id: "updateOpinion" }
        );
    };

    return (
        <>
            <NextSeo title={article.title} />
            <div className="mb-20 flex flex-grow px-4 sm:pt-24 lg:px-0">
                <Slide
                    triggerOnce
                    className="mx-auto"
                    direction="up"
                    duration={500}
                >
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
                                    {selfUpvote ? (
                                        <AiFillLike
                                            size="30"
                                            className="cursor-pointer text-blue-500 duration-150 hover:text-blue-500"
                                            onClick={() =>
                                                handleOpinion("upvote")
                                            }
                                        />
                                    ) : (
                                        <AiOutlineLike
                                            size="30"
                                            className="cursor-pointer duration-150 hover:text-blue-500"
                                            onClick={() =>
                                                handleOpinion("upvote")
                                            }
                                        />
                                    )}
                                    <p className="font-medium">{upvoteCount}</p>
                                </div>
                                <div className="flex items-center justify-center gap-1 pl-4">
                                    {selfDownvote ? (
                                        <AiFillDislike
                                            size="30"
                                            className="cursor-pointer text-red-500 duration-150 hover:text-red-500"
                                            onClick={() =>
                                                handleOpinion("downvote")
                                            }
                                        />
                                    ) : (
                                        <AiOutlineDislike
                                            size="30"
                                            className="cursor-pointer duration-150 hover:text-red-500"
                                            onClick={() =>
                                                handleOpinion("downvote")
                                            }
                                        />
                                    )}
                                    <p className="font-medium">
                                        {downvoteCount}
                                    </p>
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
                                        new Date(
                                            article.createdAt
                                        ).toISOString()
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
                        <div className="mt-6 ml-4 border-t-2 pt-4">
                            <h1 className="text-4xl font-semibold">
                                What do you think?
                            </h1>
                            <div className="my-4 w-full rounded border border-gray-200 bg-gray-50 p-6">
                                <h5 className="text-lg font-bold text-gray-900 md:text-xl">
                                    Leave a comment
                                </h5>
                                <p className="my-1 text-gray-800">
                                    Share your opinion regarding this article
                                    for other students/teachers to see.
                                </p>
                                {!data ? (
                                    <>
                                        <a
                                            className="my-4 flex h-8 w-28 cursor-pointer items-center justify-center rounded bg-gray-200 font-bold text-gray-900 duration-150 hover:bg-gray-300"
                                            onClick={() => signIn("google")}
                                        >
                                            Login
                                        </a>
                                        <p className="text-sm text-gray-800">
                                            Your information is only used to
                                            display your name and reply by
                                            email.
                                        </p>
                                    </>
                                ) : (
                                    <div className="mt-2">
                                        <input
                                            aria-label="Your comment"
                                            placeholder="Your comment..."
                                            required
                                            className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-gray-100 py-2 pl-4 pr-32 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                        <Button
                                            className="mt-2 w-full"
                                            type="submit"
                                        >
                                            Comment
                                        </Button>
                                    </div>
                                )}
                            </div>
                            {commentsState.map((comment, index) => (
                                <div
                                    className="flex gap-4 rounded-md border border-gray-200 bg-gray-50 py-4 px-4"
                                    key={index}
                                >
                                    <Image
                                        src={
                                            comment.user?.image || "/no-pfp.jpg"
                                        }
                                        width={55}
                                        height={24}
                                        blurDataURL={shimmer(10, 10)}
                                        placeholder="blur"
                                        className="rounded-full object-cover shadow-lg"
                                        alt={`${
                                            comment.user?.name.split(" ")[0]
                                        }'s profile image`}
                                    />
                                    <div className="flex flex-col space-y-2 ">
                                        <div className="w-full">
                                            {comment.comment}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <p className="text-sm text-gray-500">
                                                {comment.user?.name}
                                            </p>
                                            <span className=" text-gray-800">
                                                /
                                            </span>
                                            <p className="text-sm text-gray-400">
                                                {format(
                                                    new Date(comment.createdAt),
                                                    "d MMM yyyy 'at' h:mm bb"
                                                )}
                                            </p>
                                            {data?.user &&
                                                comment.userId ===
                                                    data.user?.id && (
                                                    <>
                                                        <span className="text-gray-200">
                                                            /
                                                        </span>
                                                        <button className="text-sm text-red-600">
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Slide>
            </div>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async ({
    query,
    req,
}) => {
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

    const session = await getSession({ req });

    const writer = await prisma.user.findFirst({
        where: { id: article?.writer },
    });
    const user = await prisma.user.findFirst({
        where: { email: session?.user?.email },
    });

    const upvotes = await prisma.upvote.count({
        where: { articleId: article.id },
    });
    const upvoteUser = await prisma.upvote.findFirst({
        where: { articleId: article.id, votedBy: user?.id },
    });

    const downvotes = await prisma.downvote.count({
        where: { articleId: article.id },
    });
    const downvoteUser = await prisma.downvote.findFirst({
        where: { articleId: article.id, votedBy: user?.id },
    });

    const comments = await prisma.comment.findMany({
        where: { articleId: article.id },
        include: {
            user: true,
        },
    });

    return {
        props: {
            article: JSON.parse(JSON.stringify(article)),
            writer: JSON.parse(JSON.stringify(writer)),
            upvotes: {
                count: upvotes,
                self: upvoteUser !== null,
            },
            downvotes: {
                count: downvotes,
                self: downvoteUser !== null,
            },
            comments: JSON.parse(JSON.stringify(comments)),
        },
    };
};

export default ArticleViewer;
