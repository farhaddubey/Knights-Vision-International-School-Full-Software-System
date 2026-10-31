import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { PanelAuthorizationError, hasScopeAccess, requirePanelPermission } from "@/src/lib/rbac/authorization";

export async function POST(request) {
  try {
    const authorization = await requirePanelPermission(request, "fee.manage");
    const body = await request.json();
    const studentId = Number(body?.studentId);
    const month = Number(body?.month);
    const year = Number(body?.year);
    const academicYear = Number(body?.academicYear);
    if (![studentId, month, year, academicYear].every(Number.isInteger) || studentId <= 0 || month < 1 || month > 12 || year < 2000 || year > 2100 || academicYear < 2000 || academicYear > 2100) {
      return NextResponse.json({ error: "studentId, month, year, and academicYear are invalid." }, { status: 400 });
    }
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, schoolId: true, branchId: true, classId: true, finalAdmissionId: true, feeSchemeId: true },
    });
    if (!student) return NextResponse.json({ error: "Student not found." }, { status: 404 });
    if (!hasScopeAccess(authorization, student)) throw new PanelAuthorizationError(403, "You cannot create a fee outside your assigned scope.");
    if (!student.feeSchemeId) return NextResponse.json({ error: "This student has no fee scheme." }, { status: 409 });
    const scheme = await prisma.feeScheme.findUnique({
      where: { id: student.feeSchemeId },
      select: { classId: true, monthlyFee: true },
    });
    if (!scheme || scheme.classId !== student.classId) return NextResponse.json({ error: "The student's fee scheme is invalid for this class." }, { status: 409 });
    const totalDue = scheme.monthlyFee;
    const isWaived = body?.isWaived === true;
    const remarks = typeof body?.remarks === "string" ? body.remarks.trim().slice(0, 300) || null : null;
    const monthlyFee = await prisma.monthlyFee.create({
      data: {
        studentId: student.id,
        admissionId: student.finalAdmissionId,
        schoolId: student.schoolId,
        branchId: student.branchId,
        classId: student.classId,
        academicYear,
        month,
        year,
        dueDate: new Date(Date.UTC(year, month - 1, 1)),
        totalDue,
        paidAmount: 0,
        status: isWaived ? "WAIVED" : "UNPAID",
        isWaived,
        waivedAmount: isWaived ? totalDue : 0,
        fineAmount: 0,
        remarks,
      },
    });
    return NextResponse.json({ monthlyFee }, { status: 201 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    if (error && typeof error === "object" && error.code === "P2002") return NextResponse.json({ error: "A monthly fee already exists for this student and month." }, { status: 409 });
    console.error("[Monthly fee]", error);
    return NextResponse.json({ error: "Failed to create monthly fee." }, { status: 500 });
  }
}
