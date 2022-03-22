import React from "react";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { BiUserCircle } from "react-icons/bi";
import { BsFillPenFill } from "react-icons/bs";
import { MdPreview } from "react-icons/md";
import { GrUserAdmin } from "react-icons/gr";
import { useSession, signOut } from "next-auth/react";

import DropdownElement from "../../ui/DropdownElement";
import NextLink from "../../ui/NextLink";

const UserDropdown: React.FC = () => {
    const { data } = useSession();

    return (
        <Menu as="div" className="relative -mr-14 inline-flex">
            <Menu.Button>
                {({ open }) => (
                    <img
                        src={data?.user?.image || "/no-pfp.jpg"}
                        className={`flex w-[45%] rounded-full duration-150 hover:ring-2 ${
                            open && "ring-2"
                        }`}
                    />
                )}
            </Menu.Button>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 z-10 mt-12 w-36 rounded-md border border-gray-200 bg-gray-50 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="border-1 rounded-t-md border-gray-300">
                        <Menu.Item as={NextLink} href="/profile">
                            <DropdownElement>
                                <BiUserCircle className="mx-0.5 text-xl" />
                                Profile
                            </DropdownElement>
                        </Menu.Item>
                        {data?.user?.isWriter && (
                            <Menu.Item as={NextLink} href="/dashboard/writer">
                                <DropdownElement>
                                    <BsFillPenFill className="mx-0.5 text-xl" />
                                    Writer Panel
                                </DropdownElement>
                            </Menu.Item>
                        )}
                        {data?.user?.isReviewer && (
                            <Menu.Item as={NextLink} href="/dashboard/reviewer">
                                <DropdownElement>
                                    <MdPreview className="mx-0.5 text-xl" />
                                    Reviewer Panel
                                </DropdownElement>
                            </Menu.Item>
                        )}
                        {data?.user?.isAdmin && (
                            <Menu.Item as={NextLink} href="/dashboard/admin">
                                <DropdownElement>
                                    <GrUserAdmin className="mx-1 text-xl" />
                                    Admin Panel
                                </DropdownElement>
                            </Menu.Item>
                        )}
                    </div>
                    <Menu.Item
                        as="a"
                        className="group flex w-full cursor-pointer items-center justify-center rounded-b-md bg-blue-600 py-2 text-center text-sm font-semibold text-white duration-150 hover:bg-blue-700"
                        onClick={() => signOut()}
                    >
                        Log Out
                    </Menu.Item>
                </Menu.Items>
            </Transition>
        </Menu>
    );
};

export default UserDropdown;
