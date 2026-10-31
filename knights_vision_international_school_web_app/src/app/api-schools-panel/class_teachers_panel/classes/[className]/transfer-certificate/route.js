import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';


export async function POST(request, { params }) {
  try {
    const { className } = params;
    const data = await request.json();
    const {
      studentId,
      branchId,
      schoolId,
      classId,
      academicYear,
      reason,
      dateOfLeaving,
      conduct,
      remarks,
    } = data;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true, feeScheme: true },
    });
    if (!student || student.classId !== classId) {
      return NextResponse.json({ error: 'Student does not belong to the specified class' }, { status: 400 });
    }

    // Check if all fees are paid
    const monthlyFees = await prisma.monthlyFee.findMany({
      where: {
        studentId,
        academicYear,
      },
    });
    const hasUnpaidFees = monthlyFees.some(
      (fee) => fee.status === 'UNPAID' || fee.status === 'PARTIALLY_PAID'
    );
    if (hasUnpaidFees) {
      return NextResponse.json({ error: 'Outstanding fees detected. Please clear all dues.' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (prisma) => {
      const transferCertificateId = `TC-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

      // Update or create admission with TC details
      const admission = await prisma.admission.upsert({
        where: { id: student.finalAdmissionId || 0 },
        update: {
          transferCertificateId,
          status: 'COMPLETED',
          updatedAt: new Date(),
        },
        create: {
          studentId,
          branchId,
          schoolId,
          classId,
          admissionType: 'DIRECT',
          admissionDate: new Date(),
          status: 'COMPLETED',
          feeSchemeId: student.feeSchemeId,
          finalAdmissionNumber: `FAN${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          academicYear,
          transferCertificateId,
        },
      });

      // Update student status to TRANSFERRED
      await prisma.student.update({
        where: { id: studentId },
        data: {
          status: 'TRANSFERRED',
          finalAdmissionId: admission.id,
        },
      });

      return { transferCertificateId };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(`POST /api/classes/${params.className}/transfer-certificate Error:`, error.message);
    return NextResponse.json({ error: 'Failed to generate TC', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}