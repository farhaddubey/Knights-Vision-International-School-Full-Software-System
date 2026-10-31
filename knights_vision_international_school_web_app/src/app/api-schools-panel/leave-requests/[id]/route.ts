import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        student: true,
        approvedBy: true,
      },
    });

    if (!leaveRequest) {
      return NextResponse.json({ error: 'Leave request not found.' }, { status: 404 });
    }

    return NextResponse.json(leaveRequest);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching leave request.' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const {
      fromDate,
      toDate,
      reason,
      approved,
      approvedById,
      approvedAt,
    } = data;

    const updated = await prisma.leaveRequest.update({
      where: { id: parseInt(params.id) },
      data: {
        fromDate: fromDate ? new Date(fromDate) : undefined,
        toDate: toDate ? new Date(toDate) : undefined,
        reason,
        approved,
        approvedById,
        approvedAt: approvedAt ? new Date(approvedAt) : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating leave request.' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const deleted = await prisma.leaveRequest.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ message: 'Leave request deleted successfully.', deleted });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete leave request.' }, { status: 500 });
  }
}
