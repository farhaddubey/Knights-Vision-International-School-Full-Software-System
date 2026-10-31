import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { combineWhere, errorResponse, pagination, requireAdmissionRead, scopeWhere, validYear } from "@/src/lib/admissions/scopedAdmissions";

export async function GET(request) {
  try {
    const authorization = await requireAdmissionRead(request);
    const { searchParams } = new URL(request.url);
    const { page, pageSize, skip } = pagination(searchParams);
    const academicYear = validYear(searchParams.get("academicYear"));
    const searchQuery = String(searchParams.get("searchQuery") || "").trim().slice(0, 100);
    if (!academicYear) return NextResponse.json({ error: "academicYear must be between 2000 and 2100." }, { status: 400 });
    const where = combineWhere(scopeWhere(authorization), {
      status: "ADMITTED",
      academicYear,
      ...(searchQuery ? { OR: [
        { studentUid: { contains: searchQuery, mode: "insensitive" } },
        { admitCardNumber: { contains: searchQuery, mode: "insensitive" } },
        { finalAdmissionNumber: { contains: searchQuery, mode: "insensitive" } },
        { firstName: { contains: searchQuery, mode: "insensitive" } },
        { lastName: { contains: searchQuery, mode: "insensitive" } },
      ] } : {}),
    });
    const [applications, totalCount] = await Promise.all([
      prisma.admissionTestApplication.findMany({
        where,
        include: { class: true },
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.admissionTestApplication.count({ where }),
    ]);
    const admissions = applications.length
      ? await prisma.admission.findMany({
          where: { applicationId: { in: applications.map((application) => application.id) } },
          include: { class: true },
        })
      : [];
    const admissionByApplication = new Map(admissions.map((admission) => [admission.applicationId, admission]));
    const formattedApplications = applications.map((application) => ({
      id: application.id,
      studentUid: application.studentUid,
      firstName: application.firstName,
      middleName: application.middleName,
      lastName: application.lastName,
      category: application.category,
      admitCardNumber: application.admitCardNumber,
      finalAdmissionNumber: application.finalAdmissionNumber,
      status: application.status,
      class: application.class,
      admission: (() => {
        const admission = admissionByApplication.get(application.id);
        return admission ? {
          id: admission.id,
          finalAdmissionNumber: admission.finalAdmissionNumber,
          admissionDate: admission.admissionDate,
          classId: admission.classId,
          schoolId: admission.schoolId,
          branchId: admission.branchId,
          admissionType: admission.admissionType,
          status: admission.status,
        } : null;
      })(),
    }));
    return NextResponse.json({ applications: formattedApplications, totalPages: Math.max(1, Math.ceil(totalCount / pageSize)), currentPage: page, totalCount });
  } catch (error) {
    return errorResponse(error, "Failed to fetch admitted students.");
  }
}
