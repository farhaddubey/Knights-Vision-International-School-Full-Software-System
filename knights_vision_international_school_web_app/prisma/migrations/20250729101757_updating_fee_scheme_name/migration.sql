/*
  Warnings:

  - A unique constraint covering the columns `[classSubjectId,assignmentNumber]` on the table `Assignment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "assignmentNumber" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_classSubjectId_assignmentNumber_key" ON "Assignment"("classSubjectId", "assignmentNumber");
