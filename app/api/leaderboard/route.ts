/**
 * GET /api/leaderboard?problemId=p-1&limit=10
 *
 * Reads from the Redis sorted set `leaderboard:problem:{problemId}` that the
 * worker writes to (ZADD GT, so the score is the user's best). Returns the
 * top N entries with rank, userId, and score.
 */
import { NextResponse, type NextRequest } from "next/server";
import { redis, LEADERBOARD_KEY } from "@/lib/redis";

export const dynamic = "force-dynamic";

interface LeaderboardRow {
  rank: number;
  userId: string;
  score: number;
}

export async function GET(req: NextRequest) {
  const problemId = req.nextUrl.searchParams.get("problemId");
  if (!problemId) {
    return NextResponse.json(
      { error: "problemId is required" },
      { status: 400 }
    );
  }

  const limitParam = Number(req.nextUrl.searchParams.get("limit") ?? "10");
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(1, Math.floor(limitParam)), 100)
    : 10;

  // ZREVRANGE returns [member, score, member, score, ...] with WITHSCORES.
  const raw = await redis.zrevrange(
    LEADERBOARD_KEY(problemId),
    0,
    limit - 1,
    "WITHSCORES"
  );

  const rows: LeaderboardRow[] = [];
  for (let i = 0; i < raw.length; i += 2) {
    rows.push({
      rank: rows.length + 1,
      userId: raw[i],
      score: Number(raw[i + 1]),
    });
  }

  return NextResponse.json({ problemId, entries: rows });
}
