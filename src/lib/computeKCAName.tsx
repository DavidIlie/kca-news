import React, { useState } from "react";
import { User } from "../types/User";

export const computeKCAName = (user: User, showNickname = false) =>
   showNickname && user.nickname
      ? `${user.nickname} ${user.showYear ? `in ${user.year}` : ""}`
      : `${
           !user.email.endsWith("kcpupils.org")
              ? user.gender === "male"
                 ? "Mr"
                 : "Ms"
              : ""
        }  ${user.names[user.nameIndex]} ${
           user.extraName ? user.extraName : ""
        } ${user.showYear ? `in ${user.year}` : ""}`;

export const ChangeableKCAName: React.FC<{
   user: User;
   showNickName: boolean;
}> = ({ user, showNickName = false }) => {
   const [nickState, setNickState] = useState<boolean>(showNickName);

   return (
      <div onClick={() => (showNickName ? setNickState(!nickState) : null)}>
         {computeKCAName(user, nickState)}
      </div>
   );
};
