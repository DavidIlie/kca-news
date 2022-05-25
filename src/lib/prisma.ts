import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

declare global {
   var prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV === "production") {
   prisma = new PrismaClient();
} else {
   if (!global.prisma) {
      global.prisma = new PrismaClient();
   }
   prisma = global.prisma;
}
export default prisma;

export function excludeFields<T, K extends keyof T>(fields: T, omit: K[]) {
   const result: Partial<Record<keyof T, boolean>> = {};
   for (const key in fields) {
     if (!omit.includes(key as any)) {
       result[key] = true;
     }
   }
   return result;
 }