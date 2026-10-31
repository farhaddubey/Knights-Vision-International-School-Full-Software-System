import jwt, { JwtPayload } from "jsonwebtoken";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  buildScopedWhere,
  hasPolicyPermission,
  hasScopeAccess as hasPolicyScopeAccess,
  type ScopeAssignment,
  type ScopeTarget,
} from "./policy";
import { STAFF_SESSION_TTL_SECONDS } from "./session";

export type { ScopeTarget } from "./policy";

export type StaffSessionPanel = "ADMINISTRATION" | "FACULTIES";

export const ADMINISTRATION_SESSION_COOKIE = "school_administration_session";
export const FACULTIES_SESSION_COOKIE = "school_faculties_session";

const sessionCookieByPanel: Record<StaffSessionPanel, string> = {
  ADMINISTRATION: ADMINISTRATION_SESSION_COOKIE,
  FACULTIES: FACULTIES_SESSION_COOKIE,
};

type Scope = ScopeAssignment;

export type PanelAuthorization = {
  user: {
    id: number;
    username: string | null;
    email: string;
    role: string | null;
    schoolId: number | null;
    branchId: number | null;
  };
  source: "rbac" | "legacy";
  roles: Array<{ code: string; name: string }>;
  permissions: string[];
  scopes: Scope[];
};

export class PanelAuthorizationError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "PanelAuthorizationError";
    this.status = status;
  }
}

const teacherPermissions = [
  "panel.access",
  "dashboard.read",
  "class.read",
  "student.read",
  "attendance.read",
  "attendance.manage",
  "homework.read",
  "homework.manage",
  "exam.read",
  "notice.read",
];

const legacyRolePermissions: Record<string, string[]> = {
  TEACHER: teacherPermissions,
  ASSISTANT_TEACHER: teacherPermissions,
  TEACHER_IN_CHARGE: [...teacherPermissions, "class.manage", "exam.manage"],
  ACADEMICS_IN_CHARGE: [...teacherPermissions, "class.manage", "student.manage", "exam.manage"],
  EXAM_CONTROLLER: ["panel.access", "dashboard.read", "class.read", "student.read", "exam.read", "exam.manage"],
  LIBRARIAN: ["panel.access", "dashboard.read", "class.read", "student.read"],
  HR_OFFICER: ["panel.access", "dashboard.read", "user.read", "user.manage", "staff.read", "staff.manage", "attendance.read", "attendance.manage"],
  FINANCE_MANAGEMENT_OFFICER: ["panel.access", "dashboard.read", "fee.read", "fee.manage", "student.read", "admission.read"],
  GUARDIAN_COMMUNICATION_IN_CHARGE: [
    "panel.access", "dashboard.read", "notice.read", "notice.manage", "student.read", "attendance.read", "attendance.manage",
    "exam.read",
    "guardian_communication.read", "guardian_communication.manage",
  ],
  STUDENT: ["panel.access", "homework.read", "attendance.read", "exam.read", "notice.read"],
};

const legacyFullAccessRoles = new Set([
  "ADMIN",
  "CEO",
  "GROUP_CEO",
  "CHIEF_EXECUTIVE_OFFICER",
]);

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return new Map<string, string>();

  return new Map(
    cookieHeader.split(";").map((entry) => {
      const separator = entry.indexOf("=");
      const key = separator === -1 ? entry.trim() : entry.slice(0, separator).trim();
      const value = separator === -1 ? "" : decodeURIComponent(entry.slice(separator + 1).trim());
      return [key, value];
    }),
  );
}

function readToken(request: Request, expectedPanel?: StaffSessionPanel) {
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  const cookies = parseCookies(request.headers.get("cookie"));
  if (expectedPanel) {
    return cookies.get(sessionCookieByPanel[expectedPanel]) || null;
  }

  return cookies.get(ADMINISTRATION_SESSION_COOKIE) || cookies.get(FACULTIES_SESSION_COOKIE) || null;
}

function verifySessionToken(token: string, expectedPanel?: StaffSessionPanel) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new PanelAuthorizationError(500, "Server authentication is not configured.");
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    // Old 30-day tokens may still be present after rollout. Enforce the
    // current server-side seven-day ceiling from the signed issued-at time so
    // no staff session can outlive the stated policy.
    const issuedAt = Number(payload.iat);
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (!Number.isFinite(issuedAt) || issuedAt + STAFF_SESSION_TTL_SECONDS <= nowSeconds) {
      throw new PanelAuthorizationError(401, "Invalid or expired session.");
    }
    if (expectedPanel && payload.panel !== expectedPanel) {
      throw new PanelAuthorizationError(403, "This session belongs to a different panel.");
    }
    return payload;
  } catch (error) {
    if (error instanceof PanelAuthorizationError) throw error;
    throw new PanelAuthorizationError(401, "Invalid or expired session.");
  }
}

function legacyPermissions(role: string | null) {
  if (!role) return ["panel.access"];
  if (legacyFullAccessRoles.has(role)) return ["*"];
  return legacyRolePermissions[role] || ["panel.access"];
}

