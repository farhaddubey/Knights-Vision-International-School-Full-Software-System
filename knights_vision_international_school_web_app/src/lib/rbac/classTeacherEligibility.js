/**
 * A class teacher is an assigned school-duty, not a legacy `User.role` value.
 * Keep the compatibility fallback for historical TEACHER users, while using
 * active RBAC assignments for every current school role.
 */
export const CLASS_TEACHER_ROLE_CODES = new Set([
  "PRINCIPAL",
  "AIC",
  "ACADEMIC_COORDINATOR",
  "HOD",
  "GCI",
  "COEF",
  "COE",
  "SYSTEM_IN_CHARGE",
  "CLASS_TEACHER",
  "SUBJECT_TEACHER",
  "TEACHER",
]);

function matchesScope(assignment, target) {
  if (assignment.scopeType === "GLOBAL") return true;
  if (assignment.scopeType === "SCHOOL") return assignment.schoolId === target.schoolId;
  if (assignment.scopeType === "BRANCH") return assignment.branchId === target.branchId;
  return assignment.scopeType === "CLASS" && target.classId != null && assignment.classId === target.classId;
}

function legacyTeacherMatches(candidate, target) {
  if (candidate.role !== "TEACHER") return false;
  if (candidate.schoolId != null && candidate.schoolId !== target.schoolId) return false;
  if (candidate.branchId != null && candidate.branchId !== target.branchId) return false;
  return true;
}

export function canServeAsClassTeacher(candidate, target) {
  if (!candidate || !target?.schoolId || !target?.branchId) return false;
  if (legacyTeacherMatches(candidate, target)) return true;
  return (candidate.accessRoleAssignments || []).some((assignment) => (
    assignment.isActive
    && CLASS_TEACHER_ROLE_CODES.has(String(assignment.role?.code || "").trim().toUpperCase())
    && matchesScope(assignment, target)
  ));
}

export async function eligibleClassTeacherForScope(prisma, userId, target) {
  if (!Number.isInteger(Number(userId)) || Number(userId) <= 0) return null;
  const candidate = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      schoolId: true,
      branchId: true,
      accessRoleAssignments: {
        where: { isActive: true },
        select: {
          isActive: true,
          scopeType: true,
          schoolId: true,
          branchId: true,
          classId: true,
          role: { select: { code: true } },
        },
      },
    },
  });
  return canServeAsClassTeacher(candidate, target) ? candidate : null;
}

export async function listEligibleClassTeachers(prisma, authorization) {
  const candidates = await prisma.user.findMany({
    where: {
      OR: [
        { role: "TEACHER" },
        {
          accessRoleAssignments: {
            some: {
              isActive: true,
              role: { code: { in: [...CLASS_TEACHER_ROLE_CODES] } },
            },
          },
        },
      ],
    },
    select: {
      id: true,
      username: true,
      role: true,
      schoolId: true,
      branchId: true,
      accessRoleAssignments: {
        where: { isActive: true },
        select: {
          isActive: true,
          scopeType: true,
          schoolId: true,
          branchId: true,
          classId: true,
          role: { select: { code: true } },
        },
      },
    },
    orderBy: [{ username: "asc" }, { id: "asc" }],
  });

  return candidates.filter((candidate) => {
    if (authorization.scopes.some((scope) => scope.scopeType === "GLOBAL")) return true;
    return candidate.accessRoleAssignments.some((assignment) => assignment.scopeType === "GLOBAL" || authorization.scopes.some((scope) => {
      if (scope.scopeType === "GLOBAL") return true;
      if (scope.scopeType === "SCHOOL") return assignment.schoolId === scope.schoolId || candidate.schoolId === scope.schoolId;
      if (scope.scopeType === "BRANCH") return assignment.branchId === scope.branchId || candidate.branchId === scope.branchId;
      return assignment.classId === scope.classId;
    })) || (candidate.role === "TEACHER" && authorization.scopes.some((scope) => (
      (scope.scopeType === "SCHOOL" && candidate.schoolId === scope.schoolId)
      || (scope.scopeType === "BRANCH" && candidate.branchId === scope.branchId)
    )));
  });
}
