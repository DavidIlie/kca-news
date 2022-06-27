import type { DefaultUser } from "next-auth";

import { User } from "@/types/User";

declare module "next-auth" {
   interface Session {
      user?: DefaultUser & User;
   }
}

declare module "next-auth/jwt/types" {
   interface JWT {
      uid: string;
   }
}
