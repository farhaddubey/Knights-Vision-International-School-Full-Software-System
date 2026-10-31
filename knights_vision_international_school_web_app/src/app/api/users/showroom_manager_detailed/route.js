import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';


export async function GET(req) {
  try {
    // const auth = verifyAuth(req);
    // if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    // 🔹 Fetch users from DB with all required fields
    const users = await prisma.user.findMany({
        where:{
            role:"SHOWROOM_MANAGER", 
        }, 
      select: {
        id: true,
        username: true,
        email: true,
        address: true,
        block: true,
        municiple: true,
        police_station: true,
        district: true,
        state: true,
        country: true,
        pincode: true,
        phone_prefix: true,
        phone1: true,
        phone2: true,
        phone3: true,
        fatherName:true, 
        motherName:true, 
        clg_name:true, 
        uid_aadhar: true,
        department: true,
        roleId: true,
        role: true,
        select:{
          showroom:{
            select:{
              id: true, 
            }
          }
        }
      },
      
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
