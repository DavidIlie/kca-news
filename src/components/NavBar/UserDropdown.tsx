import React from "react";
import { Menu, Transition } from "@headlessui/react";
import Image from "next/image";
import { Fragment } from "react";
import { BiUserCircle } from "react-icons/bi";
import { BsPen } from "react-icons/bs";
import { MdPreview, MdDarkMode, MdLightMode } from "react-icons/md";
import { RiAdminLine } from "react-icons/ri";
import { useSession, signOut } from "next-auth/react";

import DropdownElement from "@/ui/DropdownElement";
import NextLink from "@/ui/NextLink";
import useColorScheme from "@/hooks/useColorScheme";
import { shimmer } from "@/lib/shimmer";

const UserDropdown: React.FC = () => {
   const { data } = useSession();

   const { colorScheme, toggleColorScheme } = useColorScheme();

   const isWriter = data?.user?.isAdmin ? true : data?.user?.isWriter;
   const isReviewer = data?.user?.isAdmin ? true : data?.user?.isReviewer;
   const isEditorial = data?.user?.isAdmin ? true : data?.user?.isEditorial;

   return (
      <Menu as="div" className="relative inline-flex m-0">
         <Menu.Button className="w-1/2">
            <Image
               src={data?.user?.image || "/no-pfp.jpg"}
               className="flex duration-150 rounded-full"
               referrerPolicy="no-referrer"
               placeholder="blur"
               blurDataURL={shimmer(1920, 1080)}
               height={100}
               width={100}
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
            <Menu.Items className="absolute right-0 z-10 mt-12 border border-gray-200 rounded-md shadow-lg w-36 bg-gray-50 ring-1 ring-black ring-opacity-5 focus:outline-none dark:border-gray-800 dark:bg-foot">
               <div className="border-gray-300 border-1 rounded-t-md">
                  <Menu.Item as={NextLink} href="/profile">
                     <DropdownElement>
                        <BiUserCircle className="mx-0.5 text-xl" />
                        Profile
                     </DropdownElement>
                  </Menu.Item>
                  {isWriter && (
                     <Menu.Item as={NextLink} href="/dashboard/writer">
                        <DropdownElement>
                           <BsPen className="mx-0.5 text-xl" />
                           Writer Panel
                        </DropdownElement>
                     </Menu.Item>
                  )}
                  {isReviewer && (
                     <Menu.Item as={NextLink} href="/dashboard/reviewer">
                        <DropdownElement>
                           <MdPreview className="mx-0.5 text-xl" />
                           Reviewer Panel
                        </DropdownElement>
                     </Menu.Item>
                  )}
                  {isEditorial && (
                     <Menu.Item as={NextLink} href="/dashboard/admin">
                        <DropdownElement>
                           <RiAdminLine className="mx-0.5 text-xl" />
                           {data?.user?.isAdmin ? "Admin" : "Editorial"} Panel
                        </DropdownElement>
                     </Menu.Item>
                  )}
                  <DropdownElement
                     onClick={() =>
                        colorScheme === "dark"
                           ? toggleColorScheme("light")
                           : toggleColorScheme("dark")
                     }
                     title="ctrl+shift+e"
                  >
                     {colorScheme === "dark" ? (
                        <MdLightMode className="mx-0.5 text-xl" />
                     ) : (
                        <MdDarkMode className="mx-0.5 text-xl" />
                     )}
                     {colorScheme === "dark" ? "Light Mode" : "Dark Mode"}
                  </DropdownElement>
               </div>
               <Menu.Item
                  as="a"
                  className="flex items-center justify-center w-full py-2 text-sm font-semibold text-center text-white duration-150 bg-blue-600 cursor-pointer group rounded-b-md hover:bg-blue-700"
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
