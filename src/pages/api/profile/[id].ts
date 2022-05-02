import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

import prisma from "../../../lib/prisma";
import { updateProfileSchema } from "../../../schema/user";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
   try {
      const { id } = req.query;

      const session = await getSession({ req });

      if (id !== session?.id || !session?.user?.isAdmin)
         return res
            .status(401)
            .json({ message: "you don't have permission cheif" });

      const user = await prisma.user.findFirst({ where: { id: id as string } });

      if (!user) return res.status(404).json({ message: "user not found" });

      const body = await updateProfileSchema.validate(req.body);

      if (body.nameIndex > user.names.length)
         return res.status(400).json({ message: "name index is big" });

      const newUser = await prisma.user.update({
         where: { id: id as string },
         data: {
            nameIndex: body.nameIndex,
            extraName: body.extraName,
            description: body.description,
            showYear: body.showYear,
            nickname: body.nickname,
            status: body.status,
         },
      });

      return res.json({ user: newUser });
   } catch (error) {
      return res
         .status((error as any).status === 400 ? 400 : 500 || 500)
         .json({ message: (error as any).message || "unknown error" });
   }
};

export default handler;
