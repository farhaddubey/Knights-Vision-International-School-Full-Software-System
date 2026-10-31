import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import {
  StudentAuthorizationError,
  requireStudentSession,
} from "@/src/lib/student/sessionAuthorization";

function validPassword(password: unknown) {
  return typeof password === "string" && password.length >= 12 && password.length <= 128;
}

export async function POST(request: NextRequest) {
  try {
    const { student } = await requireStudentSession(request);
    const { currentPassword, newPassword } = await request.json();

    if (!validPassword(newPassword)) {
      return NextResponse.json({ error: "New password must contain at least 12 characters." }, { status: 400 });
    }

    const account = await prisma.student.findUnique({
      where: { id: student.id },
      select: { loginPassword: true },
    });
    if (!account?.loginPassword || typeof currentPassword !== "string" || !await bcrypt.compare(currentPassword, account.loginPassword)) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }

    await prisma.student.update({
      where: { id: student.id },
      data: { loginPassword: await bcrypt.hash(newPassword, 12) },
    });
    return NextResponse.json({ success: true, message: "Password changed." });
  } catch (error) {
    if (error instanceof StudentAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST /api/students_auth/password", error);
    return NextResponse.json({ error: "Unable to change password." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
