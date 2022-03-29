import React, {
   ButtonHTMLAttributes,
   DetailedHTMLProps,
   ReactNode,
} from "react";
import { Spinner } from "./Spinner";

const colorClassnames = {
   primary:
      "rounded py-2 px-4 bg-blue-500 transition duration-150 ease-in-out hover:bg-blue-600 disabled:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-900 dark:disabled:bg-blue-800 text-white dark:disabled:border dark:border-blue-500 border dark:border-blue-800 dark:hover:border-blue-900",
   secondary:
      "rounded py-2 px-4 bg-red-500 transition duration-150 ease-in-out hover:bg-red-600 disabled:bg-red-200 text-white text-white dark:bg-red-800 dark:hover:bg-red-900 dark:disabled:bg-gray-800 dark:disabled:border dark:border-red-500 border dark:border-red-800 dark:hover:border-red-900",
   transparent:
      "rounded py-1.5 px-3 border-2 border-blue-500 hover:bg-blue-600 hover:text-white transition duration-150 ease-in-out text-black",
   cyan: "rounded py-2 px-4 bg-cyan-500 transition duration-150 ease-in-out hover:bg-cyan-600 disabled:bg-cyan-200 text-white dark:bg-cyan-800 dark:hover:bg-cyan-900 dark:disabled:bg-gray-800 dark:disabled:border dark:border-gray-500 border dark:border-cyan-800 dark:hover:border-cyan-900",
   sky: "rounded py-2 px-4 bg-sky-500 transition duration-150 ease-in-out hover:bg-sky-600 disabled:bg-sky-200 text-white text-white dark:bg-sky-800 dark:hover:bg-sky-900 dark:disabled:bg-gray-800 dark:disabled:border dark:border-sky-500 border dark:border-sky-800 dark:hover:border-sky-900",
};

export type ButtonProps = DetailedHTMLProps<
   ButtonHTMLAttributes<HTMLButtonElement>,
   HTMLButtonElement
> & {
   color?: keyof typeof colorClassnames;
   loading?: boolean;
   icon?: ReactNode;
   transition?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
   children,
   color = "primary",
   disabled,
   loading,
   icon,
   className = "",
   ...props
}) => {
   return (
      <button
         disabled={disabled || loading}
         className={`flex outline-none focus:ring-4 focus:ring-${color} ${colorClassnames[color]} flex items-center justify-center font-semibold disabled:cursor-not-allowed ${className}`}
         {...props}
      >
         <span className={loading ? "opacity-0" : `flex items-center`}>
            {icon ? <span className="mr-2 items-center">{icon}</span> : null}
            {children}
         </span>
         {loading && (
            <span className={`absolute flex items-center gap-2`}>
               Loading <Spinner size="4" />
            </span>
         )}
      </button>
   );
};
