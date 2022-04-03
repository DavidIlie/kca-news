import React from "react";
import { AiFillDislike, AiFillLike } from "react-icons/ai";
import { FaCommentDots } from "react-icons/fa";
import { MdArticle, MdPublish } from "react-icons/md";

import StatisticCard from "../StatisticCard";

interface Props {
   isAdmin?: boolean;
   totalArticles: number;
   publishedArticles: number;
   totalComments: number;
   totalUpvotes: number;
   totalDownvotes: number;
   className?: string;
}

const DashboardStatistics: React.FC<Props> = ({
   isAdmin = false,
   totalArticles,
   publishedArticles,
   totalComments,
   totalUpvotes,
   totalDownvotes,
   className,
}): JSX.Element => {
   return (
      <div
         className={`${className} grid grid-cols-2 gap-4 px-2 md:grid-cols-4 lg:grid-cols-5`}
      >
         <StatisticCard
            title={`${isAdmin ? "Total" : "Your"} Articles`}
            value={totalArticles}
            icon={MdArticle}
         />
         <div className="hidden sm:block">
            <StatisticCard
               title="Published"
               value={publishedArticles}
               icon={MdPublish}
            />
         </div>
         <StatisticCard
            title="Comments"
            value={totalComments}
            icon={FaCommentDots}
         />
         <StatisticCard title="Likes" value={totalUpvotes} icon={AiFillLike} />
         <StatisticCard
            title="Dislikes"
            value={totalDownvotes}
            icon={AiFillDislike}
         />
      </div>
   );
};

export default DashboardStatistics;
