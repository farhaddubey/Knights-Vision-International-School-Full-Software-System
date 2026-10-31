/*
  Warnings:

  - A unique constraint covering the columns `[rollNumber,classId,branchId,schoolId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Student_rollNumber_classId_branchId_schoolId_key" ON "Student"("rollNumber", "classId", "branchId", "schoolId");
