-- Additive private-note ledger for the consolidated Guardian & Student Care
-- workspace. Existing communication and PTM tables remain unchanged.

CREATE TYPE "GuardianSpecialNotePriority" AS ENUM ('NORMAL', 'HIGH', 'URGENT');

CREATE TABLE "GuardianStudentSpecialNote" (
  "id" SERIAL NOT NULL,
  "studentId" INTEGER NOT NULL,
  "classId" INTEGER NOT NULL,
  "schoolId" INTEGER NOT NULL,
  "branchId" INTEGER NOT NULL,
  "note" TEXT NOT NULL,
  "priority" "GuardianSpecialNotePriority" NOT NULL DEFAULT 'NORMAL',
  "isResolved" BOOLEAN NOT NULL DEFAULT false,
  "createdById" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedById" INTEGER,
  "resolvedAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GuardianStudentSpecialNote_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GuardianStudentSpecialNote_studentId_isResolved_createdAt_idx"
  ON "GuardianStudentSpecialNote"("studentId", "isResolved", "createdAt");
CREATE INDEX "GuardianStudentSpecialNote_schoolId_branchId_classId_priority_idx"
  ON "GuardianStudentSpecialNote"("schoolId", "branchId", "classId", "priority");

ALTER TABLE "GuardianStudentSpecialNote"
  ADD CONSTRAINT "GuardianStudentSpecialNote_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "GuardianStudentSpecialNote_classId_fkey"
  FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "GuardianStudentSpecialNote_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "GuardianStudentSpecialNote_resolvedById_fkey"
  FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
