import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const { loginId, password } = await req.json();
    // Validate input
    if (!loginId || !password) {
      return NextResponse.json(
        { error: "Email or Admission Number and Password are required" },
        { status: 400 }
      );
    }

    // Find student by loginEmail or admissionNumber
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { admissionNumber: loginId },
          { loginEmail: loginId },
        ],
      },
      select: {
        id: true,
        loginEmail: true,
        admissionNumber: true,
        firstName: true,
        lastName: true,
        classId: true,
        branchId: true,
        schoolId: true, 
        status: true,
        loginPassword: true,
      },
    });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check if loginPassword exists
    if (!student.loginPassword) {
      return NextResponse.json(
        { error: "Account activation is required before first sign-in." },
        { status: 403 }
      );
    }

    if (student.status !== "ACTIVE") {
      return NextResponse.json({ error: "This student account is not active. Please contact the school office." }, { status: 403 });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, student.loginPassword);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Ensure JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Generate JWT
    const student_token = jwt.sign(
      {
        id: student.id,
        panel: "STUDENTS",
        loginEmail: student.loginEmail,
        admissionNumber: student.admissionNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        classId: student.classId,
        branchId: student.branchId || 1,
        schoolId: student.schoolId || 1,
        role: "STUDENT",
        brand_name: "Sure Success Point School",
        logo_url: "/knights.png",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({ student_token }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/students_auth/login", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
