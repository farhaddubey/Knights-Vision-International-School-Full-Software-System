import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  StudentAuthorizationError,
  requireStudentSession,
} from "@/src/lib/student/sessionAuthorization";

function pageValue(value, fallback) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
}

export async function GET(request) {
  try {
    const { student } = await requireStudentSession(request);
    const page = pageValue(request.nextUrl.searchParams.get("page"), 1);
    const pageSize = Math.min(pageValue(request.nextUrl.searchParams.get("pageSize"), 10), 100);
    const where = {
      studentId: student.id,
      assignment: {
        classSubject: {
          classId: student.classId,
          branchId: student.branchId,
          schoolId: student.schoolId,
        },
      },
    };
    const [assignmentMarks, totalCount] = await Promise.all([
      prisma.studentAssignment.findMany({
        where,
        include: {
          assignment: {
            select: {
              id: true,
              title: true,
              marks: true,
              classSubject: {
                select: {
                  class: { select: { name: true, section: true } },
                  subject: { select: { name: true } },
                },
              },
            },
          },
        },
        orderBy: { submittedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.studentAssignment.count({ where }),
    ]);

    return NextResponse.json({
      assignmentMarks: assignmentMarks.map((entry) => {
        const schoolClass = entry.assignment.classSubject.class;
        return {
          id: entry.id,
          className: `${schoolClass.name}${schoolClass.section ? `-${schoolClass.section}` : ""}`,
          subject: entry.assignment.classSubject.subject,
          assignment: { id: entry.assignment.id, title: entry.assignment.title },
          marksObtained: entry.marksObtained,
          totalMarks: entry.assignment.marks,
          submissionDate: entry.submittedAt,
          isSubmitted: entry.isSubmitted,
          remarks: entry.remarks,
          qualityTag: entry.qualityTag,
        };
      }),
      totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
      currentPage: page,
      totalCount,
    });
  } catch (error) {
    if (error instanceof StudentAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET student assignment marks failed:", error);
    return NextResponse.json({ error: "Unable to fetch your assignment marks." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
