import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

import prisma from "../../../../../lib/prisma";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
   const session = await getSession({ req });

   if (!session || (session?.user?.isAdmin ? false : !session?.user?.isWriter))
      return res.status(401).json({ message: "not authorized" });

   const { id, email, query } = req.query;

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

   const searchUsers = await prisma.user.findMany({
      where: {
         OR: [{ isWriter: true }, { isAdmin: true }],
      },
   });

   console.log(email, query);

   return res.json({ users: searchUsers });
};

export default handler;
