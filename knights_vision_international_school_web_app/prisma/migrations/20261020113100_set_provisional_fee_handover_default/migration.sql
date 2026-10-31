-- PostgreSQL makes a newly-added enum value available after the prior
-- migration commits, so the default change follows the enum extension.
ALTER TABLE "ProvisionalFeeCollection"
  ALTER COLUMN "status" SET DEFAULT 'PENDING_HANDOVER';
