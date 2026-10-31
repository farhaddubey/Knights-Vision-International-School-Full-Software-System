import { NextRequest, NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET() {
  const punishments = await prisma.punishment.findMany({
    include: {
      class: true,
      StudentBehaviourLog: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(punishments);
}

export async function POST(req: Request) {
  const data = await req.json();

  try {
    const newPunishment = await prisma.punishment.create({
      data: {
        classId: data.classId ?? null,
        title: data.title,
        description: data.description,
        severity: data.severity,
        type: data.type, // Ensure frontend sends correct ENUM string
      },
    });

    return NextResponse.json(newPunishment);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create punishment", detail: error }, { status: 500 });
  }
}
