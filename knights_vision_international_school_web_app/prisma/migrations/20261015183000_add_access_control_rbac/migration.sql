-- Additive RBAC foundation for the school control panel.
-- No legacy authentication or application tables are modified.

CREATE TYPE "AccessScopeType" AS ENUM ('GLOBAL', 'SCHOOL', 'BRANCH', 'CLASS');

CREATE TABLE "AccessRole" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AccessRole_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AccessPermission" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(150) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AccessPermission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AccessRolePermission" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AccessRolePermission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserAccessRole" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "scopeType" "AccessScopeType" NOT NULL DEFAULT 'GLOBAL',
    "schoolId" INTEGER,
    "branchId" INTEGER,
    "classId" INTEGER,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UserAccessRole_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AccessAuditLog" (
    "id" SERIAL NOT NULL,
    "actorUserId" INTEGER,
    "targetUserId" INTEGER,
    "action" VARCHAR(150) NOT NULL,
    "resource" VARCHAR(100) NOT NULL,
    "resourceId" VARCHAR(100),
    "scopeType" "AccessScopeType",
    "schoolId" INTEGER,
    "branchId" INTEGER,
    "classId" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AccessAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AccessRole_code_key" ON "AccessRole"("code");
CREATE INDEX "AccessRole_isActive_idx" ON "AccessRole"("isActive");
CREATE UNIQUE INDEX "AccessPermission_code_key" ON "AccessPermission"("code");
CREATE INDEX "AccessPermission_category_idx" ON "AccessPermission"("category");
CREATE UNIQUE INDEX "AccessRolePermission_roleId_permissionId_key" ON "AccessRolePermission"("roleId", "permissionId");
CREATE INDEX "AccessRolePermission_permissionId_idx" ON "AccessRolePermission"("permissionId");
CREATE INDEX "UserAccessRole_userId_isActive_idx" ON "UserAccessRole"("userId", "isActive");
CREATE INDEX "UserAccessRole_roleId_idx" ON "UserAccessRole"("roleId");
CREATE INDEX "UserAccessRole_scopeType_schoolId_branchId_classId_idx" ON "UserAccessRole"("scopeType", "schoolId", "branchId", "classId");
CREATE INDEX "AccessAuditLog_actorUserId_createdAt_idx" ON "AccessAuditLog"("actorUserId", "createdAt");
CREATE INDEX "AccessAuditLog_targetUserId_createdAt_idx" ON "AccessAuditLog"("targetUserId", "createdAt");
CREATE INDEX "AccessAuditLog_resource_resourceId_idx" ON "AccessAuditLog"("resource", "resourceId");

ALTER TABLE "AccessRolePermission"
ADD CONSTRAINT "AccessRolePermission_roleId_fkey"
FOREIGN KEY ("roleId") REFERENCES "AccessRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AccessRolePermission"
ADD CONSTRAINT "AccessRolePermission_permissionId_fkey"
FOREIGN KEY ("permissionId") REFERENCES "AccessPermission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserAccessRole"
ADD CONSTRAINT "UserAccessRole_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserAccessRole"
ADD CONSTRAINT "UserAccessRole_roleId_fkey"
FOREIGN KEY ("roleId") REFERENCES "AccessRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
