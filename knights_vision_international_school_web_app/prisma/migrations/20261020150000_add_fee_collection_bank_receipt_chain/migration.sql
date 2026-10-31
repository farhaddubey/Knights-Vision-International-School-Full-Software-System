ALTER TYPE "ProvisionalFeeCollectionStatus" ADD VALUE IF NOT EXISTS 'COEF_APPROVED';
ALTER TYPE "ProvisionalFeeCollectionStatus" ADD VALUE IF NOT EXISTS 'BANK_SUBMITTED';
ALTER TYPE "ProvisionalFeeCollectionStatus" ADD VALUE IF NOT EXISTS 'RECEIVED';

ALTER TABLE "ProvisionalFeeCollection"
  ADD COLUMN IF NOT EXISTS "bankSubmittedById" INTEGER,
  ADD COLUMN IF NOT EXISTS "bankSubmittedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "bankTransactionId" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "bankSubmissionNote" VARCHAR(300),
  ADD COLUMN IF NOT EXISTS "receivedById" INTEGER,
  ADD COLUMN IF NOT EXISTS "receivedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "receivedNote" VARCHAR(300);

ALTER TABLE "ProvisionalFeeCollection"
  ADD CONSTRAINT "ProvisionalFeeCollection_bankSubmittedById_fkey"
  FOREIGN KEY ("bankSubmittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProvisionalFeeCollection"
  ADD CONSTRAINT "ProvisionalFeeCollection_receivedById_fkey"
  FOREIGN KEY ("receivedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
