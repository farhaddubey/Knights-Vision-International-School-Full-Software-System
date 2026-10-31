import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  buildScopeWhere,
  PanelAuthorizationError,
  requirePanelPermission,
} from "@/src/lib/rbac/authorization";

const SERIES_CLASS_NAMES = new Set(["X", "XS"]);
const SERIES_SUBJECT_NAMES = new Set([
  "english",
  "bengali",
  "mathematics",
  "physical science",
  "life science",
  "history",
  "geography",
]);

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function isSeriesSubject(classSubject) {
  return SERIES_SUBJECT_NAMES.has(String(classSubject.subject?.name || "").trim().toLowerCase());
}

function defaultSeriesPeriod(className, now = new Date()) {
  const month = now.getUTCMonth() + 1;
  const year = now.getUTCFullYear();

  if (className === "XS") {
    if (month <= 2) return { academicYear: year - 1, month };
    return { academicYear: year, month: 1 };
  }

  const academicYear = month >= 4 ? year : year - 1;
  return { academicYear, month: month >= 7 ? month : 7 };
}

function validAcademicYear(value) {
  const year = Number.parseInt(String(value || ""), 10);
  return Number.isInteger(year) && year >= 2020 && year <= 2100 ? year : null;
}

function validSeriesMonth(className, value) {
  const month = Number.parseInt(String(value || ""), 10);
  const valid = className === "XS" ? month >= 1 && month <= 2 : month >= 7 && month <= 12;
  return valid ? month : null;
}

export async function GET(request, context) {
  try {
    const authorization = await requirePanelPermission(request, "exam.read");
    const params = await context.params;
    const className = String(params?.className || "").trim().toUpperCase();
    if (!SERIES_CLASS_NAMES.has(className)) {
      return NextResponse.json({ error: "The WB Test Preparation Series is available only for Class X and XS." }, { status: 400 });
    }

    const searchParams = new URL(request.url).searchParams;
    const defaults = defaultSeriesPeriod(className);
    const academicYear = searchParams.has("academicYear")
      ? validAcademicYear(searchParams.get("academicYear"))
      : defaults.academicYear;
    const month = searchParams.has("month")
      ? validSeriesMonth(className, searchParams.get("month"))
      : defaults.month;
    if (!academicYear) return NextResponse.json({ error: "A valid academic year is required." }, { status: 400 });
    if (!month) return NextResponse.json({ error: className === "XS" ? "Class XS uses January and February only." : "Class X uses July through December only." }, { status: 400 });

    const classScope = buildScopeWhere(authorization, {
      schoolId: "schoolId",
      branchId: "branchId",
      classId: "id",
    });
    const schoolClass = await prisma.schoolClass.findFirst({
      where: { AND: [classScope, { name: className, academicYear }] },
      select: {
        id: true,
        name: true,
        section: true,
        academicYear: true,
        schoolId: true,
        branchId: true,
        branch: { select: { name: true, code: true, school: { select: { name: true } } } },
        classSubjects: {
          include: { subject: { select: { name: true } } },
          orderBy: { id: "asc" },
        },
      },
    });
    if (!schoolClass) {
      return NextResponse.json({ error: "Class not found in your assigned school or branch for this academic year." }, { status: 404 });
    }

    const seriesSubjects = schoolClass.classSubjects.filter(isSeriesSubject);
    const calendarYear = className === "XS" ? academicYear + 1 : academicYear;
    const startDate = new Date(Date.UTC(calendarYear, month - 1, 1));
    const endDate = new Date(Date.UTC(calendarYear, month, 1));
    const [boardExams, students] = await Promise.all([
      prisma.boardExam.findMany({
        where: {
          classSubjectId: { in: seriesSubjects.map((subject) => subject.id) },
          academicYear,
          examDate: { gte: startDate, lt: endDate },
        },
        include: {
          BoardExamResult: {
            select: { studentId: true, writtenMarks: true, oralMarks: true, totalMarks: true },
          },
        },
        orderBy: { examDate: "asc" },
      }),
      prisma.student.findMany({
        where: { classId: schoolClass.id },
        select: { id: true, firstName: true, middleName: true, lastName: true },
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      }),
    ]);

    const examsBySubjectId = new Map();
    for (const exam of boardExams) {
      const subjectExams = examsBySubjectId.get(exam.classSubjectId) || [];
      subjectExams.push(exam);
      examsBySubjectId.set(exam.classSubjectId, subjectExams);
    }
    const subjects = seriesSubjects.map((subject) => {
      const subjectExams = examsBySubjectId.get(subject.id) || [];
      const scheduledExams = subjectExams.map((exam) => ({
        id: exam.id,
        title: exam.title,
        examDate: exam.examDate,
        totalMarks: exam.totalMarks,
      }));
      return {
        id: subject.id,
        classSubjectId: subject.id,
        className,
        subject: { name: subject.subject.name },
        subjectName: subject.subject.name,
        // `scheduledExam` is retained for existing panel consumers. Newer
        // panels use `scheduledExams` so paced multi-round months are not
        // reduced to their first paper.
        scheduledExam: scheduledExams[0] || null,
        scheduledExams,
      };
    });
    const scheduledTotalMarks = boardExams.reduce((total, exam) => total + Number(exam.totalMarks || 0), 0);
    const studentRecords = students.map((student) => {
      const marks = {};
      let total = 0;
      for (const exam of boardExams) {
        const result = exam.BoardExamResult.find((entry) => entry.studentId === student.id);
        if (!result) continue;
        marks[exam.classSubjectId] = Number(marks[exam.classSubjectId] || 0) + Number(result.totalMarks || 0);
        total += Number(result.totalMarks || 0);
      }
      const percentage = scheduledTotalMarks > 0 ? Number(((total / scheduledTotalMarks) * 100).toFixed(2)) : 0;
      return {
        studentId: student.id,
        studentName: [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" "),
        marks,
        percentage,
        grade: percentage >= 90 ? "AA" : percentage >= 80 ? "A+" : percentage >= 70 ? "A" : percentage >= 60 ? "B" : percentage >= 50 ? "C" : "F",
      };
    });

    return NextResponse.json({
      classInfo: {
        id: schoolClass.id,
        name: schoolClass.name,
        section: schoolClass.section,
        academicYear: schoolClass.academicYear,
        schoolId: schoolClass.schoolId,
        schoolName: schoolClass.branch.school.name,
        branchId: schoolClass.branchId,
        branchName: schoolClass.branch.name,
        branchCode: schoolClass.branch.code,
      },
      period: { academicYear, month, monthName: monthNames[month - 1], calendarYear },
      subjects,
      students: studentRecords,
      boardExams,
      scheduledExamCount: boardExams.length,
    });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    }
    console.error("[WB Test Preparation] Failed to load scoped series data.", error);
    return NextResponse.json({ error: "Failed to load the WB Test Preparation Series." }, { status: 500 });
  }
}
