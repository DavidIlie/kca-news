import React from "react";
import Link from "next/link";
import { AiOutlineInstagram } from "react-icons/ai";
import { Tooltip } from "@mantine/core";

import { Button } from "@/ui/Button";
import { fullLocations, getFormmatedLocation, links } from "@/lib/categories";
import Logo from "@/components/Logo";

const Footer: React.FC = () => {
   return (
      <footer className="border-t-2 borderColor dark:bg-dark-bg">
         <div className="container flex flex-col flex-wrap pt-6 pb-12 mx-auto md:flex-row md:flex-nowrap md:items-center lg:items-start">
            <div className="flex-shrink-0 w-64 mx-auto text-center sm:pl-14 md:mx-0 md:text-left">
               <Link href="/">
                  <a className="flex items-center justify-center font-medium text-gray-900 dark:text-gray-100 md:justify-start">
                     <Logo className="w-[45%]" />
                     <span className="ml-1 text-xl">KCA News</span>
                  </a>
               </Link>
               <p className="mt-1 text-sm text-gray-500 dark:text-gray-200">
                  Share your views on KCA News!
               </p>
               <a
                  href="https://instagram.com/kca_news"
                  target="_blank"
                  rel="noreferrer"
               >
                  <Tooltip label="kca_news on Instagram">
                     <Button className="mt-2">
                        <AiOutlineInstagram className="mr-1 text-xl" />
                        Instagram
                     </Button>
                  </Tooltip>
               </a>
            </div>
            <div className="grid grid-cols-2 mt-10 -mb-10 text-center sm:flex sm:flex-grow sm:flex-wrap md:mt-0 md:text-left">
               {fullLocations.map((location, index) => (
                  <div key={index} className="px-6">
                     <Link href={`/${location}`}>
                        <a className="mb-3 text-base font-medium tracking-widest text-gray-900 duration-150 hover:text-blue-500 dark:text-gray-100 dark:hover:text-blue-500">
                           {getFormmatedLocation(location).toUpperCase()}
                        </a>
                     </Link>
                     <ul className="mb-10 list-none">
                        {links
                           .filter((l) => l.location.includes(location))
                           .map((category, index) => (
                              <li key={index}>
                                 <Link
                                    href={`/${location}?category=${category.id}`}
                                 >
                                    <a className="text-gray-600 duration-150 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-500">
                                       {category.name}
                                    </a>
                                 </Link>
                              </li>
                           ))}
                     </ul>
                  </div>
               ))}
            </div>
         </div>
         <p className="px-5 py-4 mx-auto text-sm text-center text-gray-800 bg-gray-100 border-t-2 borderColor dark:bg-foot dark:text-gray-100 sm:text-left sm:text-base">
            © {new Date().getFullYear()}{" "}
            <a href="https://davidilie.com">David Ilie</a>
         </p>
      </footer>
   );
};

export default Footer;
