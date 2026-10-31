import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import prisma from "@/lib/prisma";
import {
  authorizationErrorResponse,
  isSystemAdministrator,
  requireAdministrationPermission,
} from "@/src/lib/rbac/authorization";

export const dynamic = "force-dynamic";

function normalizeRoleCode(value: unknown) {
  const code = typeof value === "string" ? value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_") : "";
  if (!/^[A-Z][A-Z0-9_]{2,99}$/.test(code)) {
    throw new Error("Role code must contain 3-100 uppercase letters, numbers, or underscores.");
  }
  return code;
}

export async function GET(request: Request) {
  try {
    await requireAdministrationPermission(request, "rbac.read");
    const roles = await prisma.accessRole.findMany({
      include: {
        permissions: {
          include: { permission: true },
          orderBy: { permission: { code: "asc" } },
        },
      },
      orderBy: { code: "asc" },
    });
    return NextResponse.json({ success: true, data: roles });
  } catch (error) {
    return authorizationErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const authorization = await requireAdministrationPermission(request, "rbac.manage");
    if (!isSystemAdministrator(authorization)) {
      return NextResponse.json({ success: false, message: "Only a System Administrator can create role definitions." }, { status: 403 });
    }
    const body = await request.json();
    const code = normalizeRoleCode(body.code);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() || null : null;
    const permissionCodes = Array.isArray(body.permissionCodes) ? body.permissionCodes.filter((value: unknown) => typeof value === "string") : [];

    if (!name || name.length > 150) {
      return NextResponse.json({ success: false, message: "A role name of up to 150 characters is required." }, { status: 400 });
    }

    const permissions = await prisma.accessPermission.findMany({
      where: { code: { in: permissionCodes } },
      select: { id: true, code: true, riskLevel: true },
    });
    if (permissions.length !== new Set(permissionCodes).size) {
      return NextResponse.json({ success: false, message: "One or more permissions are invalid." }, { status: 400 });
    }

    const role = await prisma.$transaction(async (tx) => {
      const created = await tx.accessRole.create({
        data: { code, name, description, isSystem: false },
      });
      if (permissions.length) {
        await tx.accessRolePermission.createMany({
          data: permissions.map((permission) => ({ roleId: created.id, permissionId: permission.id })),
        });
      }
      await tx.accessAuditLog.create({
        data: {
          actorUserId: authorization.user.id,
          action: "rbac.role.created",
          resource: "AccessRole",
          resourceId: String(created.id),
          metadata: { code, permissionCodes },
        },
      });
      await tx.enterpriseAuditEvent.create({
        data: {
          publicId: randomUUID(),
          actorUserId: authorization.user.id,
          action: "rbac.role.created",
          resource: "AccessRole",
          resourceId: String(created.id),
          afterData: {
            code,
            permissionCodes,
            highestRiskLevel: permissions.some((permission) => permission.riskLevel === "CRITICAL")
              ? "CRITICAL"
              : permissions.some((permission) => permission.riskLevel === "HIGH")
                ? "HIGH"
                : "STANDARD",
          },
        },
      });
      return created;
    });

    return NextResponse.json({ success: true, data: role }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Role code")) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
    return authorizationErrorResponse(error);
  }
}
