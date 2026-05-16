# BaMheeElab — Online Judge Platform

## Tech Stack

- **Frontend**: Next.js + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes + tRPC + JWT
- **Database**: PostgreSQL (Prisma ORM)
- **Queue**: BullMQ (Redis)
- **File Storage**: MinIO (S3-compatible)
- **Code Execution**: Judge0 API
- **Auth**: NextAuth.js (Auth.js v5)
- **Real-time**: Socket.IO / SSE

---

## Team

| คน | Role | Responsibility |
|----|------|---------------|
| อันดา | คนที่ 1 | Frontend + Authentication |
| กาย | คนที่ 2 | Admin System |
| จูน | คนที่ 3 | Code Submission + Editor |
| ฟิล์ม | คนที่ 4 | Judge0 + Webhook |
| ปอนด์ | คนที่ 5 | Infrastructure + Database |

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://docs.docker.com/desktop/) (Mac/Windows)
- [Node.js 20+](https://nodejs.org/)
- Git

---

### ครั้งแรก (ทำครั้งเดียว)

**1. Clone project**
```bash
git clone https://github.com/WnoizcGosu/BaMheeElab.git
cd BaMheeElab
```

**2. สลับไป branch develop**
```bash
git checkout develop
git pull origin develop
```

**3. แตก branch ของตัวเอง**
```bash
git checkout -b feature/ชื่องานตัวเอง
# ตัวอย่าง
# git checkout -b feature/frontend
# git checkout -b feature/admin-system
# git checkout -b feature/editor
# git checkout -b feature/judge
```

**4. ติดตั้ง dependencies**
```bash
npm install
```

**5. ตั้งค่า environment**
```bash
cp .env.example .env
```

**6. รัน Docker (เปิด Docker Desktop ก่อน)**
```bash
docker compose up -d
```

**7. Migrate database**
```bash
npx prisma migrate dev
```

**8. รันโปรเจกต์**
```bash
npm run dev
```

เปิด http://localhost:3000 ในเบราว์เซอร์ได้เลย

---

### ทุกวันก่อนเริ่มทำงาน

```bash
# ดึงโค้ดล่าสุดจาก develop
git checkout develop
git pull origin develop

# กลับไป branch ตัวเอง
git checkout feature/ชื่องานตัวเอง

# merge โค้ดล่าสุดเข้า branch ตัวเอง
git merge develop

# รันโปรเจกต์
npm run dev
```

---

### เมื่อทำงานเสร็จแล้ว

```bash
# เช็คไฟล์ที่แก้
git status

# เพิ่มไฟล์ทั้งหมด
git add .

# commit
git commit -m "feat: อธิบายสิ่งที่ทำ"

# push ขึ้น branch ตัวเอง
git push origin feature/ชื่องานตัวเอง
```

จากนั้นไปเปิด **Pull Request** บน GitHub เข้า `develop` แล้วแจ้งในกลุ่มครับ

---

### Branch Strategy

```
main        → production only (ห้าม push ตรง)
develop     → รวมโค้ดของทีม
feature/xxx → branch ของแต่ละคน
```

> ⚠️ ห้าม push ตรงเข้า `develop` หรือ `main` เด็ดขาด ทุกอย่างต้องผ่าน Pull Request เท่านั้น

---

## Environment Variables

คัดลอกไฟล์ `.env.example` แล้วแก้ค่าตามนี้:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `NEXTAUTH_SECRET` | Random secret string (รันคำสั่ง `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | URL ของเว็บ (local ใช้ `http://localhost:3000`) |
| `JUDGE0_API_URL` | Judge0 API endpoint |
| `MINIO_ENDPOINT` | MinIO host |
| `MINIO_ACCESS_KEY` | MinIO access key |
| `MINIO_SECRET_KEY` | MinIO secret key |

---

## Environment Variables

คัดลอกไฟล์ `.env.example` แล้วแก้ค่า:

```bash
cp .env.example .env
```

```env
# Database
DATABASE_URL="postgresql://admin:password@localhost:5432/bamheelab"

# Redis
REDIS_URL="redis://localhost:6379"

# MinIO
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"

# Auth
NEXTAUTH_SECRET="your-secret-here"  ← รันคำสั่ง: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Judge0
JUDGE0_API_URL="http://localhost:2358"
```

> ⚠️ `NEXTAUTH_SECRET` ต้องเปลี่ยนทุกคน รันคำสั่งนี้เพื่อสร้าง secret ของตัวเอง:
> ```bash
> openssl rand -base64 32
> ```

---

## Database

Schema ประกอบด้วยตารางหลัก:

- `User` — ผู้ใช้งาน (Student / Admin)
- `Problem` — โจทย์
- `TestCase` — ชุดทดสอบของแต่ละโจทย์
- `Submission` — การส่งโค้ด
- `TestCaseResult` — ผลของแต่ละ test case
- `LeaderboardEntry` — คะแนนสูงสุดของแต่ละ user ต่อโจทย์

---