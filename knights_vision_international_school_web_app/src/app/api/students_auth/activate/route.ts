import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/src/lib/prisma";

function validPassword(password: unknown) {
  return typeof password === "string" && password.length >= 12 && password.length <= 128;
}

export async function POST(request: NextRequest) {
  try {
    const { admissionNumber, activationCode, newPassword } = await request.json();
    if (typeof admissionNumber !== "string" || typeof activationCode !== "string" || !validPassword(newPassword)) {
      return NextResponse.json({ error: "Admission number, activation code, and a 12-character minimum password are required." }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { admissionNumber: admissionNumber.trim() },
      select: {
        id: true,
        schoolId: true,
        branchId: true,
        classId: true,
        loginPassword: true,
        loginActivationCodeHash: true,
        loginActivationExpiresAt: true,
      },
    });

    if (!student?.loginActivationCodeHash || !student.loginActivationExpiresAt || student.loginActivationExpiresAt <= new Date()) {
      return NextResponse.json({ error: "Invalid or expired activation details." }, { status: 400 });
    }
    const isActive = await bcrypt.compare(activationCode, student.loginActivationCodeHash);
    if (!isActive) return NextResponse.json({ error: "Invalid or expired activation details." }, { status: 400 });

    const now = new Date();
    const wasPasswordRecovery = Boolean(student.loginPassword);
    const updated = await prisma.$transaction(async (tx) => {
      // The hash condition consumes a one-time code atomically. Two concurrent
      // submissions cannot both use the same recovery/activation code.
      const consumed = await tx.student.updateMany({
        where: {
          id: student.id,
          loginActivationCodeHash: student.loginActivationCodeHash,
          loginActivationExpiresAt: { gt: now },
        },
        data: {
          loginPassword: await bcrypt.hash(newPassword, 12),
          loginActivationCodeHash: null,
          loginActivationExpiresAt: null,
          loginActivatedAt: now,
        },
      });
      if (consumed.count !== 1) return false;
      await tx.accessAuditLog.create({
        data: {
          action: wasPasswordRecovery ? "student.account.password_reset_completed" : "student.account.activation_completed",
          resource: "Student",
          resourceId: String(student.id),
          scopeType: "CLASS",
          schoolId: student.schoolId,
          branchId: student.branchId,
          classId: student.classId,
          metadata: { completedAt: now.toISOString() },
        },
      });
      return true;
    });
    if (!updated) return NextResponse.json({ error: "Invalid or expired activation details." }, { status: 400 });
    return NextResponse.json({
      success: true,
      message: wasPasswordRecovery
        ? "Password reset completed. Sign in with your admission number and new password."
        : "Account activated. Sign in with your admission number and new password.",
    });
  } catch (error) {
    console.error("Student activation failed", error);
    return NextResponse.json({ error: "Unable to activate this account." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
