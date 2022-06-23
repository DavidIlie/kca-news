import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signIn } from "next-auth/react";
import { AiOutlineSearch, AiOutlineArrowLeft } from "react-icons/ai";
import { Menu } from "@headlessui/react";

import { Button } from "../../ui/Button";
import UserDropdown from "./UserDropdown";
import NewsDropdown from "./NewsDropdown";
import DropdownElement from "../../ui/DropdownElement";
import NextLink from "../../ui/NextLink";
import Logo from "../Logo";

import NewsLink from "./NewsLink";
import {
   getFormmatedLocation,
   links,
   Locations,
   visibleLocations,
   moreLocations,
} from "../../lib/categories";
import { Spinner } from "@/ui/Spinner";

const NavBar: React.FC = () => {
   const { status } = useSession();

   const [openMoreMenu, setOpenMoreMenu] = useState<Locations | null>(null);
   const [searchQuery, setSearchQuery] = useState("");
   const { push, asPath } = useRouter();

   return (
      <nav className="borderColor z-[100] w-full border-b-2 bg-emerald-600 text-gray-600 dark:bg-dark-bg dark:text-gray-100 sm:fixed 2xl:px-12">
         <div
            className={`container mx-auto mt-4 flex flex-col flex-wrap items-center ${
               status === "unauthenticated" ? "p-4" : "p-2"
            } sm:mt-0 lg:flex-row`}
         >
            <Link href="/">
               <a className="flex items-center mb-4 font-medium text-gray-900 dark:text-gray-100 md:mb-0">
                  <div className="-mt-3 h-12 max-w-[4rem]">
                     <Logo />
                  </div>
                  <span className="ml-3 text-xl text-white">KCA News</span>
               </a>
            </Link>
            <div className="flex gap-2 mb-3 sm:hidden">
               <Link href="/">
                  <a className="px-2 py-1 text-white duration-150 bg-blue-500 border-2 border-blue-500 rounded-md cursor-pointer hover:border-blue-600 hover:bg-blue-600 dark:border-gray-800 dark:bg-foot dark:hover:bg-dark-bg">
                     Home
                  </a>
               </Link>
               <Link href="/about">
                  <a className="px-2 py-1 text-white duration-150 bg-blue-500 border-2 border-blue-500 rounded-md cursor-pointer hover:border-blue-600 hover:bg-blue-600 dark:border-gray-800 dark:bg-foot dark:hover:bg-dark-bg">
                     About
                  </a>
               </Link>
            </div>
            <nav className="flex items-center justify-center w-full gap-1 pb-2 text-base flex-nowrap sm:w-auto sm:gap-4 sm:pb-0 md:mr-auto md:ml-4 md:border-l md:border-gray-400 md:py-1 md:pl-4 dark:md:border-gray-900">
               <Link href="/">
                  <a className="hidden px-2 py-1 text-white duration-150 bg-blue-500 border-2 border-blue-500 rounded-md cursor-pointer hover:border-blue-600 hover:bg-blue-600 dark:border-gray-800 dark:bg-foot dark:hover:bg-dark-bg sm:block">
                     Home
                  </a>
               </Link>
               <Link href="/about">
                  <a className="hidden px-2 py-1 text-white duration-150 bg-blue-500 border-2 border-blue-500 rounded-md cursor-pointer hover:border-blue-600 hover:bg-blue-600 dark:border-gray-800 dark:bg-foot dark:hover:bg-dark-bg sm:block">
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
                        <div className="flex items-center gap-2 px-2 py-2 bg-gray-100 dark:bg-dark-bg">
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
            <div className="flex items-center w-auto gap-4 mx-auto">
               <div className="relative mx-auto text-gray-600">
                  <input
                     className="h-10 px-5 pr-16 text-sm text-white bg-green-700 bg-opacity-50 border-2 border-green-700 rounded-lg placeholder:text-white focus:outline-none dark:border-gray-800 dark:bg-foot dark:text-gray-100 sm:ml-0"
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
               {status === "loading" ? (
                  <div className="my-[1.12rem]">
                     <Spinner size="6" className="text-blue-500" />
                  </div>
               ) : status === "unauthenticated" ? (
                  <Button
                     onClick={() => signIn("google")}
                     className="my-[0.55rem]"
                  >
                     Login
                  </Button>
               ) : (
                  status === "authenticated" && (
                     <div className="mt-1">
                        <UserDropdown />
                     </div>
                  )
               )}
            </div>
         </div>
      </nav>
   );
};

export default NavBar;
