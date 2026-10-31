import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

import jwt from "jsonwebtoken";
// Middleware to verify JWT token
const authenticateToken = (req) => {
  const authHeader = req.headers.get("authorization");
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) throw new Error("Unauthorized");

  try {
    return jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
  } catch (error) {
    throw new Error("Invalid token");
  }
};

// 📌 GET: Fetch a single carousel image by ID
export async function GET(req, { params }) {
  const { id } = params;

  try {
    
    const image = await prisma.public_site_homepage_carousel.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        img_url: true,
      },
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    return NextResponse.json(image, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching carousel image:", error);
    return NextResponse.json(
      { error: "Error fetching carousel image", detail: error.message },
      { status: error.message === "Unauthorized" || error.message === "Invalid token" ? 401 : 500 }
    );
  }
}

// 📌 PUT: Update a carousel image by ID
export async function PUT(req, { params }) {
  const { id } = params;

  try {
    
    const data = await req.json();
    console.log("📦 Received Carousel Image Update Data:", data);

    const updatedImage = await prisma.public_site_homepage_carousel.update({
      where: { id: parseInt(id) },
      data: {
        img_url: data.img_url || null,
      },
    });

    return NextResponse.json(updatedImage, { status: 200 });
  } catch (error) {
    console.error("❌ Error updating carousel image:", error);
    return NextResponse.json(
      { error: "Error updating carousel image", detail: error.message },
      { status: error.message === "Unauthorized" || error.message === "Invalid token" ? 401 : 500 }
    );
  }
}

// 📌 DELETE: Delete a carousel image by ID
export async function DELETE(req, { params }) {
  const { id } = params;

  try {
    
    await prisma.public_site_homepage_carousel.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Image deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("❌ Error deleting carousel image:", error);
    return NextResponse.json(
      { error: "Error deleting carousel image", detail: error.message },
      { status: error.message === "Unauthorized" || error.message === "Invalid token" ? 401 : 500 }
    );
  }
}