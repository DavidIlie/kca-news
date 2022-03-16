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
    },
    secret: "wdzNsBb2TFRnlQb8oGYa8aU4W/IFbY++i++GJI+8N6I=",
});
