-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Programming',
ADD COLUMN     "difficulty" TEXT NOT NULL DEFAULT 'Easy';
