# Compiling System — สรุป

สรุปทุกอย่างที่ทำใน branch `feature/Compiling-system`
ส่วนของฟิล์ม (judge pipeline) ตาม `CLAUDE.md`

---

## 1. ภาพรวม

```
                                       ┌──────────────┐
   POST /api/submissions  ─────────►   │   BullMQ     │   ─────►   judge.worker
   (Jun / test page)                   │   "judge"    │
                                       │  (Redis)     │
                                       └──────────────┘
                                                                       │
                                                                       ▼
                                              ┌────────────────────────────────┐
                                              │ Judge0  (สนามจริง)             │
                                              │ Mock-Judge0 (สำหรับ dev บน Mac) │
                                              └────────────────────────────────┘
                                                                       │
                                       Redis ZSET ◄──── score ◄────────┤
                                       MinIO  (output > 10KB) ◄────────┤
                                                                       │
   ┌──────────────────┐                                                ▼
   │ Browser (/test)  │ ◄──────  Socket.IO  ─────  emit("submission:update")
   └──────────────────┘                            (cross-process via Redis)
```

---

## 2. ไฟล์ที่สร้างทั้งหมด

### Types (สัญญากับจูน)
| ไฟล์ | ทำอะไร |
|------|--------|
| `types/submission.ts` | `Language`, `SubmissionStatus`, `SubmitRequest`, `SubmitResponse`, `SubmissionUpdateEvent`, `SubmissionResult`, `JudgeJobPayload` ตรงกับ CLAUDE.md |

### Helpers (lib/)
| ไฟล์ | ทำอะไร |
|------|--------|
| `lib/redis.ts` | client ioredis แชร์ทั้งโปรเจกต์ + `LEADERBOARD_KEY` |
| `lib/queue.ts` | BullMQ Queue `"judge"` |
| `lib/judge0.ts` | submit / poll / map status / language_id ของ Judge0 |
| `lib/socket.ts` | Socket.IO server (Redis adapter) + `emitSubmissionUpdate()` ที่ใช้ Redis emitter (worker เรียกได้โดยไม่ผูก HTTP port) |
| `lib/minio.ts` | `uploadLargeOutput()` + `shouldOffload()` (cutoff 10 KB) ใช้ AWS SDK ต่อกับ MinIO |
| `lib/db/judge-store.ts` | mock DB เก็บใน Redis (cross-process) สำหรับ Problem / Submission / Leaderboard |

### Worker
| ไฟล์ | ทำอะไร |
|------|--------|
| `worker/judge.worker.ts` | BullMQ worker ตามขั้นตอน 11 ข้อใน CLAUDE.md |

### API routes (Next.js App Router)
| ไฟล์ | route | method |
|------|-------|--------|
| `app/api/submissions/route.ts` | `POST /api/submissions` | สร้าง submission + enqueue |
| `app/api/submissions/[id]/route.ts` | `GET /api/submissions/:id` | คืน `SubmissionResult` |
| `app/api/judge/callback/route.ts` | `POST /api/judge/callback` | webhook จาก Judge0 |
| `app/api/leaderboard/route.ts` | `GET /api/leaderboard` | อ่าน Redis ZSET |

### Frontend ทดสอบ
| ไฟล์ | route |
|------|-------|
| `app/test/page.tsx` | `/test` — หน้า test ที่กดส่งโค้ดแล้วเห็นผล real-time |

### Scripts
| ไฟล์ | ใช้ตอนไหน |
|------|----------|
| `scripts/test-enqueue.ts` | CLI: ยัด job ใส่คิวเอง (แทน endpoint ของจูนก่อนที่จะเสร็จ) |
| `scripts/mock-judge0.ts` | Mock Judge0 server — รัน Python/C/C++ ผ่าน child_process แทน Judge0 ตัวจริง (สำหรับ macOS ที่ Judge0 sandbox ใช้ไม่ได้) |

### Infrastructure / config
| ไฟล์ | ทำอะไร |
|------|--------|
| `docker-compose.yml` | Redis (BullMQ) + MinIO + Judge0 stack (server/workers/db/redis) |
| `judge0.conf` | config ให้ Judge0 v1.13.1 |
| `.env.local` | env vars ของ dev เครื่องนี้ |
| `package.json` | scripts: `socket`, `worker`, `enqueue`, `enqueue:wrong`, `mock-judge0` |

---

## 3. API endpoints

### POST `/api/submissions` (stub ของจูน)

```http
POST /api/submissions
Content-Type: application/json

{
  "problemId":  "p-1",
  "language":   "PYTHON" | "C" | "CPP",
  "sourceCode": "a, b = map(int, input().split())\nprint(a + b)\n"
}
```

Response **201 Created**:
```json
{ "submissionId": "uuid", "status": "PENDING" }
```

