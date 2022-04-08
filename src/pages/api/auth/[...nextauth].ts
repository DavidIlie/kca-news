import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import prisma from "../../../lib/prisma";
import { PrismaAdapter } from "../../../lib/adapter";

export default NextAuth({
   adapter: PrismaAdapter(prisma),
   providers: [
      GoogleProvider({
         clientId:
            "160944340355-s5429astr5j8ob2tasri62kra56mj1li.apps.googleusercontent.com",
         clientSecret: "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",
      }),
   ],
   callbacks: {
      async signIn({ user }) {
         if (
            user.email?.endsWith("@kcpupils.org") ||
            user.email?.endsWith("@kings.education") ||
            user.email?.endsWith("@kingsgroup.org") ||
            user.email?.endsWith("@davidilie.com")
         )
            return true;
         return false;
      },
      async session({ session, user }) {
         if (session?.user) {
            session.user.id = user.id;
            session.user.description = user.description as string;
            session.user.status = user.status as string;
            session.user.nickname = user.nickname as string;
            (session.user as any).tags = user.tags as string[];
            session.user.isAdmin = user.isAdmin as boolean;
            session.user.isWriter = user.isWriter as boolean;
            session.user.isReviewer = user.isReviewer as boolean;
            session.user.nameIndex = user.nameIndex as number;
            session.user.names = user.names as string[];
            session.user.showYear = user.showYear as boolean;
            session.user.canComment = user.canComment as boolean;
            session.user.department = user.department as string[];
         }
         return session;
      },
   },
   secret: process.env.NEXTAUTH_SECRET,
});
