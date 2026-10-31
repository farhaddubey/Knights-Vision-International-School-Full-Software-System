import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET(request, context) {
  try {
    const { className, id } = await context.params;
    const studentId = parseInt(id);
    if (!studentId) {
      return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
    }

    const currentYear = new Date().getFullYear();

    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        academicYear: currentYear,
        class: { name: className.toUpperCase() },
      },
      include: {
        class: { select: { name: true, section: true } },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found or does not meet criteria' }, { status: 404 });
    }

    const studentData = {
      basicInfo: {
        fullName: `${student.firstName} ${student.middleName || ''} ${student.lastName}`.trim(),
        rollNo: student.rollNumber || 'N/A',
        uidNo: student.admissionNumber || 'N/A',
        // A controlled same-origin endpoint. The photo route performs its
        // own permission and class-scope check before returning image bytes.
        profileImageUrl: student.profileImageUrl || null,
      },
      contactInfo: {
        guardianName: student.guardianName || 'N/A',
      },
      classInfo: {
        collectionName: `Class_${student.class.name.replace('Class ', '')}`,
      },
    };

    return NextResponse.json({ studentData }, { status: 200 });
  } catch (error) {
    console.error("GET MonthlyAdmitCards/admit-card detail Error:", error.message);
    return NextResponse.json({ error: 'Failed to fetch student data', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
