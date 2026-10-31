import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';
import bcrypt from "bcryptjs";
import verifyAuth from '../api_components/verifyAuth';
// 🔹 **GET All Users**
export async function GET(req) {
  try {
    // const auth = verifyAuth(req);
    // if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    // 🔹 Fetch users where role is "inventory_worker"
    const users = await prisma.user.findMany({
      where: {
        role: "inventory_worker",
      },
      select: {
        id: true,
        username: true,
        role: true,
        uid_aadhar: true,
        department: true,
        phone1: true,
      },
    });

    // 🔹 Convert BigInt fields to string
    const formattedUsers = users.map(user => ({
      ...user,
      uid_aadhar: user.uid_aadhar ? user.uid_aadhar.toString() : null,
      phone1: user.phone1 ? user.phone1.toString() : null,
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

