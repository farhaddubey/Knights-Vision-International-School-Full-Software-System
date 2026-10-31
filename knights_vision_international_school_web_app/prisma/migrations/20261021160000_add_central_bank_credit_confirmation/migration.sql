-- Central Administration records independent bank-credit evidence before a
-- COEF bank-submitted custody record is settled into the student ledger.
ALTER TABLE "ProvisionalFeeCollection"
  ADD COLUMN "centralBankCreditReference" VARCHAR(100),
  ADD COLUMN "centralBankCreditDate" TIMESTAMP(3);
