-- Restores the fee-override entity expected by the legacy administration and
-- faculty panels. It was referenced by routes but never existed in the live
-- schema, causing those screens to fail at runtime.
CREATE TABLE "FeeOverride" (
    "id" SERIAL NOT NULL,
    "admissionId" INTEGER NOT NULL,
    "monthlyFee" DOUBLE PRECISION,
    "admissionFee" DOUBLE PRECISION,
    "readmissionFee" DOUBLE PRECISION,
    "reason" VARCHAR(300),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeOverride_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FeeOverride_admissionId_key" ON "FeeOverride"("admissionId");

ALTER TABLE "FeeOverride"
  ADD CONSTRAINT "FeeOverride_admissionId_fkey"
  FOREIGN KEY ("admissionId") REFERENCES "Admission"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
