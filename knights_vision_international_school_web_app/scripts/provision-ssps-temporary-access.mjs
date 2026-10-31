/*
 * Provisions the named SSPS executives and temporary Main Branch test staff.
 *
 * Required environment variables:
 *   SSPS_ADMIN_PASSWORD          administrative temporary password
 *   SSPS_TEMP_FACULTY_PASSWORD   temporary faculty password
 *
 * This script makes no change unless both --apply and
 * --temporary-admin-override are supplied. The override is deliberate: it
 * assigns SYSTEM_ADMIN alongside CEO/COO/CFO only for the current review.
 * TODO: remove those SYSTEM_ADMIN assignments before production delegation.
 */
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');
const TEMPORARY_ADMIN_OVERRIDE = process.argv.includes('--temporary-admin-override');

const EXECUTIVES = [
  { email: 'farhaddubey003@gmail.com', username: 'farhaddubey003', displayName: 'Farhad Dubey - CEO', roleCodes: ['CEO'] },
  { email: 'farhaddubeyofficial@gmail.com', username: 'farhaddubeyofficial', displayName: 'Farhad Dubey - COO', roleCodes: ['COO'] },
  { email: 'farhaddubeyprofessional@gmail.com', username: 'farhaddubeyprofessional', displayName: 'Farhad Dubey - CFO', roleCodes: ['CFO'] },
  { email: 'check.cfo@ssps.test', username: 'check.cfo', displayName: 'Check CFO', roleCodes: ['CFO'] },
];

const FACULTY = [
  { email: 'check.principle@ssps.test', username: 'check.principle', displayName: 'Check Main Principal', legacyRole: 'PRINCIPAL_HEAD', department: 'ADMINISTRATION', roleCodes: ['PRINCIPAL'], scopeType: 'SCHOOL', branchRole: 'PRINCIPAL_HEAD', assignmentKind: 'ADMINISTRATIVE' },
  { email: 'temp.principal@ssps.test', username: 'temp.principal', displayName: 'Temporary Principal', legacyRole: 'PRINCIPAL_HEAD', department: 'ADMINISTRATION', roleCodes: ['PRINCIPAL'], scopeType: 'SCHOOL', assignmentKind: 'ADMINISTRATIVE' },
  { email: 'temp.coef@ssps.test', username: 'temp.coef', displayName: 'Temporary COEF', legacyRole: 'FMO', department: 'ADMINISTRATION', roleCodes: ['COEF'], scopeType: 'BRANCH', branchRole: 'FMO', assignmentKind: 'ADMINISTRATIVE' },
  { email: 'temp.gci@ssps.test', username: 'temp.gci', displayName: 'Temporary GCI', legacyRole: 'GCI', department: 'STUDENT_WELFARE', roleCodes: ['GCI'], scopeType: 'BRANCH', branchRole: 'GCI', assignmentKind: 'ADMINISTRATIVE' },
  { email: 'temp.hod@ssps.test', username: 'temp.hod', displayName: 'Temporary Najirpur Main Branch HOD', legacyRole: 'HEAD_OF_DEPARTMENTS', department: 'ACADEMIC', roleCodes: ['HOD'], scopeType: 'BRANCH', branchRole: 'HEAD_OF_DEPARTMENTS', assignmentKind: 'ADMINISTRATIVE' },
];

function requirePassword(name) {
  const password = process.env[name];
  if (typeof password !== 'string' || password.length < 12) throw new Error(`${name} must be at least 12 characters and is never stored by this script.`);
  return password;
}

function assignmentScope(scopeType, schoolId, branchId) {
  if (scopeType === 'GLOBAL') return { scopeType, schoolId: null, branchId: null, classId: null };
  if (scopeType === 'SCHOOL') return { scopeType, schoolId, branchId: null, classId: null };
  return { scopeType: 'BRANCH', schoolId, branchId, classId: null };
}

async function ensureRoleAssignment(tx, userId, roleId, scope) {
  const existing = await tx.userAccessRole.findFirst({ where: { userId, roleId, ...scope, isActive: true } });
  if (!existing) await tx.userAccessRole.create({ data: { userId, roleId, ...scope, isActive: true } });
}

async function ensureUser(tx, spec, passwordHash, data) {
  const existing = await tx.user.findUnique({ where: { email: spec.email } });
  const record = {
    username: spec.username,
    password: passwordHash,
    is_active: true,
    blocked: false,
    confirmed: true,
    role: data.legacyRole,
    role_teacher: data.roleTeacher ?? null,
    department: data.department ?? null,
    schoolId: data.schoolId ?? null,
    branchId: data.branchId ?? null,
    updated_at: new Date(),
  };
  if (existing) return tx.user.update({ where: { id: existing.id }, data: record });
  return tx.user.create({ data: { email: spec.email, ...record, created_at: new Date() } });
}

