import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET() {
    try {
        // Fetch all salary records, including associated user data
        const salaries = await prisma.factory_workers_salaries_employee_id_links.findMany({
            include: {
                User: {
                    select: { username: true } // Select only the username field
                },
                factory_workers_salaries: true,  // Fetch salary details
            }
        });

        if (!salaries || salaries.length === 0) {
            return NextResponse.json({ message: "No salary records found" }, { status: 404 });
        }

        return NextResponse.json(salaries, { status: 200 });

    } catch (error) {
        console.error("Error fetching salaries:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
