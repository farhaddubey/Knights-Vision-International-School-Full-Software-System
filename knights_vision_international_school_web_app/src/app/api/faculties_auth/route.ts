import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { generateToken } from "../../../lib/auth";
import prisma from '@/src/lib/prisma';


// 🔹 **User Registration (POST)**
export async function POST(req: Request) {
  const { username, email, password } = await req.json();
  
  // Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Create user
  const newUser = await prisma.user.create({
    data: { username, email, password: hashedPassword, confirmed: false },
  });

  return NextResponse.json({ message: "User registered successfully", user: newUser });
}

// 🔹 **User Login (POST)**
export async function PUT(req: Request) {
  const { email, password } = await req.json();

  // Check user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  // Generate token
  const token = generateToken(user);

  return NextResponse.json({ message: "Login successful", token });
}
