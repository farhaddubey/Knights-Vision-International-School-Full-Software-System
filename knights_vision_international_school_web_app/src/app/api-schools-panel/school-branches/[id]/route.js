import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';
import { hasScopeAccess, PanelAuthorizationError, requirePanelPermission } from '@/src/lib/rbac/authorization';


export async function PUT(req) {
  try {
    const authorization = await requirePanelPermission(req, 'branch.manage');
    const { id, ...data } = await req.json();
    const branchId = Number(id);
    if (!Number.isInteger(branchId) || branchId <= 0) {
      return NextResponse.json({ error: 'A valid branch id is required.' }, { status: 400 });
    }
    const existingBranch = await prisma.schoolBranch.findUnique({
      where: { id: branchId },
      select: { id: true, schoolId: true },
    });
    if (!existingBranch) {
      return NextResponse.json({ error: 'Branch not found.' }, { status: 404 });
    }
    const targetSchoolId = data.schoolId ? Number(data.schoolId) : existingBranch.schoolId;
    if (!hasScopeAccess(authorization, existingBranch) || !hasScopeAccess(authorization, { schoolId: targetSchoolId })) {
      return NextResponse.json({ error: 'You cannot update a branch outside your assigned school scope.' }, { status: 403 });
    }
    const updatedBranch = await prisma.schoolBranch.update({
      where: { id: branchId },
      data,
    });

    return NextResponse.json(updatedBranch, { status: 200 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("PUT Error:", error.message);
    return NextResponse.json({ error: "Failed to update branch" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const authorization = await requirePanelPermission(req, 'branch.manage');
    const url = new URL(req.url);
    const id = Number(url.pathname.split('/').pop());
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'A valid branch id is required.' }, { status: 400 });
    }
    const existingBranch = await prisma.schoolBranch.findUnique({
      where: { id },
      select: { id: true, schoolId: true },
    });
    if (!existingBranch) {
      return NextResponse.json({ error: 'Branch not found.' }, { status: 404 });
    }
    if (!hasScopeAccess(authorization, existingBranch)) {
      return NextResponse.json({ error: 'You cannot delete a branch outside your assigned school scope.' }, { status: 403 });
    }

    await prisma.schoolBranch.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Branch deleted successfully' }, { status: 200 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("DELETE Error:", error.message);
    return NextResponse.json({ error: "Failed to delete branch" }, { status: 500 });
  }
}
