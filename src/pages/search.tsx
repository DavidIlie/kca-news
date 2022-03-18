import React from "react";
import { GetServerSideProps } from "next";
import { DefaultSeo } from "next-seo";
import { useRouter } from "next/router";

const Search: React.FC = () => {
    const { query } = useRouter();

    return (
        <>
            <DefaultSeo title={(query as any).q} />
            <div className="mb-20 flex min-h-screen flex-grow px-4 sm:pt-24 lg:px-0"></div>
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

    return {
        props: {},
    };
};

export default Search;
