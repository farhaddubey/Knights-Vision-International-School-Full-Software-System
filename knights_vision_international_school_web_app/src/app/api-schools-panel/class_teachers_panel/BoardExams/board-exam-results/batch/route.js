import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";
import {
  positiveInteger,
  requireBoardExamWriteAccess,
} from "@/src/lib/rbac/classSubjectAccess";
import { PanelAuthorizationError } from "@/src/lib/rbac/authorization";

function mark(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function POST(request) {
  try {
    const { results } = await request.json();
    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json({ error: "A non-empty board exam result list is required." }, { status: 400 });
    }

    const boardExamId = positiveInteger(results[0]?.boardExamId);
    const { authorization, boardExam, scope } = await requireBoardExamWriteAccess(request, boardExamId);
    const normalizedResults = results.map((result) => {
      const studentId = positiveInteger(result.studentId);
      const resultBoardExamId = positiveInteger(result.boardExamId);
      const writtenMarks = mark(result.writtenMarks);
      const oralMarks = mark(result.oralMarks);
      if (!studentId || resultBoardExamId !== boardExam.id || writtenMarks === null || oralMarks === null) {
        throw new PanelAuthorizationError(400, "Every result must contain valid marks for this board exam and a valid student.");
      }
      if (writtenMarks < 0 || writtenMarks > 90 || oralMarks < 0 || oralMarks > 10) {
        throw new PanelAuthorizationError(400, "Written marks must be 0-90 and oral marks must be 0-10.");
      }

      return {
        studentId,
        writtenMarks,
        oralMarks,
        totalMarks: writtenMarks + oralMarks,
        remarks: typeof result.remarks === "string" && result.remarks.trim() ? result.remarks.trim() : null,
      };
    });

    const studentIds = normalizedResults.map((result) => result.studentId);
    const uniqueStudentIds = [...new Set(studentIds)];
    if (studentIds.length !== uniqueStudentIds.length) {
      return NextResponse.json({ error: "Each student may be submitted only once." }, { status: 400 });
    }

    const classSubject = boardExam.classSubject;
    const validStudents = await prisma.student.findMany({
      where: {
        id: { in: uniqueStudentIds },
        classId: classSubject.classId,
        branchId: classSubject.class.branchId,
        schoolId: classSubject.class.schoolId,
      },
      select: { id: true },
    });
    if (validStudents.length !== uniqueStudentIds.length) {
      return NextResponse.json({ error: "Every student must belong to this board exam's class." }, { status: 400 });
    }

    await prisma.$transaction(
      normalizedResults.map((result) => prisma.boardExamResult.upsert({
        where: {
          studentId_boardExamId: {
            studentId: result.studentId,
            boardExamId: boardExam.id,
          },
        },
        update: {
          writtenMarks: result.writtenMarks,
          oralMarks: result.oralMarks,
          totalMarks: result.totalMarks,
          remarks: result.remarks,
        },
        create: {
          studentId: result.studentId,
          boardExamId: boardExam.id,
          writtenMarks: result.writtenMarks,
          oralMarks: result.oralMarks,
          totalMarks: result.totalMarks,
          remarks: result.remarks,
        },
      })),
    );

    await appendEnterpriseAuditEvent({
      actorUserId: authorization.user.id,
      action: "EXAM_BOARD_RESULTS_UPSERTED",
      resource: "BoardExam",
      resourceId: boardExam.id,
      scope,
      metadata: { studentCount: normalizedResults.length },
    });

    return NextResponse.json({ message: "Board exam results saved successfully." });
  } catch (error) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST board exam results batch failed:", error);
    return NextResponse.json({ error: "Unable to save board exam results." }, { status: 500 });
  }
}
