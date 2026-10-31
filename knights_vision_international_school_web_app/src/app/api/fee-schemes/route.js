import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  buildScopeWhere,
  requirePanelPermission,
} from "@/src/lib/rbac/authorization";
import {
  appendFinanceAuditEvent,
  feeAmount,
  feeCategory,
  financeErrorResponse,
  pagination,
  positiveInteger,
  scopedFeeScheme,
  scopedSchoolClass,
} from "@/src/lib/finance/scopedFees";

function schemeInput(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("INVALID_INPUT");
  }
  return {
    classId: positiveInteger(value.classId, "classId"),
    category: feeCategory(value.category),
    monthlyFee: feeAmount(value.monthlyFee, "monthlyFee"),
    admissionFee: feeAmount(value.admissionFee, "admissionFee"),
    readmissionFee: feeAmount(value.readmissionFee, "readmissionFee"),
  };
}

export async function GET(request) {
  try {
    const authorization = await requirePanelPermission(request, "fee.read");
    const { searchParams } = new URL(request.url);
    const { page, pageSize, skip } = pagination(searchParams, 200);
    const classScope = buildScopeWhere(authorization, {
      schoolId: "schoolId",
      branchId: "branchId",
      classId: "id",
    });
    const where = { class: { is: classScope } };
    const [feeSchemes, total] = await Promise.all([
      prisma.feeScheme.findMany({
        where,
        skip,
        take: pageSize,
        include: { class: { select: { id: true, name: true, section: true, schoolId: true, branchId: true } } },
        orderBy: [{ classId: "asc" }, { category: "asc" }],
      }),
      prisma.feeScheme.count({ where }),
    ]);
    return NextResponse.json({
      feeSchemes,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      currentPage: page,
    });
  } catch (error) {
    const response = financeErrorResponse(error, "Failed to fetch fee schemes.");
    return NextResponse.json(response.body, { status: response.status });
  }
}

export async function POST(request) {
  try {
    const authorization = await requirePanelPermission(request, "fee.manage");
    const body = await request.json();
    const inputs = Array.isArray(body) ? body : [body];
    if (!inputs.length || inputs.length > 100) {
      return NextResponse.json({ error: "Create between one and one hundred fee schemes at a time." }, { status: 400 });
    }
    const schemes = inputs.map(schemeInput);
    const keys = new Set();
    for (const scheme of schemes) {
      const key = `${scheme.classId}:${scheme.category}`;
      if (keys.has(key)) return NextResponse.json({ error: "Each class can have only one fee scheme per category." }, { status: 400 });
      keys.add(key);
      await scopedSchoolClass(authorization, scheme.classId, "You cannot manage fee schemes outside your assigned scope.");
    }
    const createdFeeSchemes = await prisma.$transaction(
      schemes.map((scheme) => prisma.feeScheme.create({ data: scheme })),
    );
    await appendFinanceAuditEvent({
      actorUserId: authorization.user.id,
      action: "fee_scheme.create",
      resource: "FeeScheme",
      resourceId: createdFeeSchemes.map((scheme) => String(scheme.id)).join(","),
      scope: { scopeType: "GLOBAL", schoolId: null, branchId: null, classId: null },
      afterData: { count: createdFeeSchemes.length, classIds: [...new Set(schemes.map((scheme) => scheme.classId))] },
    });
    return NextResponse.json(createdFeeSchemes, { status: 201 });
  } catch (error) {
    if (error?.message === "INVALID_INPUT") return NextResponse.json({ error: "Each fee scheme must be an object." }, { status: 400 });
    const response = financeErrorResponse(error, "Failed to create fee schemes.");
    return NextResponse.json(response.body, { status: response.status });
  }
}

export async function DELETE(request) {
  try {
    const authorization = await requirePanelPermission(request, "fee.manage");
    const id = new URL(request.url).searchParams.get("id");
    const feeScheme = await scopedFeeScheme(authorization, id, "You cannot delete a fee scheme outside your assigned scope.");
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
