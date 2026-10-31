import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';
import { PanelAuthorizationError, requirePanelPermission } from '@/src/lib/rbac/authorization';
import { listEligibleClassTeachers } from '@/src/lib/rbac/classTeacherEligibility';


export async function GET(req) {
  try {
    const authorization = await requirePanelPermission(req, 'class.manage');
    const teachers = await listEligibleClassTeachers(prisma, authorization);

    return NextResponse.json(teachers.map(({ id, username }) => ({ id, username })), { status: 200 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === 'PanelAuthorizationError') {
      return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    }
    console.error("GET Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch teachers", detail: error.message }, { status: 500 });
  }
}
