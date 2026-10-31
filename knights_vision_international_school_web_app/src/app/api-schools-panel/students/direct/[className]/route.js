import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";
import { buildScopeWhere, requirePanelPermission } from "@/src/lib/rbac/authorization";
import {
  CLASS_NAMES,
  createAdmission,
  lifecycleErrorResponse,
  requireLifecyclePermission,
} from "@/src/lib/student-lifecycle/management";

export const dynamic = "force-dynamic";

function validClassName(value) {
  const className = String(value || "").trim().toUpperCase();
  if (!CLASS_NAMES.has(className)) throw new Error("INVALID_CLASS_NAME");
  return className;
}

export async function GET(request, context) {
  try {
    const authorization = await requirePanelPermission(request, "student.read");
    const { className: rawClassName } = await context.params;
    const className = validClassName(rawClassName);
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
    const pageSize = Math.min(200, Math.max(1, Number.parseInt(searchParams.get("pageSize") || "30", 10) || 30));
    const search = String(searchParams.get("searchQuery") || "").trim();
    const scopedWhere = buildScopeWhere(authorization, { schoolId: "schoolId", branchId: "branchId", classId: "classId" });
    const where = {
      AND: [
        scopedWhere,
        { class: { name: className } },
        ...(search ? [{ OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { admissionNumber: { contains: search, mode: "insensitive" } },
        ] }] : []),
      ],
    };
    const [students, totalCount] = await Promise.all([
      prisma.student.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { rollNumber: "asc" },
        include: {
          class: { include: { branch: { select: { name: true } } } },
          feeScheme: { select: { category: true } },
        },
      }),
      prisma.student.count({ where }),
    ]);
    return NextResponse.json({
      students: students.map((student) => ({
        id: student.id,
        firstName: student.firstName,
        middleName: student.middleName,
        lastName: student.lastName,
        admissionNumber: student.admissionNumber,
        rollNumber: student.rollNumber,
        studentCategory: student.studentCategory,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth,
        admissionDate: student.admissionDate,
        status: student.status,
        isScholarshipHolder: student.isScholarshipHolder,
        isTransportRequired: student.isTransportRequired,
        // This is a same-origin, access-controlled route rather than a storage
        // URL. The client must still present its staff token when it renders
        // the image, and this list is already restricted by the same scope.
        profileImageUrl: student.profileImageUrl,
        class: { name: student.class?.name, section: student.class?.section, branchName: student.class?.branch?.name },
        feeSchemeCategory: student.feeScheme?.category,
      })),
      totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
      currentPage: page,
      totalCount,
    });
  } catch (error) {
    if (error?.message === "INVALID_CLASS_NAME") return NextResponse.json({ error: "Invalid class name." }, { status: 400 });
    return lifecycleErrorResponse(error, "Unable to fetch students.");
  }
}

// Compatibility adapter for old class drawers.  It now delegates to the
// lifecycle admission service, which creates an enrolment and never derives a
// login password from Aadhaar/UID data.
export async function POST(request, context) {
  try {
    const authorization = await requireLifecyclePermission(request, "STUDENT_ADMISSION_CREATE", "admission.manage");
    const { className: rawClassName } = await context.params;
    validClassName(rawClassName);
    const result = await createAdmission(authorization, await request.json());
    await appendEnterpriseAuditEvent({
      actorUserId: authorization.user.id,
      action: "student_lifecycle.legacy_direct_admission_adapter",
      resource: "StudentEnrollment",
      resourceId: result.enrollment.publicId,
      scope: result.scope,
      afterData: { studentId: result.student.id, admissionNumber: result.student.admissionNumber, admissionId: result.admission.id },
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error?.message === "INVALID_CLASS_NAME") return NextResponse.json({ error: "Invalid class name." }, { status: 400 });
    return lifecycleErrorResponse(error, "Unable to create student admission.");
  }
}
