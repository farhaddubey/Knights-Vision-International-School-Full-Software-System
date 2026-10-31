import prisma from "@/src/lib/prisma";
import { NextResponse, NextRequest } from "next/server";


// ✅ GET all work types
export async function GET() {
  try {
    const workTypes = await prisma.work_type.findMany({
      orderBy: { created_at: 'desc' },
    });
    return NextResponse.json(workTypes);
  } catch (error) {
    console.error('❌ GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch work types' }, { status: 500 });
  }
}

// ✅ POST create a new work type
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      type_name,
      role,
      department,
      description,
      video_url,
    } = body;

    if (!type_name) {
      return NextResponse.json({ error: 'type_name is required' }, { status: 400 });
    }

    const newWorkType = await prisma.work_type.create({
      data: {
        type_name,
        role,
        department,
        description,
        video_url,
      },
    });

    return NextResponse.json(newWorkType);
  } catch (error) {
    console.error('❌ POST Error:', error);
    return NextResponse.json({ error: 'Failed to create work type' }, { status: 500 });
  }
}
