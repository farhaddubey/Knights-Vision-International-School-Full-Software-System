import prisma from "@/lib/prisma";
import { PanelAuthorizationError, hasScopeAccess, type PanelAuthorization } from "@/src/lib/rbac/authorization";

/** Resolve institution visibility through actual scope assignments, including
 * branch and class assignments whose institution is derived server-side. */
export async function schoolConfigurationWhere(authorization: PanelAuthorization) {
  if (authorization.scopes.some((scope) => scope.scopeType === "GLOBAL")) return {};

  const schoolIds = new Set<number>();
  const branchIds: number[] = [];
  const classIds: number[] = [];
  for (const scope of authorization.scopes) {
    if (scope.scopeType === "SCHOOL" && scope.schoolId) schoolIds.add(scope.schoolId);
    if (scope.scopeType === "BRANCH" && scope.branchId) branchIds.push(scope.branchId);
    if (scope.scopeType === "CLASS" && scope.classId) classIds.push(scope.classId);
  }
  if (branchIds.length) {
    const branches = await prisma.schoolBranch.findMany({ where: { id: { in: branchIds } }, select: { schoolId: true } });
    branches.forEach((branch) => schoolIds.add(branch.schoolId));
  }
  if (classIds.length) {
    const classes = await prisma.schoolClass.findMany({ where: { id: { in: classIds } }, select: { schoolId: true } });
    classes.forEach((schoolClass) => schoolIds.add(schoolClass.schoolId));
  }
  return { id: { in: [...schoolIds] } };
}

export function assertSchoolConfigurationScope(authorization: PanelAuthorization, schoolId: number, branchId: number | null = null, classId: number | null = null) {
  if (!hasScopeAccess(authorization, { schoolId, branchId, classId })) {
    throw new PanelAuthorizationError(403, "You do not have access to this institution configuration scope.");
  }
}

export function assertGlobalConfigurationScope(authorization: PanelAuthorization) {
  if (!authorization.scopes.some((scope) => scope.scopeType === "GLOBAL")) {
    throw new PanelAuthorizationError(403, "Only a global headquarters assignment may create an institution.");
  }
}

