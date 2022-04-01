import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

import prisma from "../../../../../lib/prisma";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
   const session = await getSession({ req });

   if (!session || (session?.user?.isAdmin ? false : !session?.user?.isWriter))
      return res.status(401).json({ message: "not authorized" });

   const { id, userId } = req.query;

   const article = session?.user?.isAdmin
      ? await prisma.article.findFirst({
           where: {
              id: id as string,
           },
        })
      : await prisma.article.findFirst({
           where: { id: id as string, user: session?.user?.id },
        });

   if (!article) return res.status(404).json({ message: "article not found" });

   const searchUser = await prisma.user.findFirst({
      where: {
         id: userId as string,
         OR: [{ isWriter: true }, { isAdmin: true }],
      },
   });

   if (!searchUser) return res.status(400).json({ message: "user not found" });

   return res.json({ user: searchUser });
};

export default handler;
