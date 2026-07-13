import { Queue } from "bullmq";
import { redis } from "./redis";
import type { JudgeJobPayload } from "./submission";

export const JUDGE_QUEUE_NAME = "judge";

declare global {
  // eslint-disable-next-line no-var
  var __judgeQueue: Queue<JudgeJobPayload> | undefined;
}

// @ts-expect-error: bullmq and ioredis type mismatch
export const judgeQueue: Queue<JudgeJobPayload> =
  // @ts-expect-error: bullmq and ioredis type mismatch
  new Queue<JudgeJobPayload>(JUDGE_QUEUE_NAME, { connection: redis });

if (process.env.NODE_ENV !== "production") global.__judgeQueue = judgeQueue;
