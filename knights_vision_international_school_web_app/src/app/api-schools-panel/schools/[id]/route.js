import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';
import { isSystemAdministrator, PanelAuthorizationError, requirePanelPermission } from '@/src/lib/rbac/authorization';


export async function PUT(req) {
  try {
    const authorization = await requirePanelPermission(req, 'school.manage');
    if (!isSystemAdministrator(authorization)) {
      return NextResponse.json({ error: 'Only a System Administrator can update a school.' }, { status: 403 });
    }

    const { id, ...data } = await req.json();
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return NextResponse.json({ error: 'A valid school id is required.' }, { status: 400 });
    }
    const updatedSchool = await prisma.school.update({
      where: { id: Number(id) },
      data,
    });

    return NextResponse.json(updatedSchool, { status: 200 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("PUT Error:", error.message);
    return NextResponse.json({ error: "Failed to update school" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const authorization = await requirePanelPermission(req, 'school.manage');
    if (!isSystemAdministrator(authorization)) {
      return NextResponse.json({ error: 'Only a System Administrator can delete a school.' }, { status: 403 });
    }

    const url = new URL(req.url);
    const id = parseInt(url.pathname.split('/').pop(), 10);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'A valid school id is required.' }, { status: 400 });
    }

    await prisma.school.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'School deleted successfully' }, { status: 200 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("DELETE Error:", error.message);
    return NextResponse.json({ error: "Failed to delete school" }, { status: 500 });
  }
}
