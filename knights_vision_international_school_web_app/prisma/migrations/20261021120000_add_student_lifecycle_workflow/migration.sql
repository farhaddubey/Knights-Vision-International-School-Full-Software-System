-- Student lifecycle foundation.  This is additive beside the legacy Student
-- current-class fields, so attendance, monthly-fee and existing panel records
-- remain intact while yearly enrolments become auditable.

CREATE TYPE "StudentEnrollmentStatus" AS ENUM (
  'PENDING_PAYMENT',
  'ACTIVE',
  'COMPLETED',
  'LEFT',
  'TRANSFER_REQUESTED',
  'TRANSFERRED'
);

CREATE TYPE "StudentEnrollmentDecision" AS ENUM (
  'NEW_ADMISSION',
  'PROMOTED',
  'REPEATED',
  'RETURNING'
);

CREATE TYPE "LifecycleFeeKind" AS ENUM (
  'MONTHLY_TUITION',
  'NEW_ADMISSION',
  'READMISSION'
);

CREATE TYPE "TransferCertificateRequestStatus" AS ENUM (
  'REQUESTED',
  'RETURNED_FOR_CLARIFICATION',
  'PRINCIPAL_APPROVED',
  'PRINCIPAL_REJECTED',
  'FINANCE_CLEARED',
  'FINANCE_PENDING_RECONCILIATION',
  'ISSUED',
  'CANCELLED'
);

CREATE TYPE "TransferCertificateReason" AS ENUM (
  'FAMILY_RELOCATION',
  'FINANCIAL_DIFFICULTIES',
  'ACADEMIC_CONCERNS',
  'STUDENT_BEHAVIOUR',
  'BULLYING_OR_SAFETY',
  'TEACHER_OR_STAFF_COMPLAINT',
  'SCHOOL_MANAGEMENT_CONCERN',
  'PERSONAL_REASONS',
  'OTHER'
);

ALTER TABLE "ProvisionalFeeCollection"
  ALTER COLUMN "monthlyFeeId" DROP NOT NULL,
  ADD COLUMN "paymentKind" "LifecycleFeeKind" NOT NULL DEFAULT 'MONTHLY_TUITION',
  ADD COLUMN "admissionId" INTEGER,
  ADD COLUMN "finalAdmissionFeeTransactionId" INTEGER;

CREATE UNIQUE INDEX "ProvisionalFeeCollection_finalAdmissionFeeTransactionId_key"
  ON "ProvisionalFeeCollection"("finalAdmissionFeeTransactionId");
CREATE INDEX "ProvisionalFeeCollection_admissionId_paymentKind_status_idx"
  ON "ProvisionalFeeCollection"("admissionId", "paymentKind", "status");

ALTER TABLE "ProvisionalFeeCollection"
  ADD CONSTRAINT "ProvisionalFeeCollection_admissionId_fkey"
  FOREIGN KEY ("admissionId") REFERENCES "Admission"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "ProvisionalFeeCollection_finalAdmissionFeeTransactionId_fkey"
  FOREIGN KEY ("finalAdmissionFeeTransactionId") REFERENCES "AdmissionFeeTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "StudentEnrollment" (
  "id" SERIAL NOT NULL,
  "publicId" UUID NOT NULL DEFAULT gen_random_uuid(),
  "studentId" INTEGER NOT NULL,
  "admissionId" INTEGER,
  "schoolId" INTEGER NOT NULL,
  "branchId" INTEGER NOT NULL,
  "classId" INTEGER NOT NULL,
  "academicYear" INTEGER NOT NULL,
  "status" "StudentEnrollmentStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
  "decision" "StudentEnrollmentDecision" NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "leavingDate" TIMESTAMP(3),
  "note" VARCHAR(500),
  "createdById" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentEnrollment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StudentEnrollment_publicId_key" ON "StudentEnrollment"("publicId");
