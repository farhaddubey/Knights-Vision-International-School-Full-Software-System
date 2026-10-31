import prismaClientPackage from "@prisma/client";

const { PrismaClient } = prismaClientPackage;
const prisma = new PrismaClient();

function argumentValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1]?.trim() : "";
}

const email = argumentValue("--email")?.toLowerCase();
const checkOnly = process.argv.includes("--check");

async function main() {
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error("Provide the existing administrator email: npm run rbac:bootstrap-admin -- --email owner@example.com");
  }

  const [user, role] = await Promise.all([
    prisma.user.findUnique({ where: { email }, select: { id: true, email: true, username: true, blocked: true, is_active: true } }),
    prisma.accessRole.findUnique({ where: { code: "SYSTEM_ADMIN" }, select: { id: true, code: true } }),
  ]);

  if (!user) {
    throw new Error(`No user exists for ${email}. Create the account first, then run this command again.`);
  }
  if (user.blocked === true || user.is_active === false) {
    throw new Error("The selected user is blocked or inactive and cannot receive administrator access.");
  }
  if (!role) {
    throw new Error("SYSTEM_ADMIN is not seeded. Run npm run rbac:seed first.");
  }

  const existing = await prisma.userAccessRole.findFirst({
    where: { userId: user.id, roleId: role.id, scopeType: "GLOBAL", isActive: true },
    select: { id: true },
  });

  if (checkOnly) {
    console.log(JSON.stringify({
      ok: Boolean(existing),
      email: user.email,
      userId: user.id,
      role: role.code,
      assignmentId: existing?.id || null,
    }));
    process.exitCode = existing ? 0 : 1;
    return;
  }

  if (existing) {
    console.log(JSON.stringify({ created: false, message: "A global SYSTEM_ADMIN assignment already exists.", assignmentId: existing.id, email: user.email }));
    return;
  }

  const assignment = await prisma.$transaction(async (tx) => {
    const created = await tx.userAccessRole.create({
      data: { userId: user.id, roleId: role.id, scopeType: "GLOBAL" },
    });
    await tx.accessAuditLog.create({
      data: {
        targetUserId: user.id,
        action: "rbac.bootstrap.system_admin",
        resource: "UserAccessRole",
        resourceId: String(created.id),
        scopeType: "GLOBAL",
        metadata: { email: user.email, role: role.code },
      },
    });
    return created;
  });

  console.log(JSON.stringify({ created: true, email: user.email, assignmentId: assignment.id, role: role.code }));
}

main()
  .catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
