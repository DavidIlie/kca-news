import React from "react";
import Link from "next/link";

import { links } from "../../lib/categories";

const Footer: React.FC = () => {
   return (
      <footer className="borderColor border-t-2 dark:bg-dark-bg">
         <div className="container mx-auto flex flex-col flex-wrap pb-12 pt-6 md:flex-row md:flex-nowrap md:items-center lg:items-start">
            <div className="mx-auto w-64 flex-shrink-0 text-center sm:pl-14 md:mx-0 md:text-left">
               <a className="flex items-center justify-center font-medium text-gray-900 dark:text-gray-100 md:justify-start">
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
               <p className="mt-2 text-sm text-gray-500 dark:text-gray-200">
                  Make the school cool.
               </p>
            </div>
            <div className="-mb-10 mt-10 grid grid-cols-2 text-center sm:flex sm:flex-grow sm:flex-wrap md:mt-0 md:pl-20 md:text-left">
               <div className="w-full px-4 md:w-1/2 lg:w-1/4">
                  <h2 className="mb-3 text-sm font-medium tracking-widest text-gray-900 dark:text-gray-100">
                     NEWS
                  </h2>
                  <nav className="mb-10 list-none">
                     {links
                        .filter((l) => l.location.includes("news"))
                        .map((news, index) => (
                           <li key={index}>
                              <Link
                                 href={
                                    news.location.length > 1
                                       ? `/${news.id}?filter=news`
                                       : `/${news.location[0]}?category=${news.id}`
                                 }
                              >
                                 <a className="text-gray-600 duration-150 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-500">
                                    {news.name}
                                 </a>
                              </Link>
                           </li>
                        ))}
                  </nav>
               </div>
               <div className="w-full px-4 md:w-1/2 lg:w-1/4">
                  <h2 className="mb-3 text-sm font-medium tracking-widest text-gray-900 dark:text-gray-100">
                     ENTERTAINMENT
                  </h2>
                  <nav className="mb-10 list-none">
                     {links
                        .filter((l) => l.location.includes("entertainment"))
                        .map((news, index) => (
                           <li key={index}>
                              <Link
                                 href={
                                    news.location.length > 1
                                       ? `/${news.id}?filter=entertainment`
                                       : `/${news.location[0]}?category=${news.id}`
                                 }
                              >
                                 <a className="text-gray-600 duration-150 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-500">
                                    {news.name}
                                 </a>
                              </Link>
                           </li>
                        ))}
                  </nav>
               </div>
               <div className="w-full px-4 md:w-1/2 lg:w-1/4">
                  <h2 className="mb-3 text-sm font-medium tracking-widest text-gray-900 dark:text-gray-100">
                     SPORT
                  </h2>
                  <nav className="mb-10 list-none">
                     {links
                        .filter((l) => l.location.includes("sport"))
                        .map((news, index) => (
                           <li key={index}>
                              <Link
                                 href={
                                    news.location.length > 1
                                       ? `/${news.id}?filter=sport`
                                       : `/${news.location[0]}?category=${news.id}`
                                 }
                              >
                                 <a className="text-gray-600 duration-150 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-500">
                                    {news.name}
                                 </a>
                              </Link>
                           </li>
                        ))}
                  </nav>
               </div>
               <div className="w-full px-4 md:w-1/2 lg:w-1/4">
                  <h2 className="mb-3 text-sm font-medium tracking-widest text-gray-900 dark:text-gray-100">
                     LIFESTYLE
                  </h2>
                  <nav className="mb-10 list-none">
                     {links
                        .filter((l) => l.location.includes("lifestyle"))
                        .map((news, index) => (
                           <li key={index}>
                              <Link
                                 href={
                                    news.location.length > 1
                                       ? `/${news.id}?filter=lifestyle`
                                       : `/${news.location[0]}?category=${news.id}`
                                 }
                              >
                                 <a className="text-gray-600 duration-150 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-500">
                                    {news.name}
                                 </a>
                              </Link>
                           </li>
                        ))}
                  </nav>
               </div>
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
