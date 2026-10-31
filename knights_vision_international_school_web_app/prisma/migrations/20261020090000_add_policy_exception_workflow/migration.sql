-- Central headquarters policy-exception workflow. This is additive: legacy
-- operational requests and existing school data remain unchanged.

CREATE TYPE "PolicyExceptionCategory" AS ENUM (
  'FINANCIAL',
  'ACADEMIC',
  'STAFF',
  'OPERATIONAL',
  'MARKETING',
  'COMMUNICATIONS',
  'EXECUTIVE'
);

CREATE TYPE "PolicyExceptionStatus" AS ENUM (
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'EXECUTION_VERIFIED',
  'CLOSED',
  'CANCELLED'
);

CREATE TABLE "PolicyException" (
  "id" SERIAL NOT NULL,
  "publicId" UUID NOT NULL DEFAULT gen_random_uuid(),
  "schoolId" INTEGER NOT NULL,
  "branchId" INTEGER,
  "classId" INTEGER,
  "academicYear" INTEGER,
  "category" "PolicyExceptionCategory" NOT NULL,
  "routedRoleCode" VARCHAR(100) NOT NULL,
  "title" VARCHAR(160) NOT NULL,
  "reason" TEXT NOT NULL,
  "requestedChange" JSONB NOT NULL,
  "supportingInformation" TEXT,
  "status" "PolicyExceptionStatus" NOT NULL DEFAULT 'SUBMITTED',
  "requestedById" INTEGER NOT NULL,
  "decidedById" INTEGER,
  "decisionNote" TEXT,
  "decidedAt" TIMESTAMP(3),
  "executionVerifiedById" INTEGER,
  "executionNote" TEXT,
  "executionVerifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PolicyException_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PolicyException_publicId_key" ON "PolicyException"("publicId");
CREATE INDEX "PolicyException_schoolId_branchId_classId_status_idx"
  ON "PolicyException"("schoolId", "branchId", "classId", "status");
CREATE INDEX "PolicyException_routedRoleCode_status_createdAt_idx"
  ON "PolicyException"("routedRoleCode", "status", "createdAt");
CREATE INDEX "PolicyException_requestedById_status_idx"
  ON "PolicyException"("requestedById", "status");

ALTER TABLE "PolicyException"
  ADD CONSTRAINT "PolicyException_schoolId_fkey"
  FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "PolicyException_branchId_fkey"
  FOREIGN KEY ("branchId") REFERENCES "SchoolBranch"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "PolicyException_classId_fkey"
  FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "PolicyException_requestedById_fkey"
  FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "PolicyException_decidedById_fkey"
  FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "PolicyException_executionVerifiedById_fkey"
  FOREIGN KEY ("executionVerifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "PolicyExceptionEvent" (
  "id" SERIAL NOT NULL,
  "policyExceptionId" INTEGER NOT NULL,
  "actorUserId" INTEGER,
  "action" VARCHAR(80) NOT NULL,
  "fromStatus" "PolicyExceptionStatus",
  "toStatus" "PolicyExceptionStatus",
  "note" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PolicyExceptionEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PolicyExceptionEvent_policyExceptionId_createdAt_idx"
  ON "PolicyExceptionEvent"("policyExceptionId", "createdAt");
CREATE INDEX "PolicyExceptionEvent_actorUserId_createdAt_idx"
  ON "PolicyExceptionEvent"("actorUserId", "createdAt");

ALTER TABLE "PolicyExceptionEvent"
  ADD CONSTRAINT "PolicyExceptionEvent_policyExceptionId_fkey"
  FOREIGN KEY ("policyExceptionId") REFERENCES "PolicyException"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "PolicyExceptionEvent_actorUserId_fkey"
  FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
