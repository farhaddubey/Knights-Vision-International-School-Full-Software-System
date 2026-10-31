import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET() {
  try {
    const leaveRequests = await prisma.leaveRequest.findMany({
      include: {
        student: true,
        approvedBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(leaveRequests);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leave requests.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { studentId, fromDate, toDate, reason } = data;

    const newRequest = await prisma.leaveRequest.create({
      data: {
        studentId,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        reason,
      },
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create leave request.' }, { status: 500 });
  }
}
