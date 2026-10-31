// pages/api/payments/index.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// ✅ GET all payments
export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: { request: true, currency: true, tax: true },
    });
    return NextResponse.json(payments);
  } catch (error) {
    console.error('❌ GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

// ✅ POST create payment
export async function POST(request) {
  try {
    const body = await request.json();
    const payment = await prisma.payment.create({
      data: {
        requestId: body.requestId,
        amount: body.amount,
        currencyId: body.currencyId,
        status: body.status ?? 'UNPAID',
        method: body.method ?? 'CREDIT_CARD',
        taxId: body.taxId,
      },
    });
    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('❌ POST Error:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}