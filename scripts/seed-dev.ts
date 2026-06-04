/**
 * Dev seed — idempotent. Ensures the rows the judge pipeline needs to test
 * against exist: one test user + two sample problems with test cases.
 *
 * Run: `npm run db:seed`
 */
import { prisma } from "@/lib/prisma";

async function main() {
  const user = await prisma.user.upsert({
    where: { id: "user-test" },
    create: {
      id: "user-test",
      email: "test@local",
      name: "Test User",
    },
    update: {},
  });

  await prisma.problem.upsert({
    where: { id: "p-1" },
    create: {
      id: "p-1",
      title: "A+B Problem",
      description: "Read two integers and print their sum.",
      time_limit: 1000,
      memory_limit: 256,
      created_by: user.id,
      test_cases: {
        create: [
          { id: "tc-1", filename: "tc-1.txt", input_content: "5 5", output_content: "10", is_public: true, order_index: 0 },
          { id: "tc-2", filename: "tc-2.txt", input_content: "5 15", output_content: "20", is_public: true, order_index: 1 },
          { id: "tc-3", filename: "tc-3.txt", input_content: "100 200", output_content: "300", is_public: false, order_index: 2 },
          { id: "tc-4", filename: "tc-4.txt", input_content: "-1 1", output_content: "0", is_public: false, order_index: 3 },
        ],
      },
    },
    update: {},
  });

  await prisma.problem.upsert({
    where: { id: "p-2" },
    create: {
      id: "p-2",
      title: "Echo",
      description: "Print the input line as-is.",
      time_limit: 1000,
      memory_limit: 256,
      created_by: user.id,
      test_cases: {
        create: [
          { id: "tc-e1", filename: "tc-e1.txt", input_content: "hello", output_content: "hello", is_public: true, order_index: 0 },
          { id: "tc-e2", filename: "tc-e2.txt", input_content: "world", output_content: "world", is_public: false, order_index: 1 },
        ],
      },
    },
    update: {},
  });

  console.log("[seed] done — user-test, p-1 (4 tcs), p-2 (2 tcs)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
