import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/src/lib/prisma";
import { getPanelAuthorizationForUserId } from "@/src/lib/rbac/authorization";
import { canAccessStaffPanel } from "@/src/lib/rbac/panelAccess";

export const dynamic = "force-dynamic";

function validPassword(password: unknown) {
  return typeof password === "string" && password.length >= 12 && password.length <= 128;
}

/**
 * Used by both the Faculty web portal and Faculty App.  A code never exposes
 * the old password: it only authorises setting a new bcrypt-hashed password.
 */
export async function POST(request: NextRequest) {
  try {
    const { email: rawEmail, activationCode, newPassword } = await request.json();
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    if (!email || typeof activationCode !== "string" || !validPassword(newPassword)) {
      return NextResponse.json({ error: "Email, activation code, and a 12-character minimum password are required." }, { status: 400 });
    }

    const staff = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        is_active: true,
        blocked: true,
        password: true,
        passwordActivationCodeHash: true,
        passwordActivationExpiresAt: true,
        schoolId: true,
        branchId: true,
      },
    });
    if (!staff || staff.blocked === true || staff.is_active === false || !staff.passwordActivationCodeHash || !staff.passwordActivationExpiresAt || staff.passwordActivationExpiresAt <= new Date()) {
      return NextResponse.json({ error: "Invalid or expired activation details." }, { status: 400 });
    }

    const codeMatches = await bcrypt.compare(activationCode, staff.passwordActivationCodeHash);
    if (!codeMatches) return NextResponse.json({ error: "Invalid or expired activation details." }, { status: 400 });

    const authorization = await getPanelAuthorizationForUserId(staff.id);
    if (!canAccessStaffPanel(authorization, "FACULTIES")) {
      return NextResponse.json({ error: "This account is not permitted to use the faculties panel." }, { status: 403 });
    }

    const now = new Date();
    const wasPasswordRecovery = Boolean(staff.password);
    const consumed = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.updateMany({
        where: {
          id: staff.id,
          passwordActivationCodeHash: staff.passwordActivationCodeHash,
          passwordActivationExpiresAt: { gt: now },
          is_active: { not: false },
          blocked: { not: true },
        },
        data: {
          password: await bcrypt.hash(newPassword, 12),
          passwordActivationCodeHash: null,
          passwordActivationExpiresAt: null,
          passwordActivatedAt: now,
        },
      });
      if (updated.count !== 1) return false;
      await tx.accessAuditLog.create({
        data: {
          targetUserId: staff.id,
          action: wasPasswordRecovery ? "faculty.account.password_reset_completed" : "faculty.account.activation_completed",
          resource: "User",
          resourceId: String(staff.id),
          scopeType: staff.branchId ? "BRANCH" : staff.schoolId ? "SCHOOL" : "GLOBAL",
          schoolId: staff.schoolId,
          branchId: staff.branchId,
          metadata: { completedAt: now.toISOString() },
        },
      });
      return true;
    });
    if (!consumed) return NextResponse.json({ error: "Invalid or expired activation details." }, { status: 400 });

    return NextResponse.json({
      success: true,
      message: wasPasswordRecovery
        ? "Password reset completed. Sign in with your email and new password."
        : "Account activated. Sign in with your email and new password.",
    });
  } catch (error) {
    console.error("Faculty activation failed", error);
    return NextResponse.json({ error: "Unable to activate this account." }, { status: 500 });
  }
}
