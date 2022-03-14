import React from "react";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { BiUserCircle, BiCog } from "react-icons/bi";
import { MdManageAccounts } from "react-icons/md";
import Link from "next/link";
import { useSession } from "next-auth/react";

import DropdownElement from "../../ui/DropdownElement";
import NextLink from "../../ui/NextLink";

const UserDropdown: React.FC = () => {
    const { data } = useSession();
    return (
        <div className="flex items-center sm:ml-6">
            <Menu as="div" className="relative inline-block text-right">
                <Menu.Button className="inline-flex items-center text-black">
                    <img
                        src={data?.user?.image || "/no-pfp.jpg"}
                        className="mt-0.5 -ml-1 flex rounded-full border-[4px] border-red-500"
                    />
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
                    <Menu.Items className="absolute right-0 z-10 mt-1 w-36 rounded-md border border-gray-200 bg-gray-50 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="border-1 rounded-t-md border-gray-300">
                            <Menu.Item
                                as={NextLink}
                                href="/user/settings?tab=profile"
                            >
                                <DropdownElement>
                                    <BiUserCircle className="mx-0.5 text-xl" />
                                    Profile
                                </DropdownElement>
                            </Menu.Item>
                            <Menu.Item
                                as={NextLink}
                                href="/user/settings?tab=account"
                            >
                                <DropdownElement>
                                    <MdManageAccounts className="mx-0.5 text-xl" />
                                    Account
                                </DropdownElement>
                            </Menu.Item>
                            <Menu.Item
                                as={NextLink}
                                href="/user/settings?tab=subjects"
                            >
                                <DropdownElement>
                                    <BiCog className="mx-0.5 text-xl" />
                                    Settings
                                </DropdownElement>
                            </Menu.Item>
                        </div>
                        <Menu.Item>
                            <Link href="/logout">
                                <a className="group flex w-full cursor-pointer items-center justify-center rounded-b-md bg-blue-600 py-2 text-center text-sm font-semibold text-white duration-150 hover:bg-blue-700">
                                    Log Out
                                </a>
                            </Link>
                        </Menu.Item>
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    );
};

export default UserDropdown;
