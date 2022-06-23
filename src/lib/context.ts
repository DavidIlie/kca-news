import { inferAsyncReturnType } from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { getSession } from "next-auth/react";

import { User } from "@/types/User";

export async function createContext({
   req,
}: trpcNext.CreateNextContextOptions) {
   async function getNextAuthSession() {
      const session = await getSession({ req });
      if (session) return session.user;
      return null;
   }

   const user = (await getNextAuthSession()) as any as User | undefined;

   return {
      user,
   };
}

export type Context = inferAsyncReturnType<typeof createContext>;
