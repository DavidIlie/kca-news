import React from "react";
import { DefaultSeo } from "next-seo";
import Link from "next/link";

import { Button } from "../ui/Button";

const NotFoundPage: React.FC = () => {
    return (
        <>
            <DefaultSeo title="Not Found" />
            <div className="mb-20 flex min-h-screen flex-grow items-center justify-center px-4">
                <div className="text-center">
                    <h1 className="mb-2 text-4xl font-semibold">Not Found</h1>
                    <Link href="/">
                        <Button className="mx-auto">Go Home</Button>
                    </Link>
                </div>
            </div>
        </>
    );
};

export default NotFoundPage;
