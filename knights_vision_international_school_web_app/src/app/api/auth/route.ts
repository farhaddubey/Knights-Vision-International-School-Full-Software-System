import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';
import bcrypt from "bcryptjs";
import { generateToken } from "../../../lib/auth";


// 🔹 **User Registration (POST)**
export async function POST(req: Request) {
  try {
    const { username, email: rawEmail, password } = await req.json();
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    if (!email || typeof password !== "string" || password.length < 12) {
      return NextResponse.json({ error: "A valid email and a password of at least 12 characters are required." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await prisma.user.create({
      data: { username: typeof username === "string" ? username.trim() || null : null, email, password: hashedPassword, confirmed: false },
      select: { id: true, username: true, email: true, created_at: true },
    });

    return NextResponse.json({ message: "User registered successfully", user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Unable to register user" }, { status: 500 });
  }
}

// 🔹 **User Login (POST)**
export async function PUT(req: Request) {
  const { email: rawEmail, password } = await req.json();
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

  // Check user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password || user.blocked === true || user.is_active === false || typeof password !== "string" || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  // Generate token
  const token = generateToken(user);

  return NextResponse.json({ message: "Login successful", token });
}
