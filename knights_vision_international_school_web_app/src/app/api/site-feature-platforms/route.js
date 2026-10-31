import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';


// GET: Fetch all feature platform items
export async function GET() {
  try {
    const featureItems = await prisma.siteFeaturePlatforms.findMany();
    return NextResponse.json(featureItems, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch feature items' }, { status: 500 });
  }
}

// POST: Create a new feature platform item
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, page_link, img_url } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const featureItem = await prisma.siteFeaturePlatforms.create({
      data: {
        title,
        description,
        page_link,
        img_url,
      },
    });
    return NextResponse.json(featureItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create feature item' }, { status: 500 });
  }
}