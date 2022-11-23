import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

import prisma from "@/lib/prisma";
import { ownershipTransferSchema } from "@/schema/article";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getSession({ req });

    if (
      !session ||
      (session?.user?.isAdmin || session?.user?.isEditorial
        ? false
        : !session?.user?.isWriter)
    )
      return res.status(401).json({ message: "not authorized" });

    const { id } = req.query;

    const article =
      session?.user?.isAdmin || session?.user?.isEditorial
        ? await prisma.article.findFirst({
            where: {
              id: id as string,
            },
            include: {
              coWriters: true,
              writer: true,
            },
          })
        : await prisma.article.findFirst({
            where: { id: id as string, user: session?.user?.id },
            include: {
              coWriters: true,
              writer: true,
            },
          });

    if (!article || !article.writer)
      return res.status(404).json({ message: "article not found" });

    const body = await ownershipTransferSchema.validate(req.body);
    const targetOwnerId = body.newOwner;

    const targetOwner = await prisma.user.findFirst({
      where: { id: targetOwnerId, OR: [{ isWriter: true }, { isAdmin: true }] },
    });
    const targetIsCoWriter =
      article.coWriters.findIndex((u) => u.id === targetOwnerId) > -1;

    if (!targetOwner)
      return res
        .status(400)
        .json({ message: `invalid new owner: ${targetOwnerId}` });

    await prisma.article.update({
      where: { id: article.id },
      data: {
        coWriters: {
          // setting the previous owner as a co writer
          connect: { id: article.writer.id },
          disconnect: targetIsCoWriter
            ? {
                id: targetOwnerId,
              }
            : undefined,
        },
        writer: {
          update: {
            id: targetOwnerId,
          },
        },
      },
    });

    return res.json({ message: "transfer succeeded" });
  } catch (error) {
    return res
      .status((error as any).status === 400 ? 400 : 500 || 500)
      .json({ message: (error as any).message || "unknown error" });
  }
};

export default handler;
