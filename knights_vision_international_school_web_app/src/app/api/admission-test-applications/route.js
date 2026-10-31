import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  applicationWriteData,
  assertScope,
  canonicalClassScope,
  errorResponse,
  feeSchemeForClass,
  pagination,
  requireAdmissionManage,
  requireAdmissionRead,
  scopeWhere,
  studentById,
  admissionTestById,
} from "@/src/lib/admissions/scopedAdmissions";
import { PanelAuthorizationError } from "@/src/lib/rbac/authorization";

async function validateApplicationLinks(authorization, data) {
  if (data.studentId) {
    const student = await studentById(data.studentId);
    if (student.schoolId !== data.schoolId || student.branchId !== data.branchId || student.classId !== data.classId) {
      throw new PanelAuthorizationError(400, "The selected student does not belong to the application's school, branch, and class.");
    }
    assertScope(authorization, student);
  }
  if (data.admissionId) {
    // The legacy column points to AdmissionTest despite its historical name.
    const test = await admissionTestById(data.admissionId);
    if (test.schoolId !== data.schoolId || test.branchId !== data.branchId || test.classId !== data.classId) {
      throw new PanelAuthorizationError(400, "The selected admission test does not belong to the application's school, branch, and class.");
    }
    assertScope(authorization, test);
  }
  if (data.feeSchemeId) await feeSchemeForClass(data.feeSchemeId, data.classId);
}

export async function GET(request) {
  try {
    const authorization = await requireAdmissionRead(request);
    const { searchParams } = new URL(request.url);
    const { page, pageSize, skip } = pagination(searchParams);
    const where = scopeWhere(authorization);
    const [applications, total] = await Promise.all([
      prisma.admissionTestApplication.findMany({
        where,
        skip,
        take: pageSize,
        include: { branch: true, class: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.admissionTestApplication.count({ where }),
    ]);
    return NextResponse.json({ applications, totalPages: Math.max(1, Math.ceil(total / pageSize)), currentPage: page, total });
  } catch (error) {
    return errorResponse(error, "Failed to fetch admission applications.");
  }
}

export async function POST(request) {
  try {
    const authorization = await requireAdmissionManage(request);
    const body = await request.json();
    const applications = Array.isArray(body) ? body : [body];
    if (!applications.length) return NextResponse.json({ error: "At least one application is required." }, { status: 400 });

    const created = await prisma.$transaction(async (tx) => {
      const result = [];
      for (const input of applications) {
        const scope = await canonicalClassScope(input);
        assertScope(authorization, scope);
        const data = applicationWriteData(input, scope, { creating: true });
        await validateApplicationLinks(authorization, data);
        result.push(await tx.admissionTestApplication.create({ data }));
      }
      return result;
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Failed to create admission application.");
  }
}
