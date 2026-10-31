-- First-time student account activation uses a short-lived, one-time code.
-- Government identifiers are never used as login credentials.
ALTER TABLE "Student"
    ADD COLUMN "loginActivationCodeHash" VARCHAR(255),
    ADD COLUMN "loginActivationExpiresAt" TIMESTAMP(3),
    ADD COLUMN "loginActivatedAt" TIMESTAMP(3);
