import React, { useState } from "react";
import { useRouter } from "next/router";
import { Disclosure } from "@headlessui/react";
import {
   AiOutlineArrowDown,
   AiOutlineArrowUp,
   AiOutlineWarning,
} from "react-icons/ai";

import useDetermineCustomQueryEditor from "../../hooks/useDetermineCustomQueryEditor";

interface Props {
   name: string;
   children: React.ReactNode | React.ReactNode[];
   warning?: boolean;
   defaultOpen?: boolean;
}

const EditorSettingsDisclosure: React.FC<Props> = ({
   name,
   children,
   warning = false,
   defaultOpen = false,
}) => {
   const router = useRouter();
   const { visibility } = router.query;

   const [defaultOpenState, setDefaultOpenState] = useState<boolean>(
      ((visibility as any as boolean) && name === "Visibility") || defaultOpen
   );

   const finalUrl = useDetermineCustomQueryEditor("visibility");

   return (
      <Disclosure
         as="div"
         className="border-b-2 border-gray-300 dark:border-blue-900"
         defaultOpen={defaultOpenState}
      >
         <Disclosure.Button className="w-[99.5%] select-none p-0 py-4 ring-blue-500 duration-150 hover:bg-gray-100 focus:ring-1 dark:hover:bg-gray-800">
            {({ open }) => (
               <div
                  className="mx-4 flex w-[93%] items-center justify-between gap-2"
                  onClick={() => {
                     if (
                        name === "Visibility" &&
                        (visibility as any as boolean)
                     ) {
                        router.push(finalUrl, "", { shallow: true });
                        setDefaultOpenState(defaultOpen);
                     }
                  }}
               >
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
