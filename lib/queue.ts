import { Queue } from "bullmq";
import { REDIS_URL } from "./redis";
import type { JudgeJobPayload } from "@/types/submission";

export const JUDGE_QUEUE_NAME = "judge";

declare global {
  // eslint-disable-next-line no-var
  var __judgeQueue: Queue<JudgeJobPayload> | undefined;
}

export const judgeQueue: Queue<JudgeJobPayload> =
  global.__judgeQueue ??
  new Queue<JudgeJobPayload>(JUDGE_QUEUE_NAME, { connection: { url: REDIS_URL } });

if (process.env.NODE_ENV !== "production") global.__judgeQueue = judgeQueue;
