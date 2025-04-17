import { PrismaClient } from "@prisma/client";

declare global {
  let prisma: PrismaClient | undefined;
}

export const db = (globalThis as unknown as {prisma: PrismaClient}).prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  (globalThis as unknown as {prisma: PrismaClient}).prisma = db;
} 