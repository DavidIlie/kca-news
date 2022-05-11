import React from "react";
import Link from "next/link";
import { AiOutlineInstagram } from "react-icons/ai";

import { Button } from "../../ui/Button";
import {
   fullLocations,
   getFormmatedLocation,
   links,
} from "../../lib/categories";
import Logo from "../Logo";

const Footer: React.FC = () => {
   return (
      <footer className="borderColor border-t-2 dark:bg-dark-bg">
         <div className="container mx-auto flex flex-col flex-wrap pb-12 pt-6 md:flex-row md:flex-nowrap md:items-center lg:items-start">
            <div className="mx-auto w-64 flex-shrink-0 text-center sm:pl-14 md:mx-0 md:text-left">
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
                  <Button className="mt-2">
                     <AiOutlineInstagram className="mr-1 text-xl" />
                     Instagram
                  </Button>
               </a>
            </div>
            <div className="-mb-10 mt-10 grid grid-cols-2 text-center sm:flex sm:flex-grow sm:flex-wrap md:mt-0 md:text-left">
               {fullLocations.map((location, index) => (
                  <div key={index} className="px-8">
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
         <p className="borderColor mx-auto border-t-2 bg-gray-100 py-4 px-5 text-center text-sm text-gray-800 dark:bg-foot dark:text-gray-100 sm:text-left sm:text-base">
            © {new Date().getFullYear()}{" "}
            <a href="https://davidilie.com" target="_blank" rel="noreferrer">
               David Ilie
            </a>
         </p>
      </footer>
   );
};

export default Footer;
