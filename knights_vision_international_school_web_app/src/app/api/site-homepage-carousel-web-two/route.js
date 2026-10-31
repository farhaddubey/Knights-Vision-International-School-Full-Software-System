import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';


// 📌 GET: Fetch all carousel images
export async function GET(req) {
  try {
    
    const images = await prisma.site_carousel_two.findMany({
      select: {
        id: true,
        img_url: true,
        page_link: true, 
        title_1: true, 
        title_2: true 
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
      const newImage = await prisma.site_carousel_two.create({
        data: {
          img_url: image.img_url || null,
          page_link: image.page_link || null, 
          title_1: image.title_1 || null, 
          title_2: image.title_2 || null 
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