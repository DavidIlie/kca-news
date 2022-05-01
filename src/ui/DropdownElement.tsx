import React, { DetailedHTMLProps, HTMLAttributes } from "react";

import { AiOutlineArrowRight } from "react-icons/ai";

interface Props
   extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
   className?: string;
   children: React.ReactNode | React.ReactNode[];
   opening?: boolean;
   openingFunction?: () => void;
   color?: "normal" | "red";
}

const DropdownElement: React.FC<Props> = ({
   children,
   className,
   opening = false,
   openingFunction,
   color = "normal",
   ...rest
}) => {
   return (
      <div
         className={`flex w-full cursor-pointer items-center px-2 py-2 text-sm duration-200 ${
            color === "normal" &&
            "bg-white text-black hover:bg-gray-100 dark:bg-foot dark:bg-opacity-10 dark:text-white dark:hover:bg-dark-bg"
         } ${
            color === "red" && "bg-red-500 text-white hover:bg-red-600"
         } ${className}`}
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
