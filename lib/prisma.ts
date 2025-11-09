import { PrismaClient } from "@prisma/client";

// Evite de créer plusieurs instances Prisma lors du hot reload de Next.js
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query", "info", "warn", "error"], // utile pour debug
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
