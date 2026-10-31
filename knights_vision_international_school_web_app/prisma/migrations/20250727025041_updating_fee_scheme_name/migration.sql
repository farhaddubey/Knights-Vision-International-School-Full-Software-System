/*
  Warnings:

  - The values [SUPPORT_PLUS_KSAT,SUPPORT_KSAT,STANDARD_KSAT,GENERAL_KSAT,GENERAL_DIRECT] on the enum `AdmissionFeeSchemeCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AdmissionFeeSchemeCategory_new" AS ENUM ('KSAT_SUPPORT_PLUS', 'KSAT_SUPPORT', 'KSAT_STANDARD', 'KSAT_GENERAL', 'DIRECT_GENERAL');
ALTER TABLE "AdmissionTestApplication" ALTER COLUMN "category" TYPE "AdmissionFeeSchemeCategory_new" USING ("category"::text::"AdmissionFeeSchemeCategory_new");
ALTER TABLE "FeeScheme" ALTER COLUMN "category" TYPE "AdmissionFeeSchemeCategory_new" USING ("category"::text::"AdmissionFeeSchemeCategory_new");
ALTER TABLE "Student" ALTER COLUMN "studentCategory" TYPE "AdmissionFeeSchemeCategory_new" USING ("studentCategory"::text::"AdmissionFeeSchemeCategory_new");
ALTER TYPE "AdmissionFeeSchemeCategory" RENAME TO "AdmissionFeeSchemeCategory_old";
ALTER TYPE "AdmissionFeeSchemeCategory_new" RENAME TO "AdmissionFeeSchemeCategory";
DROP TYPE "AdmissionFeeSchemeCategory_old";
COMMIT;
