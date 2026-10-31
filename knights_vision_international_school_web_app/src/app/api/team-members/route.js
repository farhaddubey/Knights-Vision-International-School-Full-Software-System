import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

// ✅ GET all team members
export async function GET() {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true, district: true, teamLead: true },
    });
    return NextResponse.json(teamMembers);
  } catch (error) {
    console.error('❌ GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}

// ✅ POST create team member
export async function POST(request) {
  try {
    const body = await request.json();
    const teamMember = await prisma.teamMember.create({
      data: {
        userId: body.userId,
        districtId: body.districtId,
        teamLeadId: body.teamLeadId,
        role: body.role,
      },
    });
    return NextResponse.json(teamMember, { status: 201 });
  } catch (error) {
    console.error('❌ POST Error:', error);
    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 });
  }
}