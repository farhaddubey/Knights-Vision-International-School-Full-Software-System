-- Daily syllabus plans are reusable academic templates. Completion belongs to
-- the school branch that actually delivered the lesson, not to the template.
CREATE TABLE "SyllabusScheduleBranchCompletion" (
    "id" SERIAL NOT NULL,
    "syllabusScheduleId" INTEGER NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyllabusScheduleBranchCompletion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SyllabusScheduleBranchCompletion_schedule_school_branch_key"
ON "SyllabusScheduleBranchCompletion"("syllabusScheduleId", "schoolId", "branchId");

CREATE INDEX "SyllabusScheduleBranchCompletion_school_branch_idx"
ON "SyllabusScheduleBranchCompletion"("schoolId", "branchId");

CREATE INDEX "SyllabusScheduleBranchCompletion_completedById_idx"
ON "SyllabusScheduleBranchCompletion"("completedById");

ALTER TABLE "SyllabusScheduleBranchCompletion"
ADD CONSTRAINT "SyllabusScheduleBranchCompletion_schedule_fkey"
FOREIGN KEY ("syllabusScheduleId") REFERENCES "SyllabusScheduleDailyPlan"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SyllabusScheduleBranchCompletion"
ADD CONSTRAINT "SyllabusScheduleBranchCompletion_completedBy_fkey"
FOREIGN KEY ("completedById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Preserve historical delivery status for the branch originally assigned to
-- each existing class-subject row. New reads use this branch table instead of
-- the legacy global isCompleted/completionDate fields.
INSERT INTO "SyllabusScheduleBranchCompletion" (
    "syllabusScheduleId", "schoolId", "branchId", "completedAt", "createdAt", "updatedAt"
)
SELECT
    plan."id",
    subject."schoolId",
    subject."branchId",
    COALESCE(plan."completionDate", plan."updatedAt", plan."createdAt", CURRENT_TIMESTAMP),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "SyllabusScheduleDailyPlan" AS plan
INNER JOIN "ClassSubject" AS subject ON subject."id" = plan."classSubjectId"
WHERE plan."isCompleted" = TRUE
ON CONFLICT ("syllabusScheduleId", "schoolId", "branchId") DO NOTHING;
