import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

import prisma from "../../../../../lib/prisma";
import { updateDate } from "../../../../../schema/article";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
   if (req.method !== "POST")
      return res.status(405).json({ message: "wrong method boi" });

   const session = await getSession({ req });

   if (
      !session ||
      (session?.user?.isAdmin || session?.user?.isEditorial
         ? false
         : !session?.user?.isWriter)
   )
      return res.status(401).json({ message: "not authenticated" });

   const { id } = req.query;

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

   let body;
   try {
      body = await updateDate.validate(req.body);
   } catch (error) {
      return res
         .status(400)
         .json({ message: (error as any).message || "Unknown parsing error" });
   }

   await prisma.article.update({
      where: { id: article.id },
      data: {
         createdAt: body.date,
      },
   });

   return res.json({ message: "ok" });
};

export default handler;
