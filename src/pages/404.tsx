import React from "react";
import { DefaultSeo } from "next-seo";
import Link from "next/link";

import { Button } from "../ui/Button";

const NotFoundPage: React.FC = () => {
   return (
      <>
         <DefaultSeo title="Not Found" />
         <div className="my-24 flex flex-grow items-center justify-center px-4 py-24 sm:pt-48 lg:px-0">
            <div className="text-center">
               <h1 className="mb-4 text-4xl font-semibold text-red-500 sm:text-6xl">
                  Not Found
               </h1>
               <Link href="/">
                  <Button className="mx-auto">Go Home</Button>
               </Link>
            </div>
         </div>
      </>
   );
};

export default NotFoundPage;
