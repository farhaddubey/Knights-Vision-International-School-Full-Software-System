/*
  Warnings:

  - Added the required column `subjectId` to the `DailyHomeworkCompletion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DailyHomeworkCompletion" ADD COLUMN     "subjectId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "DailyHomeworkCompletion" ADD CONSTRAINT "DailyHomeworkCompletion_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "ClassSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
