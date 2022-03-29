import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signIn } from "next-auth/react";
import { AiOutlineSearch } from "react-icons/ai";

import { Button } from "../../ui/Button";
import { Spinner } from "../../ui/Spinner";
import UserDropdown from "./UserDropdown";

import NewsLink from "./NewsLink";
import { links } from "../../lib/categories";

const NavBar: React.FC = () => {
   const { status } = useSession();

   const [searchQuery, setSearchQuery] = useState("");
   const { push, asPath } = useRouter();

   return (
      <nav className="z-[100] w-full border-b-2 border-gray-300 bg-white text-gray-600 dark:border-blue-900 dark:bg-gray-900 dark:text-gray-100 sm:fixed 2xl:px-12">
         <div className="container mx-auto flex flex-col flex-wrap items-center p-5 md:flex-row">
            <Link href="/">
               <a className="mb-4 flex items-center font-medium text-gray-900 dark:text-gray-100 md:mb-0">
                  <svg
                     xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     stroke="currentColor"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth="2"
                     className="h-10 w-10 rounded-full bg-blue-500 p-2 text-white dark:text-black"
                     viewBox="0 0 24 24"
                  >
                     <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                  </svg>
                  <span className="ml-3 text-xl">KCA News</span>
               </a>
            </Link>
            <nav className="flex w-full flex-nowrap items-center justify-center gap-4 pb-2 text-base sm:w-auto sm:pb-0 md:mr-auto md:ml-4 md:border-l md:border-gray-400 md:py-1 md:pl-4 dark:md:border-gray-900">
               <Link href="/">
                  <a className="cursor-pointer rounded-md border-2 border-gray-200 bg-gray-100 px-2 py-1 duration-150 hover:bg-gray-200 hover:text-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-900">
                     Home
                  </a>
               </Link>
               <NewsLink
                  name="News"
                  categories={links.filter((s) => s.location.includes("news"))}
               />
               <NewsLink
                  name="Entertainment"
                  categories={links.filter((s) =>
                     s.location.includes("entertainment")
                  )}
               />
               <NewsLink
                  name="Sport"
                  categories={links.filter((s) => s.location.includes("sport"))}
               />
               <NewsLink
                  name="Lifestyle"
                  categories={links.filter((s) =>
                     s.location.includes("lifestyle")
                  )}
               />
               <Link href="/about">
                  <a className="cursor-pointer rounded-md border-2 border-gray-200 bg-gray-100 px-2 py-1 duration-150 hover:bg-gray-200 hover:text-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-900">
                     About
                  </a>
               </Link>
            </nav>
            <div className="mx-auto mt-4 flex items-center gap-4 xl:mt-0">
               <div className="relative mx-auto text-gray-600">
                  <input
                     className="h-10 rounded-lg border-2 border-gray-300 bg-white px-5 pr-16 text-sm text-gray-900 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                     type="search"
                     name="search"
                     placeholder="Search"
                     onChange={(e) => setSearchQuery(e.target.value)}
                     value={searchQuery}
                     onKeyDown={(e) => {
                        if (e.key === "Enter" && searchQuery !== "") {
                           push(`/search?q=${encodeURIComponent(searchQuery)}`);
                           if (asPath.includes("search"))
                              window.location.reload();
                           setSearchQuery("");
                        }
                     }}
                  />
                  <AiOutlineSearch
                     className={`absolute right-0 top-0 mr-4 mt-[0.75rem] ${
                        searchQuery !== "" && "cursor-pointer"
                     }`}
                     onClick={() => {
                        if (searchQuery !== "") {
                           push(`/search?q=${encodeURIComponent(searchQuery)}`);
                           if (asPath.includes("search"))
                              window.location.reload();
                           setSearchQuery("");
                        }
                     }}
                  />
               </div>
               {status === "loading" ? (
                  <Spinner size="6" />
               ) : status === "unauthenticated" ? (
                  <Button onClick={() => signIn("google")}>Login</Button>
               ) : (
                  <UserDropdown />
               )}
            </div>
         </div>
      </nav>
   );
};

export default NavBar;
