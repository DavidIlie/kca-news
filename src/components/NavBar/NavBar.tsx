import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signIn } from "next-auth/react";
import { AiOutlineSearch, AiOutlineArrowLeft } from "react-icons/ai";
import { Menu } from "@headlessui/react";

import { Button } from "../../ui/Button";
import { Spinner } from "../../ui/Spinner";
import UserDropdown from "./UserDropdown";

import NewsLink from "./NewsLink";
import {
   getFormmatedLocation,
   links,
   Locations,
   visibleLocations,
   moreLocations,
} from "../../lib/categories";
import NewsDropdown from "./NewsDropdown";
import DropdownElement from "../../ui/DropdownElement";
import NextLink from "../../ui/NextLink";
import Logo from "../Logo";

const NavBar: React.FC = () => {
   const { status } = useSession();

   const [openMoreMenu, setOpenMoreMenu] = useState<Locations | null>(null);
   const [searchQuery, setSearchQuery] = useState("");
   const { push, asPath } = useRouter();

   return (
      <nav className="borderColor z-[100] w-full border-b-2 bg-emerald-600 text-gray-600 dark:bg-dark-bg dark:text-gray-100 sm:fixed 2xl:px-12">
         <div className="container mx-auto flex flex-col flex-wrap items-center p-5 lg:flex-row">
            <Link href="/">
               <a className="mb-4 flex items-center font-medium text-gray-900 dark:text-gray-100 md:mb-0">
                  <div className="max-w-[4rem]">
                     <Logo />
                  </div>
                  <span className="ml-3 text-xl text-white">KCA News</span>
               </a>
            </Link>
            <div className="mb-3 flex gap-2 sm:hidden">
               <Link href="/">
                  <a className="cursor-pointer rounded-md border-2 border-blue-500 bg-blue-500 px-2 py-1 text-white duration-150 hover:border-blue-600 hover:bg-blue-600 dark:border-gray-800 dark:bg-foot dark:hover:bg-dark-bg">
                     Home
                  </a>
               </Link>
               <Link href="/about">
                  <a className="cursor-pointer rounded-md border-2 border-blue-500 bg-blue-500 px-2 py-1 text-white duration-150 hover:border-blue-600 hover:bg-blue-600 dark:border-gray-800 dark:bg-foot dark:hover:bg-dark-bg">
                     About
                  </a>
               </Link>
            </div>
            <nav className="flex w-full flex-nowrap items-center justify-center gap-1 pb-2 text-base sm:w-auto sm:gap-4 sm:pb-0 md:mr-auto md:ml-4 md:border-l md:border-gray-400 md:py-1 md:pl-4 dark:md:border-gray-900">
               <Link href="/">
                  <a className="hidden cursor-pointer rounded-md border-2 border-blue-500 bg-blue-500 px-2 py-1 text-white duration-150 hover:border-blue-600 hover:bg-blue-600 dark:border-gray-800 dark:bg-foot dark:hover:bg-dark-bg sm:block">
                     Home
                  </a>
               </Link>
               <Link href="/about">
                  <a className="hidden cursor-pointer rounded-md border-2 border-blue-500 bg-blue-500 px-2 py-1 text-white duration-150 hover:border-blue-600 hover:bg-blue-600 dark:border-gray-800 dark:bg-foot dark:hover:bg-dark-bg sm:block">
                     About
                  </a>
               </Link>
               {visibleLocations.map((location, index) => (
                  <NewsDropdown
                     name={getFormmatedLocation(location)}
                     key={index}
                  >
                     <Menu.Item as={NextLink} href={`/${location}`}>
                        <DropdownElement>Main Home</DropdownElement>
                     </Menu.Item>
                     {links
                        .filter((l) => l.location.includes(location))
                        .map((category, index) => (
                           <NewsLink
                              category={category}
                              location={location}
                              key={index}
                           />
                        ))}
                  </NewsDropdown>
               ))}
               <NewsDropdown name="More" special={openMoreMenu !== null}>
                  {openMoreMenu ? (
                     <>
                        <div className="flex items-center gap-2 bg-gray-100 px-2 py-2 dark:bg-dark-bg">
                           <AiOutlineArrowLeft
                              onClick={() => setOpenMoreMenu(null)}
                              className="cursor-pointer"
                           />
                           <p className="mx-auto text-black dark:text-white">
                              {getFormmatedLocation(openMoreMenu)}
                           </p>
                        </div>
                        <Menu.Item as={NextLink} href={`/${openMoreMenu}`}>
                           <DropdownElement>Main Home</DropdownElement>
                        </Menu.Item>
                        {links
                           .filter((l) => l.location.includes(openMoreMenu))
                           .map((category, index) => (
                              <NewsLink
                                 category={category}
                                 location={openMoreMenu}
                                 key={index}
                              />
                           ))}
                     </>
                  ) : (
                     moreLocations.map((location, index) => (
                        <DropdownElement
                           key={index}
                           opening
                           openingFunction={() => setOpenMoreMenu(location)}
                        >
                           {getFormmatedLocation(location)}
                        </DropdownElement>
                     ))
                  )}
               </NewsDropdown>
            </nav>
            <div className="mx-auto mt-1 flex w-full items-center gap-4 sm:w-auto xl:mt-0">
               <div className="relative mx-auto text-gray-600">
                  <input
                     className="h-10 rounded-lg border-2 border-green-700 bg-green-700 bg-opacity-50 px-5 pr-16 text-sm text-white placeholder:text-white focus:outline-none dark:border-gray-800 dark:bg-foot dark:text-gray-100 sm:ml-0"
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
                     className={`absolute right-0 top-0 mr-4 mt-[0.75rem] text-white ${
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
               {status === "unauthenticated" ? (
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
