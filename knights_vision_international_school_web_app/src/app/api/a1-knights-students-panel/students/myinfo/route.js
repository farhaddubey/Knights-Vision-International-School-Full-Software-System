import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  requireStudentSession,
  StudentAuthorizationError,
} from "@/src/lib/student/sessionAuthorization";

export async function GET(request) {
  try {
    const { student: sessionStudent } = await requireStudentSession(request);
    const student = await prisma.student.findUnique({
      where: { id: sessionStudent.id },
      select: {
        id: true,
        loginEmail: true,
        admissionNumber: true,
        rollNumber: true,
        aadhaarNumber: true,
        academicYear: true,
        admittedViaTest: true,
        studentCategory: true,
        enrollmentMode: true,
        isScholarshipHolder: true,
        isTransportRequired: true,
        firstName: true,
        middleName: true,
        lastName: true,
        gender: true,
        dateOfBirth: true,
        admissionDate: true,
        status: true,
        bloodGroup: true,
        nationality: true,
        religion: true,
        casteCategory: true,
        profileImageUrl: true,
        dreamOrAim: true,
        hobbies: true,
        specialTalents: true,
        fatherName: true,
        fatherContact: true,
        fatherEmail: true,
        fatherProfession: true,
        fatherQualification: true,
        fatherIncome: true,
        motherName: true,
        motherContact: true,
        motherEmail: true,
        motherProfession: true,
        motherQualification: true,
        motherIncome: true,
        guardianName: true,
        guardianRelation: true,
        guardianContact: true,
        guardianAddress: true,
        emergencyContact: true,
        residentialAddress: true,
        city: true,
        state: true,
        pinCode: true,
        previousSchoolName: true,
        lastExamPassed: true,
        lastExamResult: true,
        previousAdmissionFee: true,
        previousMonthlyFee: true,
        reasonOfTransfer: true,
        previousSchoolMedium: true,
        previousSchoolBoard: true,
        previousSchoolCity: true,
        healthImmunization: true,
        preferredLanguage: true,
        createdAt: true,
        updatedAt: true,
        class: { select: { name: true, section: true } },
        branch: { select: { name: true } },
      },
    });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    // Authentication hashes and activation material are intentionally omitted.
    return NextResponse.json({ student });
  } catch (error) {
    if (error instanceof StudentAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET student profile failed:", error);
    return NextResponse.json({ error: "Unable to fetch student information." }, { status: 500 });
  }
}
