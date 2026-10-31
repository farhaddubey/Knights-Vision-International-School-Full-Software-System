import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

export async function GET(req) {
    try {
        const employees = await prisma.user.findMany({
            include: {
                role: true,
                department: true,
            },
        });

        if (!employees) {
            return Response.json({ error: "No employees found" }, { status: 404 });
        }

        return Response.json({ employees }, { status: 200 });  // Wrap in object
    } catch (error) {
        console.error("Error fetching employees:", error);
        return Response.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
