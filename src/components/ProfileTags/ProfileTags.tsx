import React from "react";
import { Tooltip } from "@mantine/core";

import { IconType } from "react-icons";
import {
   AiOutlineCodeSandbox,
   AiOutlineComment,
   AiOutlineLike,
   AiOutlineDislike,
   AiOutlineQuestion,
} from "react-icons/ai";
import { GrUserAdmin } from "react-icons/gr";

import { Tag } from "../../types/Tag";
import { BsPen } from "react-icons/bs";
import { MdPreview } from "react-icons/md";

interface ProfileTagsProps {
   tags: Tag[];
   isAdmin: boolean;
   isWriter: boolean;
   isReviewer: boolean;
}

interface BaseTagProps {
   label: string;
   Icon: IconType;
}

const BaseTag: React.FC<BaseTagProps> = ({ label, Icon }) => {
   return (
      <Tooltip label={label}>
         <Icon size="25" className="cursor-pointer" />
      </Tooltip>
   );
};

const ProfileTags: React.FC<ProfileTagsProps> = ({
   tags,
   isAdmin,
   isWriter,
   isReviewer,
}) => {
   return (
      <div className="flex items-center gap-2">
         {tags.map((tag, index) => {
            switch (tag) {
               case "developer":
                  return (
                     <BaseTag
                        label="Developer of this website!"
                        Icon={AiOutlineCodeSandbox}
                        key={index}
                     />
                  );
               case "commenter":
                  return (
                     <BaseTag
                        label="Awarded due to multiple comments on multiple articles!"
                        Icon={AiOutlineComment}
                        key={index}
                     />
                  );
               case "liker":
                  return (
                     <BaseTag
                        label="Awarded due to liking many articles!"
                        Icon={AiOutlineLike}
                        key={index}
                     />
                  );
               case "disliker":
                  return (
                     <BaseTag
                        label="Awarded due to disliking many articles! What a guy!"
                        Icon={AiOutlineDislike}
                        key={index}
                     />
                  );
               default:
                  return (
                     <BaseTag
                        label={`This tag has not been implemented yet, ${tag}`}
                        Icon={AiOutlineQuestion}
                        key={index}
                     />
                  );
            }
         })}
         {isAdmin && <BaseTag label="Administrator" Icon={GrUserAdmin} />}
         {isWriter && <BaseTag label="Writer" Icon={BsPen} />}
         {isReviewer && <BaseTag label="Reviewer" Icon={MdPreview} />}
      </div>
   );
};

export default ProfileTags;
