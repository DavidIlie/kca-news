import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

import { searchArticles } from "../../../lib/searchArticles";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
   try {
      const { q } = req.query;
      const session = await getSession({ req });
      return res.json({ articles: await searchArticles(q, session?.user) });
   } catch (error: any) {
      res.status(500).json({ message: error.message });
   }
};

export default handler;
