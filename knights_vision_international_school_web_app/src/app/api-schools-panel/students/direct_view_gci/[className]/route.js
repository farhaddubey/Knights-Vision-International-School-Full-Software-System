import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';
import jwt from 'jsonwebtoken';
import { formatStudentAdmissionNumber } from '@/src/lib/students/admissionNumbers';
// Define ClassName enum values (matching the Prisma schema)
const validClassNames = [
  'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XS', 'XI', 'XII', 'XIIS', 'XIII', 'XIIIJ'
];

export async function GET(request, { params }) {
  try {
    const { className } = params;
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('searchQuery') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    console.log("Class Name is", className);

    // Validate className against ClassName enum
    if (!validClassNames.includes(className.toUpperCase())) {
      return NextResponse.json({ error: 'Invalid class name' }, { status: 400 });
    }

    // Extract and decode JWT token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Use your JWT secret key
    } catch (err) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { branchId, schoolId } = decodedToken;
    if (!branchId || !schoolId) {
      return NextResponse.json({ error: 'Missing branchId or schoolId in token' }, { status: 400 });
    }

    // Dynamically calculate the current academic year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0-11 (Jan-Dec)
    const currentYear = currentDate.getFullYear();
    const academicYear = currentMonth >= 3 ? currentYear : currentYear - 1;

    const where = {
      class: {
        name: className.toUpperCase(),
        branchId: parseInt(branchId), // Use decoded branchId
        schoolId: parseInt(schoolId), // Use decoded schoolId
        academicYear,
      },
      OR: searchQuery
        ? [
            { firstName: { contains: searchQuery, mode: 'insensitive' } },
            { lastName: { contains: searchQuery, mode: 'insensitive' } },
            { admissionNumber: { contains: searchQuery, mode: 'insensitive' } },
          ]
        : undefined,
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
            select: { category: true, monthlyFee: true, admissionFee: true, readmissionFee: true}, // Include fee scheme category
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
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
      fatherName: student.fatherName, 
      fatherContact: student.fatherContact, 
      fatherProfession: student.fatherProfession, 
      fatherQualification: student.fatherQualification, 
      fatherIncome: student.fatherIncome, 
      motherName: student.motherName, 
      motherContact:student.motherContact, 
      motherEmail: student.motherEmail, 
      motherProfession: student.motherProfession, 
      motherIncome: student.motherIncome,
      guardianName: student.guardianName, 
      guardianAddress: student.guardianAddress, 
      guardianRelation: student.guardianRelation, 
      residentialAddress: student.residentialAddress, 
      city: student.city, 
      pinCode: student.pinCode, 
      class: {
        name: student.class?.name,
        section: student.class?.section,
        branchName: student.class?.branch?.name, // Add branch name
      },
      feeSchemeCategory: student.feeScheme?.category, // Add fee scheme category
      feeMonthly: student.feeScheme?.monthlyFee,
      admissionFee: student.feeScheme?.admissionFee, 
      readmissionFee: student.feeScheme?.readmissionFee 
    }));

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

    // Required field validation
    if (
      !data.firstName ||
      !data.lastName ||
      !data.studentCategory ||
      !data.enrollmentMode ||
      !data.feeSchemeId ||
      !data.admissionDate ||
      !data.classId
    ) {
      return NextResponse.json(
        { error: "Required fields (First Name, Last Name, Student Category, Enrollment Mode, Fee Scheme, Admission Date, Class ID) are missing" },
        { status: 400 }
      );
    }

    // Validate classId
    const schoolClass = await prisma.schoolClass.findUnique({
      where: { id: data.classId },
    });
    if (!schoolClass) {
      return NextResponse.json({ error: `Invalid classId: ${data.classId}` }, { status: 400 });
    }

    // Validate feeSchemeId
    const feeScheme = await prisma.feeScheme.findUnique({
      where: { id: data.feeSchemeId },
    });
    if (!feeScheme || feeScheme.classId !== data.classId) {
      return NextResponse.json({ error: `Invalid feeSchemeId: ${data.feeSchemeId} for classId: ${data.classId}` }, { status: 400 });
    }

    // Check for existing loginEmail
    if (data.loginEmail) {
      const existingEmail = await prisma.student.findUnique({
        where: { loginEmail: data.loginEmail },
      });
      if (existingEmail) {
        return NextResponse.json({ error: `Email ${data.loginEmail} already exists` }, { status: 409 });
      }
    }

    const academicYear = Number(data.academicYear) || schoolClass.academicYear;
    const student = await prisma.$transaction(async (tx) => {
      const created = await tx.student.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName || null,
        // Never derive an identifier or password from government identity data.
        admissionNumber: null,
        rollNumber: data.rollNumber || null,
        studentCategory: data.studentCategory,
        enrollmentMode: data.enrollmentMode,
        gender: data.gender || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        admissionDate: data.admissionDate ? new Date(data.admissionDate) : null,
        aadhaarNumber: data.aadhaarNumber || null,
        fatherAadhaarNumber: data.fatherAadhaarNumber || null,
        motherAadhaarNumber: data.motherAadhaarNumber || null,
        loginEmail: data.loginEmail || null,
        loginPassword: null,
        biometricId: data.biometricId || null,
        govt_studentId: data.govt_studentId || null,
        admittedViaTest: data.admittedViaTest || false,
        isScholarshipHolder: data.isScholarshipHolder || false,
        isTransportRequired: data.isTransportRequired || false,
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
        fatherIncome: data.fatherIncome ? parseFloat(data.fatherIncome) : null,
        motherName: data.motherName || null,
        motherContact: data.motherContact || null,
        motherEmail: data.motherEmail || null,
        motherProfession: data.motherProfession || null,
        motherQualification: data.motherQualification || null,
        motherIncome: data.motherIncome ? parseFloat(data.motherIncome) : null,
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
        lastExamResult: data.lastExamResult ? parseFloat(data.lastExamResult) : null,
        previousAdmissionFee: data.previousAdmissionFee
          ? parseFloat(data.previousAdmissionFee)
          : null,
        previousMonthlyFee: data.previousMonthlyFee ? parseFloat(data.previousMonthlyFee) : null,
        reasonOfTransfer: data.reasonOfTransfer || null,
        previousSchoolMedium: data.previousSchoolMedium || null,
        previousSchoolBoard: data.previousSchoolBoard || null,
        previousSchoolCity: data.previousSchoolCity || null,
        healthImmunization: data.healthImmunization || null,
        classId: data.classId,
        branchId: data.branchId || 1,
        schoolId: data.schoolId || 1,
        feeSchemeId: data.feeSchemeId,
        academicYear,
        status: data.status || "ACTIVE",
      },
      });
      const admissionNumber = formatStudentAdmissionNumber(created.id, academicYear);
      return tx.student.update({
        where: { id: created.id },
        data: { admissionNumber, rollNumber: created.rollNumber || admissionNumber },
      });
    });

    return NextResponse.json({ student }, { status: 201 });
  } catch (error) {
    console.error(`POST /api/students/direct/${params.className} Error:`, error.message);
    return NextResponse.json(
      { error: "Failed to create student", detail: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
