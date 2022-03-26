import React from "react";
import { Disclosure } from "@headlessui/react";

import {
   AiOutlineArrowDown,
   AiOutlineArrowUp,
   AiOutlineWarning,
} from "react-icons/ai";

interface Props {
   name: string;
   children: React.ReactNode | React.ReactNode[];
   warning?: boolean;
}

const EditorSettingsDisclosure: React.FC<Props> = ({
   name,
   children,
   warning = false,
}) => {
   return (
      <Disclosure as="div" className="border-b-2">
         <Disclosure.Button className="w-[99.5%] p-0 py-4 ring-blue-500 duration-150 hover:bg-gray-100 focus:ring-1">
            {({ open }) => (
               <div className="mx-4 flex items-center justify-between gap-2">
                  <div
                     className={`flex items-center gap-2 ${
                        warning && "font-semibold text-red-500"
                     }`}
                  >
                     <h1>{name}</h1>
                     {warning && <AiOutlineWarning />}
                  </div>
                  {open ? <AiOutlineArrowUp /> : <AiOutlineArrowDown />}
               </div>
            )}
         </Disclosure.Button>
         <Disclosure.Panel className="border-t border-blue-500 px-4 py-4">
            {children}
         </Disclosure.Panel>
      </Disclosure>
   );
};

export default EditorSettingsDisclosure;
