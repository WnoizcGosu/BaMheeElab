import { judgeQueue } from "@/lib/queue";
import type { JudgeJobPayload } from "@/types/submission";
import { randomUUID } from "node:crypto";

const sampleRequests = [
    {
    problemId: "prob-001",
    language: "PYTHON" as const,
    sourceCode: "print('Hello World')",
    },
    {
    problemId: "prob-002",
    language: "C" as const,
    sourceCode: '#include <stdio.h>\nint main() { printf("Hello"); return 0; }',
    },
];

async function enqueueSamples() {
    for (const req of sampleRequests) {
    const submissionId = randomUUID();
    const payload: JudgeJobPayload = {
        submissionId,
        problemId: req.problemId,
        language: req.language,
        sourceCode: req.sourceCode,
        userId: "user-test",
    };
    
    await judgeQueue.add("judge", payload, {
      removeOnComplete: 100,
      removeOnFail: 100,
    });
    
    console.log(`✅ Enqueued submission: ${submissionId}`);
  }
}

enqueueSamples().catch(console.error);