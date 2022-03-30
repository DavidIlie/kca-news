import React from "react";
import { NextSeo } from "next-seo";
import { v4 } from "uuid";

import { Button } from "../../ui/Button";

interface ErrorPageProps {
   statusCode?: number;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ statusCode = 500 }) => {
   return (
      <>
         <NextSeo title="Crashed" />
         <div className="mx-auto mt-10 flex w-full flex-grow items-center justify-center text-center">
            <div className="flex-col">
               <div className="text-4xl font-semibold">
                  Well, this is awkward.
               </div>
               <div className="mt-1 font-semibold text-gray-600 dark:text-gray-300">
                  <h1>Looks like an error just occurred.</h1>
               </div>
               <div className="mt-2 flex justify-center text-gray-800">
                  <Button onClick={() => window.location.reload()}>
                     Reload
                  </Button>
               </div>
               <p className="mt-2 text-sm italic">
                  Error {statusCode}, ID: {v4()}
               </p>
            </div>
         </div>
      </>
   );
};

export default ErrorPage;
