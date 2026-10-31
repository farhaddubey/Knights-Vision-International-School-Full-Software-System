/*
  Warnings:

  - Added the required column `branchId` to the `ImprovementSuggestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `classId` to the `ImprovementSuggestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `ImprovementSuggestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ImprovementSuggestion" ADD COLUMN     "branchId" INTEGER NOT NULL,
ADD COLUMN     "classId" INTEGER NOT NULL,
ADD COLUMN     "schoolId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ImprovementSuggestion" ADD CONSTRAINT "ImprovementSuggestion_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImprovementSuggestion" ADD CONSTRAINT "ImprovementSuggestion_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "SchoolBranch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImprovementSuggestion" ADD CONSTRAINT "ImprovementSuggestion_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
