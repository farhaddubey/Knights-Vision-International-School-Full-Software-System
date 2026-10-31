import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

// GET /api/users/lawyer_profiles
export async function GET() {
  try {
    const lawyerProfiles = await prisma.lawyerProfile.findMany({
      select: {
        id: true,
        user: { select: { id: true, username: true } },
      },
    });
    return NextResponse.json(lawyerProfiles);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch lawyer profiles' }, { status: 500 });
  }
}