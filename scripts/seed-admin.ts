import prisma from "../lib/db/prisma";

async function main() {
  await prisma.user.upsert({
    where: { email: "admin@local.dev" },
    update: { role: "ADMIN", name: "admin" },
    create: { email: "admin@local.dev", name: "admin", role: "ADMIN" },
  });
  console.log("OK - Prisma User seeded");
  process.exit(0);
}

main().catch(console.error);
