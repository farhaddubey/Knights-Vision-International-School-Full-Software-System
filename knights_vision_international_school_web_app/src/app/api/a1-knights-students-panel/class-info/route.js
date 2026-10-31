import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
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
    const classId = decoded.classId;
    if (!studentId || !classId) {
      return NextResponse.json({ error: "Invalid token: No student ID or class ID" }, { status: 401 });
    }

    const { classId: requestedClassId } = Object.fromEntries(request.nextUrl.searchParams);

    if (parseInt(requestedClassId) !== classId) {
      return NextResponse.json({ error: "Unauthorized: Class ID mismatch" }, { status: 403 });
    }

    const classInfo = await prisma.schoolClass.findUnique({
      where: { id: parseInt(classId) },
      select: { name: true, section: true },
    });

    if (!classInfo) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const className = `${classInfo.name}${classInfo.section ? ` - ${classInfo.section}` : ""}`;

    return NextResponse.json({ className }, { status: 200 });
  } catch (error) {
    console.error("GET /api/a1-knights-students-panel/class-info Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch class info", detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
