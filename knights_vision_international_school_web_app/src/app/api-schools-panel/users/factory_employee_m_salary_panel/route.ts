import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';
// 🔹 **GET All Users**
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const factoryId = searchParams.get("factory_id");

    if (!factoryId) {
      return NextResponse.json({ error: "Missing factory_id in request" }, { status: 400 });
    }

    const users = await prisma.user.findMany({
      where: {
        factory_id: parseInt(factoryId),
      },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        address: true,
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
        biometric_id: true,
        aggrement_work_hours_per_day: true,
        base_salary: true,
        extra_per_half_hour_salary: true,
        regular_entry_time: true,
        regular_leave_time: true,
        salary_system: true,
        per_day_bonus_salary: true,
        per_day_salary: true,
        factory_id: true,
        machine_id: true,
        inventory_id: true,
        product_id: true,
        work_type_id: true,
        produced_material_id: true, 
        factory: {    // ✅ This is the correct relation name
          select: {
            factory_name: true,
            id: true // use `id` here instead of factory_id, as that's the actual field name
          }
        },    
      },
    });

    const formattedUsers = users.map((user) => ({
      ...user,
      uid_aadhar: user.uid_aadhar?.toString() || null,
      phone1: user.phone1?.toString() || null,
      phone2: user.phone2?.toString() || null,
      phone3: user.phone3?.toString() || null,
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

