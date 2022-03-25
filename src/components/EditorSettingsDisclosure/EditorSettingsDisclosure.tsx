import React from "react";
import { Disclosure } from "@headlessui/react";

import { AiOutlineArrowDown, AiOutlineArrowUp } from "react-icons/ai";

interface Props {
   name: string;
   children: React.ReactNode | React.ReactNode[];
}

const EditorSettingsDisclosure: React.FC<Props> = ({ name, children }) => {
   return (
      <Disclosure
         as="div"
         className="border-b-2"
         defaultOpen={name === "Status & Visibility"}
      >
         <Disclosure.Button className="w-[99.5%] py-4 px-2 ring-blue-500 duration-150 hover:bg-gray-100 focus:ring-1">
            {({ open }) => (
               <div className="mx-4 flex items-center justify-between gap-2">
                  <h1>{name}</h1>
                  {open ? <AiOutlineArrowUp /> : <AiOutlineArrowDown />}
               </div>
            )}
         </Disclosure.Button>
         <Disclosure.Panel className="border-t border-blue-500 px-2 py-4">
            {children}
         </Disclosure.Panel>
      </Disclosure>
   );
};

export default EditorSettingsDisclosure;
