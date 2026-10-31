/*
  Warnings:

  - The values [MISSING] on the enum `HomeworkStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "HomeworkStatus_new" AS ENUM ('PENDING', 'SUBMITTED', 'LATE', 'NEEDS_IMPROVEMENT', 'EXCELLENT');
ALTER TABLE "DailyHomeworkCompletion" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "DailyHomeworkCompletion" ALTER COLUMN "status" TYPE "HomeworkStatus_new" USING ("status"::text::"HomeworkStatus_new");
ALTER TYPE "HomeworkStatus" RENAME TO "HomeworkStatus_old";
ALTER TYPE "HomeworkStatus_new" RENAME TO "HomeworkStatus";
DROP TYPE "HomeworkStatus_old";
ALTER TABLE "DailyHomeworkCompletion" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
