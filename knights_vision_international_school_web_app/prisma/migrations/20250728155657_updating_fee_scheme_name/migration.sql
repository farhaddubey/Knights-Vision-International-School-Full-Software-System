/*
  Warnings:

  - You are about to alter the column `roomNumber` on the `SchoolClass` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(20)`.
  - You are about to alter the column `remarks` on the `StudentAssignment` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AssignmentQualityTag" ADD VALUE 'ILLEGIBLE_HANDWRITING';
ALTER TYPE "AssignmentQualityTag" ADD VALUE 'NO_STRUCTURE_OR_FORMAT';
ALTER TYPE "AssignmentQualityTag" ADD VALUE 'LACKS_VISUAL_ELEMENTS';
ALTER TYPE "AssignmentQualityTag" ADD VALUE 'COPY_PASTE_FROM_BOOK';
ALTER TYPE "AssignmentQualityTag" ADD VALUE 'VERY_SHORT_OR_INCOMPLETE';
ALTER TYPE "AssignmentQualityTag" ADD VALUE 'CREATIVELY_PRESENTED';
ALTER TYPE "AssignmentQualityTag" ADD VALUE 'TOO_MUCH_DECORATION';
ALTER TYPE "AssignmentQualityTag" ADD VALUE 'MISALIGNED_CONTENT';
ALTER TYPE "AssignmentQualityTag" ADD VALUE 'CLARITY_LACKING';
ALTER TYPE "AssignmentQualityTag" ADD VALUE 'IMPROPER_LANGUAGE';

-- AlterTable
ALTER TABLE "SchoolClass" ALTER COLUMN "roomNumber" DROP NOT NULL,
ALTER COLUMN "roomNumber" SET DATA TYPE VARCHAR(20);

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "govt_studentId" VARCHAR(20);

-- AlterTable
ALTER TABLE "StudentAssignment" ALTER COLUMN "remarks" SET DATA TYPE VARCHAR(100);