async function main() {
  if (!APPLY || !TEMPORARY_ADMIN_OVERRIDE) {
    console.log(JSON.stringify({
      mode: 'check',
      requiredFlags: ['--apply', '--temporary-admin-override'],
      executives: EXECUTIVES.map(({ email, username, roleCodes }) => ({ email, username, roleCodes: [...roleCodes, 'SYSTEM_ADMIN'] })),
      faculty: FACULTY.map(({ email, username, roleCodes, scopeType }) => ({ email, username, roleCodes, scopeType })),
    }, null, 2));
    return;
  }

  const adminPassword = requirePassword('SSPS_ADMIN_PASSWORD');
  const facultyPassword = requirePassword('SSPS_TEMP_FACULTY_PASSWORD');
  const requiredRoleCodes = [...new Set([
    ...EXECUTIVES.flatMap((item) => [...item.roleCodes, 'SYSTEM_ADMIN']),
    ...FACULTY.flatMap((item) => item.roleCodes),
  ])];
  const [adminHash, facultyHash, branch, roles] = await Promise.all([
    bcrypt.hash(adminPassword, 12),
    bcrypt.hash(facultyPassword, 12),
    prisma.schoolBranch.findUnique({ where: { code: 'SSPS-MAIN' }, select: { id: true, schoolId: true, name: true } }),
    prisma.accessRole.findMany({ where: { code: { in: requiredRoleCodes } }, select: { id: true, code: true } }),
  ]);
  if (!branch) throw new Error('Main Branch (SSPS-MAIN) was not found. No account was changed.');
  const roleByCode = new Map(roles.map((role) => [role.code, role]));
  const missing = requiredRoleCodes.filter((code) => !roleByCode.has(code));
  if (missing.length) throw new Error(`Missing RBAC role(s): ${missing.join(', ')}. No account was changed.`);

  const report = await prisma.$transaction(async (tx) => {
    const created = [];
    for (const spec of EXECUTIVES) {
      const user = await ensureUser(tx, spec, adminHash, { legacyRole: 'ADMIN' });
      for (const code of [...spec.roleCodes, 'SYSTEM_ADMIN']) {
        await ensureRoleAssignment(tx, user.id, roleByCode.get(code).id, assignmentScope('GLOBAL', null, null));
      }
      await tx.accessAuditLog.create({ data: { targetUserId: user.id, action: 'temporary_admin_override.provisioned', resource: 'UserAccessRole', resourceId: String(user.id), scopeType: 'GLOBAL', metadata: { roles: [...spec.roleCodes, 'SYSTEM_ADMIN'], temporary: true } } });
      created.push({ email: spec.email, roles: [...spec.roleCodes, 'SYSTEM_ADMIN'], scope: 'GLOBAL' });
    }

    for (const spec of FACULTY) {
      const user = await ensureUser(tx, spec, facultyHash, { legacyRole: spec.legacyRole, department: spec.department, schoolId: branch.schoolId, branchId: branch.id });
      const scope = assignmentScope(spec.scopeType, branch.schoolId, branch.id);
      for (const code of spec.roleCodes) await ensureRoleAssignment(tx, user.id, roleByCode.get(code).id, scope);
      if (spec.branchRole) {
        const existingBranchRole = await tx.branchRoleAssignment.findUnique({ where: { branchId_role: { branchId: branch.id, role: spec.branchRole } } });
        if (existingBranchRole && existingBranchRole.userId !== user.id) throw new Error(`Main Branch already has a ${spec.branchRole} assignment for another user. No account was changed.`);
        if (!existingBranchRole) await tx.branchRoleAssignment.create({ data: { userId: user.id, schoolId: branch.schoolId, branchId: branch.id, role: spec.branchRole, startDate: new Date() } });
      }
      const sourceReference = `temporary-access:${spec.email}:${spec.roleCodes[0]}`;
      await tx.workforceAssignment.upsert({
        where: { sourceReference },
        create: { userId: user.id, assignmentKind: spec.assignmentKind, roleCode: spec.roleCodes[0], schoolId: branch.schoolId, branchId: branch.id, source: 'MANUAL', sourceReference, startsAt: new Date(), isActive: true },
        update: { userId: user.id, roleCode: spec.roleCodes[0], schoolId: branch.schoolId, branchId: branch.id, isActive: true, endsAt: null },
      });
      await tx.accessAuditLog.create({ data: { targetUserId: user.id, action: 'temporary_faculty_account.provisioned', resource: 'UserAccessRole', resourceId: String(user.id), scopeType: scope.scopeType, schoolId: branch.schoolId, branchId: branch.id, metadata: { roles: spec.roleCodes, temporary: true } } });
      created.push({ email: spec.email, roles: spec.roleCodes, scope: scope.scopeType });
    }
    return created;
  }, { maxWait: 10_000, timeout: 60_000 });

  console.log(JSON.stringify({ mode: 'apply', mainBranch: branch.name, accounts: report }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
