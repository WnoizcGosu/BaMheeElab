import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

declare global {

  var __prisma: PrismaClient | undefined;
}

function build(): PrismaClient {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter, log: ["warn", "error"] });
}

export const prisma = global.__prisma ?? build();

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
