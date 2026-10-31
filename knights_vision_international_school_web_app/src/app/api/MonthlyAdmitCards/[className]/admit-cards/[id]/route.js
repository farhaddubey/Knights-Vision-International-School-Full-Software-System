import { NextRequest, NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';


export async function GET(request, { params }) {
  try {
    const { className, id } = params;
    const studentId = parseInt(id);
    if (!studentId) {
      return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
    }

    const currentYear = new Date().getFullYear();

    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        classId: classInfo.id,
        academicYear: currentYear,
        admittedViaTest: false,
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
        // Maintain legacy compatibility without exposing a storage URL.
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
    console.error(`GET MonthlyAdmitCards/${params.className}/admit-cards/${params.id} Error:`, error.message);
    return NextResponse.json({ error: 'Failed to fetch student data', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
