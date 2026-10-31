/*
  Warnings:

  - Changed the type of `name` on the `SchoolClass` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `section` on the `SchoolClass` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SectionName" AS ENUM ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H');

-- CreateEnum
CREATE TYPE "ClassName" AS ENUM ('LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XS', 'XI', 'XII', 'XIIS', 'XIII', 'XIIIJ');

-- AlterTable
ALTER TABLE "SchoolClass" DROP COLUMN "name",
ADD COLUMN     "name" "ClassName" NOT NULL,
DROP COLUMN "section",
ADD COLUMN     "section" "SectionName" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SchoolClass_branchId_name_section_academicYear_key" ON "SchoolClass"("branchId", "name", "section", "academicYear");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolClass_schoolId_branchId_name_section_academicYear_key" ON "SchoolClass"("schoolId", "branchId", "name", "section", "academicYear");
