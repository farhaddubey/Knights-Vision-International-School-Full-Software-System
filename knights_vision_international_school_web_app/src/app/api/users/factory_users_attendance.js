import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';
import bcrypt from "bcryptjs";
import verifyAuth from '../api_components/verifyAuth';
// 🔹 **GET All Users**
export async function GET(req) {
  try {
    // const auth = verifyAuth(req);
    // if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    // 🔹 Fetch users from DB with all required fields
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        reset_password_token: true,
        registration_token: true,
        is_active: true,
        blocked: true,
        prefered_language: true,
        created_at: true,
        updated_at: true,
        created_by_id: true,
        updated_by_id: true,
        address: true,
        clg_name: true,
        highest_degree: true,
        highest_marks_in_degree: true,
        village: true,
        block: true,
        municiple: true,
        police_station: true,
        district: true,
        state: true,
        country: true,
        pincode: true,
        phone_prefix: true,
        fatherName: true,
        motherName: true,
        phone1: true,
        phone2: true,
        phone3: true,
        uid_aadhar: true,
        department: true,
        roleId: true,
        role: true,
        confirmation_token: true,
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
      }
    });

    // 🔹 Convert BigInt fields to string
    const formattedUsers = users.map(user => ({
      ...user,
      uid_aadhar: user.uid_aadhar ? user.uid_aadhar.toString() : null,
      phone1: user.phone1 ? user.phone1.toString() : null,
      phone2: user.phone2 ? user.phone2.toString() : null,
      phone3: user.phone3 ? user.phone3.toString() : null,
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


export async function POST(req) {
  try {
    const auth = verifyAuth(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    if (!req.body) throw new Error("Request body is empty");
    const body = await req.json();

    const missingFields = ["username", "email", "password"].filter(field => !body[field]);
    if (missingFields.length) throw new Error(`Missing required fields: ${missingFields.join(", ")}`);

    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Convert BigInt fields safely
    const toBigInt = (value) => (value ? BigInt(value) : null);

    const newUser = await prisma.user.create({
      data: {
        username: body.username,
        email: body.email,
        password: hashedPassword,
        reset_password_token: body.resetPasswordToken,
        registration_token: body.registrationToken,
        is_active: body.isActive,
        blocked: body.blocked,
        prefered_language: body.preferedLanguage,
        created_by_id: body.createdById,
        updated_by_id: body.updatedById,
        address: body.address,
        clg_name: body.clgName,
        highest_degree: body.highestDegree,
        highest_marks_in_degree: body.highestMarksInDegree,
        village: body.village,
        block: body.block,
        municiple: body.municiple,
        police_station: body.policeStation,
        district: body.district,
        state: body.state,
        country: body.country,
        pincode: body.pincode,
        phone_prefix: body.phonePrefix,
        fatherName: body.fatherName,
        motherName: body.motherName,
        phone1: toBigInt(body.phone1),
        phone2: toBigInt(body.phone2),
        phone3: toBigInt(body.phone3),
        uid_aadhar: toBigInt(body.uidAadhar),
        department: body.department,
        roleId: 0,
        role: body.role ? body.role.toUpperCase() : null,
        confirmation_token: body.confirmationToken,
        confirmed: body.confirmed,
        biometric_id: body.biometricId,
        aggrement_work_hours_per_day: body.aggrementWorkHoursPerDay,
        base_salary: body.baseSalary,
        extra_per_half_hour_salary: body.extraPerHalfHourSalary,
        regular_entry_time: body.regularEntryTime,
        regular_leave_time: body.regularLeaveTime,
        salary_system: body.salarySystem,
        per_day_bonus_salary: body.perDayBonusSalary,
        per_day_salary: body.perDaySalary,
      },
    });

    return NextResponse.json({
      message: "User created successfully",
      user: {
        ...newUser,
        uid_aadhar: newUser.uid_aadhar?.toString() || null,
        phone1: newUser.phone1?.toString() || null,
        phone2: newUser.phone2?.toString() || null,
        phone3: newUser.phone3?.toString() || null,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("User creation error:", error.message);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

