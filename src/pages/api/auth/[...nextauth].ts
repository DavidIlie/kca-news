import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import prisma from "../../../lib/prisma";

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
                user.email?.includes("kcpupils.org") ||
                user.email?.includes("kings.education") ||
                user.email?.includes("davidilie.com") ||
                user.email?.includes("davidapps.dev")
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
                session.user.tags = user.tags as string[];
                session.user.isAdmin = user.isAdmin as boolean;
                session.user.isWriter = user.isWriter as boolean;
                session.user.isReviewer = user.isReviewer as boolean;
            }
            return session;
        },
    },
    secret: "wdzNsBb2TFRnlQb8oGYa8aU4W/IFbY++i++GJI+8N6I=",
});
