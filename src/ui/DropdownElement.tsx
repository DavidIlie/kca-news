import React, { DetailedHTMLProps, HTMLAttributes } from "react";

import { AiOutlineArrowRight } from "react-icons/ai";

interface Props
   extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
   className?: string;
   children: React.ReactNode | React.ReactNode[];
   opening?: boolean;
   openingFunction?: () => void;
}

const DropdownElement: React.FC<Props> = ({
   children,
   className,
   opening = false,
   openingFunction,
   ...rest
}) => {
   return (
      <div
         className={`flex w-full cursor-pointer items-center px-2 py-2 text-sm text-black duration-200 hover:bg-gray-200 dark:bg-opacity-10 dark:text-white dark:hover:bg-dark-bg ${className}`}
         {...rest}
         onClick={openingFunction || rest.onClick}
      >
         {children}
         {opening && (
            <div className="flex w-full justify-end">
               <AiOutlineArrowRight />
            </div>
         )}
      </div>
   );
};

export default DropdownElement;
