import { PrismaClient as NonEdgePrismaClient } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

declare global {
   var prisma: PrismaClient | undefined;
}

if (!global.prisma) {
   global.prisma = new NonEdgePrismaClient();
}
prisma = global.prisma;

export default prisma;
