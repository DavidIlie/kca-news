declare namespace NodeJS {
   interface ProcessEnv {
      NEXTAUTH_URL: string;
      DATABASE_URL: string;
      NEXTAUTH_SECRET: string;
      MINIO_ACCESS_KEY: string;
      MINIO_SECRET_KEY: string;
      NEXT_PUBLIC_APP_URL: string;
   }
}
