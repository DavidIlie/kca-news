import React from "react";

import { colors } from "../../lib/colors";

interface ArticleBadgeProps {
   tag: string;
   className?: string;
}

export const ArticleBadge: React.FC<ArticleBadgeProps> = ({
   tag,
   className,
}) => {
   return (
      <span
         className={`mr-2 inline-flex items-center justify-center px-2 py-2 text-sm font-bold leading-none text-${
            colors[(tag.charCodeAt(1) + tag.charCodeAt(1)) % 11]
         }-50 bg-${
            colors[(tag.charCodeAt(1) + tag.charCodeAt(2)) % 11]
         }-500 mb-1 rounded-md ${className}`}
      >
         {tag}
      </span>
   );
};

export default ArticleBadge;
