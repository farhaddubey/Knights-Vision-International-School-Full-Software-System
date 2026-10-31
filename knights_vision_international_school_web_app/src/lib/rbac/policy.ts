export type ScopeType = "GLOBAL" | "SCHOOL" | "BRANCH" | "CLASS";

export type ScopeAssignment = {
  scopeType: ScopeType;
  schoolId: number | null;
  branchId: number | null;
  classId: number | null;
};

export type ScopeTarget = {
  scopeType?: ScopeType;
  schoolId?: number | null;
  branchId?: number | null;
  classId?: number | null;
};

export type PermissionSubject = {
  permissions: string[];
  scopes: ScopeAssignment[];
};

export type PermissionDecision = {
  allowed: boolean;
  reason: "ALLOWED" | "MISSING_PERMISSION" | "OUT_OF_SCOPE";
};

/**
 * The API remains authoritative: this helper receives only assignments loaded
 * by the server from the database and a target resolved from the resource.
 */
export function hasPolicyPermission(subject: Pick<PermissionSubject, "permissions">, permission: string) {
  return subject.permissions.includes("*") || subject.permissions.includes(permission);
}

/**
 * A scope covers only its own level or a descendant represented with all
 * necessary parent identifiers. A browser-supplied branch ID is never enough
 * to establish a school grant; routes resolve the resource first.
 */
export function hasScopeAccess(scopes: ScopeAssignment[], target: ScopeTarget) {
  return scopes.some((scope) => {
    if (scope.scopeType === "GLOBAL") return true;

    if (scope.scopeType === "SCHOOL") {
      return target.schoolId != null && scope.schoolId === target.schoolId;
    }

    if (scope.scopeType === "BRANCH") {
      return target.branchId != null && scope.branchId === target.branchId;
    }

    return target.classId != null && scope.classId === target.classId;
  });
}

export function evaluatePermission(subject: PermissionSubject, permission: string, target?: ScopeTarget): PermissionDecision {
  if (!hasPolicyPermission(subject, permission)) {
    return { allowed: false, reason: "MISSING_PERMISSION" };
  }

  if (target && !hasScopeAccess(subject.scopes, target)) {
    return { allowed: false, reason: "OUT_OF_SCOPE" };
  }

  return { allowed: true, reason: "ALLOWED" };
}

/**
 * Build a Prisma WHERE fragment using the narrowest known grant. It only
 * supports resources that expose the matching school/branch/class field.
 */
export function buildScopedWhere(
  scopes: ScopeAssignment[],
  fields: { schoolId?: string; branchId?: string; classId?: string },
) {
  if (scopes.some((scope) => scope.scopeType === "GLOBAL")) return {};

  const clauses = scopes.flatMap((scope) => {
    if (scope.scopeType === "CLASS" && fields.classId && scope.classId != null) {
      return [{ [fields.classId]: scope.classId }];
    }
    if (scope.scopeType === "BRANCH" && fields.branchId && scope.branchId != null) {
      return [{ [fields.branchId]: scope.branchId }];
    }
    if (scope.scopeType === "SCHOOL" && fields.schoolId && scope.schoolId != null) {
      return [{ [fields.schoolId]: scope.schoolId }];
    }
    return [];
  });

  return clauses.length ? { OR: clauses } : { id: { in: [] } };
}
