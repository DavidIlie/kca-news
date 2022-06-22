import { PrismaClient as NonEdgePrismaClient } from "@prisma/client";
import { PrismaClient as EdgePrismaClient } from "@prisma/client/edge";
import type { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

declare global {
   var prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV === "production") {
   prisma = new EdgePrismaClient();
} else {
   if (!global.prisma) {
      global.prisma = new NonEdgePrismaClient();
   }
   prisma = global.prisma;
}
export default prisma;
