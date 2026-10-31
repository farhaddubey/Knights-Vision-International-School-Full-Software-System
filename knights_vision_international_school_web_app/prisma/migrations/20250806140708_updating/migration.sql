/*
  Warnings:

  - You are about to drop the column `if_mid_verified` on the `employee_attendance_logs` table. All the data in the column will be lost.
  - You are about to drop the column `mid_verified_time` on the `employee_attendance_logs` table. All the data in the column will be lost.
  - You are about to drop the column `production_bonus_of_the_day` on the `employee_attendance_logs` table. All the data in the column will be lost.
  - You are about to drop the column `work_bonus_of_the_day` on the `employee_attendance_logs` table. All the data in the column will be lost.
  - You are about to drop the `payment_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payment_logs_employee_salary_links` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payment_logs_users_permissions_user_links` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "payment_logs" DROP CONSTRAINT "payment_logs_created_by_id_fk";

-- DropForeignKey
ALTER TABLE "payment_logs" DROP CONSTRAINT "payment_logs_updated_by_id_fk";

-- DropForeignKey
ALTER TABLE "payment_logs_employee_salary_links" DROP CONSTRAINT "payment_logs_employee_salary_links_fk";

-- DropForeignKey
ALTER TABLE "payment_logs_employee_salary_links" DROP CONSTRAINT "payment_logs_employee_salary_links_inv_fk";

-- DropForeignKey
ALTER TABLE "payment_logs_users_permissions_user_links" DROP CONSTRAINT "payment_logs_users_permissions_user_links_fk";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "base_salary_per_day" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "employee_attendance_logs" DROP COLUMN "if_mid_verified",
DROP COLUMN "mid_verified_time",
DROP COLUMN "production_bonus_of_the_day",
DROP COLUMN "work_bonus_of_the_day";

-- DropTable
DROP TABLE "payment_logs";

-- DropTable
DROP TABLE "payment_logs_employee_salary_links";

-- DropTable
DROP TABLE "payment_logs_users_permissions_user_links";
