-- Faculty-side evidence is intentionally isolated from generic media.  A
-- submission goes directly from the Faculty Panel to CEO/CTO Administration
-- verification; no fabricated intermediary approval stage exists.

CREATE TYPE "SchoolMediaEvidenceStatus" AS ENUM ('SUBMITTED', 'VERIFIED', 'REJECTED');
CREATE TYPE "SchoolMediaEvidenceReason" AS ENUM (
  'EVENT_DOCUMENTATION',
  'ACTIVITY_DOCUMENTATION',
  'STUDENT_ACHIEVEMENT',
  'FACILITY_MAINTENANCE',
  'SAFETY_INCIDENT',
  'ADMISSIONS_VERIFICATION',
  'COMPLIANCE_DOCUMENT',
  'NOTICE_OR_CIRCULAR',
  'OTHER_AUTHORISED'
);

CREATE TABLE "SchoolMediaEvidence" (
  "id" SERIAL NOT NULL,
  "fileId" INTEGER NOT NULL,
  "schoolId" INTEGER NOT NULL,
  "branchId" INTEGER NOT NULL,
  "reason" "SchoolMediaEvidenceReason" NOT NULL,
  "description" VARCHAR(1000) NOT NULL,
  "status" "SchoolMediaEvidenceStatus" NOT NULL DEFAULT 'SUBMITTED',
  "submittedById" INTEGER NOT NULL,
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedById" INTEGER,
  "reviewedAt" TIMESTAMP(3),
  "verificationNote" VARCHAR(1000),
  "deleteEligibleAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SchoolMediaEvidence_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SchoolMediaEvidence_fileId_key" ON "SchoolMediaEvidence"("fileId");
CREATE INDEX "SchoolMediaEvidence_schoolId_branchId_status_submittedAt_idx"
  ON "SchoolMediaEvidence"("schoolId", "branchId", "status", "submittedAt");
CREATE INDEX "SchoolMediaEvidence_submittedById_status_submittedAt_idx"
  ON "SchoolMediaEvidence"("submittedById", "status", "submittedAt");
CREATE INDEX "SchoolMediaEvidence_status_deleteEligibleAt_idx"
  ON "SchoolMediaEvidence"("status", "deleteEligibleAt");

ALTER TABLE "SchoolMediaEvidence"
  ADD CONSTRAINT "SchoolMediaEvidence_fileId_fkey"
    FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "SchoolMediaEvidence_schoolId_fkey"
    FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "SchoolMediaEvidence_branchId_fkey"
    FOREIGN KEY ("branchId") REFERENCES "SchoolBranch"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "SchoolMediaEvidence_submittedById_fkey"
    FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "SchoolMediaEvidence_reviewedById_fkey"
    FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
