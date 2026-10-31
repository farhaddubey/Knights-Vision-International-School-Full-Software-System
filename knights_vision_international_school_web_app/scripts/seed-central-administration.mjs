import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');
const CHECK = process.argv.includes('--check');

const centralAdministrationSpecs = [
  { role: 'SYSTEM_ADMIN', email: 'demo.hq.system-admin@ssps.invalid', username: 'Demo HQ System Administrator' },
  { role: 'CEO', email: 'demo.hq.ceo@ssps.invalid', username: 'Demo HQ CEO' },
  { role: 'COO', email: 'demo.hq.coo@ssps.invalid', username: 'Demo HQ COO' },
  { role: 'CFO', email: 'demo.hq.cfo@ssps.invalid', username: 'Demo HQ CFO' },
  { role: 'CAO', email: 'demo.hq.cao@ssps.invalid', username: 'Demo HQ CAO' },
  { role: 'CHRO', email: 'demo.hq.chro@ssps.invalid', username: 'Demo HQ CHRO' },
  { role: 'CTO', email: 'demo.hq.cto@ssps.invalid', username: 'Demo HQ CTO' },
  { role: 'CMO', email: 'demo.hq.cmo@ssps.invalid', username: 'Demo HQ CMO' },
  { role: 'CCO', email: 'demo.hq.cco@ssps.invalid', username: 'Demo HQ CCO' },
  { role: 'CCA', email: 'demo.hq.cca@ssps.invalid', username: 'Demo HQ CCA' },
];

function printReport(mode, accounts, missingRoles = []) {
  const ok = missingRoles.length === 0 && accounts.every((account) => account.exists && account.activeGlobalAssignment);
  console.log(JSON.stringify({ ok, mode, missingRoles, accounts }, null, 2));
  return ok;
}

async function getRoles() {
  const roleCodes = centralAdministrationSpecs.map((spec) => spec.role);
  const roles = await prisma.accessRole.findMany({
    where: { code: { in: roleCodes }, isActive: true },
    select: { id: true, code: true },
  });
  const roleByCode = new Map(roles.map((role) => [role.code, role]));
  const missingRoles = roleCodes.filter((roleCode) => !roleByCode.has(roleCode));
  return { roleByCode, missingRoles };
}

async function accountReport(roleByCode) {
  return Promise.all(centralAdministrationSpecs.map(async (spec) => {
    const user = await prisma.user.findUnique({ where: { email: spec.email }, select: { id: true } });
    const role = roleByCode.get(spec.role);
    const assignment = user && role
      ? await prisma.userAccessRole.findFirst({
        where: {
          userId: user.id,
          roleId: role.id,
          scopeType: 'GLOBAL',
          schoolId: null,
          branchId: null,
          classId: null,
          isActive: true,
        },
        select: { id: true },
      })
      : null;

    return {
      role: spec.role,
      email: spec.email,
      exists: Boolean(user),
      activeGlobalAssignment: Boolean(assignment),
    };
  }));
}

async function applySeed(roleByCode) {
  const missingUsers = [];
  for (const spec of centralAdministrationSpecs) {
    const user = await prisma.user.findUnique({ where: { email: spec.email }, select: { id: true } });
    if (!user) missingUsers.push(spec.email);
  }

  const password = process.env.SSPS_CENTRAL_DEMO_PASSWORD;
  if (missingUsers.length && (!password || password.length < 16)) {
    throw new Error('Set SSPS_CENTRAL_DEMO_PASSWORD to a unique temporary password of at least 16 characters before first --apply. It is hashed and never stored in this script.');
  }
  const passwordHash = missingUsers.length ? await bcrypt.hash(password, 12) : null;
  const rootAdmin = await prisma.user.findUnique({
    where: { email: 'farhaddubey003@gmail.com' },
    select: { id: true },
  });

  const results = [];
  for (const spec of centralAdministrationSpecs) {
    const role = roleByCode.get(spec.role);
    const result = await prisma.$transaction(async (tx) => {
      let user = await tx.user.findUnique({ where: { email: spec.email } });
      let accountCreated = false;
      if (!user) {
        user = await tx.user.create({
          data: {
            email: spec.email,
            username: spec.username,
            password: passwordHash,
            role: spec.role === 'CEO' ? 'GROUP_CEO' : 'ADMIN',
            is_active: true,
            blocked: false,
            confirmed: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
        accountCreated = true;
      }

      const assignment = await tx.userAccessRole.findFirst({
        where: {
          userId: user.id,
          roleId: role.id,
          scopeType: 'GLOBAL',
          schoolId: null,
          branchId: null,
          classId: null,
          isActive: true,
        },
        select: { id: true },
      });
      const assignmentCreated = !assignment;
      if (assignmentCreated) {
        await tx.userAccessRole.create({
          data: {
            userId: user.id,
            roleId: role.id,
            scopeType: 'GLOBAL',
            isActive: true,
            assignedById: rootAdmin?.id ?? null,
          },
        });
      }

      if (accountCreated || assignmentCreated) {
        await tx.accessAuditLog.create({
          data: {
            actorUserId: rootAdmin?.id ?? null,
            targetUserId: user.id,
            action: 'rbac.central_administration.seed',
            resource: 'UserAccessRole',
            resourceId: String(user.id),
            scopeType: 'GLOBAL',
            metadata: { role: spec.role, accountCreated, assignmentCreated, seededAccount: true },
          },
        });
      }

      return { accountCreated, assignmentCreated };
    });

    results.push({ role: spec.role, email: spec.email, ...result });
  }

  return results;
}

async function run() {
  if (APPLY === CHECK) {
    throw new Error('Use exactly one command: --check or --apply.');
  }

  const { roleByCode, missingRoles } = await getRoles();
  if (missingRoles.length) {
    throw new Error(`RBAC roles are missing: ${missingRoles.join(', ')}. Run npm run rbac:seed first.`);
  }

  if (CHECK) {
    const ok = printReport('check', await accountReport(roleByCode), missingRoles);
    if (!ok) process.exitCode = 1;
    return;
  }

  const changed = await applySeed(roleByCode);
  const accounts = await accountReport(roleByCode);
  const ok = printReport('apply', accounts, missingRoles);
  console.log(JSON.stringify({ changed, password: 'Use the temporary SSPS_CENTRAL_DEMO_PASSWORD supplied during first apply, then rotate or disable the demo accounts before production.' }, null, 2));
  if (!ok) process.exitCode = 1;
}

run()
  .catch((error) => {
    console.error(error.stack || error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
