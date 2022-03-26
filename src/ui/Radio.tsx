import React, { InputHTMLAttributes, DetailedHTMLProps } from "react";

type RadioProps = DetailedHTMLProps<
   InputHTMLAttributes<HTMLInputElement>,
   HTMLInputElement
> & {
   label?: string;
   labelSize?: "sm" | "md" | "lg" | "xl";
   labelDisabled?: boolean;
};

const Radio: React.FC<RadioProps> = ({
   label,
   labelSize = "sm",
   labelDisabled = false,
   ...rest
}) => {
   return (
      <div className="flex items-center justify-between">
         <div className="block">
            <label
               className={`flex items-center ${
                  labelDisabled && "cursor-not-allowed"
               }`}
            >
               <input
                  type="checkbox"
                  className="focus:border-dark-600 rounded border-gray-200 bg-gray-100 text-gray-500 shadow-sm focus:ring-1 focus:ring-gray-800 focus:ring-opacity-50"
                  {...rest}
               />
               <span
                  className={`ml-2 text-${labelSize} font-semibold text-gray-${
                     labelDisabled ? "300" : "700"
                  }`}
               >
                  {label}
               </span>
            </label>
         </div>
      </div>
   );
};

export default Radio;
