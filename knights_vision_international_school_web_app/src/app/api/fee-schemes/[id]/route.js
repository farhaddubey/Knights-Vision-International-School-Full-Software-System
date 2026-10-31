import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { requirePanelPermission } from "@/src/lib/rbac/authorization";
import {
  appendFinanceAuditEvent,
  feeAmount,
  feeCategory,
  financeErrorResponse,
  positiveInteger,
  scopedFeeScheme,
  scopedSchoolClass,
} from "@/src/lib/finance/scopedFees";

async function idFrom(context) {
  const params = await context.params;
  return params?.id;
}

export async function GET(request, context) {
  try {
    const authorization = await requirePanelPermission(request, "fee.read");
    const feeScheme = await scopedFeeScheme(authorization, await idFrom(context));
    // Preserve the older dialog contract: this endpoint returns the scheme itself.
    return NextResponse.json(feeScheme);
  } catch (error) {
    const response = financeErrorResponse(error, "Failed to fetch fee scheme.");
    return NextResponse.json(response.body, { status: response.status });
  }
}

export async function PUT(request, context) {
  try {
    const authorization = await requirePanelPermission(request, "fee.manage");
    const feeScheme = await scopedFeeScheme(authorization, await idFrom(context), "You cannot modify a fee scheme outside your assigned scope.");
    const body = await request.json();
    const classId = body?.classId == null || body.classId === "" ? feeScheme.classId : positiveInteger(body.classId, "classId");
    const schoolClass = await scopedSchoolClass(authorization, classId, "You cannot move a fee scheme outside your assigned scope.");
    const data = {
      classId: schoolClass.id,
      category: feeCategory(body?.category),
      monthlyFee: feeAmount(body?.monthlyFee, "monthlyFee"),
      admissionFee: feeAmount(body?.admissionFee, "admissionFee"),
      readmissionFee: feeAmount(body?.readmissionFee, "readmissionFee"),
    };
    const updatedFeeScheme = await prisma.feeScheme.update({ where: { id: feeScheme.id }, data });
    await appendFinanceAuditEvent({
      actorUserId: authorization.user.id,
      action: "fee_scheme.update",
      resource: "FeeScheme",
      resourceId: String(feeScheme.id),
      scope: { scopeType: "CLASS", schoolId: schoolClass.schoolId, branchId: schoolClass.branchId, classId: schoolClass.id },
      beforeData: { classId: feeScheme.classId, category: feeScheme.category, monthlyFee: feeScheme.monthlyFee, admissionFee: feeScheme.admissionFee, readmissionFee: feeScheme.readmissionFee },
      afterData: data,
    });
    return NextResponse.json(updatedFeeScheme);
  } catch (error) {
    const response = financeErrorResponse(error, "Failed to update fee scheme.");
    return NextResponse.json(response.body, { status: response.status });
  }
}

export async function DELETE(request, context) {
  try {
    const authorization = await requirePanelPermission(request, "fee.manage");
    const feeScheme = await scopedFeeScheme(authorization, await idFrom(context), "You cannot delete a fee scheme outside your assigned scope.");
    await prisma.feeScheme.delete({ where: { id: feeScheme.id } });
    await appendFinanceAuditEvent({
      actorUserId: authorization.user.id,
      action: "fee_scheme.delete",
      resource: "FeeScheme",
      resourceId: String(feeScheme.id),
      scope: { scopeType: "CLASS", schoolId: feeScheme.class.schoolId, branchId: feeScheme.class.branchId, classId: feeScheme.class.id },
      beforeData: { classId: feeScheme.classId, category: feeScheme.category },
    });
    return NextResponse.json({ message: "Fee scheme deleted successfully." });
  } catch (error) {
    const response = financeErrorResponse(error, "Failed to delete fee scheme.");
    return NextResponse.json(response.body, { status: response.status });
  }
}
