-- A faculty activation/recovery code is always stored as a bcrypt hash.  This
-- keeps the existing password intact until the code is successfully consumed.
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "passwordActivationCodeHash" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "passwordActivationExpiresAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "passwordActivatedAt" TIMESTAMP(3);
