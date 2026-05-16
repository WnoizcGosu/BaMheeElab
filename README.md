# BaMheeElab — Online Judge Platform

## Development

To start the development:

1. Install Docker
   - Mac/Linux: https://docs.docker.com/engine/install/
   - Windows: https://docs.docker.com/desktop/

2. Clone the repository and navigate to the project directory

```bash
git clone https://github.com/WnoizcGosu/BaMheeElab.git
cd BaMheeElab
```

3. Copy environment variables

```bash
cp .env.example .env
```

4. Start all services with Docker Compose

```bash
docker compose up -d
```

5. Install dependencies and run migrations

```bash
npm install
npx prisma migrate dev
```

6. Start the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Architecture

- **Frontend**: Next.js + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes + tRPC + JWT
- **Database**: PostgreSQL (Prisma ORM)
- **Queue**: BullMQ (Redis)
- **File Storage**: MinIO (S3-compatible)
- **Code Execution**: Judge0 API
- **Auth**: NextAuth.js (Auth.js v5)
- **Real-time**: Socket.IO / SSE

## Team

| Role | Responsibility |
|------|---------------|
| คนที่ 1 | Frontend + Authentication |
| คนที่ 2 | Admin System |
| คนที่ 3 | Code Submission + Editor |
| คนที่ 4 | Judge0 + Webhook |
| คนที่ 5 | Infrastructure + Database |