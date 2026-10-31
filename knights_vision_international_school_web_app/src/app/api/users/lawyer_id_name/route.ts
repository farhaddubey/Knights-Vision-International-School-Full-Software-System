import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

// GET ALL USERS
export async function GET(req) {
  try {
    const users = await prisma.user.findMany({
        where:{
          role: "LAWYER"
        },
        select:{
          id:true, 
          username: true 
        }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('GET users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
