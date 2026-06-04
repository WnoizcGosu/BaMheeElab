# CLAUDE.md — Film

## My job

I own the code execution pipeline.
When a user submits code, I make sure it gets judged and the result comes back.

## What I need to build

- `worker/judge.worker.ts` — picks up jobs from BullMQ, sends to Judge0, saves result
- `app/api/judge/callback/route.ts` — Judge0 webhook endpoint
- `lib/socket.ts` — Socket.IO server (emit result back to user)
- `lib/minio.ts` — upload large output to MinIO
- `app/api/leaderboard/route.ts` — read leaderboard from Redis

## Tech I use

- BullMQ + Redis — job queue
- Judge0 CE (Docker) — code execution
- MinIO (Docker) — file storage
- Socket.IO — realtime result push

---

## Shared types (types/submission.ts)

These are agreed with Jun — do not change without telling Jun.

```typescript
export type Language = "PYTHON" | "C" | "CPP"

export type SubmissionStatus =
  | "PENDING" | "JUDGING" | "ACCEPTED"
  | "WRONG_ANSWER" | "TIME_LIMIT" | "MEMORY_LIMIT"
  | "RUNTIME_ERROR" | "COMPILE_ERROR"

// payload ที่จูนส่งมา POST /api/submissions
export interface SubmitRequest {
  problemId:  string
  language:   Language
  sourceCode: string
}

// response ที่จูนได้รับจาก POST
export interface SubmitResponse {
  submissionId: string
  status:       "PENDING"
}

// socket event ที่จูนฟัง — ฟิล์ม emit นี้
export interface SubmissionUpdateEvent {
  submissionId: string
  status:       SubmissionStatus
  score:        number        // 0–100
  runtime:      number | null // ms
  memory:       number | null // KB
}

// response จาก GET /api/submissions/:id
export interface SubmissionResult {
  id:          string
  status:      SubmissionStatus
  score:       number
  runtime:     number | null
  memory:      number | null
  language:    Language
  submittedAt: string
  resultUrl:   string | null
  results: {
    testCaseId:     string
    passed:         boolean
    runtime:        number | null
    memory:         number | null
    actualOutput:   string | null  // null ถ้า hidden
    expectedOutput: string | null  // null ถ้า hidden
    errorMessage:   string | null
  }[]
}
```

---

## APIs ที่ฟิล์มรับผิดชอบ

### JOB — queue: "judge" → worker (internal)

BullMQ job payload ที่ฟิล์มรับ:

```typescript
interface JudgeJobPayload {
  submissionId: string
  problemId:    string
  language:     Language
  sourceCode:   string   // plain text
  userId:       string
}
```

Worker flow:
```
1. update submission → JUDGING
2. emit SubmissionUpdateEvent { status: "JUDGING", score: 0, runtime: null, memory: null }
3. fetch Problem + TestCase[] (including hidden) from DB
4. submit all test cases to Judge0 in parallel
5. poll until all verdicts ready
6. map verdict → results[]
7. score = (passed / total) * 100
8. if any stdout > 10KB → upload MinIO → store resultUrl
9. update Submission DB (status, score, runtime, memory, results, resultUrl)
10. upsert LeaderboardEntry + Redis sorted set
11. emit SubmissionUpdateEvent { status, score, runtime, memory }
```

---

### POST /api/judge/callback (internal)

Judge0 POST กลับมาที่นี่เมื่อ judge เสร็จ

Request header:
```
X-Callback-Secret: {JUDGE0_CALLBACK_SECRET}
```

Request body (จาก Judge0):
```typescript
{
  token:          string
  status:         { id: number, description: string }
  stdout:         string | null
  stderr:         string | null
  compile_output: string | null
  time:           string | null  // "0.142" seconds
  memory:         number | null  // KB
}
```

Response: `200 OK` | `401 Bad secret`

---

### Socket.IO — io.to(userId).emit("submission:update")

ส่งผลกลับหา user ที่ submit เท่านั้น

```typescript
// emit JUDGING ก่อนเสมอ (ทันทีที่ worker รับ job)
io.to(userId).emit("submission:update", {
  submissionId, status: "JUDGING", score: 0, runtime: null, memory: null
})

// emit final หลัง DB update เสร็จ
io.to(userId).emit("submission:update", {
  submissionId, status, score, runtime, memory
})
```

---

## Judge0 reference

| Language | language_id |
|----------|-------------|
| PYTHON   | 71          |
| C        | 50          |
| CPP      | 54          |

| Judge0 status id | SubmissionStatus |
|-----------------|-----------------|
| 1, 2            | (still running) |
| 3               | ACCEPTED        |
| 4               | WRONG_ANSWER    |
| 5               | TIME_LIMIT      |
| 6               | COMPILE_ERROR   |
| 7–12            | RUNTIME_ERROR   |

---

## Environment variables

```env
REDIS_URL=redis://localhost:6379
JUDGE0_API_URL=http://localhost:2358
JUDGE0_CALLBACK_URL=https://xxxx.ngrok.io
JUDGE0_CALLBACK_SECRET=some-secret
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=submissions
```

## Run locally

```bash
docker-compose up -d
npx ngrok http 3000          # set URL as JUDGE0_CALLBACK_URL
npx ts-node worker/judge.worker.ts
```