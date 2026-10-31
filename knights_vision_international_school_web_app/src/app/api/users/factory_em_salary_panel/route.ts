import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';
// 🔹 **GET All Users**
export async function GET(req) {
  try {
    const {searchParams} = new URL(req.url); 
    const factoryId=searchParams.get("factory_id");
    if(!factoryId){
      return NextResponse.json({error: "Missing FactoryID"}); 
    }
    // 🔹 Fetch users from DB with all required fields
    const users = await prisma.user.findMany({
      where:{
        factory_id: parseInt(factoryId),
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone1: true,
        uid_aadhar: true,
        department: true,
        role: true,
        aggrement_work_hours_per_day: true,
        base_salary: true,
        extra_per_half_hour_salary: true,
        regular_entry_time: true,
        regular_leave_time: true,
        salary_system: true,
        per_day_bonus_salary: true,
        per_day_salary: true,
        // 🔄 Relational Includes
        factory: {
          select:{
            factory_name: true 
          }
        }
      },
      
    });

    // 🔹 Convert BigInt fields to string
    const formattedUsers = users.map(user => ({
      ...user,
      uid_aadhar: user.uid_aadhar ? user.uid_aadhar.toString() : null,
      phone1: user.phone1 ? user.phone1.toString() : null
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
