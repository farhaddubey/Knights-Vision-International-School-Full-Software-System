import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';


export async function GET(request: Request) {

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const academicYear = parseInt(searchParams.get('academicYear') || '2025', 10);

  try {
    const fees = await prisma.monthlyFee.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where: { academicYear },
      include: {
        student: { select: { firstName: true, lastName: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
    const total = await prisma.monthlyFee.count({ where: { academicYear } });
    return NextResponse.json({
      fees,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Error fetching monthly fees:', error);
    return NextResponse.json({ error: 'Failed to fetch monthly fees' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const { amount, method, transactionId, remarks, isWaived } = await request.json();

  try {
    const fee = await prisma.monthlyFee.findUnique({ where: { id } });
    if (!fee) {
      return NextResponse.json({ error: 'Fee not found' }, { status: 404 });
    }

    const updates = [];
    if (isWaived) {
      updates.push(
        prisma.monthlyFee.update({
          where: { id },
          data: {
            status: 'WAIVED',
            isWaived: true,
            waivedAmount: fee.totalDue,
            remarks,
            updatedAt: new Date(),
          },
        })
      );
    } else {
      const newPaidAmount = fee.paidAmount + parseFloat(amount);
      const status = newPaidAmount >= fee.totalDue ? 'PAID' : 'PARTIALLY_PAID';
      updates.push(
        prisma.monthlyFee.update({
          where: { id },
          data: {
            paidAmount: newPaidAmount,
            status,
            remarks,
            updatedAt: new Date(),
          },
        }),
        prisma.monthlyFeePayment.create({
          data: {
            monthlyFeeId: id,
            amount: parseFloat(amount),
            method,
            transactionId,
            remarks,
            paymentDate: new Date(),
          },
        })
      );
    }

    const [updatedFee] = await prisma.$transaction(updates);
    return NextResponse.json({ payment: { ...updatedFee, amount: parseFloat(amount), method, transactionId, paymentDate: new Date(), isWaived } });
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }
}