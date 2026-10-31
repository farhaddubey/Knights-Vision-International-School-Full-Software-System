/*
  Warnings:

  - You are about to drop the column `appliesTo` on the `HolidayCalendar` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "HolidayCalendar_date_appliesTo_key";

-- AlterTable
ALTER TABLE "HolidayCalendar" DROP COLUMN "appliesTo";
