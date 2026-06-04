# ประกาศสำคัญ (By จูน)
- ไม่มีการใช้งาน feature/editor อีกต่อไป เนื่องจาก feature/problem มี Monaco Editor แล้ว

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
|-----|------|----------------|
| อันดา | คนที่ 1 | Frontend + Authentication |
| กาย | คนที่ 2 | Admin System |
| จูน | คนที่ 3 | Code Submission + Editor |
| ฟิล์ม | คนที่ 4 | Judge0 + Webhook |
| ปอนด์ | คนที่ 5 | Infrastructure + Database |

---

# Getting Started

## Prerequisites

- [Docker Desktop](https://docs.docker.com/desktop/)  
  *(ต้องติดตั้งและเปิดโปรแกรมไว้ก่อนรันคำสั่งอื่น)*
- [Node.js 20+](https://nodejs.org/)
- Git

---

# ครั้งแรก (ทำครั้งเดียว)

## 1. Clone Project

```bash
git clone https://github.com/WnoizcGosu/BaMheeElab.git
cd BaMheeElab
```

---

## 2. สลับไป branch develop และดึงโค้ดล่าสุด

```bash
git checkout develop
git pull origin develop
```

---

## 3. แตก branch ของตัวเองออกจาก develop

```bash
git checkout -b feature/ชื่องานตัวเอง
```

ตัวอย่าง:

```bash
git checkout -b feature/frontend
git checkout -b feature/admin-system
git checkout -b feature/editor
```

---

## 4. ดึงข้อมูล Branch Infra เพื่อให้ Git ในเครื่องมองเห็น

```bash
git checkout feature/infra
git checkout [ชื่อ branch ตัวเอง - กลับไปที่ branch ของตัวเอง]
```

*(สลับกลับมาที่ branch งานของตัวเองทันที)*

---

## 5. Merge ระบบฐานข้อมูล (Infra) เข้ากับ Branch ของตัวเอง

⚠️ **ข้อควรระวัง:**  
ตรวจสอบให้มั่นใจว่าตอนนี้อยู่บน Branch ของตัวเองแล้วก่อนรันคำสั่งนี้

```bash
git merge feature/infra
```

### หากเกิด Merge Conflict

เช่นในไฟล์:

- `package.json`
- `package-lock.json`

ให้:

1. เปิดไฟล์ที่ติดสีแดงใน VS Code
2. ลบข้อความ conflict

```txt
<<<<<<< HEAD
=======
>>>>>>>
```

3. เลือกเนื้อหาที่ถูกต้อง

จากนั้นรัน:

```bash
git add .
git commit -m "fix: resolve conflicts with feature/infra"
```

---

## 6. ติดตั้ง Dependencies

```bash
npm install
```

---

## 7. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ที่ root ของโปรเจกต์  
จากนั้น copy ค่าจากหัวข้อ **Environment Variables** ด้านล่างไปใส่

---

## 8. รัน Docker

⚠️ อย่าลืมเปิด Docker Desktop

```bash
docker compose up -d
```

---

## 9. Migrate Database

```bash
npx prisma migrate dev
```

---

## 10. รันโปรเจกต์

```bash
npm run dev
```

เปิด:

`http://localhost:3000`

---

# ทุกวันก่อนเริ่มทำงาน

## ดึงโค้ดล่าสุดจาก develop

```bash
git checkout develop
git pull origin develop
```

## กลับไป branch ตัวเอง

```bash
git checkout feature/ชื่องานตัวเอง
```

## Merge โค้ดล่าสุดเข้า branch ตัวเอง

```bash
git merge develop
```

หากมี conflict ให้แก้ตามขั้นตอนในข้อ 5

---

## รันโปรเจกต์

```bash
npm run dev
```

---

# เมื่อทำงานเสร็จแล้ว

## เช็คไฟล์ที่แก้

```bash
git status
```

## เพิ่มไฟล์ทั้งหมด

```bash
git add .
```

## Commit

```bash
git commit -m "feat: อธิบายสิ่งที่ทำ"
```

## Push ขึ้น branch ตัวเอง

```bash
git push origin feature/ชื่องานตัวเอง
```

จากนั้น:

- เปิด Pull Request บน GitHub
- ส่งจาก branch ของตัวเองเข้า `develop`
- แจ้งในกลุ่มทีมงาน

---

# Branch Strategy

```txt
main        → production only
develop     → รวมโค้ดหลักของทีมเพื่อรอตรวจ
feature/xxx → branch สำหรับพัฒนาฟีเจอร์แยกรายบุคคล
```

⚠️ **ห้าม push ตรงเข้า `develop` หรือ `main` เด็ดขาด**  
ทุกอย่างต้องผ่าน Pull Request เท่านั้น

---

# Environment Variables

สร้างไฟล์ `.env`

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
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Judge0
JUDGE0_API_URL="http://localhost:2358"

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

---

## Generate NEXTAUTH_SECRET

⚠️ ทุกคนต้อง generate ของตัวเอง

```bash
openssl rand -base64 32
```

นำค่าที่ได้ไปแทน

```env
NEXTAUTH_SECRET="..."
```

---

# Database Schema

## User
ข้อมูลผู้ใช้งานระบบ  
แบ่งสิทธิ์เป็น:

- Student
- Admin

---

## Problem
โจทย์และโจทย์ย่อยในระบบตรวจโค้ด

---

## TestCase
ไฟล์ Input / Output สำหรับทดสอบโค้ดของแต่ละโจทย์

---

## Submission
บันทึกประวัติการส่งโค้ดของผู้ใช้งาน

---

## TestCaseResult
ผลลัพธ์การตรวจแยกตามแต่ละ Test Case

---

## LeaderboardEntry
เก็บ:

- คะแนนสูงสุด
- เวลาที่ดีที่สุด

ของแต่ละ User ต่อโจทย์แต่ละข้อ
