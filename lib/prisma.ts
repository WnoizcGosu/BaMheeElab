import { PrismaClient } from "@prisma/client";
<<<<<<< HEAD

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.prisma ??
  new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
=======
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
>>>>>>> feature/compiling-system
