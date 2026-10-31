import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { z } from "zod";


// GET: Retrieve a district by ID
export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const district = await prisma.tdilcs_District.findUnique({
      where: { id },
      include: { manager: true },
    });

    if (!district) {
      return NextResponse.json({ error: "District not found" }, { status: 404 });
    }

    return NextResponse.json(district, { status: 200 });
  } catch (error) {
    console.error("Error fetching district:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: Update a district
export async function PUT(request, { params }) {
  try {

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const district = await prisma.tdilcs_District.findUnique({ where: { id } });
    if (!district) {
      return NextResponse.json({ error: "District not found" }, { status: 404 });
    }

    const updatedDistrict = await prisma.tdilcs_District.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(updatedDistrict, { status: 200 });
  } catch (error) {
    console.error("Error updating district:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Delete a district
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const district = await prisma.tdilcs_District.findUnique({ where: { id } });
    if (!district) {
      return NextResponse.json({ error: "District not found" }, { status: 404 });
    }

    await prisma.tdilcs_District.delete({ where: { id } });
    return NextResponse.json({ message: "District deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting district:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
