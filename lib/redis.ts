import IORedis, { Redis } from "ioredis";

export const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined;
  // eslint-disable-next-line no-var
  var __redisBlocking: Redis | undefined;
}

export const redis: Redis =
  global.__redis ?? new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

if (process.env.NODE_ENV !== "production") global.__redis = redis;

export function createBlockingConnection(): Redis {
  return new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
}

export const LEADERBOARD_KEY = (problemId: string) =>
  `leaderboard:problem:${problemId}`;
