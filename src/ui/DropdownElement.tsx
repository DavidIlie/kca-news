import React, { DetailedHTMLProps, HTMLAttributes } from "react";

interface Props
   extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
   children: React.ReactNode | React.ReactNode[];
}

const DropdownElement: React.FC<Props> = ({ children, ...rest }) => {
   return (
      <div
         className="group flex w-full cursor-pointer items-center gap-1 px-2 py-2 text-sm text-black duration-200 hover:bg-gray-200 dark:text-white dark:hover:bg-dark-bg"
         {...rest}
      >
         {children}
      </div>
   );
};

export default DropdownElement;
