import { User } from "../types/User";

export const computeKCAName = (user: User) =>
   `${user.names[user.nameIndex]} ${user.extraName ? user.extraName : ""} ${
      user.showYear ? `in ${user.year}` : ""
   }`;
