import React, { Fragment } from "react";
import { AiOutlineArrowDown, AiOutlineArrowUp } from "react-icons/ai";
import { Menu, Transition } from "@headlessui/react";

interface Props {
   name: string;
   special?: boolean;
   children: React.ReactNode | React.ReactNode[];
}

const NewsLink: React.FC<Props> = ({ name, children, special = false }) => {
   return (
      <Menu as="div" className="relative inline-flex select-none">
         <Menu.Button
            as="div"
            className="flex cursor-pointer items-center gap-1 rounded-md border-2 border-blue-500 bg-blue-500 px-2 py-1 text-white duration-150 hover:border-blue-600 hover:bg-blue-600 dark:border-gray-800 dark:bg-foot dark:hover:bg-dark-bg"
         >
            {({ open }) => (
               <>
                  {name}
                  {open ? (
                     <AiOutlineArrowUp className="-mr-1" />
                  ) : (
                     <AiOutlineArrowDown className="-mr-1" />
                  )}
               </>
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
            <Menu.Items
               className={`absolute mt-12 ${
                  name === "More" && special ? "-ml-40" : "-ml-16"
               } ${
                  special ? "w-56" : "w-32"
               } z-[200] rounded-md border border-gray-200 bg-gray-50 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:border-gray-900 dark:bg-foot sm:ml-auto`}
            >
               {children}
            </Menu.Items>
         </Transition>
      </Menu>
   );
};

export default NewsLink;
