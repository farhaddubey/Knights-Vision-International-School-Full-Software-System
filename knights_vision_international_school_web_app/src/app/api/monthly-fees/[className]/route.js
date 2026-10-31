import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { PanelAuthorizationError } from "@/src/lib/rbac/authorization";
import { resolveScopedCommunicationClass } from "@/src/lib/communications/scopedGuardianCommunication";

function displayName(student) {
  return [student?.firstName, student?.middleName, student?.lastName].filter(Boolean).join(" ").trim() || "Unknown student";
}

export async function GET(request, { params }) {
  try {
    const { className } = await params;
    // The class is resolved from the database and then checked against the
    // caller's school/branch/class scope. The URL can never grant scope.
    const { schoolClass } = await resolveScopedCommunicationClass(request, className, "fee.read");
    const ownership = {
      schoolId: schoolClass.schoolId,
      branchId: schoolClass.branchId,
      classId: schoolClass.id,
    };
    const [fees, students, feeFollowUpCalls] = await Promise.all([
      prisma.monthlyFee.findMany({
      where: {
        ...ownership,
      },
      select: {
        id: true,
        academicYear: true,
        month: true,
        year: true,
        dueDate: true,
        totalDue: true,
        paidAmount: true,
        waivedAmount: true,
        fineAmount: true,
        status: true,
        student: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            admissionNumber: true,
            guardianName: true,
          },
        },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }, { student: { firstName: "asc" } }],
      take: 1000,
      }),
      // Include every current class student, including a student whose twelve
      // monthly rows have not been generated yet. The client then renders the
      // required one-student/one-list-tile monthly view.
      prisma.student.findMany({
        where: ownership,
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          admissionNumber: true,
          guardianName: true,
          guardianContact: true,
        },
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
        take: 1000,
      }),
      // Only the numbered fee-follow-up markers are returned here; the
      // communication details remain in the guardian-care endpoint.
      prisma.guardianCommunicationLog.findMany({
        where: {
          ...ownership,
          communicationType: "CALL",
          details: { path: ["source"], equals: "monthly-fee-followup" },
        },
        select: { id: true, studentId: true, recordedAt: true, recordedById: true, details: true },
        orderBy: { recordedAt: "desc" },
        take: 5000,
      }),
    ]);

    return NextResponse.json({
      schoolClass: { id: schoolClass.id, name: schoolClass.name, branchId: schoolClass.branchId, academicYear: schoolClass.academicYear },
      fees: fees.map((fee) => ({
        ...fee,
        student: fee.student ? { ...fee.student, name: displayName(fee.student) } : null,
      })),
      students: students.map((student) => ({ ...student, name: displayName(student) })),
      feeFollowUpCalls: feeFollowUpCalls.flatMap((entry) => {
        const details = entry.details && typeof entry.details === "object" ? entry.details : null;
        const attempt = Number(details?.feeFollowUpAttempt);
        const academicYear = Number(details?.feeFollowUpAcademicYear);
        if (!Number.isInteger(attempt) || attempt < 1 || attempt > 5 || !Number.isInteger(academicYear)) return [];
        return [{ id: entry.id, studentId: entry.studentId, attempt, academicYear, recordedAt: entry.recordedAt, recordedById: entry.recordedById }];
      }),
    });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    }
    console.error("[Class monthly fee overview]", error);
    return NextResponse.json({ error: "Unable to load class monthly fees." }, { status: 500 });
  }
}
