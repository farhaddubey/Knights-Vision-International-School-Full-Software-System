import { randomUUID } from "crypto";
import prismaClientPackage from "@prisma/client";

const { PrismaClient } = prismaClientPackage;
const prisma = new PrismaClient();
const checkOnly = process.argv.includes("--check");
const requestedSchoolId = (() => {
  const option = process.argv.find((argument) => argument.startsWith("--school-id="));
  if (!option) return null;
  const parsed = Number(option.slice("--school-id=".length));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
})();

function normalizeCode(value, fallback) {
  const normalized = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);

  return normalized || fallback;
}

function organizationCode(school) {
  return normalizeCode(school.slug, `SSPS-ORG-${school.id}`);
}

function groupConfiguration() {
  return {
    code: normalizeCode(process.env.SSPS_ENTERPRISE_GROUP_CODE, "SURE-SUCCESS-POINT-SCHOOL-GROUP"),
    name: (process.env.SSPS_ENTERPRISE_GROUP_NAME || "Sure Success Point School Group").trim().slice(0, 200),
  };
}

async function loadSelectedSchools() {
  const schools = await prisma.school.findMany({
    where: requestedSchoolId ? { id: requestedSchoolId } : undefined,
    select: {
      id: true,
      name: true,
      slug: true,
      legalEntityName: true,
      branches: { select: { id: true, code: true, name: true } },
    },
    orderBy: { id: "asc" },
  });

  if (requestedSchoolId && schools.length === 0) {
    throw new Error(`School ${requestedSchoolId} was not found.`);
  }

  if (!requestedSchoolId && schools.length !== 1) {
    throw new Error(
      `Found ${schools.length} schools. Use --school-id=<id> to register one organization intentionally.`,
    );
  }

  return schools;
}

async function main() {
  const schools = await loadSelectedSchools();
  const schoolIds = schools.map((school) => school.id);
  const branchIds = schools.flatMap((school) => school.branches.map((branch) => branch.id));

  const [organizations, branchScopes, baselinePolicy] = await Promise.all([
    prisma.organizationProfile.findMany({
      where: { legacySchoolId: { in: schoolIds } },
      select: { id: true, legacySchoolId: true, groupId: true, code: true },
    }),
    prisma.enterpriseBranchScope.findMany({
      where: { branchId: { in: branchIds } },
      select: { branchId: true, organizationId: true, code: true },
    }),
    prisma.accessPolicyVersion.findUnique({
      where: { policyKey_version: { policyKey: "RBAC_CORE", version: 1 } },
      select: { id: true, status: true },
    }),
  ]);

  const registeredSchoolIds = new Set(organizations.map((organization) => organization.legacySchoolId));
  const registeredBranchIds = new Set(branchScopes.map((scope) => scope.branchId));
  const missingOrganizationSchoolIds = schoolIds.filter((schoolId) => !registeredSchoolIds.has(schoolId));
  const missingBranchIds = branchIds.filter((branchId) => !registeredBranchIds.has(branchId));

  if (checkOnly) {
    const ok = missingOrganizationSchoolIds.length === 0 && missingBranchIds.length === 0 && baselinePolicy?.status === "ACTIVE";
    console.log(JSON.stringify({
      ok,
      selectedSchoolIds: schoolIds,
      expectedBranches: branchIds.length,
      registeredOrganizations: organizations.length,
      registeredBranches: branchScopes.length,
      missingOrganizationSchoolIds,
      missingBranchIds,
      baselinePolicyStatus: baselinePolicy?.status ?? null,
      hint: ok ? null : "Run enterprise:scope:apply after reviewing this output.",
    }));
    process.exitCode = ok ? 0 : 1;
    return;
  }

  const group = groupConfiguration();
  await prisma.$transaction(async (tx) => {
    const schoolGroup = await tx.schoolGroup.upsert({
      where: { code: group.code },
      update: { name: group.name, status: "ACTIVE" },
      create: { publicId: randomUUID(), code: group.code, name: group.name, status: "ACTIVE" },
      select: { id: true },
    });

    for (const school of schools) {
      const organization = await tx.organizationProfile.upsert({
        where: { legacySchoolId: school.id },
        update: {
          groupId: schoolGroup.id,
          code: organizationCode(school),
          displayName: school.name.slice(0, 200),
          legalName: school.legalEntityName?.slice(0, 200) || null,
          status: "ACTIVE",
        },
        create: {
          publicId: randomUUID(),
          groupId: schoolGroup.id,
          legacySchoolId: school.id,
          code: organizationCode(school),
          displayName: school.name.slice(0, 200),
          legalName: school.legalEntityName?.slice(0, 200) || null,
          status: "ACTIVE",
        },
        select: { id: true },
      });

      for (const branch of school.branches) {
        const code = normalizeCode(branch.code, `BRANCH-${branch.id}`);
        await tx.enterpriseBranchScope.upsert({
          where: { branchId: branch.id },
          update: { organizationId: organization.id, code, status: "ACTIVE" },
          create: {
            publicId: randomUUID(),
            organizationId: organization.id,
            branchId: branch.id,
            code,
            status: "ACTIVE",
          },
        });
      }
    }

    await tx.accessPolicyVersion.upsert({
      where: { policyKey_version: { policyKey: "RBAC_CORE", version: 1 } },
      update: {
        status: "ACTIVE",
        description: "Baseline scoped RBAC policy for the compatibility rollout.",
        rules: {
          requiredOrder: ["authenticate", "panel", "permission", "scope", "workflow", "audit"],
          denyByDefault: true,
          panelBoundSessions: true,
        },
        effectiveFrom: new Date(),
        effectiveTo: null,
      },
      create: {
        policyKey: "RBAC_CORE",
        version: 1,
        status: "ACTIVE",
        description: "Baseline scoped RBAC policy for the compatibility rollout.",
        rules: {
          requiredOrder: ["authenticate", "panel", "permission", "scope", "workflow", "audit"],
          denyByDefault: true,
          panelBoundSessions: true,
        },
        effectiveFrom: new Date(),
      },
    });
  }, { maxWait: 10_000, timeout: 60_000 });

  console.log(JSON.stringify({
    applied: true,
    selectedSchoolIds: schoolIds,
    registeredOrganizations: schools.length,
    registeredBranches: branchIds.length,
    policy: "RBAC_CORE@1",
  }));
}

main()
  .catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
