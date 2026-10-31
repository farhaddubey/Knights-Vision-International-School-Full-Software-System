import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
const jwt = require("jsonwebtoken");

export async function GET(request, { params }) {
  try {
    const { id } = await params; // Await params to resolve dynamic route parameter

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication token is missing or invalid" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Authentication token is missing" }, { status: 401 });
    }

    jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");

    const userId = parseInt(id);
    if (isNaN(userId) || userId <= 0) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        username: true,
        email: true,
        is_active: true,
        blocked: true,
        prefered_language: true,
        created_at: true,
        updated_at: true,
        role: true,
        department: true,
        rfid_card_no: true,
        confirmed: true,
        biometric_id: true,
        aggrement_work_hours_per_day: true,
        base_salary: true,
        extra_per_half_hour_salary: true,
        regular_entry_time: true,
        regular_leave_time: true,
        salary_system: true,
        per_day_bonus_salary: true,
        per_day_salary: true,
        clg_name: true,
        highest_degree: true,
        highest_marks: true,
        years_experience: true,
        specialization: true,
        bio: true,
        languages_known: true,
        address: true,
        fatherName: true,
        motherName: true,
        phone1: true,
        phone_prefix: true,
        village: true,
        district: true,
        state: true,
        country: true,
        pincode: true,
        whatsapp: true,
        aadhar_verified: true,
        schoolId: true,
        branchId: true,
        img_url: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error(`GET User ${id} Error:`, error.message);
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch user", detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request, { params }) {
  const { id } = await params; // Await params to resolve dynamic route parameter
  try {
    const data = await request.json();

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication token is missing or invalid" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Authentication token is missing" }, { status: 401 });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    const userIdFromToken = decodedToken.userId ? parseInt(decodedToken.userId) : null;

    const userId = parseInt(id);
    if (isNaN(userId) || userId <= 0) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      console.log("User is not found..")
      console.log("User is not found..")
      console.log("User is not found..")
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const validRoles = [
      "ADMIN", "MANAGER", "GROUP_CEO", "BOARD_OF_DIRECTORS", "REGIONAL_DIRECTOR",
      "DISTRICT_MANAGER", "TRANSPORT_MANAGER", "INFRASTRUCTURE_MANAGER", "EVENT_COORDINATOR",
      "MEDIA_COORDINATOR", "LEGAL_COMPLIANCE_OFFICER", "STATE_EXPANSION_HEAD",
      "BRANCH_DEVELOPMENT_OFFICER", "FRANCHISE_SUPPORT_MANAGER", "STUDENT_WELFARE_OFFICER",
      "SCHOOL_MARKETING_MANAGER", "INTERN", "TEACHER", "STAFF", "SYSTEM_IN_CHARGE",
      "ACADEMICS_IN_CHARGE", "TEACHER_IN_CHARGE", "GUARDIAN_COMMUNICATION_IN_CHARGE",
      "FINANCE_MANAGEMENT_OFFICER", "PRINCIPAL_HEAD", "ASSISTANT_TEACHER", "LIBRARIAN",
      "EXAM_CONTROLLER", "ACADEMIC_RESEARCHER", "HR_OFFICER", "SECURITY_HEAD"
    ];

    const validDepartments = [
      "ACADEMIC", "ADMINISTRATION", "DISTRICT_CONTROLLER", "STATE_CONTROLLER",
      "EXTRACURRICULAR", "SPECIAL_EDUCATION", "VOCATIONAL_TRAINING", "GUIDANCE_COUNSELING",
      "LIBRARY_SERVICES", "TECHNICAL_SUPPORT", "STUDENT_WELFARE", "INTERN_FACULTY"
    ];

    const validSalarySystems = ["Weekly", "Monthly", "Daily"];

    if (data.role && !validRoles.includes(data.role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (data.role_teacher && !validRoles.includes(data.role_teacher)) {
      return NextResponse.json({ error: "Invalid teacher role" }, { status: 400 });
    }

    if (data.department && !validDepartments.includes(data.department)) {
      return NextResponse.json({ error: "Invalid department" }, { status: 400 });
    }

    if (data.salary_system && !validSalarySystems.includes(data.salary_system)) {
      return NextResponse.json({ error: "Invalid salary system" }, { status: 400 });
    }

    // Convert BigInt fields safely
    const toBigInt = (value) => value ? BigInt(value) : null;

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        username: data.username || null,
        email: data.email,
        is_active: data.is_active ?? true,
        blocked: data.blocked ?? false,
        prefered_language: data.prefered_language || null,
        department: data.department || null,
        rfid_card_no: data.rfid_card_no || null,
        confirmed: data.confirmed ?? false,
        biometric_id: data.biometric_id || null,
        aggrement_work_hours_per_day: data.aggrement_work_hours_per_day ? parseFloat(data.aggrement_work_hours_per_day) : null,
        base_salary: data.base_salary ? parseFloat(data.base_salary) : null,
        base_salary_per_day: data.base_salary_per_day ? parseFloat(data.base_salary_per_day) : null,
        extra_per_half_hour_salary: data.extra_per_half_hour_salary ? parseFloat(data.extra_per_half_hour_salary) : null,
        regular_entry_time: data.regular_entry_time || null,
        regular_leave_time: data.regular_leave_time || null,
        salary_system: data.salary_system || null,
        per_day_bonus_salary: data.per_day_bonus_salary ? parseFloat(data.per_day_bonus_salary) : null,
        per_day_salary: data.per_day_salary ? parseFloat(data.per_day_salary) : null,
        role: data.role || null,
        role_teacher: data.role_teacher || null,
        clg_name: data.clg_name || null,
        highest_degree: data.highest_degree || null,
        highest_marks: data.highest_marks || null,
        years_experience: data.years_experience ? parseInt(data.years_experience) : null,
        specialization: data.specialization || null,
        bio: data.bio || null,
        languages_known: data.languages_known || null,
        bar_registration_no: data.bar_registration_no || null,
        address: data.address || null,
        fatherName: data.fatherName || null,
        motherName: data.motherName || null,
        phone1: toBigInt(data.phone1),
        phone2: toBigInt(data.phone2),
        phone3: toBigInt(data.phone3),
        uid_aadhar: toBigInt(data.uid_aadhar),
        village: data.village || null,
        block: data.block || null,
        municiple: data.municiple || null,
        police_station: data.police_station || null,
        district: data.district || null,
        state: data.state || null,
        country: data.country || null,
        pincode: data.pincode || null,
        phone_prefix: data.phone_prefix || null,
        whatsapp: data.whatsapp || null,
        aadhar_verified: data.aadhar_verified ?? false,
        schoolId: data.schoolId ? parseInt(data.schoolId) : null,
        branchId: data.branchId ? parseInt(data.branchId) : null,
        img_url: data.img_url || null,
        updated_at: new Date(),
        updated_by_id: userIdFromToken, // Track who updated the user
      },
    });

    // Convert BigInt fields in response
    return NextResponse.json(
      {
        message: "User updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`PUT User ${id} Error:`, error.message);
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Email or Aadhar UID already exists" }, { status: 400 });
    }
    if (error.code === "P2003") {
      return NextResponse.json({ error: "Invalid foreign key for schoolId or branchId" }, { status: 400 });
    }
    if (error.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update user", detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params; // Await params to resolve dynamic route parameter

    // const authHeader = request.headers.get("Authorization");
    // if (!authHeader || !authHeader.startsWith("Bearer ")) {
    //   return NextResponse.json({ error: "Authentication token is missing or invalid" }, { status: 401 });
    // }

    // const token = authHeader.split(" ")[1];
    // if (!token) {
    //   return NextResponse.json({ error: "Authentication token is missing" }, { status: 401 });
    // }

    const userId = parseInt(id);
    if (isNaN(userId) || userId <= 0) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(`DELETE User ${id} Error:`, error.message);
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    if (error.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete user", detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}