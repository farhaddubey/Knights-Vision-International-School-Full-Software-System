-- Phase 3 workforce ledger. Existing staff and teaching-assignment tables are
-- preserved; this table mirrors them through scripts/sync-workforce-assignments.mjs.

CREATE TYPE "WorkforceAssignmentKind" AS ENUM ('ADMINISTRATIVE', 'TEACHER', 'CLASS_TEACHER', 'SUBJECT_TEACHER');
CREATE TYPE "WorkforceAssignmentSource" AS ENUM ('RBAC_ROLE', 'BRANCH_ROLE', 'CLASS_TEACHER', 'CLASS_SUBJECT', 'TEACHER_SUBJECT', 'LEGACY_USER', 'MANUAL');

CREATE TABLE "WorkforceAssignment" (
  "id" SERIAL NOT NULL,
  "publicId" UUID NOT NULL,
  "userId" INTEGER NOT NULL,
  "assignmentKind" "WorkforceAssignmentKind" NOT NULL,
  "roleCode" VARCHAR(100),
  "schoolId" INTEGER,
  "branchId" INTEGER,
  "departmentId" INTEGER,
  "classId" INTEGER,
  "subjectId" INTEGER,
  "classSubjectId" INTEGER,
  "source" "WorkforceAssignmentSource" NOT NULL,
  "sourceReference" VARCHAR(160) NOT NULL,
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "assignedById" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WorkforceAssignment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WorkforceAssignment_publicId_key" ON "WorkforceAssignment"("publicId");
CREATE UNIQUE INDEX "WorkforceAssignment_sourceReference_key" ON "WorkforceAssignment"("sourceReference");
CREATE INDEX "WorkforceAssignment_userId_isActive_idx" ON "WorkforceAssignment"("userId", "isActive");
CREATE INDEX "WorkforceAssignment_assignmentKind_isActive_idx" ON "WorkforceAssignment"("assignmentKind", "isActive");
CREATE INDEX "WorkforceAssignment_schoolId_branchId_classId_idx" ON "WorkforceAssignment"("schoolId", "branchId", "classId");
CREATE INDEX "WorkforceAssignment_classSubjectId_idx" ON "WorkforceAssignment"("classSubjectId");
CREATE INDEX "WorkforceAssignment_source_isActive_idx" ON "WorkforceAssignment"("source", "isActive");

ALTER TABLE "WorkforceAssignment"
  ADD CONSTRAINT "WorkforceAssignment_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
