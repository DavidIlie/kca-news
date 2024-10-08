import type { PrismaClient, Prisma } from "@prisma/client";
import type { Adapter } from "next-auth/adapters";

export function PrismaAdapter(p: PrismaClient): Adapter {
   return {
      createUser: async (data) => {
         const name = data.name as string;

         const fullName = name.split("Year")[0];
         const year = name.split(fullName)[1];

         const email = data.email as string;

         let names = fullName.split(" ");
         if (email.endsWith("kcpupils.org")) {
            names.pop();
            data.year = year;
         } else {
            data.year = "";
            data.showYear = false;
         }

         if (email.endsWith("kings.education")) {
            data.tags = ["teacher"];
            data.nameIndex = 1;
         } else {
            data.nameIndex = 0;
         }

         const r = await fetch(`https://api.genderize.io/?name=${names[0]}`);
         const response = await r.json();
         data.gender = response.gender;

         data.names = names;

         return p.user.create({ data: data as any });
      },
      getUser: (id) => p.user.findUnique({ where: { id } }),
      getUserByEmail: (email) => p.user.findUnique({ where: { email } }),
      async getUserByAccount(provider_providerAccountId) {
         const account = await p.account.findUnique({
            where: { provider_providerAccountId },
            select: { user: true },
         });
         return account?.user ?? null;
      },
      updateUser: (data) => p.user.update({ where: { id: data.id }, data }),
      deleteUser: (id) => p.user.delete({ where: { id } }),
      linkAccount: (data) => p.account.create({ data }) as any,
      unlinkAccount: (provider_providerAccountId) =>
         p.account.delete({ where: { provider_providerAccountId } }) as any,
      async getSessionAndUser(sessionToken) {
         const userAndSession = await p.session.findUnique({
            where: { sessionToken },
            include: { user: true },
         });
         if (!userAndSession) return null;
         const { user, ...session } = userAndSession;
         return { user, session };
      },
      createSession: (data) => p.session.create({ data }),
      updateSession: (data) =>
         p.session.update({
            data,
            where: { sessionToken: data.sessionToken },
         }),
      deleteSession: (sessionToken) =>
         p.session.delete({ where: { sessionToken } }),
      createVerificationToken: (data) => p.verificationToken.create({ data }),
      async useVerificationToken(identifier_token) {
         try {
            return await p.verificationToken.delete({
               where: { identifier_token },
            });
         } catch (error) {
            if (
               (error as Prisma.PrismaClientKnownRequestError).code === "P2025"
            )
               return null;
            throw error;
         }
      },
   };
}
