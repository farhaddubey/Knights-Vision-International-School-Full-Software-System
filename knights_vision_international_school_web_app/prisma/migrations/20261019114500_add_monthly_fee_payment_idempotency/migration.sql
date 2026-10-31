-- Prevent a retry from posting the same payment reference twice against the
-- same monthly fee ledger row. PostgreSQL permits multiple NULL references.
CREATE UNIQUE INDEX "MonthlyFeePayment_monthlyFeeId_transactionId_key"
  ON "MonthlyFeePayment"("monthlyFeeId", "transactionId");
