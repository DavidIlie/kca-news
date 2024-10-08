import * as minio from "minio";

export const minioUrl = "cdn.kcanews.org";

export const minioClient = new minio.Client({
   endPoint: minioUrl,
   port: 443,
   useSSL: true,
   accessKey: process.env.MINIO_ACCESS_KEY,
   secretKey: process.env.MINIO_SECRET_KEY,
});

export type BucketItem = minio.BucketItemWithMetadata;

export const getObjects = async (bucket: string) => {
   const objectsList = await new Promise<Array<any>>((resolve, reject) => {
      const objectsListTemp = [] as Array<any>;
      const stream = minioClient.extensions.listObjectsV2WithMetadata(
         bucket,
         "",
         true,
         ""
      );

      stream.on("data", (obj) => objectsListTemp.push(obj));
      stream.on("error", reject);
      stream.on("end", () => {
         resolve(objectsListTemp);
      });
   });

   return objectsList;
};

export const getObjectsByMetadata = async (
   bucket: string,
   metadata: Object
) => {
   const data = await getObjects(bucket);

   const keys = Object.keys(metadata);
   const values = Object.values(metadata);
   let match = [] as minio.BucketItemWithMetadata[];

   data.forEach((object: minio.BucketItemWithMetadata) => {
      let found = false;
      keys.forEach((key, index) => {
         if (key in object.metadata && object.metadata[key] === values[index])
            found = true;
      });

      if (found) match.push(object);
   });

   return match;
};
