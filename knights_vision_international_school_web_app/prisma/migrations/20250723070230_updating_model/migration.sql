/*
  Warnings:

  - The `studentCategory` column on the `Student` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `category` on the `AdmissionTestApplication` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `category` on the `FeeScheme` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AdmissionFeeSchemeCategory" AS ENUM ('SUPPORT_PLUS_KSAT', 'SUPPORT_KSAT', 'STANDARD_KSAT', 'GENERAL_KSAT', 'GENERAL_DIRECT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SectionName" ADD VALUE 'I';
ALTER TYPE "SectionName" ADD VALUE 'J';
ALTER TYPE "SectionName" ADD VALUE 'K';
ALTER TYPE "SectionName" ADD VALUE 'L';
ALTER TYPE "SectionName" ADD VALUE 'M';
ALTER TYPE "SectionName" ADD VALUE 'N';
ALTER TYPE "SectionName" ADD VALUE 'O';
ALTER TYPE "SectionName" ADD VALUE 'P';
ALTER TYPE "SectionName" ADD VALUE 'Q';
ALTER TYPE "SectionName" ADD VALUE 'R';
ALTER TYPE "SectionName" ADD VALUE 'S';
ALTER TYPE "SectionName" ADD VALUE 'T';
ALTER TYPE "SectionName" ADD VALUE 'U';
ALTER TYPE "SectionName" ADD VALUE 'V';
ALTER TYPE "SectionName" ADD VALUE 'W';
ALTER TYPE "SectionName" ADD VALUE 'X';
ALTER TYPE "SectionName" ADD VALUE 'Y';
ALTER TYPE "SectionName" ADD VALUE 'Z';

-- AlterTable
ALTER TABLE "AdmissionTestApplication" DROP COLUMN "category",
ADD COLUMN     "category" "AdmissionFeeSchemeCategory" NOT NULL;

-- AlterTable
ALTER TABLE "FeeScheme" DROP COLUMN "category",
ADD COLUMN     "category" "AdmissionFeeSchemeCategory" NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "studentCategory",
ADD COLUMN     "studentCategory" "AdmissionFeeSchemeCategory";

-- DropEnum
DROP TYPE "AdmissionCategory";

-- CreateIndex
CREATE UNIQUE INDEX "FeeScheme_classId_category_key" ON "FeeScheme"("classId", "category");

-- AddForeignKey
ALTER TABLE "KnightsCdtpSession" ADD CONSTRAINT "KnightsCdtpSession_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
