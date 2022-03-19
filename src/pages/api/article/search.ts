import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../../lib/prisma";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { q } = req.query;

        const articles = await prisma.article.findMany({
            where: {
                published: true,
                title: {
                    contains: q as string,
                    mode: "insensitive",
                },
            },
            include: {
                user: true,
            },
            orderBy: [
                {
                    createdAt: "desc",
                },
            ],
        });

        return res.json(articles);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export default handler;
