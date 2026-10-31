-- Government-issued TC identifiers are required at final issue time. Existing
-- historical certificates remain valid with a NULL value until reissued.
ALTER TABLE "TransferCertificateRequest"
  ADD COLUMN "governmentTcId" VARCHAR(100);

CREATE UNIQUE INDEX "TransferCertificateRequest_governmentTcId_key"
  ON "TransferCertificateRequest"("governmentTcId");
