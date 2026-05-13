/**
 * Test driver — stands in for Jun's POST /api/submissions while it isn't ready.
 *
 * Seeds a submission row in the mock store, enqueues a JudgeJobPayload, and
 * prints the submissionId. Run the worker in another terminal:
 *
 *   npx tsx worker/judge.worker.ts
 *   npx tsx scripts/test-enqueue.ts             # default: PYTHON correct
 *   npx tsx scripts/test-enqueue.ts --wrong     # WA case
 *   npx tsx scripts/test-enqueue.ts --lang=CPP  # CPP source
 */
import { randomUUID } from "node:crypto";
import { judgeQueue } from "@/lib/queue";
import { createSubmission } from "@/lib/db/judge-store";
import type { JudgeJobPayload, Language } from "@/types/submission";

const args = new Set(process.argv.slice(2));
const langArg = process.argv
  .find((a) => a.startsWith("--lang="))
  ?.split("=")[1] as Language | undefined;

const language: Language = langArg ?? "PYTHON";
const problemId = "p-1"; // A+B from the mock store
const userId = "user-test";
const wrong = args.has("--wrong");

const sources: Record<Language, { correct: string; wrong: string }> = {
  PYTHON: {
    correct: `a, b = map(int, input().split())\nprint(a + b)\n`,
    wrong: `a, b = map(int, input().split())\nprint(a - b)\n`,
  },
  C: {
    correct: `#include <stdio.h>\nint main(){int a,b;scanf("%d %d",&a,&b);printf("%d\\n",a+b);return 0;}\n`,
    wrong: `#include <stdio.h>\nint main(){int a,b;scanf("%d %d",&a,&b);printf("%d\\n",a-b);return 0;}\n`,
  },
  CPP: {
    correct: `#include <iostream>\nint main(){int a,b;std::cin>>a>>b;std::cout<<a+b<<"\\n";}\n`,
    wrong: `#include <iostream>\nint main(){int a,b;std::cin>>a>>b;std::cout<<a-b<<"\\n";}\n`,
  },
};

async function main() {
  const submissionId = randomUUID();
  await createSubmission({
    id: submissionId,
    userId,
    problemId,
    language,
    sourceCode: wrong ? sources[language].wrong : sources[language].correct,
  });

  const payload: JudgeJobPayload = {
    submissionId,
    problemId,
    language,
    sourceCode: wrong ? sources[language].wrong : sources[language].correct,
    userId,
  };

  const job = await judgeQueue.add("judge", payload, {
    removeOnComplete: 100,
    removeOnFail: 100,
  });

  console.log(
    JSON.stringify(
      {
        enqueued: true,
        jobId: job.id,
        submissionId,
        userId,
        problemId,
        language,
        mode: wrong ? "wrong" : "correct",
      },
      null,
      2
    )
  );

  // close so the script exits cleanly
  await judgeQueue.close();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
