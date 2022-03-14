import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
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
                user.email?.includes("kings.education")
            )
                return true;
            return false;
        },
    },
});
