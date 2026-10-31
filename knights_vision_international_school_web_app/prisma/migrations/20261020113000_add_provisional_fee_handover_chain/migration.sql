-- A GCI collection remains in the GCI's custody until the GCI declares it
-- handed over. COEF cannot create the final receipt before this evidence step.

ALTER TYPE "ProvisionalFeeCollectionStatus" ADD VALUE IF NOT EXISTS 'PENDING_HANDOVER';
ALTER TYPE "ProvisionalFeeCollectionStatus" ADD VALUE IF NOT EXISTS 'HANDED_OVER';

ALTER TABLE "ProvisionalFeeCollection"
  ADD COLUMN "handedOverById" INTEGER,
  ADD COLUMN "handedOverAt" TIMESTAMP(3),
  ADD COLUMN "handoverNote" VARCHAR(300);

ALTER TABLE "ProvisionalFeeCollection"
  ADD CONSTRAINT "ProvisionalFeeCollection_handedOverById_fkey"
  FOREIGN KEY ("handedOverById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "ProvisionalFeeCollection_handedOverById_status_idx"
  ON "ProvisionalFeeCollection"("handedOverById", "status");
