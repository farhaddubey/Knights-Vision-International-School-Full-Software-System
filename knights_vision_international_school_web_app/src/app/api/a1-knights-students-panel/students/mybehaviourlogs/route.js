import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  StudentAuthorizationError,
  requireStudentSession,
} from "@/src/lib/student/sessionAuthorization";

export async function GET(request) {
  try {
    const { student } = await requireStudentSession(request);
    const logs = await prisma.studentBehaviourLog.findMany({
      where: { studentId: student.id },
      include: {
        classSubject: { select: { subject: { select: { name: true } } } },
        punishment: { select: { title: true, description: true } },
      },
      orderBy: { incidentDate: "desc" },
      take: 100,
    });
    return NextResponse.json({ behaviourLogs: logs });
  } catch (error) {
    if (error instanceof StudentAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET student behaviour report failed:", error);
    return NextResponse.json({ error: "Unable to fetch your behaviour report." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