CREATE UNIQUE INDEX "StudentEnrollment_admissionId_key" ON "StudentEnrollment"("admissionId");
CREATE UNIQUE INDEX "StudentEnrollment_studentId_academicYear_key" ON "StudentEnrollment"("studentId", "academicYear");
CREATE INDEX "StudentEnrollment_schoolId_branchId_classId_academicYear_status_idx"
  ON "StudentEnrollment"("schoolId", "branchId", "classId", "academicYear", "status");
CREATE INDEX "StudentEnrollment_createdById_createdAt_idx" ON "StudentEnrollment"("createdById", "createdAt");

ALTER TABLE "StudentEnrollment"
  ADD CONSTRAINT "StudentEnrollment_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "StudentEnrollment_admissionId_fkey"
  FOREIGN KEY ("admissionId") REFERENCES "Admission"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "StudentEnrollment_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "TransferCertificateRequest" (
  "id" SERIAL NOT NULL,
  "publicId" UUID NOT NULL DEFAULT gen_random_uuid(),
  "studentId" INTEGER NOT NULL,
  "schoolId" INTEGER NOT NULL,
  "branchId" INTEGER NOT NULL,
  "classId" INTEGER NOT NULL,
  "academicYear" INTEGER NOT NULL,
  "requestedTransferDate" TIMESTAMP(3) NOT NULL,
  "destinationSchoolName" VARCHAR(160),
  "destinationLocation" VARCHAR(160),
  "reason" "TransferCertificateReason" NOT NULL,
  "guardianRemarks" TEXT,
  "staffRemarks" TEXT,
  "sensitiveDetails" TEXT,
  "status" "TransferCertificateRequestStatus" NOT NULL DEFAULT 'REQUESTED',
  "requestedById" INTEGER NOT NULL,
  "principalDecisionById" INTEGER,
  "principalDecisionAt" TIMESTAMP(3),
  "principalRemarks" TEXT,
  "financeVerifiedById" INTEGER,
  "financeVerifiedAt" TIMESTAMP(3),
  "financeRemarks" TEXT,
  "financialSnapshot" JSONB,
  "issuedById" INTEGER,
  "issuedAt" TIMESTAMP(3),
  "tcNumber" VARCHAR(60),
  "documentReference" VARCHAR(300),
  "reissuedFromId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TransferCertificateRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TransferCertificateRequest_publicId_key" ON "TransferCertificateRequest"("publicId");
CREATE UNIQUE INDEX "TransferCertificateRequest_tcNumber_key" ON "TransferCertificateRequest"("tcNumber");
CREATE INDEX "TransferCertificateRequest_schoolId_branchId_classId_status_createdAt_idx"
  ON "TransferCertificateRequest"("schoolId", "branchId", "classId", "status", "createdAt");
CREATE INDEX "TransferCertificateRequest_studentId_createdAt_idx" ON "TransferCertificateRequest"("studentId", "createdAt");

ALTER TABLE "TransferCertificateRequest"
  ADD CONSTRAINT "TransferCertificateRequest_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "TransferCertificateRequest_requestedById_fkey"
  FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "TransferCertificateRequest_principalDecisionById_fkey"
  FOREIGN KEY ("principalDecisionById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "TransferCertificateRequest_financeVerifiedById_fkey"
  FOREIGN KEY ("financeVerifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "TransferCertificateRequest_issuedById_fkey"
  FOREIGN KEY ("issuedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "TransferCertificateFeedback" (
  "id" SERIAL NOT NULL,
  "requestId" INTEGER NOT NULL,
  "category" "TransferCertificateReason" NOT NULL,
  "explanation" TEXT NOT NULL,
  "isSensitive" BOOLEAN NOT NULL DEFAULT false,
  "recordedById" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TransferCertificateFeedback_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TransferCertificateFeedback_requestId_createdAt_idx"
  ON "TransferCertificateFeedback"("requestId", "createdAt");

ALTER TABLE "TransferCertificateFeedback"
  ADD CONSTRAINT "TransferCertificateFeedback_requestId_fkey"
  FOREIGN KEY ("requestId") REFERENCES "TransferCertificateRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "TransferCertificateFeedback_recordedById_fkey"
  FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
