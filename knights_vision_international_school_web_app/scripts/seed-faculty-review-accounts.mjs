import bcrypt from "bcryptjs";
import prismaClientPackage from "@prisma/client";

const { PrismaClient } = prismaClientPackage;
const prisma = new PrismaClient();
const checkOnly = process.argv.includes("--check");

const reviewAccounts = [
  { email: "demo.principal@ssps.invalid", role: "PRINCIPAL", scopeType: "SCHOOL" },
  { email: "demo.aic@ssps.invalid", role: "AIC", scopeType: "SCHOOL" },
  { email: "demo.coef@ssps.invalid", role: "COEF", scopeType: "BRANCH" },
  { email: "demo.gci@ssps.invalid", role: "GCI", scopeType: "BRANCH" },
  { email: "demo.system@ssps.invalid", role: "SYSTEM_IN_CHARGE", scopeType: "SCHOOL" },
];

function expectedScope(item, schoolId, branchId) {
  return {
    scopeType: item.scopeType,
    schoolId,
    branchId: item.scopeType === "BRANCH" ? branchId : null,
    classId: null,
  };
}

async function main() {
  const [school, branch, roles, users] = await Promise.all([
    prisma.school.findFirst({ where: { name: "Sure Success Point School" }, select: { id: true } }),
    prisma.schoolBranch.findFirst({ where: { code: "SSPS-TRAINING" }, select: { id: true, schoolId: true } }),
    prisma.accessRole.findMany({ where: { code: { in: reviewAccounts.map((item) => item.role) } }, select: { id: true, code: true } }),
    prisma.user.findMany({ where: { email: { in: reviewAccounts.map((item) => item.email) } }, select: { id: true, email: true, password: true, is_active: true, blocked: true } }),
  ]);

  if (!school || !branch || branch.schoolId !== school.id) {
    throw new Error("Run npm run system:seed:apply before preparing Faculty review accounts.");
  }
  const roleByCode = new Map(roles.map((role) => [role.code, role]));
  const userByEmail = new Map(users.map((user) => [user.email, user]));
  const missing = reviewAccounts.filter((item) => !roleByCode.has(item.role) || !userByEmail.has(item.email));

  const report = reviewAccounts.map((item) => {
    const user = userByEmail.get(item.email);
    return {
      email: item.email,
      role: item.role,
      exists: Boolean(user),
      active: Boolean(user && user.is_active !== false && user.blocked !== true),
      hasPassword: Boolean(user?.password),
      scope: expectedScope(item, school.id, branch.id),
    };
  });
  if (checkOnly) {
    console.log(JSON.stringify({ ok: missing.length === 0, accounts: report, missing }, null, 2));
    process.exitCode = missing.length ? 1 : 0;
    return;
  }
  if (missing.length) throw new Error(`Missing Faculty review prerequisites: ${missing.map((item) => `${item.email}/${item.role}`).join(", ")}`);

  const password = process.env.SSPS_FACULTY_REVIEW_PASSWORD;
  if (!password || password.length < 16) {
    throw new Error("Set SSPS_FACULTY_REVIEW_PASSWORD to a temporary password of at least 16 characters before --apply.");
  }
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction(async (tx) => {
    for (const item of reviewAccounts) {
      const user = userByEmail.get(item.email);
      const role = roleByCode.get(item.role);
      const scope = expectedScope(item, school.id, branch.id);
      await tx.user.update({
        where: { id: user.id },
        data: { password: passwordHash, is_active: true, blocked: false, confirmed: true, updated_at: new Date() },
      });
      const assignment = await tx.userAccessRole.findFirst({ where: { userId: user.id, roleId: role.id, isActive: true }, orderBy: { id: "asc" } });
      if (assignment) {
        await tx.userAccessRole.update({ where: { id: assignment.id }, data: { ...scope, isActive: true, endsAt: null } });
      } else {
        await tx.userAccessRole.create({ data: { userId: user.id, roleId: role.id, ...scope, isActive: true } });
      }
      await tx.accessAuditLog.create({
        data: { targetUserId: user.id, action: "demo_faculty_review.reset", resource: "UserAccessRole", resourceId: String(user.id), ...scope, metadata: { role: item.role, seededFor: "faculty-access-review" } },
      });
    }
  });
  console.log(JSON.stringify({ ok: true, updated: reviewAccounts.map(({ email, role }) => ({ email, role })), password: "Use SSPS_FACULTY_REVIEW_PASSWORD supplied for this seed; rotate or disable these demo accounts before production." }, null, 2));
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
