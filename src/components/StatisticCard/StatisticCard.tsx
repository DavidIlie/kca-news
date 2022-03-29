import React from "react";
import { IconType } from "react-icons";

interface Types {
   title: string;
   value: number;
   icon: IconType;
}

const StatisticCard: React.FC<Types> = ({ title, value, ...rest }) => {
   return (
      <div className="hoverItem rounded-lg border-2 border-gray-100 bg-gray-50 p-6 duration-200 dark:border-gray-700 dark:bg-gray-800">
         <div className="flex items-center justify-evenly space-x-8">
            <div>
               <div className="dark:text-dark-gray-300 text-sm uppercase text-gray-800 dark:text-gray-200">
                  {title}
               </div>
               <div className="darl:text-gray-100 mt-1 text-3xl font-bold text-gray-900 dark:text-gray-200 sm:text-5xl">
                  {value}
               </div>
            </div>
            <rest.icon className="text-3xl" />
         </div>
      </div>
   );
};

export default StatisticCard;
