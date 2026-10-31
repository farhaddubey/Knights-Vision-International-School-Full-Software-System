import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  StudentAuthorizationError,
  requireStudentSession,
} from "@/src/lib/student/sessionAuthorization";

function authorizationResponse(error) {
  if (error instanceof StudentAuthorizationError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("Student leave request", error);
  return NextResponse.json({ error: "Unable to process the leave request." }, { status: 500 });
}

export async function GET(request) {
  try {
    const { student } = await requireStudentSession(request);
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: { studentId: student.id },
      include: { approvedBy: { select: { username: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ leaveRequests });
  } catch (error) {
    return authorizationResponse(error);
  }
}

export async function POST(request) {
  try {
    const { student } = await requireStudentSession(request);
    const { fromDate, toDate, reason } = await request.json();
    if (!fromDate || !toDate || typeof reason !== "string" || !reason.trim()) {
      return NextResponse.json({ error: "From Date, To Date, and Reason are required" }, { status: 400 });
    }

    const fromDateObj = new Date(fromDate);
    const toDateObj = new Date(toDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(fromDateObj.getTime()) || Number.isNaN(toDateObj.getTime())) {
      return NextResponse.json({ error: "Invalid leave dates" }, { status: 400 });
    }
    if (fromDateObj > toDateObj) {
      return NextResponse.json({ error: "From Date must be before or equal to To Date" }, { status: 400 });
    }
    if (fromDateObj < today) {
      return NextResponse.json({ error: "From Date cannot be in the past" }, { status: 400 });
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        studentId: student.id,
        fromDate: fromDateObj,
        toDate: toDateObj,
        reason: reason.trim(),
        approved: false,
      },
    });
    return NextResponse.json({ leaveRequest }, { status: 201 });
  } catch (error) {
    return authorizationResponse(error);
  }
}
