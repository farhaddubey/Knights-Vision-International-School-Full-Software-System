import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  concernScopeWhere,
  operationsError,
  requireConcernManage,
  requireConcernRead,
  schoolConcernCreateData,
  schoolConcernInclude,
} from "@/src/lib/operations/scopedOperations";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";

const allowedStatuses = new Set(["OPEN", "IN_PROGRESS", "RESOLVED", "ESCALATED", "CLOSED"]);

function pageValue(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function concernResponse(concern) {
  const studentName = [concern.student.firstName, concern.student.middleName, concern.student.lastName]
    .filter(Boolean)
    .join(" ");
  return {
    ...concern,
    // These compatibility aliases keep the existing panel read view working
    // while the UI shifts from the old Customer entity to a real student.
    customer: { id: concern.student.id, name: studentName },
    request: null,
  };
}

export async function GET(request) {
  try {
    const authorization = await requireConcernRead(request);
    const { searchParams } = new URL(request.url);
    const resource = searchParams.get("resource");
    const where = concernScopeWhere(authorization);

    if (resource === "students") {
      const students = await prisma.student.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          admissionNumber: true,
          schoolId: true,
          branchId: true,
          classId: true,
        },
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
        take: 500,
      });
      return NextResponse.json({ data: students });
    }

    const page = pageValue(searchParams.get("page"), 1);
    const pageSize = Math.min(pageValue(searchParams.get("pageSize"), 20), 100);
    const status = searchParams.get("status");
    if (status && !allowedStatuses.has(status)) {
      return NextResponse.json({ error: "status is not supported." }, { status: 400 });
    }
    const scopedWhere = { ...where, ...(status ? { status } : {}) };
    const [complaints, total] = await Promise.all([
      prisma.schoolConcern.findMany({
        where: scopedWhere,
        include: schoolConcernInclude,
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.schoolConcern.count({ where: scopedWhere }),
    ]);
    return NextResponse.json({
      data: complaints.map(concernResponse),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return operationsError(error, "Failed to fetch school concerns.");
  }
}

export async function POST(request) {
  try {
    const authorization = await requireConcernManage(request);
    const data = await schoolConcernCreateData(await request.json(), authorization);
    const concern = await prisma.schoolConcern.create({ data, include: schoolConcernInclude });
    await appendEnterpriseAuditEvent({
      actorUserId: authorization.user.id,
      action: "school_concern.create",
      resource: "SchoolConcern",
      resourceId: concern.id,
      scope: { scopeType: "CLASS", schoolId: concern.schoolId, branchId: concern.branchId, classId: concern.classId },
      afterData: { category: concern.category, status: concern.status, studentId: concern.studentId },
    });
    return NextResponse.json(concernResponse(concern), { status: 201 });
  } catch (error) {
    return operationsError(error, "Failed to create school concern.");
  }
}
