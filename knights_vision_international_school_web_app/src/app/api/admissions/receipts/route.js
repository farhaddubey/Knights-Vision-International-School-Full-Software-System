import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  combineWhere,
  errorResponse,
  pagination,
  requireAdditionalPermission,
  requireAdmissionRead,
  scopeWhere,
  validYear,
} from "@/src/lib/admissions/scopedAdmissions";

export async function GET(request) {
  try {
    const authorization = await requireAdmissionRead(request);
    requireAdditionalPermission(authorization, "fee.read", "Admission receipts require fee-read permission.");
    const { searchParams } = new URL(request.url);
    const { page, pageSize, skip } = pagination(searchParams);
    const academicYear = validYear(searchParams.get("academicYear"));
    const formId = String(searchParams.get("formId") || "").trim().slice(0, 100);
    if (!academicYear) return NextResponse.json({ error: "academicYear must be between 2000 and 2100." }, { status: 400 });
    const where = combineWhere(scopeWhere(authorization), {
      status: "ADMITTED",
      academicYear,
      ...(formId ? { OR: [
        { admitCardNumber: { contains: formId, mode: "insensitive" } },
        { finalAdmissionNumber: { contains: formId, mode: "insensitive" } },
      ] } : {}),
    });
    const [applications, totalCount] = await Promise.all([
      prisma.admissionTestApplication.findMany({ where, include: { class: true }, skip, take: pageSize, orderBy: { createdAt: "desc" } }),
      prisma.admissionTestApplication.count({ where }),
    ]);
    const admissions = applications.length
      ? await prisma.admission.findMany({ where: { applicationId: { in: applications.map((application) => application.id) } } })
      : [];
    const transactions = admissions.length
      ? await prisma.admissionFeeTransaction.findMany({ where: { admissionId: { in: admissions.map((admission) => admission.id) } } })
      : [];
    const admissionByApplication = new Map(admissions.map((admission) => [admission.applicationId, admission]));
    const transactionByAdmission = new Map(transactions.map((transaction) => [transaction.admissionId, transaction]));
    const formattedApplications = applications.map((application) => {
      const admission = admissionByApplication.get(application.id);
      const transaction = admission ? transactionByAdmission.get(admission.id) : null;
      return {
        id: application.id,
        studentUid: application.studentUid,
        firstName: application.firstName,
        middleName: application.middleName,
        lastName: application.lastName,
        gender: application.gender,
        dateOfBirth: application.dateOfBirth,
        bloodGroup: application.bloodGroup,
        nationality: application.nationality,
        religion: application.religion,
        casteCategory: application.casteCategory,
        profileImageUrl: application.profileImageUrl,
        category: application.category,
        admitCardNumber: application.admitCardNumber,
        finalAdmissionNumber: application.finalAdmissionNumber,
        status: application.status,
        class: application.class,
        admission: admission ? {
          id: admission.id,
          finalAdmissionNumber: admission.finalAdmissionNumber,
          admissionDate: admission.admissionDate,
          classId: admission.classId,
          schoolId: admission.schoolId,
          branchId: admission.branchId,
          admissionType: admission.admissionType,
          status: admission.status,
          feeSchemeId: admission.feeSchemeId,
          admissionFeeTransaction: transaction ? {
            id: transaction.id,
            amount: transaction.amount,
            paymentDate: transaction.paymentDate,
            paymentMethod: transaction.paymentMethod,
            transactionId: transaction.transactionId,
            remarks: transaction.remarks,
            feeType: transaction.feeType,
          } : null,
        } : null,
      };
    });
    return NextResponse.json({ applications: formattedApplications, totalPages: Math.max(1, Math.ceil(totalCount / pageSize)), currentPage: page, totalCount });
  } catch (error) {
    return errorResponse(error, "Failed to fetch admission receipts.");
  }
}
