import "dotenv/config";
import prisma from '../lib/db/prisma';

async function main() {
  console.log('Finding duplicate problems...');

  const allProblems = await prisma.problem.findMany({
    include: {
      test_cases: true,
      submissions: true,
      leaderboard_entries: true
    }
  });

  const titlesMap = new Map<string, typeof allProblems>();

  for (const prob of allProblems) {
    if (!titlesMap.has(prob.title)) {
      titlesMap.set(prob.title, []);
    }
    titlesMap.get(prob.title)!.push(prob);
  }

  let deletedCount = 0;

  for (const [title, probs] of titlesMap.entries()) {
    if (probs.length > 1) {
      console.log(`Found ${probs.length} instances of "${title}". Keeping one...`);
      // Keep the first one, delete the others
      const toKeep = probs[0];
      const toDelete = probs.slice(1);

      for (const prob of toDelete) {
        // First delete associated test cases
        if (prob.test_cases.length > 0) {
           await prisma.testCase.deleteMany({
             where: { problem_id: prob.id }
           });
        }
        if (prob.submissions.length > 0) {
           // Delete test case results of submissions first
           await prisma.testCaseResult.deleteMany({
             where: { submission: { problem_id: prob.id } }
           });
           await prisma.submission.deleteMany({
             where: { problem_id: prob.id }
           });
        }
        if (prob.leaderboard_entries.length > 0) {
           await prisma.leaderboardEntry.deleteMany({
             where: { problem_id: prob.id }
           });
        }

        await prisma.problem.delete({
          where: { id: prob.id }
        });
        deletedCount++;
      }
    }
  }

  console.log(`Successfully removed ${deletedCount} duplicate problems.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
