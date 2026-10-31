import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import prisma from "@/src/lib/prisma";
import {
  authorizationErrorResponse,
  hasScopeAccess,
  requireAdministrationPermission,
} from "@/src/lib/rbac/authorization";

export const dynamic = "force-dynamic";

type AccountCodeMode = "ACTIVATION" | "PASSWORD_RESET";

function accountCodeMode(value: unknown): AccountCodeMode | null {
  if (value === undefined || value === null || value === "") return null;
  return value === "ACTIVATION" || value === "PASSWORD_RESET" ? value : null;
}

async function getScopedStaff(staffId: number, authorization: Awaited<ReturnType<typeof requireAdministrationPermission>>) {
  const staff = await prisma.user.findUnique({
    where: { id: staffId },
    select: {
      id: true,
      username: true,
      email: true,
      is_active: true,
      blocked: true,
      schoolId: true,
      branchId: true,
      password: true,
      passwordActivationCodeHash: true,
      passwordActivationExpiresAt: true,
      passwordActivatedAt: true,
    },
  });
  if (!staff) throw new Error("STAFF_NOT_FOUND");
  if (!hasScopeAccess(authorization, staff)) throw new Error("OUT_OF_SCOPE");
  return staff;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const authorization = await requireAdministrationPermission(request, "staff.manage");
    const { userId } = await params;
    const staffId = Number(userId);
    if (!Number.isInteger(staffId) || staffId <= 0) {
      return NextResponse.json({ success: false, message: "A valid staff id is required." }, { status: 400 });
    }

    const staff = await getScopedStaff(staffId, authorization);
    const isActivated = Boolean(staff.password);
    const hasPendingCode = Boolean(staff.passwordActivationCodeHash)
      && Boolean(staff.passwordActivationExpiresAt && staff.passwordActivationExpiresAt > new Date());

    return NextResponse.json({
      success: true,
      staff: { id: staff.id, username: staff.username, email: staff.email },
      account: {
        status: hasPendingCode
          ? (isActivated ? "PASSWORD_RECOVERY_CODE_ISSUED" : "ACTIVATION_CODE_ISSUED")
          : isActivated ? "ACTIVATED" : "NOT_ACTIVATED",
        isActivated,
        pendingCodeExpiresAt: hasPendingCode ? staff.passwordActivationExpiresAt : null,
        recommendedMode: isActivated ? "PASSWORD_RESET" : "ACTIVATION",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "STAFF_NOT_FOUND") {
      return NextResponse.json({ success: false, message: "Staff member not found." }, { status: 404 });
    }
    if (error instanceof Error && error.message === "OUT_OF_SCOPE") {
      return NextResponse.json({ success: false, message: "You cannot manage a staff account outside your assigned scope." }, { status: 403 });
    }
    return authorizationErrorResponse(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const authorization = await requireAdministrationPermission(request, "staff.manage");
    const { userId } = await params;
    const staffId = Number(userId);
    if (!Number.isInteger(staffId) || staffId <= 0) {
      return NextResponse.json({ success: false, message: "A valid staff id is required." }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const requestedMode = accountCodeMode(body?.mode);
    if (body?.mode !== undefined && !requestedMode) {
      return NextResponse.json({ success: false, message: "Account-code mode must be ACTIVATION or PASSWORD_RESET." }, { status: 400 });
    }

    const staff = await getScopedStaff(staffId, authorization);
    if (staff.blocked === true || staff.is_active === false) {
      return NextResponse.json({ success: false, message: "Only active, unblocked staff accounts can receive an access code." }, { status: 409 });
    }

    const isActivated = Boolean(staff.password);
    const mode = requestedMode || (isActivated ? "PASSWORD_RESET" : "ACTIVATION");
    if (mode === "ACTIVATION" && isActivated) {
      return NextResponse.json({ success: false, message: "This account already has a password. Issue a password-recovery code instead." }, { status: 409 });
    }
    if (mode === "PASSWORD_RESET" && !isActivated) {
      return NextResponse.json({ success: false, message: "This account has no password yet. Issue a first-activation code instead." }, { status: 409 });
    }

    const activationCode = randomBytes(12).toString("base64url");
    const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000));
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: staff.id },
        data: {
          passwordActivationCodeHash: await bcrypt.hash(activationCode, 12),
          passwordActivationExpiresAt: expiresAt,
        },
      });
      await tx.accessAuditLog.create({
        data: {
          actorUserId: authorization.user.id,
          targetUserId: staff.id,
          action: mode === "PASSWORD_RESET"
            ? "faculty.account.password_recovery_code_issued"
            : "faculty.account.activation_issued",
          resource: "User",
          resourceId: String(staff.id),
          scopeType: staff.branchId ? "BRANCH" : staff.schoolId ? "SCHOOL" : "GLOBAL",
          schoolId: staff.schoolId,
          branchId: staff.branchId,
          metadata: { mode, expiresAt: expiresAt.toISOString(), invalidatesPriorUnusedCode: true },
        },
      });
    });

    // Returned once only. The database retains only the bcrypt hash and a
    // subsequent issuance invalidates any unused earlier code.
    return NextResponse.json({ success: true, mode, activationCode, expiresAt });
  } catch (error) {
    if (error instanceof Error && error.message === "STAFF_NOT_FOUND") {
      return NextResponse.json({ success: false, message: "Staff member not found." }, { status: 404 });
    }
    if (error instanceof Error && error.message === "OUT_OF_SCOPE") {
      return NextResponse.json({ success: false, message: "You cannot manage a staff account outside your assigned scope." }, { status:403 });
    }
    return authorizationErrorResponse(error);
  }
}