Errors:
- `400` body ผิดรูป

> หมายเหตุ: `userId` hardcode `"user-test"` ไว้ก่อน เพราะยังไม่มี auth — จูนจะเปลี่ยนตอนเชื่อม session จริง

---

### GET `/api/submissions/:id`

Response **200**:
```json
{
  "id":          "uuid",
  "status":      "ACCEPTED",
  "score":       100,
  "runtime":     42,
  "memory":      8192,
  "language":    "PYTHON",
  "submittedAt": "2026-05-13T14:51:06.285Z",
  "resultUrl":   null,
  "results": [
    {
      "testCaseId":     "tc-1",
      "passed":         true,
      "runtime":        21,
      "memory":         8192,
      "actualOutput":   "10",
      "expectedOutput": "10",
      "errorMessage":   null
    },
    {
      "testCaseId":     "tc-3",
      "passed":         true,
      "runtime":        20,
      "memory":         8192,
      "actualOutput":   null,    // hidden
      "expectedOutput": null,    // hidden
      "errorMessage":   null
    }
  ]
}
```

`404` ถ้าหาไม่เจอ

---

### POST `/api/judge/callback`

Judge0 ยิงมาเมื่อ judge เสร็จ

```http
POST /api/judge/callback
X-Callback-Secret: dev-secret
Content-Type: application/json

{
  "token":          "...",
  "status":         { "id": 3, "description": "Accepted" },
  "stdout":         "...",
  "stderr":         null,
  "compile_output": null,
  "time":           "0.142",
  "memory":         1024
}
```

Response:
- `200 OK` — ปกติ
- `401 Bad secret` — header/query secret ไม่ตรง
- `400 Invalid JSON` / `Malformed callback`

> ปัจจุบัน worker ใช้ **polling** ไป Judge0 เป็นหลัก endpoint นี้ทำหน้าที่ ack อย่างเดียว ถ้าจะเปลี่ยนเป็น push อย่างเดียวค่อยขยายต่อ

---

### GET `/api/leaderboard?problemId=p-1&limit=10`

อ่านจาก Redis ZSET `leaderboard:problem:{problemId}` (เก็บ best score ของแต่ละ user)

Response **200**:
```json
{
  "problemId": "p-1",
  "entries": [
    { "rank": 1, "userId": "user-test", "score": 100 },
    { "rank": 2, "userId": "user-2",    "score": 75  }
  ]
}
```

---

## 4. Socket.IO

### Server side
```
SOCKET_PORT = 3001 (default)
```

### Client → Server
| event | payload | ทำอะไร |
|-------|---------|--------|
| `join` | `userId: string` | join room `userId` เพื่อรับ event ของตัวเอง |

### Server → Client
| event | payload | เมื่อไหร่ |
|-------|---------|----------|
| `joined` | `{ userId }` | ตอบกลับหลัง join |
| `submission:update` | `SubmissionUpdateEvent` | (1) ตอน worker รับ job → status `"JUDGING"` (2) ตอน judge เสร็จ → status สุดท้าย + score/runtime/memory |

```ts
interface SubmissionUpdateEvent {
  submissionId: string
  status:       SubmissionStatus
  score:        number        // 0–100
  runtime:      number | null // ms
  memory:       number | null // KB
}
```

Worker emit ผ่าน Redis pub/sub (`@socket.io/redis-emitter`) เลยรันคนละ process กับ socket server ได้

---

## 5. BullMQ Queue

Queue name: **`judge`** (Redis: `redis://localhost:6379`)

Job payload:
```ts
interface JudgeJobPayload {
  submissionId: string
  problemId:    string
  language:     Language
  sourceCode:   string
  userId:       string
}
```

Worker flow ภายใน `processJob()`:
1. `setSubmissionStatus(JUDGING)` + emit JUDGING event
2. โหลด problem + test case (รวม hidden)
3. ยิง Judge0 ทุก test case parallel (`Promise.all`)
4. รอ verdict ทุกตัวด้วย `waitForJudge0()`
5. map verdict → `results[]`
6. ถ้า stdout > 10KB → `uploadLargeOutput()` → `resultUrl`
7. คำนวณ status รวม + score = passed/total × 100 + max runtime/memory
8. `finalizeSubmission()` (Redis-backed mock store)
9. `upsertLeaderboardEntry()` + `ZADD GT` ลง Redis ZSET
10. emit final SubmissionUpdateEvent

---

## 6. Mock data ที่ seed ไว้

ใน `lib/db/judge-store.ts`:

| problemId | title | test cases |
|-----------|-------|------------|
| `p-1` | A+B Problem | `5 5→10`, `5 15→20`, `100 200→300` (hidden), `-1 1→0` (hidden) |
| `p-2` | Echo | `hello→hello`, `world→world` (hidden) |

