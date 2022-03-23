import { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../lib/prisma";

export default async (req: NextApiRequest, res: NextApiResponse) => {
   const url = decodeURIComponent((req.query as any).url);

   const check = await prisma.article.findFirst({ where: { cover: url } });
   if (!check)
      return res
         .status(401)
         .json({ message: "image not present in any article" });

   const result = await fetch(url);
   const body = await result.body;
   //@ts-ignore
   body?.pipe(res);
};
