import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  admissionById,
  admissionWriteData,
  applicationById,
  assertScope,
  canonicalClassScope,
  errorResponse,
  feeSchemeForClass,
  requireAdditionalPermission,
  requireAdmissionManage,
  routeId,
  studentById,
} from "@/src/lib/admissions/scopedAdmissions";
import { PanelAuthorizationError } from "@/src/lib/rbac/authorization";

async function validateLinks(authorization, data) {
  const student = await studentById(data.studentId);
  if (student.schoolId !== data.schoolId || student.branchId !== data.branchId || student.classId !== data.classId) {
    throw new PanelAuthorizationError(400, "The selected student does not belong to the admission school, branch, and class.");
  }
  assertScope(authorization, student);
  if (data.applicationId) {
    const application = await applicationById(data.applicationId);
    if (application.schoolId !== data.schoolId || application.branchId !== data.branchId || application.classId !== data.classId) {
      throw new PanelAuthorizationError(400, "The selected application does not belong to the admission school, branch, and class.");
    }
    assertScope(authorization, application);
  }
  if (data.feeSchemeId) await feeSchemeForClass(data.feeSchemeId, data.classId);
}

function requireSettlementPermission(authorization, status) {
  if (status === "CONFIRMED" || status === "COMPLETED") {
    requireAdditionalPermission(authorization, "fee.manage", "Confirming or completing an admission requires fee-manage permission.");
  }
}

export async function PUT(request, context) {
  try {
    const authorization = await requireAdmissionManage(request);
    const body = await request.json();
    const current = await admissionById((await routeId(context)) || body?.id);
    assertScope(authorization, current, "You cannot change an admission outside your assigned scope.");
    const nextScope = await canonicalClassScope({
      classId: body?.classId ?? current.classId,
      branchId: body?.branchId ?? current.branchId,
      schoolId: body?.schoolId ?? current.schoolId,
    });
    assertScope(authorization, nextScope, "You cannot move an admission outside your assigned scope.");
    const data = admissionWriteData(body || {}, nextScope);
    if (!Object.keys(data).length) return NextResponse.json({ error: "No supported admission fields were supplied." }, { status: 400 });
    const candidate = { ...current, ...data, ...nextScope };
    requireSettlementPermission(authorization, candidate.status);
    await validateLinks(authorization, candidate);
    const updated = await prisma.admission.update({ where: { id: current.id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    return errorResponse(error, "Failed to update admission.");
  }
}

export async function DELETE(request, context) {
  try {
    const authorization = await requireAdmissionManage(request);
    const admission = await admissionById(await routeId(context));
    assertScope(authorization, admission, "You cannot delete an admission outside your assigned scope.");
    const [transactions, monthlyFees] = await Promise.all([
      prisma.admissionFeeTransaction.count({ where: { admissionId: admission.id } }),
      prisma.monthlyFee.count({ where: { admissionId: admission.id } }),
    ]);
    if (transactions || monthlyFees) {
      return NextResponse.json({ error: "An admission with recorded fee transactions cannot be deleted." }, { status: 409 });
    }
    await prisma.admission.delete({ where: { id: admission.id } });
    return NextResponse.json({ message: "Admission deleted successfully" });
  } catch (error) {
    return errorResponse(error, "Failed to delete admission.");
  }
}
