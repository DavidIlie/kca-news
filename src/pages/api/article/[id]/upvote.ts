import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

import prisma from "../../../../lib/prisma";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;

    const session = await getSession({ req });

    if (!session) return res.status(401).json({ message: "not authenticated" });

    const article = await prisma.article.findFirst({
        where: { id: id as string },
    });

    if (!article) return res.status(404).json({ message: "article not found" });

    const user = await prisma.user.findFirst({
        where: { email: session.user?.email },
    });
    const upvoteCheck = await prisma.upvote.findFirst({
        where: { articleId: article.id, votedBy: user?.id },
    });

    if (upvoteCheck) {
    } else {
    }

    return res.send(req.query);
};

export default handler;
