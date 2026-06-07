import prisma from "../lib/db/prisma";

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "admin@local.dev" },
    update: { role: "ADMIN", name: "admin" },
    create: { email: "admin@local.dev", name: "admin", role: "ADMIN" },
  });
  console.log("Seeded admin user:", user);
}

main().finally(() => prisma.$disconnect());
