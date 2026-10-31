import jwt, { type JwtPayload } from "jsonwebtoken";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export class StudentAuthorizationError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "StudentAuthorizationError";
    this.status = status;
  }
}

function readCookie(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null;
  const entry = cookieHeader.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}

function readStudentToken(request: Request) {
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) return authorization.slice("Bearer ".length).trim();
  return readCookie(request.headers.get("cookie"), "student_token");
}

/**
 * The student session is independent from staff sessions. Its scope comes from
 * the live Student record, never from IDs embedded in a browser token.
 */
export async function requireStudentSession(request: Request) {
  const token = readStudentToken(request);
  const secret = process.env.JWT_SECRET;
  if (!token) throw new StudentAuthorizationError(401, "Student authentication is required.");
  if (!secret) throw new StudentAuthorizationError(500, "Server authentication is not configured.");

  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, secret) as JwtPayload;
  } catch {
    throw new StudentAuthorizationError(401, "Invalid or expired student session.");
  }

  if (payload.panel !== "STUDENTS" || payload.role !== "STUDENT") {
    throw new StudentAuthorizationError(403, "This session is not permitted in the student panel.");
  }
  const studentId = Number(payload.id);
  if (!Number.isInteger(studentId) || studentId <= 0) {
    throw new StudentAuthorizationError(401, "Invalid student session identity.");
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      classId: true,
      branchId: true,
      schoolId: true,
      status: true,
      loginPassword: true,
    },
  });
  if (!student || !student.loginPassword || (student.status && student.status !== "ACTIVE")) {
    throw new StudentAuthorizationError(401, "This student account is not authorized.");
  }

  return {
    student: {
      id: student.id,
      classId: student.classId,
      branchId: student.branchId,
      schoolId: student.schoolId,
    },
  };
}

export function studentAuthorizationErrorResponse(error: unknown) {
  if (error instanceof StudentAuthorizationError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("[Student authorization]", error);
  return NextResponse.json({ error: "Unable to authorize this student request." }, { status: 500 });
}
