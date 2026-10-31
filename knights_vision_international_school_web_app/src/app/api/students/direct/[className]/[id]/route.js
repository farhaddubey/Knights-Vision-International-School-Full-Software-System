import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

import { formatStudentAdmissionNumber } from "@/src/lib/students/admissionNumbers";

export async function PUT(request, { params }) {
  try {
    const { className, id } = params;
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

    // Admission numbers are permanent login and school identifiers. They are
    // issued centrally from the immutable student ID and cannot be edited.
    if (data.admissionNumber && data.admissionNumber !== existingStudent.admissionNumber) {
      return NextResponse.json({ error: "Admission number is permanent and cannot be edited." }, { status: 400 });
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
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName || null,
      admissionNumber: existingStudent.admissionNumber || formatStudentAdmissionNumber(existingStudent.id, existingStudent.academicYear || new Date().getFullYear()),
      rollNumber: data.rollNumber || existingStudent.rollNumber,
      studentCategory: data.studentCategory || existingStudent.studentCategory,
      enrollmentMode: data.enrollmentMode || existingStudent.enrollmentMode,
      gender: data.gender || null,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      admissionDate: data.admissionDate ? new Date(data.admissionDate) : null,
      aadhaarNumber: data.aadhaarNumber || null,
      loginEmail: data.loginEmail || null,
      isScholarshipHolder: data.isScholarshipHolder ?? existingStudent.isScholarshipHolder,
      isTransportRequired: data.isTransportRequired ?? existingStudent.isTransportRequired,
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
      academicYear: data.academicYear || existingStudent.academicYear,
      status: data.status || existingStudent.status,
      updatedAt: new Date(),
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
