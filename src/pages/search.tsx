import React, { useState } from "react";
import { GetServerSideProps } from "next";
import { DefaultSeo } from "next-seo";
import { useRouter } from "next/router";
import { AiOutlineSearch } from "react-icons/ai";
import toast from "react-hot-toast";

import prisma from "../lib/prisma";
import { Article } from "../types/Article";
import { Spinner } from "../ui/Spinner";
import ArticleCard from "../components/ArticleCard";

interface Props {
    initialResponse: Array<Article>;
}

const Search: React.FC<Props> = ({ initialResponse }) => {
    const { query, push } = useRouter();
    const q = (query as any).q;

    const [previousSearchQuery, setPreviousSearchQuery] = useState(q);
    const [searchQuery, setSearchQuery] = useState(q);
    const [results, setResults] = useState<Array<Article>>(initialResponse);
    const [loading, setLoading] = useState<boolean>(false);

    const doSearch = async () => {
        if (searchQuery === "" || searchQuery === previousSearchQuery) return;

        setLoading(true);

        push(`/search?q=${encodeURIComponent(searchQuery)}`, "", {
            shallow: true,
        });

        const r = await fetch(
            `/api/article/search?q=${encodeURIComponent(searchQuery)}`
        );
        const response = await r.json();

        if (r.status !== 200) {
            toast.error(response.message);
        } else {
            setPreviousSearchQuery(searchQuery);
            setResults(response);
        }

        return setLoading(false);
    };

    return (
        <>
            <DefaultSeo title={previousSearchQuery} />
            <div className="mb-20 flex min-h-screen flex-grow px-4 sm:pt-32 lg:px-0">
                <div className="container mx-auto max-w-5xl">
                    <h1 className="mb-4 text-4xl font-semibold">
                        Search results for: {previousSearchQuery}
                    </h1>
                    <div className="relative mx-auto text-gray-600">
                        <input
                            className="h-10 w-full rounded-lg border-2 border-gray-300 bg-white px-5 pr-16 text-sm focus:outline-none"
                            type="search"
                            name="search"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && doSearch()}
                        />
                        <AiOutlineSearch
                            className={`absolute right-0 top-0 mr-4 mt-[0.75rem] ${
                                searchQuery !== "" && "cursor-pointer"
                            }`}
                            onClick={() => doSearch()}
                        />
                    </div>
                    <div className="mt-4">
                        {loading && (
                            <Spinner className="mx-auto my-12 h-16 w-16" />
                        )}
                        {results.map((article, index) => (
                            <ArticleCard article={article} key={index} />
                        ))}
                        {results.length === 0 && (
                            <h1 className="text-center text-xl font-semibold">
                                No results...
                            </h1>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
    const { q } = query;

    if (!q)
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };

    const initialResponse = await prisma.article.findMany({
        where: {
            published: true,
            title: {
                contains: q as string,
                mode: "insensitive",
            },
        },
        include: {
            user: true,
        },
        orderBy: [
            {
                createdAt: "desc",
            },
        ],
    });

    return {
        props: {
            initialResponse: JSON.parse(JSON.stringify(initialResponse)),
        },
    };
};

export default Search;
