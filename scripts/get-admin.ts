import prisma from '../lib/db/prisma';

async function main() {
  let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    const user = await prisma.user.findFirst();
    if (user) {
      admin = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' }
      });
      console.log(`Promoted existing user to admin: Email: ${admin.email}`);
    } else {
      console.log("No users found in the database. Please register an account on the website first.");
    }
  } else {
    console.log(`Found Admin: Email: ${admin.email}`);
  }
}
main().catch(console.error).finally(() => process.exit(0));
