-- CreateEnum
CREATE TYPE "HomeworkStatus" AS ENUM ('PENDING', 'SUBMITTED', 'LATE', 'MISSING', 'NEEDS_IMPROVEMENT', 'EXCELLENT');

-- CreateTable
CREATE TABLE "DailyHomeworkCompletion" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "status" "HomeworkStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyHomeworkCompletion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DailyHomeworkCompletion" ADD CONSTRAINT "DailyHomeworkCompletion_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyHomeworkCompletion" ADD CONSTRAINT "DailyHomeworkCompletion_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
