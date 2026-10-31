import prismaClientPackage from "@prisma/client";

const { PrismaClient } = prismaClientPackage;
const prisma = new PrismaClient();
const checkOnly = process.argv.includes("--check");

const critical = new Set([
  "rbac.manage",
  "student_account.manage",
  "fee.manage",
  "exam.manage",
  "user.manage",
  "staff.manage",
]);
const high = new Set([
  "school.manage",
  "branch.manage",
  "student.manage",
  "admission.manage",
  "attendance.manage",
  "homework.manage",
  "notice.manage",
  "guardian_communication.manage",
  "operations.manage",
  "transport.manage",
  "media.manage",
  "website.manage",
]);

function expectedRiskLevel(code) {
  if (critical.has(code)) return "CRITICAL";
  if (high.has(code)) return "HIGH";
  return "STANDARD";
}

async function main() {
  const permissions = await prisma.accessPermission.findMany({
    select: { id: true, code: true, riskLevel: true, policyVersion: true },
    orderBy: { code: "asc" },
  });
  const changes = permissions.filter((permission) =>
    permission.riskLevel !== expectedRiskLevel(permission.code) || permission.policyVersion !== 1,
  );

  if (checkOnly) {
    console.log(JSON.stringify({
      ok: changes.length === 0,
      totalPermissions: permissions.length,
      pendingUpdates: changes.map(({ code, riskLevel, policyVersion }) => ({
        code,
        from: { riskLevel, policyVersion },
        to: { riskLevel: expectedRiskLevel(code), policyVersion: 1 },
      })),
    }));
    process.exitCode = changes.length ? 1 : 0;
    return;
  }

  await prisma.$transaction(
    changes.map((permission) => prisma.accessPermission.update({
      where: { id: permission.id },
      data: { riskLevel: expectedRiskLevel(permission.code), policyVersion: 1 },
    })),
  );

  console.log(JSON.stringify({ applied: true, updatedPermissions: changes.length }));
}

main()
  .catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
