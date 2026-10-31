import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

export async function POST(request, { params }) {
  try {
    console.log("🔍 [DEBUG] Received POST request");

    const { results } = await request.json();
    console.log("📦 [DEBUG] Parsed results:", JSON.stringify(results, null, 2));

    if (!Array.isArray(results) || results.length === 0) {
      console.warn("⚠️ [DEBUG] Invalid or empty results array");
      return NextResponse.json(
        { error: 'Missing or invalid results array' },
        { status: 400 }
      );
    }

    const boardExamId = results[0].boardExamId;
    console.log("🆔 [DEBUG] Board Exam ID:", boardExamId);

    const existingBoardExam = await prisma.boardExam.findUnique({
      where: { id: boardExamId },
    });
    console.log("✅ [DEBUG] Found Board Exam:", existingBoardExam);

    if (!existingBoardExam) {
      console.warn("❌ [DEBUG] Board exam not found");
      return NextResponse.json(
        { error: 'Board exam not found' },
        { status: 404 }
      );
    }

    const studentIds = results.map((r) => r.studentId);
    const uniqueStudentIds = [...new Set(studentIds)];
    console.log("🎓 [DEBUG] Unique Student IDs:", uniqueStudentIds);

    const existingStudents = await prisma.student.findMany({
      where: { id: { in: uniqueStudentIds } },
    });
    console.log("👥 [DEBUG] Found students:", existingStudents.map(s => s.id));

    if (existingStudents.length !== uniqueStudentIds.length) {
      console.warn("❌ [DEBUG] One or more students not found");
      return NextResponse.json(
        { error: 'One or more students not found' },
        { status: 404 }
      );
    }

    // Validate results data
    const invalidResults = results.filter(
      (result) =>
        result.writtenMarks == null ||
        result.oralMarks == null ||
        result.totalMarks == null ||
        isNaN(result.writtenMarks) ||
        isNaN(result.oralMarks) ||
        isNaN(result.totalMarks) ||
        result.writtenMarks < 0 ||
        result.writtenMarks > 90 ||
        result.oralMarks < 0 ||
        result.oralMarks > 10 ||
        result.totalMarks !== result.writtenMarks + result.oralMarks
    );
    if (invalidResults.length > 0) {
      console.warn("⚠️ [DEBUG] Invalid results found:", JSON.stringify(invalidResults, null, 2));
      return NextResponse.json(
        { error: 'Invalid marks: Written (0-90), Oral (0-10), Total must match sum' },
        { status: 400 }
      );
    }

    console.log("🔄 [DEBUG] Creating or updating results");

    const createOrUpdatePromises = results.map(async (result, idx) => {
      console.log(`📝 [DEBUG][${idx}] Processing studentId=${result.studentId}`);

      const existingResult = await prisma.boardExamResult.findUnique({
        where: {
          studentId_boardExamId: {
            studentId: result.studentId,
            boardExamId: result.boardExamId,
          },
        },
      });

      if (existingResult) {
        console.log(`✏️ [DEBUG][${idx}] Updating result for studentId=${result.studentId}`);
        return prisma.boardExamResult.update({
          where: {
            studentId_boardExamId: {
              studentId: result.studentId,
              boardExamId: result.boardExamId,
            },
          },
          data: {
            writtenMarks: result.writtenMarks,
            oralMarks: result.oralMarks,
            totalMarks: result.totalMarks,
            remarks: result.remarks || null,
            updatedAt: new Date(),
          },
        });
      } else {
        console.log(`➕ [DEBUG][${idx}] Creating result for studentId=${result.studentId}`);
        return prisma.boardExamResult.create({
          data: {
            boardExam: { connect: { id: result.boardExamId } },
            student: { connect: { id: result.studentId } },
            writtenMarks: result.writtenMarks,
            oralMarks: result.oralMarks,
            totalMarks: result.totalMarks,
            remarks: result.remarks || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }
    });

    await Promise.all(createOrUpdatePromises);

    console.log("✅ [DEBUG] All results processed successfully");

    return NextResponse.json(
      { message: 'Batch board exam results saved successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error(`💥 [ERROR] POST BoardExams/board-exam-results/batch:`, error);
    return NextResponse.json(
      { error: 'Failed to save batch board exam results', detail: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
    console.log("🔌 [DEBUG] Prisma disconnected");
  }
}