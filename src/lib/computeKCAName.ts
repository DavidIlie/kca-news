import { User } from "../types/User";

export const computeKCAName = (user: User) =>
   `${
      !user.email.endsWith("kcpupils.org")
         ? user.gender === "male"
            ? "Mr"
            : "Ms"
         : ""
   }  ${user.names[user.nameIndex]} ${user.extraName ? user.extraName : ""} ${
      user.showYear ? `in ${user.year}` : ""
   }`;
