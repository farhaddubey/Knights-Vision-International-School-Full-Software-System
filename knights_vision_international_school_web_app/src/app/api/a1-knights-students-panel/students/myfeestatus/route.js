import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  requireStudentSession,
  StudentAuthorizationError,
} from "@/src/lib/student/sessionAuthorization";

function positiveInteger(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function GET(request) {
  try {
    const { student } = await requireStudentSession(request);
    const { searchParams } = new URL(request.url);
    const academicYear = positiveInteger(searchParams.get("academicYear")) ?? new Date().getFullYear();
    const monthlyFeeId = positiveInteger(searchParams.get("monthlyFeeId"));

    const schoolClass = await prisma.schoolClass.findFirst({
      where: { id: student.classId, branchId: student.branchId, schoolId: student.schoolId },
      select: { name: true, section: true },
    });
    if (!schoolClass) return NextResponse.json({ error: "Class not found" }, { status: 404 });
    const className = `${schoolClass.name}${schoolClass.section ? ` - ${schoolClass.section}` : ""}`;

    if (monthlyFeeId) {
      const payments = await prisma.monthlyFeePayment.findMany({
        where: {
          monthlyFeeId,
          monthlyFee: {
            studentId: student.id,
            classId: student.classId,
            branchId: student.branchId,
            schoolId: student.schoolId,
          },
        },
        orderBy: { paymentDate: "asc" },
        select: {
          id: true,
          amount: true,
          paymentDate: true,
          method: true,
          transactionId: true,
          receivedBy: true,
          remarks: true,
        },
      });
      return NextResponse.json({ payments, className });
    }

    const feeScheme = await prisma.feeScheme.findFirst({
      where: { classId: student.classId },
      select: { monthlyFee: true },
    });
    const defaultTotalDue = feeScheme?.monthlyFee ?? 1000;
    const fees = await prisma.monthlyFee.findMany({
      where: {
        studentId: student.id,
        classId: student.classId,
        branchId: student.branchId,
        schoolId: student.schoolId,
        academicYear,
      },
      orderBy: { month: "asc" },
      select: {
        id: true,
        month: true,
        year: true,
        dueDate: true,
        paidAmount: true,
        totalDue: true,
        status: true,
        isWaived: true,
        waivedAmount: true,
        fineAmount: true,
        remarks: true,
      },
    });

    const feeRecords = Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
      fees.find((fee) => fee.month === month) ?? {
        id: null,
        month,
        year: academicYear,
        dueDate: new Date(academicYear, month - 1, 15).toISOString(),
        paidAmount: 0,
        totalDue: defaultTotalDue,
        status: "UNPAID",
        isWaived: false,
        waivedAmount: 0,
        fineAmount: 0,
        remarks: null,
      }
    ));

    return NextResponse.json({ fees: feeRecords, className });
  } catch (error) {
    if (error instanceof StudentAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET student fee status failed:", error);
    return NextResponse.json({ error: "Unable to fetch fee status." }, { status: 500 });
  }
}
