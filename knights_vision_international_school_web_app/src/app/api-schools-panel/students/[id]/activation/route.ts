import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import prisma from "@/src/lib/prisma";
import { authorizationErrorResponse, hasScopeAccess, requirePanelPermission } from "@/src/lib/rbac/authorization";

export const dynamic = "force-dynamic";

type AccountCodeMode = "ACTIVATION" | "PASSWORD_RESET";

function accountCodeMode(value: unknown): AccountCodeMode | null {
  if (value === undefined || value === null || value === "") return null;
  return value === "ACTIVATION" || value === "PASSWORD_RESET" ? value : null;
}

async function getScopedStudent(studentId: number, authorization: Awaited<ReturnType<typeof requirePanelPermission>>) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      admissionNumber: true,
      firstName: true,
      middleName: true,
      lastName: true,
      guardianName: true,
      guardianContact: true,
      schoolId: true,
      branchId: true,
      classId: true,
      loginPassword: true,
      loginActivationCodeHash: true,
      loginActivationExpiresAt: true,
      loginActivatedAt: true,
    },
  });
  if (!student) throw new Error("STUDENT_NOT_FOUND");
  if (!hasScopeAccess(authorization, student)) throw new Error("OUT_OF_SCOPE");
  return student;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authorization = await requirePanelPermission(request, "student_account.manage");
    const { id } = await params;
    const studentId = Number(id);
    if (!Number.isInteger(studentId) || studentId <= 0) {
      return NextResponse.json({ success: false, message: "A valid student id is required." }, { status: 400 });
    }
    const student = await getScopedStudent(studentId, authorization);
    const isActivated = Boolean(student.loginPassword);
    const hasPendingCode = Boolean(student.loginActivationCodeHash)
      && Boolean(student.loginActivationExpiresAt && student.loginActivationExpiresAt > new Date());
    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        admissionNumber: student.admissionNumber,
        firstName: student.firstName,
        middleName: student.middleName,
        lastName: student.lastName,
        guardianName: student.guardianName,
        guardianContact: student.guardianContact,
      },
      account: {
        status: hasPendingCode
          ? (isActivated ? "PASSWORD_RECOVERY_CODE_ISSUED" : "ACTIVATION_CODE_ISSUED")
          : isActivated ? "ACTIVATED" : "NOT_ACTIVATED",
        isActivated,
        pendingCodeExpiresAt: hasPendingCode ? student.loginActivationExpiresAt : null,
        recommendedMode: isActivated ? "PASSWORD_RESET" : "ACTIVATION",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "STUDENT_NOT_FOUND") {
      return NextResponse.json({ success: false, message: "Student not found." }, { status: 404 });
    }
    if (error instanceof Error && error.message === "OUT_OF_SCOPE") {
      return NextResponse.json({ success: false, message: "You cannot manage a student account outside your assigned scope." }, { status: 403 });
    }
    return authorizationErrorResponse(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authorization = await requirePanelPermission(request, "student_account.manage");
    const { id } = await params;
    const studentId = Number(id);
    if (!Number.isInteger(studentId) || studentId <= 0) {
      return NextResponse.json({ success: false, message: "A valid student id is required." }, { status: 400 });
    }
    const body = await request.json().catch(() => ({}));
    const requestedMode = accountCodeMode(body?.mode);
    if (body?.mode !== undefined && !requestedMode) {
      return NextResponse.json({ success: false, message: "Account-code mode must be ACTIVATION or PASSWORD_RESET." }, { status: 400 });
    }
    const student = await getScopedStudent(studentId, authorization);
    const isActivated = Boolean(student.loginPassword);
    const mode = requestedMode || (isActivated ? "PASSWORD_RESET" : "ACTIVATION");
    if (mode === "ACTIVATION" && isActivated) {
      return NextResponse.json(
        { success: false, message: "This account is already active. Issue a password-recovery code instead." },
        { status: 409 },
      );
    }
    if (mode === "PASSWORD_RESET" && !isActivated) {
      return NextResponse.json(
        { success: false, message: "This student has not activated an account yet. Issue a first-activation code instead." },
        { status: 409 },
      );
    }

    const activationCode = randomBytes(12).toString("base64url");
    const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000));
    await prisma.$transaction(async (tx) => {
      await tx.student.update({
        where: { id: student.id },
        data: {
          loginActivationCodeHash: await bcrypt.hash(activationCode, 12),
          loginActivationExpiresAt: expiresAt,
          loginActivatedAt: null,
        },
      });
      await tx.accessAuditLog.create({
        data: {
          actorUserId: authorization.user.id,
          action: mode === "PASSWORD_RESET"
            ? "student.account.password_recovery_code_issued"
            : "student.account.activation_issued",
          resource: "Student",
          resourceId: String(student.id),
          scopeType: "CLASS",
          schoolId: student.schoolId,
          branchId: student.branchId,
          classId: student.classId,
          metadata: { mode, expiresAt: expiresAt.toISOString(), invalidatesPriorUnusedCode: true },
        },
      });
    });

    // This value is returned exactly once to an authorised staff member. Only its
    // bcrypt hash remains in storage, and issuing another code invalidates this one.
    return NextResponse.json({ success: true, mode, activationCode, expiresAt });
  } catch (error) {
    if (error instanceof Error && error.message === "STUDENT_NOT_FOUND") {
      return NextResponse.json({ success: false, message: "Student not found." }, { status: 404 });
    }
    if (error instanceof Error && error.message === "OUT_OF_SCOPE") {
      return NextResponse.json({ success: false, message: "You cannot manage a student account outside your assigned scope." }, { status: 403 });
    }
    return authorizationErrorResponse(error);
  }
}
