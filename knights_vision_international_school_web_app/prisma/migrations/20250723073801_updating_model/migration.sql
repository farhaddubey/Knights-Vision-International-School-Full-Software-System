-- AddForeignKey
ALTER TABLE "SemesterExamSchedule" ADD CONSTRAINT "SemesterExamSchedule_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
