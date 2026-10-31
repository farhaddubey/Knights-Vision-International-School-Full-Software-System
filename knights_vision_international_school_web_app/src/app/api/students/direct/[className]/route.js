import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

import { formatStudentAdmissionNumber } from "@/src/lib/students/admissionNumbers";


export async function GET(request, { params }) {
  try {
    const { className } = params;
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('searchQuery') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    // Dynamically calculate the current academic year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0-11 (Jan-Dec)
    const currentYear = currentDate.getFullYear();
    const academicYear = currentMonth >= 3 ? currentYear : currentYear - 1;

    const where = {
      class: {
        name: className.toUpperCase(),
        branchId: 1, // Assuming branchId is fixed; adjust dynamically if needed
        academicYear,
      }
    };

    const [students, totalCount] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          class: {
            include: {
              branch: {
                select: { name: true }, // Include branch name
              },
            },
          },
          feeScheme: {
            select: { category: true }, // Include fee scheme category
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { rollNumber: 'asc' },
      }),
      prisma.student.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    const formattedStudents = students.map((student) => ({
      id: student.id,
      firstName: student.firstName,
      middleName: student.middleName,
      lastName: student.lastName,
      admissionNumber: student.admissionNumber,
      rollNumber: student.rollNumber,
      studentCategory: student.studentCategory,
      gender: student.gender,
      dateOfBirth: student.dateOfBirth,
      admissionDate: student.admissionDate,
      status: student.status,
      aadhaarNumber: student.aadhaarNumber,
      isScholarshipHolder: student.isScholarshipHolder,
      isTransportRequired: student.isTransportRequired,
      class: {
        id: student.class?.id, 
        name: student.class?.name,
        section: student.class?.section,
        branchName: student.class?.branch?.name, // Add branch name
      },
      feeSchemeCategory: student.feeScheme?.category, // Add fee scheme category
    }));
console.log(formattedStudents); 
    return NextResponse.json(
      {
        students: formattedStudents,
        totalPages,
        currentPage: page,
        totalCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`GET Direct Students Error for ${params.className}:`, error.message);
    return NextResponse.json({ error: 'Failed to fetch students', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request, { params }) {
  try {
    const { className } = params;
    const data = await request.json();

    const classInfo = classMap[className.toLowerCase()];
    if (!classInfo || data.classId !== classInfo.id) {
      return NextResponse.json({ error: "Invalid class name or classId" }, { status: 400 });
    }

    if (!data.firstName || !data.lastName) {
      return NextResponse.json({ error: "First Name and Last Name are required" }, { status: 400 });
    }

    const academicYear = Number(data.academicYear) || new Date().getFullYear();

    const existingEmail = data.loginEmail ? await prisma.student.findUnique({
      where: { loginEmail: data.loginEmail },
    }) : null;

    if (existingEmail) {
      return NextResponse.json({ error: `Email ${data.loginEmail} already exists` }, { status: 409 });
    }

    const student = await prisma.student.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName || null,
        // Never accept a browser-supplied admission number. The permanent
        // SSPS code is derived from the immutable database student ID below.
        admissionNumber: null,
        rollNumber: data.rollNumber || null,
        studentCategory: data.studentCategory || "DIRECT_GENERAL",
        enrollmentMode: data.enrollmentMode || "DIRECT",
        gender: data.gender || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        admissionDate: data.admissionDate ? new Date(data.admissionDate) : null,
        aadhaarNumber: data.aadhaarNumber || null,
        loginEmail: data.loginEmail || null,
        // Account activation is handled by a one-time school code. Aadhaar/
        // UID and other government identifiers must never become passwords.
        loginPassword: null,
        isScholarshipHolder: data.isScholarshipHolder || false,
        isTransportRequired: data.isTransportRequired || false,
        biometricId: data.biometricId || null,
        guardianContact: data.guardianContact || null,
        bloodGroup: data.bloodGroup || null,
        nationality: data.nationality || null,
        religion: data.religion || null,
        casteCategory: data.casteCategory || null,
        profileImageUrl: data.profileImageUrl || null,
        dreamOrAim: data.dreamOrAim || null,
        hobbies: data.hobbies || null,
        specialTalents: data.specialTalents || null,
        fatherName: data.fatherName || null,
        fatherContact: data.fatherContact || null,
        fatherEmail: data.fatherEmail || null,
        fatherProfession: data.fatherProfession || null,
        fatherQualification: data.fatherQualification || null,
        fatherIncome: data.fatherIncome || null,
        motherName: data.motherName || null,
        motherContact: data.motherContact || null,
        motherEmail: data.motherEmail || null,
        motherProfession: data.motherProfession || null,
        motherQualification: data.motherQualification || null,
        motherIncome: data.motherIncome || null,
        guardianName: data.guardianName || null,
        guardianRelation: data.guardianRelation || null,
        guardianAddress: data.guardianAddress || null,
        emergencyContact: data.emergencyContact || null,
        residentialAddress: data.residentialAddress || null,
        city: data.city || null,
        state: data.state || null,
        pinCode: data.pinCode || null,
        preferredLanguage: data.preferredLanguage || null,
        previousSchoolName: data.previousSchoolName || null,
        lastExamPassed: data.lastExamPassed || null,
        lastExamResult: data.lastExamResult || null,
        previousAdmissionFee: data.previousAdmissionFee || null,
        previousMonthlyFee: data.previousMonthlyFee || null,
        reasonOfTransfer: data.reasonOfTransfer || null,
        previousSchoolMedium: data.previousSchoolMedium || null,
        previousSchoolBoard: data.previousSchoolBoard || null,
        previousSchoolCity: data.previousSchoolCity || null,
        healthImmunization: data.healthImmunization || null,
        classId: data.classId,
        branchId: data.branchId,
        schoolId: data.schoolId,
        academicYear,
        status: data.status || "ACTIVE",
      },
    });

    const admissionNumber = formatStudentAdmissionNumber(student.id, academicYear);
    const numberedStudent = await prisma.student.update({
      where: { id: student.id },
      data: {
        admissionNumber,
        rollNumber: student.rollNumber || admissionNumber,
      },
    });

    return NextResponse.json({ student: numberedStudent }, { status: 201 });
  } catch (error) {
    console.error(`POST /api/students/direct/${params.className} Error:`, error.message);
    return NextResponse.json({ error: "Failed to create student", detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
