/*
  Warnings:

  - You are about to drop the `employee_night_shift_attendance_logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "employee_night_shift_attendance_logs" DROP CONSTRAINT "employee_night_shift_attendance_logs_user_id_fkey";

-- AlterTable
ALTER TABLE "employee_attendance_logs" ADD COLUMN     "base_salary_per_day" DECIMAL(10,2);

-- DropTable
DROP TABLE "employee_night_shift_attendance_logs";
