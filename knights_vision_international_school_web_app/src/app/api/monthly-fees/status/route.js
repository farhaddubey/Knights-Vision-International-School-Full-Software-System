import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { PanelAuthorizationError, hasScopeAccess, requirePanelPermission } from "@/src/lib/rbac/authorization";

export async function GET(request) {
  try {
    const authorization = await requirePanelPermission(request, "fee.read");
    const { searchParams } = new URL(request.url);
    const studentId = Number(searchParams.get("studentId"));
    const academicYear = Number(searchParams.get("academicYear"));
    if (!Number.isInteger(studentId) || studentId <= 0 || !Number.isInteger(academicYear) || academicYear < 2000 || academicYear > 2100) {
      return NextResponse.json({ error: "A valid studentId and academicYear are required." }, { status: 400 });
    }
    const student = await prisma.student.findUnique({ where: { id: studentId }, select: { id: true, schoolId: true, branchId: true, classId: true } });
    if (!student) return NextResponse.json({ error: "Student not found." }, { status: 404 });
    if (!hasScopeAccess(authorization, student)) throw new PanelAuthorizationError(403, "You cannot view fees outside your assigned scope.");
    const monthlyFees = await prisma.monthlyFee.findMany({
      where: { studentId, academicYear },
      select: { month: true, year: true, status: true },
    });
    return NextResponse.json({ paidMonths: monthlyFees.filter((fee) => fee.status === "PAID").map((fee) => ({ month: fee.month, year: fee.year })) });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    console.error("[Monthly fee status]", error);
    return NextResponse.json({ error: "Failed to fetch fee status." }, { status: 500 });
  }
}
