-- Provenance for the one-way Firebase student migration. The raw legacy payload is
-- isolated from existing Student API serialisation and linked with a unique source path.
CREATE TABLE "StudentLegacyFirebaseRecord" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "sourcePath" VARCHAR(200) NOT NULL,
    "sourceData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentLegacyFirebaseRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StudentLegacyFirebaseRecord_studentId_key"
    ON "StudentLegacyFirebaseRecord"("studentId");

CREATE UNIQUE INDEX "StudentLegacyFirebaseRecord_sourcePath_key"
    ON "StudentLegacyFirebaseRecord"("sourcePath");

ALTER TABLE "StudentLegacyFirebaseRecord"
    ADD CONSTRAINT "StudentLegacyFirebaseRecord_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "Student"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
