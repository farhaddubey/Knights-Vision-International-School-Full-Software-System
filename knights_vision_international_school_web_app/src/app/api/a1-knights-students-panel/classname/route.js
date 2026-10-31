import { NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const studentId = decoded.id;
    if (!studentId) {
      return NextResponse.json({ error: "Invalid token: No student ID" }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { id: parseInt(studentId) },
      select: {
        class: { select: { name: true } },
      },
    });

    if (!student || !student.class?.name) {
      return NextResponse.json({ error: "Student or class not found" }, { status: 404 });
    }

    return NextResponse.json({ className: student.class.name }, { status: 200 });
  } catch (error) {
    console.error("POST /api-schools-panel/auth/decode-token Error:", error.message);
    return NextResponse.json({ error: "Failed to decode token", detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}