-- Phase 2 enterprise foundation. This migration is additive: it does not
-- rename, delete, or copy legacy School, SchoolBranch, SchoolClass, User, or
-- RBAC records.

CREATE TYPE "EnterpriseScopeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');
CREATE TYPE "PermissionRiskLevel" AS ENUM ('STANDARD', 'HIGH', 'CRITICAL');
CREATE TYPE "AccessPolicyStatus" AS ENUM ('DRAFT', 'ACTIVE', 'RETIRED');
CREATE TYPE "EnterpriseAuditOutcome" AS ENUM ('SUCCESS', 'DENIED', 'FAILED');

ALTER TABLE "AccessPermission"
  ADD COLUMN "policyVersion" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "riskLevel" "PermissionRiskLevel" NOT NULL DEFAULT 'STANDARD';

CREATE TABLE "SchoolGroup" (
  "id" SERIAL NOT NULL,
  "publicId" UUID NOT NULL,
  "code" VARCHAR(100) NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "status" "EnterpriseScopeStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SchoolGroup_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrganizationProfile" (
  "id" SERIAL NOT NULL,
  "publicId" UUID NOT NULL,
  "groupId" INTEGER,
  "legacySchoolId" INTEGER NOT NULL,
  "code" VARCHAR(100) NOT NULL,
  "displayName" VARCHAR(200) NOT NULL,
  "legalName" VARCHAR(200),
  "status" "EnterpriseScopeStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrganizationProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrganizationRegion" (
  "id" SERIAL NOT NULL,
  "publicId" UUID NOT NULL,
  "organizationId" INTEGER NOT NULL,
  "code" VARCHAR(100) NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "status" "EnterpriseScopeStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrganizationRegion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EnterpriseBranchScope" (
  "id" SERIAL NOT NULL,
  "publicId" UUID NOT NULL,
  "organizationId" INTEGER NOT NULL,
  "regionId" INTEGER,
  "branchId" INTEGER NOT NULL,
  "code" VARCHAR(100) NOT NULL,
  "status" "EnterpriseScopeStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EnterpriseBranchScope_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AccessPolicyVersion" (
  "id" SERIAL NOT NULL,
  "policyKey" VARCHAR(100) NOT NULL,
  "version" INTEGER NOT NULL,
  "status" "AccessPolicyStatus" NOT NULL DEFAULT 'DRAFT',
  "description" TEXT,
  "rules" JSONB,
  "effectiveFrom" TIMESTAMP(3),
  "effectiveTo" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AccessPolicyVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EnterpriseAuditEvent" (
  "id" BIGSERIAL NOT NULL,
  "publicId" UUID NOT NULL,
  "actorUserId" INTEGER,
  "action" VARCHAR(150) NOT NULL,
  "resource" VARCHAR(100) NOT NULL,
  "resourceId" VARCHAR(100),
  "outcome" "EnterpriseAuditOutcome" NOT NULL DEFAULT 'SUCCESS',
  "correlationId" VARCHAR(100),
  "scopeType" "AccessScopeType",
  "schoolId" INTEGER,
  "branchId" INTEGER,
  "classId" INTEGER,
  "beforeData" JSONB,
  "afterData" JSONB,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EnterpriseAuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SchoolGroup_publicId_key" ON "SchoolGroup"("publicId");
CREATE UNIQUE INDEX "SchoolGroup_code_key" ON "SchoolGroup"("code");
CREATE INDEX "SchoolGroup_status_idx" ON "SchoolGroup"("status");
CREATE UNIQUE INDEX "OrganizationProfile_publicId_key" ON "OrganizationProfile"("publicId");
CREATE UNIQUE INDEX "OrganizationProfile_legacySchoolId_key" ON "OrganizationProfile"("legacySchoolId");
CREATE UNIQUE INDEX "OrganizationProfile_code_key" ON "OrganizationProfile"("code");
CREATE INDEX "OrganizationProfile_groupId_status_idx" ON "OrganizationProfile"("groupId", "status");
CREATE UNIQUE INDEX "OrganizationRegion_publicId_key" ON "OrganizationRegion"("publicId");
CREATE UNIQUE INDEX "OrganizationRegion_organizationId_code_key" ON "OrganizationRegion"("organizationId", "code");
CREATE INDEX "OrganizationRegion_organizationId_status_idx" ON "OrganizationRegion"("organizationId", "status");
CREATE UNIQUE INDEX "EnterpriseBranchScope_publicId_key" ON "EnterpriseBranchScope"("publicId");
CREATE UNIQUE INDEX "EnterpriseBranchScope_branchId_key" ON "EnterpriseBranchScope"("branchId");
CREATE UNIQUE INDEX "EnterpriseBranchScope_organizationId_code_key" ON "EnterpriseBranchScope"("organizationId", "code");
CREATE INDEX "EnterpriseBranchScope_regionId_status_idx" ON "EnterpriseBranchScope"("regionId", "status");
CREATE UNIQUE INDEX "AccessPolicyVersion_policyKey_version_key" ON "AccessPolicyVersion"("policyKey", "version");
CREATE INDEX "AccessPolicyVersion_policyKey_status_idx" ON "AccessPolicyVersion"("policyKey", "status");
CREATE UNIQUE INDEX "EnterpriseAuditEvent_publicId_key" ON "EnterpriseAuditEvent"("publicId");
CREATE INDEX "EnterpriseAuditEvent_actorUserId_createdAt_idx" ON "EnterpriseAuditEvent"("actorUserId", "createdAt");
CREATE INDEX "EnterpriseAuditEvent_resource_resourceId_idx" ON "EnterpriseAuditEvent"("resource", "resourceId");
CREATE INDEX "EnterpriseAuditEvent_correlationId_idx" ON "EnterpriseAuditEvent"("correlationId");
CREATE INDEX "EnterpriseAuditEvent_scopeType_schoolId_branchId_classId_idx" ON "EnterpriseAuditEvent"("scopeType", "schoolId", "branchId", "classId");

ALTER TABLE "OrganizationProfile"
  ADD CONSTRAINT "OrganizationProfile_groupId_fkey"
  FOREIGN KEY ("groupId") REFERENCES "SchoolGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrganizationProfile"
  ADD CONSTRAINT "OrganizationProfile_legacySchoolId_fkey"
  FOREIGN KEY ("legacySchoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrganizationRegion"
  ADD CONSTRAINT "OrganizationRegion_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "OrganizationProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EnterpriseBranchScope"
  ADD CONSTRAINT "EnterpriseBranchScope_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "OrganizationProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EnterpriseBranchScope"
  ADD CONSTRAINT "EnterpriseBranchScope_regionId_fkey"
  FOREIGN KEY ("regionId") REFERENCES "OrganizationRegion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EnterpriseBranchScope"
  ADD CONSTRAINT "EnterpriseBranchScope_branchId_fkey"
  FOREIGN KEY ("branchId") REFERENCES "SchoolBranch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
