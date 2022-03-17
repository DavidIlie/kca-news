import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

import prisma from "../../../../lib/prisma";
import { crudCommentSchema } from "../../../../schema/comment";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST")
        return res.status(405).json({ message: "wrong method" });
    try {
        const { id } = req.query;

        const body = await crudCommentSchema.validate(req.body);

        const session = await getSession({ req });

        if (!session)
            return res.status(401).json({ message: "not authenticated" });

        const article = await prisma.article.findFirst({
            where: { id: id as string },
        });

        if (!article)
            return res.status(404).json({ message: "article not found" });

        const commentCheck = await prisma.comment.findFirst({
            where: { userId: session?.user?.id, comment: body.message },
        });
        if (commentCheck) return res.status(409).json({ message: "conflict" });

        const commentCreation = await prisma.comment.create({
            data: {
                userId: session!.user!.id,
                articleId: article.id,
                comment: body.message,
            },
        });

        const comment = await prisma.comment.findFirst({
            where: { id: commentCreation.id },
            include: {
                user: true,
            },
        });

        return res.json(comment);
    } catch (error: any) {
        return res.status(400).json({ message: error?.message });
    }
};
export default handler;
