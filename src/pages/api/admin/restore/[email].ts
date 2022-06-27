import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import * as yup from "yup";

import prisma from "@/lib/prisma";

const emailSchema = yup
   .object()
   .shape({ email: yup.string().email().required() });

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
   const session = await getSession({ req });

   if (!session || !session.user?.isAdmin) {
      return res.status(401).json({ message: "not authenticated" });
   }

   let email;
   try {
      const body = await emailSchema.validate({ email: req.query["email"] });
      email = body.email;
   } catch (error: any) {
      return res
         .status(400)
         .json({ message: error.message || "unknown error" });
   }

   const banned = await prisma.bannedUsers.findFirst({
      where: { email: email },
   });

   if (!banned) {
      return res.status(404).json({ message: "user not found in ban list" });
   }

   await prisma.bannedUsers.delete({ where: { id: banned.id } });

   return res.json({ message: "ok" });
};

export default handler;
