-- GCI collections are deliberately isolated from the final MonthlyFee ledger.
-- A scoped COEF decision is required before a MonthlyFeePayment can be created.

CREATE TYPE "ProvisionalFeeCollectionStatus" AS ENUM (
  'PENDING_VERIFICATION',
  'VERIFIED',
  'REJECTED',
  'CANCELLED'
);

CREATE TABLE "ProvisionalFeeCollection" (
  "id" SERIAL NOT NULL,
  "publicId" UUID NOT NULL DEFAULT gen_random_uuid(),
  "monthlyFeeId" INTEGER NOT NULL,
  "schoolId" INTEGER NOT NULL,
  "branchId" INTEGER NOT NULL,
  "classId" INTEGER NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "method" "PaymentMethod" NOT NULL,
  "transactionId" VARCHAR(100),
  "idempotencyKey" VARCHAR(100) NOT NULL,
  "submittedRemarks" VARCHAR(300),
  "status" "ProvisionalFeeCollectionStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
  "collectorUserId" INTEGER NOT NULL,
  "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "verifiedById" INTEGER,
  "verifiedAt" TIMESTAMP(3),
  "verificationNote" VARCHAR(300),
  "finalPaymentId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProvisionalFeeCollection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProvisionalFeeCollection_publicId_key" ON "ProvisionalFeeCollection"("publicId");
CREATE UNIQUE INDEX "ProvisionalFeeCollection_idempotencyKey_key" ON "ProvisionalFeeCollection"("idempotencyKey");
CREATE UNIQUE INDEX "ProvisionalFeeCollection_finalPaymentId_key" ON "ProvisionalFeeCollection"("finalPaymentId");
CREATE INDEX "ProvisionalFeeCollection_schoolId_branchId_classId_status_createdAt_idx"
  ON "ProvisionalFeeCollection"("schoolId", "branchId", "classId", "status", "createdAt");
CREATE INDEX "ProvisionalFeeCollection_collectorUserId_status_createdAt_idx"
  ON "ProvisionalFeeCollection"("collectorUserId", "status", "createdAt");
CREATE INDEX "ProvisionalFeeCollection_monthlyFeeId_status_idx"
  ON "ProvisionalFeeCollection"("monthlyFeeId", "status");

ALTER TABLE "ProvisionalFeeCollection"
  ADD CONSTRAINT "ProvisionalFeeCollection_monthlyFeeId_fkey"
  FOREIGN KEY ("monthlyFeeId") REFERENCES "MonthlyFee"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "ProvisionalFeeCollection_collectorUserId_fkey"
  FOREIGN KEY ("collectorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "ProvisionalFeeCollection_verifiedById_fkey"
  FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "ProvisionalFeeCollection_finalPaymentId_fkey"
  FOREIGN KEY ("finalPaymentId") REFERENCES "MonthlyFeePayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
