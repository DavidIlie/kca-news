import React from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { AiOutlineSearch } from "react-icons/ai";

import { Button } from "../../ui/Button";
import { Spinner } from "../../ui/Spinner";
import UserDropdown from "./UserDropdown";

import NewsLink from "./NewsLink";
import {
    entertainmentLinks,
    lifestyleLinks,
    newsLinks,
    sportLinks,
} from "../../lib/categories";

const NavBar: React.FC = () => {
    const { status } = useSession();

    return (
        <nav className="w-full border-b-2 text-gray-600 shadow-md sm:fixed sm:px-12">
            <div className="container mx-auto flex flex-col flex-wrap items-center p-5 md:flex-row">
                <Link href="/">
                    <a className="mb-4 flex items-center font-medium text-gray-900 md:mb-0">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-10 w-10 rounded-full bg-blue-500 p-2 text-white"
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </svg>
                        <span className="ml-3 text-xl">KCA News</span>
                    </a>
                </Link>
                <nav className="flex flex-wrap items-center justify-center gap-4 text-base md:mr-auto md:ml-4 md:border-l md:border-gray-400 md:py-1 md:pl-4">
                    <Link href="/">
                        <a className="cursor-pointer rounded-md border-2 border-gray-200 bg-gray-100 px-2 py-1 duration-150 hover:bg-gray-200 hover:text-gray-900">
                            Home
                        </a>
                    </Link>
                    <NewsLink name="News" categories={newsLinks} />
                    <NewsLink
                        name="Entertainment"
                        categories={entertainmentLinks}
                    />
                    <NewsLink name="Sport" categories={sportLinks} />
                    <NewsLink name="Lifestyle" categories={lifestyleLinks} />
                    <Link href="/our-team">
                        <a className="cursor-pointer rounded-md border-2 border-gray-200 bg-gray-100 px-2 py-1 duration-150 hover:bg-gray-200 hover:text-gray-900">
                            Our Team
                        </a>
                    </Link>
                </nav>
                <div className="mt-4 flex items-center gap-4 sm:mt-0">
                    <div className="relative mx-auto text-gray-600">
                        <input
                            className="h-10 rounded-lg border-2 border-gray-300 bg-white px-5 pr-16 text-sm focus:outline-none"
                            type="search"
                            name="search"
                            placeholder="Search"
                        />
                        <AiOutlineSearch className="absolute right-0 top-0 mr-4 mt-[0.75rem]" />
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
