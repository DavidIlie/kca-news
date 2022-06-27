import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

import prisma from "@/lib/prisma";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
   const { id } = req.query;
   const session = await getSession({ req });

   const comment = await prisma.comment.findFirst({
      where: { id: id as string },
   });

   if (!comment) return res.status(404).json({ message: "comment not found" });

   if (!session) return res.status(401).json({ message: "not authenticated" });

   if (
      (comment.underReview &&
         (session.user?.isAdmin || session.user?.isEditorial)) ||
      !comment.underReview
   ) {
      await prisma.comment.update({
         where: { id: comment.id },
         data: { underReview: !comment.underReview },
      });
      return res.json({ message: "ok" });
   } else {
      return res.status(401).json({ message: "no perms" });
   }
};

export default handler;
