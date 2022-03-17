import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

import prisma from "../../../../lib/prisma";
import { crudCommentSchema } from "../../../../schema/comment";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;

    try {
        const body = await crudCommentSchema.validate(req.body);

        const session = await getSession({ req });

        if (!session)
            return res.status(401).json({ message: "not authenticated" });

        const article = await prisma.article.findFirst({
            where: { id: id as string },
        });

        if (!article)
            return res.status(404).json({ message: "article not found" });

        const user = await prisma.user.findFirst({
            where: { email: session.user?.email },
        });

        const commentCheck = await prisma.comment.findFirst({
            where: { userId: user?.id, comment: body.message },
        });
        if (commentCheck) return res.status(409).json({ message: "conflict" });
    } catch (error: any) {
        return res.status(400).json({ message: error?.message });
    }
};
export default handler;
