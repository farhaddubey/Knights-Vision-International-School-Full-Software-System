import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  assertScope,
  combineWhere,
  errorResponse,
  pagination,
  positiveInteger,
  requireAdmissionManage,
  requireAdmissionRead,
  scopeWhere,
  validYear,
} from "@/src/lib/admissions/scopedAdmissions";

export async function GET(request: Request) {
  try {
    const authorization = await requireAdmissionRead(request);
    const { searchParams } = new URL(request.url);
    const { page, pageSize, skip } = pagination(searchParams);
    const academicYear = validYear(searchParams.get("academicYear"));
    if (!academicYear) return NextResponse.json({ error: "academicYear must be between 2000 and 2100." }, { status: 400 });
    const where = combineWhere(scopeWhere(authorization), { academicYear });
    const [applications, total] = await Promise.all([
      prisma.admissionTestApplication.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          class: { select: { name: true, section: true, roomNumber: true } },
          seatRoom: { select: { roomNumber: true } },
        },
        orderBy: { firstName: "asc" },
      }),
      prisma.admissionTestApplication.count({ where }),
    ]);
    return NextResponse.json({ applications, totalPages: Math.max(1, Math.ceil(total / pageSize)), currentPage: page, total });
  } catch (error) {
    return errorResponse(error, "Failed to fetch admission-test seating.");
  }
}

export async function POST(request: Request) {
  try {
    const authorization = await requireAdmissionManage(request);
    const body = await request.json();
    const academicYear = validYear(body?.academicYear);
    const branchId = positiveInteger(body?.branchId);
    if (!academicYear || !branchId) {
      return NextResponse.json({ error: "A valid academicYear and branchId are required for seat assignment." }, { status: 400 });
    }
    const branch = await prisma.schoolBranch.findUnique({ where: { id: branchId }, select: { id: true, schoolId: true } });
    if (!branch) return NextResponse.json({ error: "Branch not found." }, { status: 404 });
    assertScope(authorization, { schoolId: branch.schoolId, branchId: branch.id });

    const applicationWhere = { academicYear, branchId, seatRoomId: null };
    const applications = await prisma.admissionTestApplication.findMany({
      where: applicationWhere,
      orderBy: { firstName: "asc" },
      take: 500,
    });
    if (!applications.length) return NextResponse.json({ error: "No applications without seats were found for this branch and academic year." }, { status: 400 });

    const rooms = await prisma.room.findMany({ where: { branchId }, orderBy: { roomNumber: "asc" } });
    if (!rooms.length) return NextResponse.json({ error: "No rooms are configured for this branch." }, { status: 400 });

    const occupancy = await prisma.admissionTestApplication.groupBy({
      by: ["seatRoomId"],
      where: { academicYear, branchId, seatRoomId: { not: null } },
      _count: { seatRoomId: true },
    });
    const filled = new Map<number, number>(occupancy.flatMap((row) =>
      row.seatRoomId == null ? [] : [[row.seatRoomId, Number(row._count.seatRoomId)]],
    ));
    const updates = [];
    let roomIndex = 0;
    let roll = 1;
    for (const application of applications) {
      while (roomIndex < rooms.length && (filled.get(rooms[roomIndex].id) || 0) >= (rooms[roomIndex].capacity || 20)) roomIndex += 1;
      if (roomIndex >= rooms.length) break;
      const room = rooms[roomIndex];
      const seatNumber = (filled.get(room.id) || 0) + 1;
      updates.push(prisma.admissionTestApplication.update({
        where: { id: application.id },
        data: { seatRoomId: room.id, seatRollNumber: `R${roll.toString().padStart(3, "0")}` },
      }));
      filled.set(room.id, seatNumber);
      roll += 1;
    }
    if (!updates.length) return NextResponse.json({ error: "No seats could be assigned because every room is full." }, { status: 409 });
    await prisma.$transaction(updates);
    return NextResponse.json({ message: "Seats assigned successfully", assigned: updates.length });
  } catch (error) {
    return errorResponse(error, "Failed to assign admission-test seats.");
  }
}