Default user: `"user-test"`

---

## 7. การรัน (4–5 terminals)

```bash
# 1) Docker — Redis + MinIO ก็พอ (Judge0 จริงใช้ไม่ได้บนเครื่องนี้)
docker-compose up -d redis minio

# 2) Mock Judge0 (รัน Python/C/C++ จริงบนเครื่อง host)
npm run mock-judge0

# 3) Socket.IO server
npm run socket

# 4) Judge worker
npm run worker

# 5) Next.js
npm run dev
```

แล้วเปิด **`http://localhost:3000/test`**

หรือยิง CLI:
```bash
npm run enqueue            # PYTHON ถูก → ACCEPTED 100
npm run enqueue:wrong      # PYTHON ผิด → WRONG_ANSWER 0
```

---

## 8. หน้า `/test` มีอะไรบ้าง

```
┌──────────────────────────────────────────────────────────────────┐
│ Judge test page                socket: connected · user: user-test│
├──────────────────────────────────────────────────────────────────┤
│ [Problem ▼ A+B Problem]  [Language ▼ PYTHON]   [ Submit ]        │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ a, b = map(int, input().split())                           │  │
│ │ print(a + b)                                               │  │
│ │                                                            │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ submissionId: 199be879-...   [ ACCEPTED ]                        │
│ ┌─score─┐ ┌─runtime─┐ ┌─memory─┐                                 │
│ │  100  │ │  42 ms  │ │ 8192KB │                                 │
│ └───────┘ └─────────┘ └────────┘                                 │
│                                                                  │
│ test case │ verdict │ runtime │ memory │ expected │ actual │ ...│
│ tc-1      │ PASS    │ 21ms    │ 8192   │ 10       │ 10     │   │
│ tc-2      │ PASS    │ 23ms    │ 8192   │ 20       │ 20     │   │
│ tc-3      │ PASS    │ 20ms    │ 8192   │ hidden   │ hidden │   │
│ tc-4      │ PASS    │ 22ms    │ 8192   │ hidden   │ hidden │   │
│                                                                  │
│ Leaderboard — p-1                                       refresh │
│ #  user        score                                             │
│ 1  user-test   100                                               │
└──────────────────────────────────────────────────────────────────┘
```

ฟีเจอร์:
- เลือก problem / language → starter code เปลี่ยนตาม
- กด Submit → POST `/api/submissions` → ได้ submissionId
- socket รับ event แบบ live: badge เปลี่ยน `PENDING → JUDGING → ACCEPTED/WA/...`
- หลัง final verdict → fetch `/api/submissions/:id` แสดงตาราง test case (hidden ขึ้นคำว่า hidden)
- Leaderboard refresh auto + ปุ่ม refresh แมนนวล

---

## 9. ส่วนที่ยัง Mock อยู่

| ของจริง (production) | ตอนนี้ใช้ |
|----------------------|-----------|
| Postgres / Prisma | Redis-backed mock ใน `lib/db/judge-store.ts` |
| Judge0 sandbox | `scripts/mock-judge0.ts` (รัน host process ตรง ๆ — **ไม่ปลอดภัย** สำหรับ untrusted code) |
| Auth / session | hardcode `userId = "user-test"` |
| POST `/api/submissions` ของจูน | stub ใน `app/api/submissions/route.ts` |
| frontend ของจูน | `app/test/page.tsx` |

`function signature` ของ mock DB ทุกตัวออกแบบให้ตรงกับของจริง เปลี่ยน implementation ได้โดยไม่ต้องแตะ worker หรือ API route

---

## 10. Environment variables (`.env.local`)

```env
REDIS_URL=redis://localhost:6379

JUDGE0_API_URL=http://localhost:2358     # mock-judge0 หรือ Judge0 จริง
JUDGE0_CALLBACK_URL=                     # ปล่อยว่าง (worker ใช้ poll)
JUDGE0_CALLBACK_SECRET=dev-secret

MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=submissions

SOCKET_PORT=3001
JUDGE_WORKER_CONCURRENCY=4
```

---

## 11. Redis keys ที่ใช้

| key | type | ใช้ทำอะไร |
|-----|------|----------|
| `bull:judge:*` | BullMQ internal | job queue |
| `mock:submission:{id}` | string (JSON) | submission row |
| `mock:lb:{problemId}:{userId}` | string (JSON) | leaderboard entry |
| `mock:lb-index:{problemId}` | set | รายชื่อ userId ของแต่ละ problem |
| `leaderboard:problem:{problemId}` | zset | leaderboard ZSET ที่ API ใช้ |
| `socket.io#/#...` | pub/sub | Socket.IO redis-adapter / emitter |

ล้างทุก key (debug):
```bash
docker exec bam-redis redis-cli FLUSHALL
```
