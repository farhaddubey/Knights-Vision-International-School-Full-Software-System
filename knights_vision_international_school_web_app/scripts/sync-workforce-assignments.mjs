import { randomUUID } from "crypto";
import prismaClientPackage from "@prisma/client";

const { PrismaClient } = prismaClientPackage;
const prisma = new PrismaClient();
const checkOnly = process.argv.includes("--check");

const automaticSources = [
  "RBAC_ROLE",
  "BRANCH_ROLE",
  "CLASS_TEACHER",
  "CLASS_SUBJECT",
  "TEACHER_SUBJECT",
  "LEGACY_USER",
];

function isStaffRole(roleCode) {
  return roleCode && roleCode !== "STUDENT" && roleCode !== "GUARDIAN";
}

function workforceKindForRole(roleCode) {
  if (roleCode === "CLASS_TEACHER") return "CLASS_TEACHER";
  if (roleCode === "SUBJECT_TEACHER") return "SUBJECT_TEACHER";
  if (roleCode === "TEACHER" || roleCode === "ASSISTANT_TEACHER" || roleCode === "TEACHER_IN_CHARGE") return "TEACHER";
  return "ADMINISTRATIVE";
}

function activeOn(date, startsAt, endsAt) {
  return (!startsAt || startsAt <= date) && (!endsAt || endsAt >= date);
}

function assignmentData({ source, sourceReference, userId, assignmentKind, roleCode, schoolId = null, branchId = null, classId = null, subjectId = null, classSubjectId = null, startsAt = null, endsAt = null, assignedById = null }) {
  return {
    source,
    sourceReference,
    userId,
    assignmentKind,
    roleCode,
    schoolId,
    branchId,
    departmentId: null,
    classId,
    subjectId,
    classSubjectId,
    startsAt,
    endsAt,
    isActive: true,
    assignedById,
  };
}

async function expectedAssignments() {
  const now = new Date();
  const [rbacAssignments, branchRoles, classTeachers, classSubjects, teacherSubjects, legacyUsers] = await Promise.all([
    prisma.userAccessRole.findMany({
      where: { isActive: true },
      select: {
        id: true,
        userId: true,
        schoolId: true,
        branchId: true,
        classId: true,
        startsAt: true,
        endsAt: true,
        assignedById: true,
        role: { select: { code: true } },
      },
    }),
    prisma.branchRoleAssignment.findMany({
      select: { id: true, userId: true, schoolId: true, branchId: true, role: true, startDate: true, endDate: true },
    }),
    prisma.schoolClass.findMany({
      where: { classTeacherId: { not: null } },
      select: { id: true, classTeacherId: true, schoolId: true, branchId: true },
    }),
    prisma.classSubject.findMany({
      where: { teacherId: { not: null } },
      select: { id: true, teacherId: true, schoolId: true, branchId: true, classId: true, subjectId: true },
    }),
    prisma.teacherSubjectAssignment.findMany({
      select: { id: true, teacherId: true, subjectId: true, assignedById: true },
    }),
    prisma.user.findMany({
      where: { OR: [{ role: { not: null } }, { role_teacher: { not: null } }] },
      select: { id: true, role: true, role_teacher: true, schoolId: true, branchId: true },
    }),
  ]);

  const expected = [];

  for (const assignment of rbacAssignments) {
    const roleCode = assignment.role.code;
    if (!isStaffRole(roleCode) || !activeOn(now, assignment.startsAt, assignment.endsAt)) continue;
    expected.push(assignmentData({
      source: "RBAC_ROLE",
      sourceReference: `RBAC_ROLE:${assignment.id}`,
      userId: assignment.userId,
      assignmentKind: workforceKindForRole(roleCode),
      roleCode,
      schoolId: assignment.schoolId,
      branchId: assignment.branchId,
      classId: assignment.classId,
      startsAt: assignment.startsAt,
      endsAt: assignment.endsAt,
      assignedById: assignment.assignedById,
    }));
  }

  for (const assignment of branchRoles) {
    const roleCode = String(assignment.role);
    if (!isStaffRole(roleCode) || !activeOn(now, assignment.startDate, assignment.endDate)) continue;
    expected.push(assignmentData({
      source: "BRANCH_ROLE",
      sourceReference: `BRANCH_ROLE:${assignment.id}`,
      userId: assignment.userId,
      assignmentKind: workforceKindForRole(roleCode),
      roleCode,
      schoolId: assignment.schoolId,
      branchId: assignment.branchId,
      startsAt: assignment.startDate,
      endsAt: assignment.endDate,
    }));
  }

  for (const schoolClass of classTeachers) {
    expected.push(assignmentData({
      source: "CLASS_TEACHER",
      sourceReference: `CLASS_TEACHER:${schoolClass.id}`,
      userId: schoolClass.classTeacherId,
      assignmentKind: "CLASS_TEACHER",
      roleCode: "CLASS_TEACHER",
      schoolId: schoolClass.schoolId,
      branchId: schoolClass.branchId,
      classId: schoolClass.id,
    }));
  }

  for (const classSubject of classSubjects) {
    expected.push(assignmentData({
      source: "CLASS_SUBJECT",
      sourceReference: `CLASS_SUBJECT:${classSubject.id}`,
      userId: classSubject.teacherId,
      assignmentKind: "SUBJECT_TEACHER",
      roleCode: "SUBJECT_TEACHER",
      schoolId: classSubject.schoolId,
      branchId: classSubject.branchId,
      classId: classSubject.classId,
      subjectId: classSubject.subjectId,
      classSubjectId: classSubject.id,
    }));
  }

  for (const assignment of teacherSubjects) {
    expected.push(assignmentData({
      source: "TEACHER_SUBJECT",
      sourceReference: `TEACHER_SUBJECT:${assignment.id}`,
      userId: assignment.teacherId,
      assignmentKind: "SUBJECT_TEACHER",
      roleCode: "SUBJECT_TEACHER",
      subjectId: assignment.subjectId,
      assignedById: assignment.assignedById,
    }));
  }

  for (const user of legacyUsers) {
    const roleCode = String(user.role_teacher || user.role || "");
    if (!isStaffRole(roleCode)) continue;
    expected.push(assignmentData({
      source: "LEGACY_USER",
      sourceReference: `LEGACY_USER:${user.id}`,
      userId: user.id,
      assignmentKind: workforceKindForRole(roleCode),
      roleCode,
      schoolId: user.schoolId,
      branchId: user.branchId,
    }));
  }

  return expected;
}

