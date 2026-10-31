import { NextRequest, NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';
// GET: List folders (returns empty array for compatibility)
export async function GET() {
  try {
    const folders = await prisma.upload_folders.findMany();
    return NextResponse.json(folders);
  } catch (err) {
    console.error("Error fetching folders:", err);
    return NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}