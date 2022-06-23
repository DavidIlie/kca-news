import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import * as yup from "yup";

import { Context, createContext } from "@/lib/context";
import { getArticles } from "@/lib/getArticles";
import { fullLocations, Locations } from "@/lib/categories";

export const appRouter = trpc
   .router<Context>()
   .query("featured-posts", {
      async resolve({ ctx }) {
         return {
            articles: await getArticles(
               ctx.user,
               null,
               {
                  take: 4,
               },
               true
            ),
         };
      },
   })
   .query("location-posts", {
      // find a way to set the type
      input: yup.object({
         location: yup
            .string()
            .test((val) => {
               if (!fullLocations.includes(val as any)) return false;
               return true;
            })
            .required(),
      }),
      async resolve({ ctx, input }) {
         return {
            articles: await getArticles(
               ctx.user,
               { location: input.location },
               {
                  take: 4,
               },
               true,
               null
            ),
         };
      },
   });

export type AppRouter = typeof appRouter;

export default trpcNext.createNextApiHandler({
   router: appRouter,
   createContext,
});