async function main() {
  const expected = await expectedAssignments();
  const existing = await prisma.workforceAssignment.findMany({
    where: { source: { in: automaticSources } },
    select: { sourceReference: true, source: true, isActive: true },
  });
  const activeExisting = new Map(existing.filter((assignment) => assignment.isActive).map((assignment) => [assignment.sourceReference, assignment]));
  const expectedReferences = new Set(expected.map((assignment) => assignment.sourceReference));
  const missingOrInactive = expected.filter((assignment) => !activeExisting.has(assignment.sourceReference));
  const staleActive = existing.filter((assignment) => assignment.isActive && !expectedReferences.has(assignment.sourceReference));

  if (checkOnly) {
    const byKind = Object.fromEntries(
      ["ADMINISTRATIVE", "TEACHER", "CLASS_TEACHER", "SUBJECT_TEACHER"].map((kind) => [
        kind,
        expected.filter((assignment) => assignment.assignmentKind === kind).length,
      ]),
    );
    const ok = missingOrInactive.length === 0 && staleActive.length === 0;
    console.log(JSON.stringify({
      ok,
      expectedAssignments: expected.length,
      activeAssignments: activeExisting.size,
      byKind,
      missingOrInactive: missingOrInactive.length,
      staleActive: staleActive.length,
      hint: ok ? null : "Run workforce:sync:apply to mirror active legacy and RBAC assignments safely.",
    }));
    process.exitCode = ok ? 0 : 1;
    return;
  }

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    for (const assignment of expected) {
      await tx.workforceAssignment.upsert({
        where: { sourceReference: assignment.sourceReference },
        update: assignment,
        create: { publicId: randomUUID(), ...assignment },
      });
    }

    for (const source of automaticSources) {
      const sourceReferences = expected
        .filter((assignment) => assignment.source === source)
        .map((assignment) => assignment.sourceReference);
      await tx.workforceAssignment.updateMany({
        where: sourceReferences.length
          ? { source, sourceReference: { notIn: sourceReferences }, isActive: true }
          : { source, isActive: true },
        data: { isActive: false, endsAt: now },
      });
    }
  }, { maxWait: 10_000, timeout: 60_000 });

  console.log(JSON.stringify({
    applied: true,
    synchronizedAssignments: expected.length,
    deactivatedStaleAssignments: staleActive.length,
  }));
}

main()
  .catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
