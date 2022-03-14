import React from "react";
import { useSession } from "next-auth/react";

import { Button } from "../../ui/Button";
import { Spinner } from "../../ui/Spinner";
import UserDropdown from "./UserDropdown";

const NavBar: React.FC = () => {
    const { status } = useSession();

    return (
        <header className="body-font border-b-2 text-gray-600 sm:px-8">
            <div className="container mx-auto flex flex-col flex-wrap items-center p-5 md:flex-row">
                <a className="title-font mb-4 flex items-center font-medium text-gray-900 md:mb-0">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-10 w-10 rounded-full bg-indigo-500 p-2 text-white"
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                    </svg>
                    <span className="ml-3 text-xl">KCA News</span>
                </a>
                <nav className="flex flex-wrap items-center justify-center text-base md:mr-auto	md:ml-4 md:border-l md:border-gray-400 md:py-1 md:pl-4">
                    <a className="mr-5 cursor-pointer hover:text-gray-900">
                        Home
                    </a>
                    <a className="mr-5 cursor-pointer hover:text-gray-900">
                        News
                    </a>
                    <a className="mr-5 cursor-pointer hover:text-gray-900">
                        Entertainment
                    </a>
                    <a className="mr-5 cursor-pointer hover:text-gray-900">
                        Lifestyle
                    </a>
                    <a className="mr-5 cursor-pointer hover:text-gray-900">
                        Our Team
                    </a>
                </nav>
                <div className="mt-4 flex items-center gap-4 sm:mt-0">
                    <div className="relative mx-auto text-gray-600">
                        <input
                            className="h-10 rounded-lg border-2 border-gray-300 bg-white px-5 pr-16 text-sm focus:outline-none"
                            type="search"
                            name="search"
                            placeholder="Search"
                        />
                        <button
                            type="submit"
                            className="absolute right-0 top-0 mr-4 mt-[0.75rem]"
                        >
                            <svg
                                className="h-4 w-4 fill-current text-gray-600"
                                xmlns="http://www.w3.org/2000/svg"
                                version="1.1"
                                id="Capa_1"
                                x="0px"
                                y="0px"
                                viewBox="0 0 56.966 56.966"
                                width="512px"
                                height="512px"
                            >
                                <path d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z" />
                            </svg>
                        </button>
                    </div>
                    {status === "loading" ? (
                        <Spinner />
                    ) : status === "unauthenticated" ? (
                        <Button>Login</Button>
                    ) : (
                        <UserDropdown />
                    )}
                </div>
            </div>
        </header>
    );
};

export default NavBar;
