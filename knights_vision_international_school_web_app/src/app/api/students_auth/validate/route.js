import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  requireStudentSession,
  StudentAuthorizationError,
} from "@/src/lib/student/sessionAuthorization";

export async function GET(request) {
  try {
    const { student: sessionStudent } = await requireStudentSession(request);
    const student = await prisma.student.findUnique({
      where: { id: sessionStudent.id },
      select: {
        id: true,
        loginEmail: true,
        admissionNumber: true,
        firstName: true,
        lastName: true,
        classId: true,
        branchId: true,
        fatherName: true,
        motherName: true,
        residentialAddress: true,
        city: true,
        state: true,
        pinCode: true,
      },
    });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });
    return NextResponse.json({ student });
  } catch (error) {
    if (error instanceof StudentAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Student session validation failed:", error);
    return NextResponse.json({ error: "Unable to validate student session." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
