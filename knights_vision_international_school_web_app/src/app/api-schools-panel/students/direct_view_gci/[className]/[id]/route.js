import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();

    if (!data.firstName || !data.lastName) {
      return NextResponse.json({ error: "First Name and Last Name are required" }, { status: 400 });
    }

    const existingStudent = await prisma.student.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: `Student with ID ${id} not found` }, { status: 404 });
    }

    // Admission numbers are permanent system identifiers. They must never be
    // edited from a profile form because students use them to sign in.
    if (data.admissionNumber && data.admissionNumber !== existingStudent.admissionNumber) {
      return NextResponse.json({ error: "Admission number is system-generated and cannot be changed." }, { status: 400 });
    }

    // Check if loginEmail is being changed and is unique
    if (data.loginEmail && data.loginEmail !== existingStudent.loginEmail) {
      const duplicateEmail = await prisma.student.findUnique({
        where: { loginEmail: data.loginEmail },
      });
      if (duplicateEmail) {
        return NextResponse.json({ error: `Email ${data.loginEmail} already exists` }, { status: 409 });
      }
    }

const updateData = {
  firstName: data.firstName || existingStudent.firstName,
  middleName: data.middleName || existingStudent.middleName,
  lastName: data.lastName || existingStudent.lastName,
  admissionNumber: existingStudent.admissionNumber,
  aadhaarNumber: data.aadhaarNumber || existingStudent.aadhaarNumber,
  loginEmail: data.loginEmail || existingStudent.loginEmail,
  loginPassword: data.loginPassword || existingStudent.loginPassword,
  rollNumber: data.rollNumber || existingStudent.rollNumber,
  enrollmentMode: data.enrollmentMode || existingStudent.enrollmentMode,
  studentCategory: data.studentCategory || existingStudent.studentCategory,
  classId: data.classId || existingStudent.classId,
  branchId: data.branchId || existingStudent.branchId,
  schoolId: data.schoolId || existingStudent.schoolId,
  academicYear: data.academicYear || existingStudent.academicYear,
  status: data.status || existingStudent.status,
  gender: data.gender || existingStudent.gender,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : existingStudent.dateOfBirth,
      admissionDate: data.admissionDate ? new Date(data.admissionDate) : existingStudent.admissionDate,
  isScholarshipHolder: data.isScholarshipHolder ?? existingStudent.isScholarshipHolder,
  isTransportRequired: data.isTransportRequired ?? existingStudent.isTransportRequired,
  biometricId: data.biometricId || existingStudent.biometricId,
  guardianContact: data.guardianContact || existingStudent.guardianContact,
  bloodGroup: data.bloodGroup || existingStudent.bloodGroup,
  nationality: data.nationality || existingStudent.nationality,
  religion: data.religion || existingStudent.religion,
  casteCategory: data.casteCategory || existingStudent.casteCategory,
  profileImageUrl: data.profileImageUrl || existingStudent.profileImageUrl,
  dreamOrAim: data.dreamOrAim || existingStudent.dreamOrAim,
  hobbies: data.hobbies || existingStudent.hobbies,
  specialTalents: data.specialTalents || existingStudent.specialTalents,

  fatherName: data.fatherName || existingStudent.fatherName,
  fatherContact: data.fatherContact || existingStudent.fatherContact,
  fatherEmail: data.fatherEmail || existingStudent.fatherEmail,
  fatherProfession: data.fatherProfession || existingStudent.fatherProfession,
  fatherQualification: data.fatherQualification || existingStudent.fatherQualification,
  fatherAnnualIncome: data.fatherAnnualIncome || existingStudent.fatherAnnualIncome,

  motherName: data.motherName || existingStudent.motherName,
  motherContact: data.motherContact || existingStudent.motherContact,
  motherEmail: data.motherEmail || existingStudent.motherEmail,
  motherProfession: data.motherProfession || existingStudent.motherProfession,
  motherQualification: data.motherQualification || existingStudent.motherQualification,
  motherAnnualIncome: data.motherAnnualIncome || existingStudent.motherAnnualIncome,

  guardianName: data.guardianName || existingStudent.guardianName,
  guardianRelation: data.guardianRelation || existingStudent.guardianRelation,
  guardianAddress: data.guardianAddress || existingStudent.guardianAddress,
  emergencyContact: data.emergencyContact || existingStudent.emergencyContact,

  residentialAddress: data.residentialAddress || existingStudent.residentialAddress,
  city: data.city || existingStudent.city,
  state: data.state || existingStudent.state,
  pinCode: data.pinCode || existingStudent.pinCode,

  preferredLanguage: data.preferredLanguage || existingStudent.preferredLanguage,
  previousSchoolName: data.previousSchoolName || existingStudent.previousSchoolName,
  lastExamPassed: data.lastExamPassed || existingStudent.lastExamPassed,
  lastExamResult: data.lastExamResult || existingStudent.lastExamResult,
  previousAdmissionFee: data.previousAdmissionFee || existingStudent.previousAdmissionFee,
  previousMonthlyFee: data.previousMonthlyFee || existingStudent.previousMonthlyFee,
  reasonOfTransfer: data.reasonOfTransfer || existingStudent.reasonOfTransfer,
  previousSchoolMedium: data.previousSchoolMedium || existingStudent.previousSchoolMedium,
  previousSchoolBoard: data.previousSchoolBoard || existingStudent.previousSchoolBoard,
  previousSchoolCity: data.previousSchoolCity || existingStudent.previousSchoolCity,

  healthImmunization: data.healthImmunization || existingStudent.healthImmunization,

  govt_studentId: data.govt_studentId || existingStudent.govt_studentId,
  finalAdmissionId: data.finalAdmissionId || existingStudent.finalAdmissionId,
  feeSchemeId: data.feeSchemeId || existingStudent.feeSchemeId,

  updatedAt: new Date()
};


    const student = await prisma.student.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return NextResponse.json({ student }, { status: 200 });
  } catch (error) {
    console.error(`PUT /api/students/direct/${params.className}/${params.id} Error:`, error.message);
    return NextResponse.json({ error: "Failed to update student", detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}


export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const studentId = parseInt(id);
    if (!studentId) {
      return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
    }

    await prisma.student.delete({ where: { id: studentId } });

    return NextResponse.json({ message: 'Student deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`DELETE Student Error for ${params.className}:`, error.message);
    return NextResponse.json({ error: 'Failed to delete student', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request, {params}){
  try{
    const {id} = params; 
    const studentId=parseInt(id); 
    const response=await prisma.student.findUnique({
      where:{
        id: studentId
      },
    })
    return NextResponse.json(response);
  }catch(error){
    console.error("Get failed"); 
    return NextResponse.json({error: 'Failed to fetch'});
  }finally{
    await prisma.$disconnect(); 
  }
}
