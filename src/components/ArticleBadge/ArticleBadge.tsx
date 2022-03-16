import React from "react";

import { colors } from "../../lib/colors";

interface ArticleBadgeProps {
    tag: string;
}

export const ArticleBadge: React.FC<ArticleBadgeProps> = ({ tag }) => {
    return (
        <span
            className={`mr-2 inline-flex items-center justify-center px-2 py-2 text-sm font-bold leading-none text-${
                colors[(tag.charCodeAt(1) + tag.charCodeAt(1)) % 12]
            }-50 bg-${
                colors[(tag.charCodeAt(1) + tag.charCodeAt(2)) % 12]
            }-500 rounded-md`}
        >
            {tag}
        </span>
    );
};

export default ArticleBadge;
