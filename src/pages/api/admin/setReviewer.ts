import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

import prisma from "../../../lib/prisma";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
   const session = await getSession({ req });

   if (
      !session ||
      (session.user?.isAdmin
         ? false
         : session?.user?.isEditorial
         ? false
         : true)
   ) {
      return res.status(401).json({ message: "not authenticated" });
   }

   const { id } = req.query;

   if (!id) return res.status(400).json({ message: "no id provided" });

   const user = await prisma.user.findFirst({ where: { id: id as string } });

   if (!user) return res.status(404).json({ message: "user not found" });

   await prisma.user.update({
      where: { id: user.id },
      data: { isReviewer: !user.isReviewer },
   });

   return res.json({
      message: "ok",
   });
};

export default handler;
