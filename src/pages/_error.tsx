import React from "react";
import { DefaultSeo } from "next-seo";
import Link from "next/link";
import { Button } from "@/ui/Button";
import { ErrorProps } from "next/error";

const Error: React.FC<ErrorProps> = ({ statusCode, title }) => {
  return (
    <>
      <DefaultSeo title="Error" />
      <div className="my-24 flex flex-grow items-center justify-center px-4 sm:pt-16 lg:px-0">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-semibold text-red-500 sm:text-6xl">
            {statusCode} Error
          </h1>
          {title && (
            <h3 className="mb-5 text-2xl text-red-500/80 sm:text-3xl">
              {title}
            </h3>
          )}
          <Link href="/">
            <Button className="mx-auto">Go Home</Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Error;
