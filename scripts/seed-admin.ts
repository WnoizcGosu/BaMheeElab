import prisma from "../lib/db/prisma";

async function main() {
<<<<<<< HEAD
  await prisma.user.upsert({
=======
  const user = await prisma.user.upsert({
>>>>>>> feature/Compiling-system
    where: { email: "admin@local.dev" },
    update: { role: "ADMIN", name: "admin" },
    create: { email: "admin@local.dev", name: "admin", role: "ADMIN" },
  });
<<<<<<< HEAD
  console.log("OK - Prisma User seeded");
  process.exit(0);
}

main().catch(console.error);
=======
  console.log("Seeded admin user:", user);
}

main().finally(() => prisma.$disconnect());
>>>>>>> feature/Compiling-system
