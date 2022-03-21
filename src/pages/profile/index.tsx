import React from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { DefaultSeo } from "next-seo";

const PersonalProfileViewer: React.FC = () => {
    return (
        <>
            <DefaultSeo title="Profile" />
            <div className="mb-20 flex min-h-screen flex-grow px-4 sm:pt-24 lg:px-0"></div>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async ({req}) => {
    const session = await getSession({req});

    if (!session) return {
        redirect: {
            destination: "/api/auth/signin",
            permanent: false
        }
    }
    return {
        props: {

        }
    }
}

export default PersonalProfileViewer;