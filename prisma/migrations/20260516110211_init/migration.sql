-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('PYTHON', 'C', 'CPP');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'JUDGING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT', 'MEMORY_LIMIT', 'RUNTIME_ERROR', 'COMPILE_ERROR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Problem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "time_limit" INTEGER NOT NULL,
    "memory_limit" INTEGER NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestCase" (
    "id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "input_url" TEXT,
    "output_url" TEXT,
    "input_content" TEXT,
    "output_content" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "source_code" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "score" INTEGER NOT NULL DEFAULT 0,
    "runtime" INTEGER,
    "memory" INTEGER,
    "result_url" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "judged_at" TIMESTAMP(3),

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestCaseResult" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "test_case_id" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "status" "SubmissionStatus" NOT NULL,
    "runtime" INTEGER,
    "memory" INTEGER,
    "actual_output" TEXT,
    "actual_url" TEXT,
    "error_message" TEXT,
    "judge0_token" TEXT,

    CONSTRAINT "TestCaseResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardEntry" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "best_score" INTEGER NOT NULL DEFAULT 0,
    "best_runtime" INTEGER,
    "best_memory" INTEGER,
    "best_submission_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaderboardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Problem_created_by_idx" ON "Problem"("created_by");

-- CreateIndex
CREATE INDEX "TestCase_problem_id_order_index_idx" ON "TestCase"("problem_id", "order_index");

-- CreateIndex
CREATE INDEX "Submission_user_id_idx" ON "Submission"("user_id");

-- CreateIndex
CREATE INDEX "Submission_problem_id_idx" ON "Submission"("problem_id");

-- CreateIndex
CREATE INDEX "Submission_user_id_problem_id_idx" ON "Submission"("user_id", "problem_id");

-- CreateIndex
CREATE INDEX "Submission_problem_id_score_idx" ON "Submission"("problem_id", "score");

-- CreateIndex
CREATE INDEX "Submission_submitted_at_idx" ON "Submission"("submitted_at");

-- CreateIndex
CREATE INDEX "TestCaseResult_submission_id_idx" ON "TestCaseResult"("submission_id");

-- CreateIndex
CREATE UNIQUE INDEX "TestCaseResult_submission_id_test_case_id_key" ON "TestCaseResult"("submission_id", "test_case_id");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_problem_id_best_score_idx" ON "LeaderboardEntry"("problem_id", "best_score");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardEntry_user_id_problem_id_key" ON "LeaderboardEntry"("user_id", "problem_id");

-- AddForeignKey
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCaseResult" ADD CONSTRAINT "TestCaseResult_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCaseResult" ADD CONSTRAINT "TestCaseResult_test_case_id_fkey" FOREIGN KEY ("test_case_id") REFERENCES "TestCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_best_submission_id_fkey" FOREIGN KEY ("best_submission_id") REFERENCES "Submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
