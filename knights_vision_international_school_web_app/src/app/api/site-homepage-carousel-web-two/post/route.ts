import { NextRequest, NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

// 📌 POST: Create one or more carousel images
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("📦 Received Carousel Image Data:", data);

    const isArray = Array.isArray(data);
    const payloads = isArray ? data : [data];

    const createdImages = [];

    for (const item of payloads) {
      const newImage = await prisma.site_carousel_two.create({
        data: {
          img_url: item.img_url || null,
          page_link: item.page_link || null, 
          title_1: item.title_1 || null,
          title_2: item.title_2 || null
        },
      });
      createdImages.push(newImage);
    }

    return NextResponse.json(createdImages, { status: 201 });
  } catch (error: any) {
    console.error("❌ Error creating carousel image:", error);
    return NextResponse.json(
      { error: "Error creating carousel image", detail: error.message },
      {
        status:
          error.message === "Unauthorized" ||
          error.message === "Invalid token"
            ? 401
            : 500,
      }
    );
  }
}
