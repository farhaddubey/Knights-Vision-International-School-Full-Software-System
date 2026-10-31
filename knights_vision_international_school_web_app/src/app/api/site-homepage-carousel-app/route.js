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

// 📌 GET: Fetch all carousel images
export async function GET(req) {
  try {
    
    const images = await prisma.app_homepage_carousel.findMany({
      select: {
        id: true,
        img_url: true,
      },
      orderBy: { id: "asc" },
    });
    return NextResponse.json(images, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching carousel images:", error);
    return NextResponse.json(
      { error: "Error fetching carousel images", detail: error.message },
      { status: error.message === "Unauthorized" || error.message === "Invalid token" ? 401 : 500 }
    );
  }
}

// 📌 POST: Create one or more carousel images
export async function POST(req) {
  try {
    
    const data = await req.json();
    console.log("📦 Received Carousel Image Data:", data);

    // Handle array or single object
    const images = Array.isArray(data) ? data : [data];
    const createdImages = [];

    for (const image of images) {
      const newImage = await prisma.app_homepage_carousel.create({
        data: {
          img_url: image.img_url || null,
        },
      });
      createdImages.push(newImage);
    }

    return NextResponse.json(createdImages, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating carousel image:", error);
    return NextResponse.json(
      { error: "Error creating carousel image", detail: error.message },
      { status: error.message === "Unauthorized" || error.message === "Invalid token" ? 401 : 500 }
    );
  }
}