import nextConnect from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next";
import fileUpload from "express-fileupload";
import { getSession } from "next-auth/react";
import { v4 } from "uuid";

import prisma from "../../../../lib/prisma";
import { expressFiles, uploadedFile } from "../../../../types/fileUpload";
import { minioClient, minioUrl } from "../../../../lib/minio";

const router = nextConnect({
   onNoMatch(req, res: NextApiResponse) {
      res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
   },
});

router.use(fileUpload());

router.post(async (req: NextApiRequest, res) => {
   try {
      const session = await getSession({ req });

      if (
         !session ||
         (session?.user?.isAdmin ? false : !session?.user?.isWriter)
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

      if (!article)
         return res.status(404).json({ message: "article not found" });

      const file = ((req as any).files as expressFiles)?.image as uploadedFile;

      if (!file) {
         return res.status(400).json({ message: "no file provided" });
      }

      if (!file.mimetype.startsWith("image")) {
         return res.status(400).json({ message: "only image is accepted" });
      }

      const name = `${v4()}.webp`;

      //   let compressedFile;
      //   try {
      //      compressedFile = await sharp(file.data)
      //         .webp({ quality: 75 })
      //         .toBuffer();
      //   } catch (error) {
      //      return res.status(500).json({ message: "failed to compress image" });
      //   }

      try {
         await minioClient.putObject("article-image", name, file.data, {
            article: article.id,
         });
      } catch (error) {
         return res.status(503).json({ message: "failed to upload image" });
      }

      return res
         .status(200)
         .json({ url: `https://${minioUrl}/article-image/${name}` });
   } catch (error: any) {
      return res.status(500).json({ message: error.message });
   }
});

export const config = {
   api: {
      bodyParser: false,
   },
};

export default router;
