import prisma from "@/src/lib/prisma";
import { NextResponse, NextRequest } from "next/server";


// Get all produced materials
export async function GET() {
  try {
    const all = await prisma.work_type.findMany({
        select:{
            id:true,
            type_name:true
        }
    });
    return NextResponse.json(all);
  } catch (err) {
    console.error('GET ERROR:', err);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
