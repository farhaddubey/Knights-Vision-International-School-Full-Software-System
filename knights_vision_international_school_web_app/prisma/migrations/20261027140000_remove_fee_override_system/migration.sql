-- Fee schemes are the single authorized source of monthly, admission, and
-- readmission pricing. The FeeOverride feature has no live records and is
-- intentionally removed rather than retained as an unused alternate path.
DROP TABLE IF EXISTS "FeeOverride";

DROP INDEX IF EXISTS "Admission_feeOverrideId_key";
DROP INDEX IF EXISTS "Admission_feeOverrideId_idx";
ALTER TABLE "Admission" DROP COLUMN IF EXISTS "feeOverrideId";
