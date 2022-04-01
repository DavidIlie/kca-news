import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

import prisma from "../../../../../lib/prisma";
import { coWriterSchema } from "../../../../../schema/article";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
   try {
      const session = await getSession({ req });

      if (
         !session ||
         (session?.user?.isAdmin ? false : !session?.user?.isWriter)
      )
         return res.status(401).json({ message: "not authorized" });

      const { id } = req.query;

      const article = session?.user?.isAdmin
         ? await prisma.article.findFirst({
              where: {
                 id: id as string,
              },
              include: {
                 coWriters: true,
              },
           })
         : await prisma.article.findFirst({
              where: { id: id as string, user: session?.user?.id },
              include: {
                 coWriters: true,
              },
           });

      if (!article)
         return res.status(404).json({ message: "article not found" });

      const body = await coWriterSchema.validate(req.body);

      const notValidIds = [] as string[];

      body.coWriters.forEach((id) => {
         const check = prisma.user.findFirst({
            where: { id, OR: [{ isWriter: true }, { isAdmin: true }] },
         });
         if (!check) notValidIds.push(id);
      });

      if (notValidIds.length > 0)
         return res
            .status(400)
            .json({ message: `invalid co writers: ${notValidIds.join(", ")}` });

      const finalCoWriterObject = body.coWriters.map((writer) => ({
         id: writer,
      }));

      await prisma.article.update({
         where: { id: article.id },
         data: {
            coWriters: {
               set: [],
            },
         },
      });

      if (body.coWriters.length > 0) {
         await prisma.article.update({
            where: { id: article.id },
            data: {
               coWriters: {
                  connect: finalCoWriterObject,
               },
            },
         });
      }

      return res.json({ message: "ok" });
   } catch (error) {
      return res
         .status((error as any).status === 400 ? 400 : 500 || 500)
         .json({ message: (error as any).message || "unknown error" });
   }
};

export default handler;
