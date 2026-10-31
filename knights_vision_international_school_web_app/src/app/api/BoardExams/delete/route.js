// /app/api/BoardExam/delete/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // adjust path if your prisma client is elsewhere

// POST /api/BoardExam/delete
export async function POST(req) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "BoardExam ID is required" },
        { status: 400 }
      );
    }

    // Delete record (also cascades results if relation is set in schema)
    const deletedExam = await prisma.boardExam.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(
      { message: "Board Exam deleted successfully", exam: deletedExam },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete BoardExam Error:", error);
    return NextResponse.json(
      { error: "Failed to delete BoardExam", details: error.message },
      { status: 500 }
    );
  }
}
