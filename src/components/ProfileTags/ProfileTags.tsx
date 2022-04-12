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
import { MdPreview } from "react-icons/md";
import { RiAdminLine } from "react-icons/ri";
import { BiCommentX } from "react-icons/bi";
import { BsPen } from "react-icons/bs";
import { GiTeacher } from "react-icons/gi";

import { User } from "../../types/User";

interface ProfileTagsProps {
   user: User;
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

const ProfileTags: React.FC<ProfileTagsProps> = ({ user }) => {
   return (
      <div className="flex items-center gap-2">
         {user.tags.map((tag, index) => {
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
               case "teacher":
                  return (
                     <BaseTag label="Teacher" Icon={GiTeacher} key={index} />
                  );
               default:
                  return (
                     <BaseTag
                        label={`This tag has not been implemented yet, "${tag}"`}
                        Icon={AiOutlineQuestion}
                        key={index}
                     />
                  );
            }
         })}
         {user.isAdmin && <BaseTag label="Administrator" Icon={RiAdminLine} />}
         {user.isWriter && <BaseTag label="Writer" Icon={BsPen} />}
         {user.isReviewer && <BaseTag label="Reviewer" Icon={MdPreview} />}
         {!user.canComment && (
            <BaseTag
               label="Muted from commenting, what a guy!"
               Icon={BiCommentX}
            />
         )}
      </div>
   );
};

export default ProfileTags;
