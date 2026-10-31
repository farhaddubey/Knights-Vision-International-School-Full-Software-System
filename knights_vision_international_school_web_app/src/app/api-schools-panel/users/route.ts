import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from '@/src/lib/prisma';
import { Decimal } from "@prisma/client/runtime/library";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10);
    const skip = (page - 1) * pageSize;

    // Fetch paginated users with related data
    const users = await prisma.user.findMany({
      skip,
      take: pageSize,
      select:{
  username: true, 
  email: true, 
  role: true, 
  role_teacher: true, 
  department: true, 
  uid_aadhar: true, 
  phone_prefix: true, 
  phone1: true, 
  phone2: true, 
  aggrement_work_hours_per_day: true, 
  regular_entry_time: true, 
  regular_leave_time: true,  
  highest_degree: true, 
  highest_marks: true, 
  years_experience: true, 
  specialization: true, 
  clg_name: true, 
  address: true,
  base_salary: true,
  extra_per_half_hour_salary: true,
  per_day_bonus_salary: true,
  per_day_salary: true,
  salary_system: true, 
  rfid_card_no: true
}
    });
    // Count total users for pagination
    const totalUsers = await prisma.user.count();

const transformedUsers = users.map((user) => ({
  ...user,
  phone1: user.phone1?.toString() || null,
  phone2: user.phone2?.toString() || null,
  uid_aadhar: user.uid_aadhar?.toString() || null,
}));


    return NextResponse.json({
      users: transformedUsers,
      total: totalUsers,
      page,
      pageSize,
      totalPages: Math.ceil(totalUsers / pageSize),
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users", details: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}



export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Hash password
const hashedPassword = await bcrypt.hash(
  (body.uid_aadhar ? String(body.uid_aadhar) : "ilovekiread"),
  10
);

    // Convert BigInt fields safely
    const toBigInt = (value: string | number | undefined) => value ? BigInt(value) : null;

    // Prepare user data
    const userData = {
      branchId: body.branchId || null,
      schoolId: body.schoolId || null, 
      username: body.username || null,
      email: body.email || null,
      password: hashedPassword,
      reset_password_token: body.reset_password_token || null,
      registration_token: body.registration_token || null,
      is_active: body.is_active ?? true,
      blocked: body.blocked ?? false,
      prefered_language: body.prefered_language || null,
      department: body.department || null,
      role: body.role ? body.role.toUpperCase() : null,
      confirmation_token: body.confirmation_token || null,
      confirmed: body.confirmed ?? false,
      rfid_card_no: body.rfid_card_no || null,
      biometric_id: body.biometric_id || null,
      aggrement_work_hours_per_day: body.aggrement_work_hours_per_day ? parseFloat(body.aggrement_work_hours_per_day) : null,
      base_salary: body.base_salary ? parseFloat(body.base_salary) : null,
      extra_per_half_hour_salary: body.extra_per_half_hour_salary ? parseFloat(body.extra_per_half_hour_salary) : null,
      regular_entry_time: body.regular_entry_time || null,
      regular_leave_time: body.regular_leave_time || null,
      salary_system: body.salary_system || null,
      per_day_bonus_salary: body.per_day_bonus_salary ? parseFloat(body.per_day_bonus_salary) : null,
      per_day_salary: body.per_day_salary ? parseFloat(body.per_day_salary) : null,
      published_at: body.published_at ? new Date(body.published_at) : null,
      img_url: body.img_url || null,
      clg_name: body.clg_name || null,
      highest_degree: body.highest_degree || null,
      highest_marks: body.highest_marks || null,
      years_experience: body.years_experience ? parseInt(body.years_experience) : null,
      specialization: body.specialization || null,
      bio: body.bio || null,
      languages_known: body.languages_known || null,
      bar_registration_no: body.bar_registration_no || null,
      address: body.address || null,
      fatherName: body.fatherName || null,
      motherName: body.motherName || null,
      phone1: toBigInt(body.phone1),
      phone2: toBigInt(body.phone2),
      phone3: toBigInt(body.phone3),
      uid_aadhar: toBigInt(body.uid_aadhar),
      village: body.village || null,
      block: body.block || null,
      municiple: body.municiple || null,
      police_station: body.police_station || null,
      district: body.district || null,
      state: body.state || null,
      country: body.country || null,
      pincode: body.pincode || null,
      phone_prefix: body.phone_prefix || null,
      whatsapp: body.whatsapp || null,
      aadhar_verified: body.aadhar_verified ?? false,
      created_at: new Date(),
      updated_at: new Date(),
      created_by_id: body.created_by_id ? parseInt(body.created_by_id) : null,
      updated_by_id: body.updated_by_id ? parseInt(body.updated_by_id) : null,
    };

    // Create user
    const newUser = await prisma.user.create({ data: userData });

    // Convert BigInt fields in response
    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          ...newUser,
          phone1: newUser.phone1?.toString() || null,
          phone2: newUser.phone2?.toString() || null,
          phone3: newUser.phone3?.toString() || null,
          uid_aadhar: newUser.uid_aadhar?.toString() || null,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("User creation error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Invalid foreign key value" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

