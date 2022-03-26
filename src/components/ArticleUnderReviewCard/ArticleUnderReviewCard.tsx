import React from "react";
import { Popover, Transition } from "@headlessui/react";
import { Tooltip } from "@mantine/core";
import { GrCircleInformation } from "react-icons/gr";

const ArticleUnderReviewCard: React.FC = () => {
   return (
      <Popover className="relative inline-flex">
         <Tooltip label="Click for information">
            <Popover.Button
               as={GrCircleInformation}
               className="mt-0.5 cursor-pointer"
            />
         </Tooltip>
         <Transition
            as={React.Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
         >
            <Popover.Panel className="absolute right-0 z-10 -mr-12 w-96 rounded-md border-2 border-gray-200 bg-white p-4 shadow-md">
               This can be for any number of reasons: your article is pending to
               be published, your article has been edited, your article has been
               taken down for moderation, etc. To see more information{" "}
               <a
                  href="#"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 duration-150 hover:text-blue-800"
               >
                  click here
               </a>
               .
            </Popover.Panel>
         </Transition>
      </Popover>
   );
};

export default ArticleUnderReviewCard;
