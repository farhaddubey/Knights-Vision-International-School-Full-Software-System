import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from '@/src/lib/prisma';

// Define the expected JWT payload interface
interface JwtPayloadCustom extends jwt.JwtPayload {
  id: number;
  email: string;
  role: string;
  department: string;
  brand_name: string;
  logo_url: string;
}


export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayloadCustom;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, department: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error in /api/faculties_auth/validate:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  } finally {
    await prisma.$disconnect();
  }
}

export const dynamic = 'force-dynamic';