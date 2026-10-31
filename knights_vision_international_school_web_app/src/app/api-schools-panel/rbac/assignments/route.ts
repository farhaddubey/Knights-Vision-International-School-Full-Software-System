import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import prisma from "@/lib/prisma";
import {
  authorizationErrorResponse,
  buildScopeWhere,
  hasScopeAccess,
  isSystemAdministrator,
  requireAdministrationPermission,
} from "@/src/lib/rbac/authorization";

export const dynamic = "force-dynamic";

function positiveInteger(value: unknown, fieldName: string, nullable = false) {
  if (nullable && (value === null || value === undefined || value === "")) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new Error(`${fieldName} must be a positive integer.`);
  return parsed;
}

function workforceKindForRole(roleCode: string) {
  if (roleCode === "CLASS_TEACHER") return "CLASS_TEACHER";
  if (roleCode === "SUBJECT_TEACHER") return "SUBJECT_TEACHER";
  if (roleCode === "TEACHER") return "TEACHER";
  return "ADMINISTRATIVE";
}

function representsStaffRole(roleCode: string) {
  return roleCode !== "STUDENT" && roleCode !== "GUARDIAN";
}

export async function GET(request: Request) {
  try {
    const authorization = await requireAdministrationPermission(request, "rbac.read");
    const where = isSystemAdministrator(authorization)
      ? {}
      : buildScopeWhere(authorization, { schoolId: "schoolId", branchId: "branchId", classId: "classId" });
    const assignments = await prisma.userAccessRole.findMany({
      where,
      include: {
        user: { select: { id: true, username: true, email: true, role: true } },
        role: { select: { id: true, code: true, name: true } },
      },
      orderBy: [{ userId: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ success: true, data: assignments });
  } catch (error) {
    return authorizationErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const authorization = await requireAdministrationPermission(request, "rbac.manage");
    const body = await request.json();
    const userId = positiveInteger(body.userId, "userId");
    const roleId = positiveInteger(body.roleId, "roleId");
    const scopeType = ["GLOBAL", "SCHOOL", "BRANCH", "CLASS"].includes(body.scopeType) ? body.scopeType : "GLOBAL";
    let schoolId = positiveInteger(body.schoolId, "schoolId", true);
    let branchId = positiveInteger(body.branchId, "branchId", true);
    let classId = positiveInteger(body.classId, "classId", true);

    if ((scopeType === "SCHOOL" && !schoolId) || (scopeType === "BRANCH" && !branchId) || (scopeType === "CLASS" && !classId)) {
      return NextResponse.json({ success: false, message: "The selected access scope requires its matching school, branch, or class ID." }, { status: 400 });
    }

    const [user, role, school, branch, schoolClass] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
      prisma.accessRole.findUnique({
        where: { id: roleId },
        select: {
          id: true,
          code: true,
          isActive: true,
          permissions: { include: { permission: { select: { code: true, riskLevel: true } } } },
        },
      }),
      schoolId ? prisma.school.findUnique({ where: { id: schoolId }, select: { id: true } }) : null,
      branchId ? prisma.schoolBranch.findUnique({ where: { id: branchId }, select: { id: true, schoolId: true } }) : null,
      classId ? prisma.schoolClass.findUnique({ where: { id: classId }, select: { id: true, schoolId: true, branchId: true } }) : null,
    ]);
    if (!user || !role?.isActive) {
      return NextResponse.json({ success: false, message: "The requested user or active role does not exist." }, { status: 404 });
    }

    if ((schoolId && !school) || (branchId && !branch) || (classId && !schoolClass)) {
      return NextResponse.json({ success: false, message: "The selected school, branch, or class scope does not exist." }, { status: 404 });
    }

    if (scopeType === "GLOBAL") {
      schoolId = null;
      branchId = null;
      classId = null;
    } else if (scopeType === "SCHOOL") {
      branchId = null;
      classId = null;
    } else if (scopeType === "BRANCH" && branch) {
      if (schoolId && schoolId !== branch.schoolId) {
        return NextResponse.json({ success: false, message: "The branch does not belong to the selected school." }, { status: 400 });
      }
      schoolId = branch.schoolId;
      classId = null;
    } else if (scopeType === "CLASS" && schoolClass) {
      if ((schoolId && schoolId !== schoolClass.schoolId) || (branchId && branchId !== schoolClass.branchId)) {
        return NextResponse.json({ success: false, message: "The class does not belong to the selected school and branch." }, { status: 400 });
      }
      schoolId = schoolClass.schoolId;
      branchId = schoolClass.branchId;
    }

    const targetScope = { scopeType, schoolId, branchId, classId };
    const systemAdministrator = isSystemAdministrator(authorization);
    if (!hasScopeAccess(authorization, targetScope)) {
      return NextResponse.json({ success: false, message: "You cannot manage role assignments outside your own scope." }, { status: 403 });
    }
    if (!systemAdministrator && (scopeType === "GLOBAL" || role.code === "SYSTEM_ADMIN")) {
      return NextResponse.json({ success: false, message: "Only a System Administrator can grant global or System Administrator access." }, { status: 403 });
    }
    if (!systemAdministrator && role.permissions.some(({ permission }) => permission.code === "rbac.manage" || permission.riskLevel === "CRITICAL")) {
      return NextResponse.json({ success: false, message: "Only a System Administrator can grant roles with critical or access-control authority." }, { status: 403 });
    }

    const duplicate = await prisma.userAccessRole.findFirst({
      where: { userId, roleId, scopeType, schoolId, branchId, classId, isActive: true },
      select: { id: true },
    });
    if (duplicate) {
      return NextResponse.json({ success: false, message: "This active role assignment already exists." }, { status: 409 });
    }

    const assignment = await prisma.$transaction(async (tx) => {
      const created = await tx.userAccessRole.create({
        data: { userId, roleId, scopeType, schoolId, branchId, classId, assignedById: authorization.user.id },
      });
      if (representsStaffRole(role.code)) {
        await tx.workforceAssignment.upsert({
          where: { sourceReference: `RBAC_ROLE:${created.id}` },
          update: {
            userId,
            assignmentKind: workforceKindForRole(role.code),
            roleCode: role.code,
            schoolId,
            branchId,
            classId,
            subjectId: null,
            classSubjectId: null,
            startsAt: null,
            endsAt: null,
            isActive: true,
            assignedById: authorization.user.id,
          },
          create: {
            publicId: randomUUID(),
            userId,
            assignmentKind: workforceKindForRole(role.code),
            roleCode: role.code,
            schoolId,
            branchId,
            classId,
            source: "RBAC_ROLE",
            sourceReference: `RBAC_ROLE:${created.id}`,
            assignedById: authorization.user.id,
          },
        });
      }
      await tx.accessAuditLog.create({
        data: {
          actorUserId: authorization.user.id,
          targetUserId: userId,
          action: "rbac.assignment.created",
          resource: "UserAccessRole",
          resourceId: String(created.id),
          scopeType,
          schoolId,
          branchId,
          classId,
          metadata: { roleId },
        },
      });
      await tx.enterpriseAuditEvent.create({
        data: {
          publicId: randomUUID(),
          actorUserId: authorization.user.id,
          action: "rbac.assignment.created",
          resource: "UserAccessRole",
          resourceId: String(created.id),
          scopeType,
          schoolId,
          branchId,
          classId,
          afterData: { roleId, roleCode: role.code, workforceMirrored: representsStaffRole(role.code) },
        },
      });
      return created;
    });
    return NextResponse.json({ success: true, data: assignment }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("must be a positive integer")) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
    return authorizationErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const authorization = await requireAdministrationPermission(request, "rbac.manage");
    const body = await request.json();
    const assignmentId = positiveInteger(body.assignmentId, "assignmentId");
    const assignment = await prisma.userAccessRole.findUnique({
      where: { id: assignmentId },
      include: {
        role: {
          select: {
            code: true,
            permissions: { include: { permission: { select: { code: true, riskLevel: true } } } },
          },
        },
      },
    });
    if (!assignment) {
      return NextResponse.json({ success: false, message: "Assignment not found." }, { status: 404 });
    }
    if (!hasScopeAccess(authorization, assignment)) {
      return NextResponse.json({ success: false, message: "You cannot remove a role assignment outside your own scope." }, { status: 403 });
    }
    if (!isSystemAdministrator(authorization) && (
      assignment.scopeType === "GLOBAL"
      || assignment.role.code === "SYSTEM_ADMIN"
      || assignment.role.permissions.some(({ permission }) => permission.code === "rbac.manage" || permission.riskLevel === "CRITICAL")
    )) {
      return NextResponse.json({ success: false, message: "Only a System Administrator can remove critical or access-control role assignments." }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      const endedAt = new Date();
      await tx.userAccessRole.update({
        where: { id: assignmentId },
        data: { isActive: false, endsAt: endedAt },
      });
      await tx.workforceAssignment.updateMany({
        where: { sourceReference: `RBAC_ROLE:${assignmentId}`, isActive: true },
        data: { isActive: false, endsAt: endedAt },
      });
      await tx.accessAuditLog.create({
        data: {
          actorUserId: authorization.user.id,
          targetUserId: assignment.userId,
          action: "rbac.assignment.deleted",
          resource: "UserAccessRole",
          resourceId: String(assignmentId),
          scopeType: assignment.scopeType,
          schoolId: assignment.schoolId,
          branchId: assignment.branchId,
          classId: assignment.classId,
          metadata: { roleId: assignment.roleId, roleCode: assignment.role.code, deactivated: true },
        },
      });
      await tx.enterpriseAuditEvent.create({
        data: {
          publicId: randomUUID(),
          actorUserId: authorization.user.id,
          action: "rbac.assignment.deactivated",
          resource: "UserAccessRole",
          resourceId: String(assignmentId),
          scopeType: assignment.scopeType,
          schoolId: assignment.schoolId,
          branchId: assignment.branchId,
          classId: assignment.classId,
          beforeData: { roleId: assignment.roleId, roleCode: assignment.role.code, isActive: true },
          afterData: { isActive: false, endsAt: endedAt.toISOString() },
        },
      });
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return authorizationErrorResponse(error);
  }
}
