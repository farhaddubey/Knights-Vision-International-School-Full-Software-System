-- Scoped school operations replace the inherited unscoped legal-services routes.
-- Existing legacy Complaint records are intentionally preserved and are not
-- exposed through the school operational API.

CREATE TYPE "SchoolIssueStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED', 'CLOSED');
CREATE TYPE "OperationalRequestStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'ON_HOLD', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "OperationalRequestPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

CREATE TABLE "SchoolConcern" (
  "id" SERIAL NOT NULL,
  "publicId" UUID NOT NULL DEFAULT gen_random_uuid(),
  "studentId" INTEGER NOT NULL,
  "classId" INTEGER NOT NULL,
  "branchId" INTEGER NOT NULL,
  "schoolId" INTEGER NOT NULL,
  "category" "SuggestionCategory" NOT NULL,
  "description" VARCHAR(1000) NOT NULL,
  "status" "SchoolIssueStatus" NOT NULL DEFAULT 'OPEN',
  "resolution" VARCHAR(1000),
  "submittedBy" "SuggestionSubmittedBy" NOT NULL DEFAULT 'GUARDIAN',
  "handledById" INTEGER,
  "handledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SchoolConcern_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SchoolConcern_publicId_key" ON "SchoolConcern"("publicId");
CREATE INDEX "SchoolConcern_schoolId_branchId_classId_status_idx"
  ON "SchoolConcern"("schoolId", "branchId", "classId", "status");
CREATE INDEX "SchoolConcern_studentId_createdAt_idx" ON "SchoolConcern"("studentId", "createdAt");
CREATE INDEX "SchoolConcern_handledById_idx" ON "SchoolConcern"("handledById");

ALTER TABLE "SchoolConcern"
  ADD CONSTRAINT "SchoolConcern_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "SchoolConcern_classId_fkey"
  FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "SchoolConcern_branchId_fkey"
  FOREIGN KEY ("branchId") REFERENCES "SchoolBranch"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "SchoolConcern_schoolId_fkey"
  FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "SchoolConcern_handledById_fkey"
  FOREIGN KEY ("handledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "OperationalRequest" (
  "id" SERIAL NOT NULL,
  "publicId" UUID NOT NULL DEFAULT gen_random_uuid(),
  "schoolId" INTEGER NOT NULL,
  "branchId" INTEGER,
  "title" VARCHAR(160) NOT NULL,
  "description" TEXT,
  "category" VARCHAR(100) NOT NULL,
  "status" "OperationalRequestStatus" NOT NULL DEFAULT 'PENDING',
  "priority" "OperationalRequestPriority" NOT NULL DEFAULT 'NORMAL',
  "requestedById" INTEGER NOT NULL,
  "assignedToId" INTEGER,
  "approvedById" INTEGER,
  "decisionNote" VARCHAR(1000),
  "decidedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OperationalRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OperationalRequest_publicId_key" ON "OperationalRequest"("publicId");
CREATE INDEX "OperationalRequest_schoolId_branchId_status_idx" ON "OperationalRequest"("schoolId", "branchId", "status");
CREATE INDEX "OperationalRequest_requestedById_status_idx" ON "OperationalRequest"("requestedById", "status");
CREATE INDEX "OperationalRequest_assignedToId_status_idx" ON "OperationalRequest"("assignedToId", "status");

ALTER TABLE "OperationalRequest"
  ADD CONSTRAINT "OperationalRequest_schoolId_fkey"
  FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "OperationalRequest_branchId_fkey"
  FOREIGN KEY ("branchId") REFERENCES "SchoolBranch"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "OperationalRequest_requestedById_fkey"
  FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "OperationalRequest_assignedToId_fkey"
  FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "OperationalRequest_approvedById_fkey"
  FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
