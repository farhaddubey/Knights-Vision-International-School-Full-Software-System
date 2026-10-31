import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
const jwt = require("jsonwebtoken");


export async function PUT(request, { params }) {
  try {
    const { id } = await params; // Await params to resolve dynamic route parameter
    const data = await request.json();

    const userId = parseInt(id);
    if (isNaN(userId) || userId <= 0) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        blocked: true,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ user: updatedUser, message: "User updated successfully" }, { status: 200 });
  } catch (error) {
    console.error(`PUT User ${id} Error:`, error.message);
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Email or Aadhar UID already exists" }, { status: 400 });
    }
    if (error.code === "P2003") {
      return NextResponse.json({ error: "Invalid foreign key for schoolId or branchId" }, { status: 400 });
    }
    if (error.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update user", detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}