import React, { useState } from "react";
import { GetServerSideProps } from "next";
import { DefaultSeo } from "next-seo";
import { useRouter } from "next/router";
import { AiOutlineSearch } from "react-icons/ai";

import prisma from "../lib/prisma";
import { Article } from "../types/Article";

interface Props {
    initialResponse: Array<Article>;
}

const Search: React.FC<Props> = ({ initialResponse }) => {
    const { query } = useRouter();
    const q = (query as any).q;

    const [searchQuery, setSearchQuery] = useState(q);
    const [results, setResults] = useState<Array<Article>>(initialResponse);

    return (
        <>
            <DefaultSeo title={q} />
            <div className="mb-20 flex min-h-screen flex-grow px-4 sm:pt-32 lg:px-0">
                <div className="container mx-auto max-w-5xl">
                    <h1 className="mb-4 text-4xl font-semibold">
                        Search results for: {q}
                    </h1>
                    <div className="relative mx-auto text-gray-600">
                        <input
                            className="h-10 w-full rounded-lg border-2 border-gray-300 bg-white px-5 pr-16 text-sm focus:outline-none"
                            type="search"
                            name="search"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    console.log("search");
                                }
                            }}
                        />
                        <AiOutlineSearch
                            className={`absolute right-0 top-0 mr-4 mt-[0.75rem] ${
                                searchQuery !== "" && "cursor-pointer"
                            }`}
                            onClick={() => {
                                console.log("search");
                            }}
                        />
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
        where: { published: true, title: q as string },
    });

    return {
        props: {
            initialResponse,
        },
    };
};

export default Search;
