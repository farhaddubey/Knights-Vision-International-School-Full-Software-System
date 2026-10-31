import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  admissionById,
  assertScope,
  errorResponse,
  positiveInteger,
  readString,
  requireAdditionalPermission,
  validYear,
} from "@/src/lib/admissions/scopedAdmissions";
import { requirePanelPermission } from "@/src/lib/rbac/authorization";

const PAYMENT_METHODS = new Set(["CASH", "UPI", "BANK_TRANSFER", "ONLINE_GATEWAY", "CHEQUE"]);

export async function POST(request) {
  try {
    const authorization = await requirePanelPermission(request, "fee.manage");
    requireAdditionalPermission(authorization, "admission.read", "Admission fee payments require admission-read permission.");
    const body = await request.json();
    const admission = await admissionById(body?.admissionId, {
      id: true, studentId: true, schoolId: true, branchId: true, classId: true, feeSchemeId: true, admissionType: true,
    });
    assertScope(authorization, admission, "You cannot record a payment outside your assigned scope.");
    if (body?.studentId != null && positiveInteger(body.studentId) !== admission.studentId) {
      return NextResponse.json({ error: "The supplied student does not belong to this admission." }, { status: 400 });
    }
    if (!admission.feeSchemeId) return NextResponse.json({ error: "This admission has no fee scheme and must be normalized before recording a payment." }, { status: 409 });
    const scheme = await prisma.feeScheme.findUnique({
      where: { id: admission.feeSchemeId },
      select: { classId: true, admissionFee: true, readmissionFee: true },
    });
    if (!scheme || scheme.classId !== admission.classId) return NextResponse.json({ error: "The admission fee scheme is invalid for this class." }, { status: 409 });
    const method = String(body?.paymentMethod || "").trim().toUpperCase();
    if (!PAYMENT_METHODS.has(method)) return NextResponse.json({ error: "A valid paymentMethod is required." }, { status: 400 });
    const academicYear = validYear(body?.academicYear);
    if (!academicYear) return NextResponse.json({ error: "academicYear must be between 2000 and 2100." }, { status: 400 });

    const transaction = await prisma.$transaction(async (tx) => {
      const existing = await tx.admissionFeeTransaction.findFirst({ where: { admissionId: admission.id }, select: { id: true } });
      if (existing) return null;
      return tx.admissionFeeTransaction.create({
        data: {
          admissionId: admission.id,
          studentId: admission.studentId,
          schoolId: admission.schoolId,
          branchId: admission.branchId,
          classId: admission.classId,
          academicYear,
          amount: admission.admissionType === "READMISSION"
            ? scheme.readmissionFee
            : scheme.admissionFee,
          feeType: admission.admissionType === "READMISSION" ? "READMISSION" : admission.admissionType === "MIGRATION" ? "MIGRATION" : "FRESH",
          paymentDate: new Date(),
          paymentMethod: method,
          transactionId: readString(body?.transactionId, "transactionId", { maxLength: 100 }),
          receivedBy: String(authorization.user.id),
          remarks: readString(body?.remarks, "remarks", { maxLength: 300 }),
        },
      });
    });
    if (!transaction) return NextResponse.json({ error: "An admission fee payment is already recorded for this admission." }, { status: 409 });
    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Failed to record admission fee payment.");
  }
}
