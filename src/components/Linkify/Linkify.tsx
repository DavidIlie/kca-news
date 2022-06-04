import React from "react";

//@ts-ignore
import Linkify from "react-linkify";

const LinkifyText: React.FC = ({ children }) => {
   return (
      <Linkify
         componentDecorator={(
            decoratedHref: any,
            decoratedText: any,
            key: any
         ) => (
            <a
               href={decoratedHref}
               key={key}
               className="font-medium text-blue-500 duration-150 hover:text-blue-600"
            >
               {decoratedText}
            </a>
         )}
      >
         {children}
      </Linkify>
   );
};

export default LinkifyText;
