import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET(req) {
    try {
        // Fetch all users with associated factory and machine details
        const users=await prisma.user.findMany({
            select:{
                id:true,
                username:true
            },
            where: {
                role: "SALES_EXECUTIVE"
            }
        });
        return NextResponse.json(users ?? [], { status: 200 });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ success: false, message: 'Error fetching users' }, { status: 500 });
    }
}