export function hasPermission(authorization: PanelAuthorization, permission: string) {
  return hasPolicyPermission(authorization, permission);
}

export function hasScopeAccess(authorization: PanelAuthorization, target: ScopeTarget) {
  return hasPolicyScopeAccess(authorization.scopes, target);
}

export function buildScopeWhere(
  authorization: PanelAuthorization,
  fields: { schoolId?: string; branchId?: string; classId?: string },
) {
  return buildScopedWhere(authorization.scopes, fields);
}

export function isSystemAdministrator(authorization: PanelAuthorization) {
  return authorization.permissions.includes("*") || authorization.roles.some((role) => role.code === "SYSTEM_ADMIN");
}

export function setSchoolSessionCookie(response: NextResponse, token: string, panel: StaffSessionPanel) {
  response.cookies.set({
    name: sessionCookieByPanel[panel],
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: STAFF_SESSION_TTL_SECONDS,
  });

  // Retire the old shared staff cookie when either panel signs in. The two
  // panel-specific cookies can now safely coexist in one browser.
  response.cookies.set({ name: "school_admin_session", value: "", path: "/", maxAge: 0 });
  response.cookies.set({ name: "token", value: "", path: "/", maxAge: 0 });
}

export function clearSchoolSessionCookie(response: NextResponse, panel: StaffSessionPanel) {
  response.cookies.set({
    name: sessionCookieByPanel[panel],
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getPanelAuthorizationForUserId(userId: number): Promise<PanelAuthorization> {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new PanelAuthorizationError(401, "Invalid session identity.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      schoolId: true,
      branchId: true,
      blocked: true,
      is_active: true,
      accessRoleAssignments: {
        where: { isActive: true },
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true },
              },
            },
          },
        },
      },
    },
  });

  if (!user || user.blocked === true || user.is_active === false) {
    throw new PanelAuthorizationError(401, "This account is not authorized.");
  }

  const now = new Date();
  const activeAssignments = user.accessRoleAssignments.filter((assignment) =>
    assignment.role.isActive &&
    (!assignment.startsAt || assignment.startsAt <= now) &&
    (!assignment.endsAt || assignment.endsAt >= now),
  );

  const baseUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    schoolId: user.schoolId,
    branchId: user.branchId,
  };

  if (activeAssignments.length === 0) {
    return {
      user: baseUser,
      source: "legacy",
      roles: user.role ? [{ code: user.role, name: user.role }] : [],
      permissions: legacyPermissions(user.role),
      scopes: [{
        scopeType: user.branchId ? "BRANCH" : user.schoolId ? "SCHOOL" : "GLOBAL",
        schoolId: user.schoolId,
        branchId: user.branchId,
        classId: null,
      }],
    };
  }

  const permissions = new Set<string>();
  const roleMap = new Map<string, { code: string; name: string }>();
  const scopes: Scope[] = [];

  for (const assignment of activeAssignments) {
    roleMap.set(assignment.role.code, { code: assignment.role.code, name: assignment.role.name });
    assignment.role.permissions.forEach(({ permission }) => permissions.add(permission.code));
    scopes.push({
      scopeType: assignment.scopeType,
      schoolId: assignment.schoolId,
      branchId: assignment.branchId,
      classId: assignment.classId,
    });
  }

  return {
    user: baseUser,
    source: "rbac",
    roles: Array.from(roleMap.values()),
    permissions: Array.from(permissions).sort(),
    scopes,
  };
}

export async function getPanelAuthorization(request: Request, expectedPanel?: StaffSessionPanel): Promise<PanelAuthorization | null> {
  const token = readToken(request, expectedPanel);
  if (!token) return null;

  const payload = verifySessionToken(token, expectedPanel);
  return getPanelAuthorizationForUserId(Number(payload.id));
}

export async function requirePanelPermission(request: Request, permission: string, expectedPanel?: StaffSessionPanel) {
  const authorization = await getPanelAuthorization(request, expectedPanel);
  if (!authorization) {
    throw new PanelAuthorizationError(401, "Authentication is required.");
  }
  if (!hasPermission(authorization, permission)) {
    throw new PanelAuthorizationError(403, "You do not have permission to perform this action.");
  }
  return authorization;
}

export async function requireAdministrationPermission(request: Request, permission: string) {
  return requirePanelPermission(request, permission, "ADMINISTRATION");
}

export async function requireFacultyPermission(request: Request, permission: string) {
  return requirePanelPermission(request, permission, "FACULTIES");
}

export async function requirePanelScopedPermission(
  request: Request,
  permission: string,
  target: ScopeTarget,
  expectedPanel?: StaffSessionPanel,
) {
  const authorization = await requirePanelPermission(request, permission, expectedPanel);
  if (!hasScopeAccess(authorization, target)) {
    throw new PanelAuthorizationError(403, "You do not have access to this school, branch, or class scope.");
  }
  return authorization;
}

export function authorizationErrorResponse(error: unknown) {
  if (error instanceof PanelAuthorizationError) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status });
  }
  console.error("[School RBAC]", error);
  return NextResponse.json({ success: false, message: "Unable to authorize this request." }, { status: 500 });
}
