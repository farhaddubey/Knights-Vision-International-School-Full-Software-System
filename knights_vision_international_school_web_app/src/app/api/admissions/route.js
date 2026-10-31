import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  admissionWriteData,
  applicationById,
  assertScope,
  canonicalClassScope,
  errorResponse,
  feeSchemeForClass,
  pagination,
  requireAdmissionManage,
  requireAdmissionRead,
  requireAdditionalPermission,
  scopeWhere,
  studentById,
} from "@/src/lib/admissions/scopedAdmissions";
import { PanelAuthorizationError } from "@/src/lib/rbac/authorization";
import {
  formatAdmissionRecordNumber,
  formatStudentAdmissionNumber,
} from "@/src/lib/students/admissionNumbers";

async function validateAdmissionLinks(authorization, data) {
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

export async function GET(request) {
  try {
    const authorization = await requireAdmissionRead(request);
    const { searchParams } = new URL(request.url);
    const { page, pageSize, skip } = pagination(searchParams);
    const where = scopeWhere(authorization);
    const [admissions, total] = await Promise.all([
      prisma.admission.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          student: { select: { firstName: true, lastName: true } },
          class: { select: { name: true, section: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.admission.count({ where }),
    ]);
    return NextResponse.json({ admissions, totalPages: Math.max(1, Math.ceil(total / pageSize)), currentPage: page, total });
  } catch (error) {
    return errorResponse(error, "Failed to fetch admissions.");
  }
}

export async function POST(request) {
  try {
    const authorization = await requireAdmissionManage(request);
    const body = await request.json();
    const admissions = Array.isArray(body) ? body : [body];
    if (!admissions.length) return NextResponse.json({ error: "At least one admission is required." }, { status: 400 });

    const createdAdmissions = await prisma.$transaction(async (tx) => {
      const records = [];
      for (const input of admissions) {
        const scope = await canonicalClassScope(input);
        assertScope(authorization, scope);
        const data = admissionWriteData(input, scope, { creating: true });
        requireSettlementPermission(authorization, data.status);
        await validateAdmissionLinks(authorization, data);
        const student = await tx.student.findUnique({
          where: { id: data.studentId },
          select: { id: true, admissionNumber: true },
        });
        if (!student) throw new PanelAuthorizationError(404, "Student not found.");
        if (!student.admissionNumber) {
          await tx.student.update({
            where: { id: student.id },
            data: { admissionNumber: formatStudentAdmissionNumber(student.id, scope.academicYear) },
          });
        }
        const priorAdmissions = await tx.admission.count({ where: { studentId: student.id } });
        records.push(await tx.admission.create({
          data: {
            ...data,
            finalAdmissionNumber: formatAdmissionRecordNumber({
              studentId: student.id,
              academicYear: scope.academicYear,
              admissionType: data.admissionType,
              ordinal: priorAdmissions + 1,
            }),
          },
        }));
      }
      return records;
    });
    return NextResponse.json({
      admissions: createdAdmissions,
      ...(createdAdmissions.length === 1 ? { admission: createdAdmissions[0] } : {}),
    }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Failed to create admission.");
  }
}
