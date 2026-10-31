import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';


// 📌 GET: Fetch all carousel images
export async function GET(req) {
  try {
    
    const images = await prisma.public_site_homepage_carousel.findMany({
      select: {
        id: true,
        img_url: true,
        title: true, 
        subtitle: true 
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
