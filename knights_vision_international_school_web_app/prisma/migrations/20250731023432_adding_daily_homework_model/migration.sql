/*
  Warnings:

  - A unique constraint covering the columns `[studentId,subjectId,date]` on the table `DailyHomeworkCompletion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DailyHomeworkCompletion_studentId_subjectId_date_key" ON "DailyHomeworkCompletion"("studentId", "subjectId", "date");
