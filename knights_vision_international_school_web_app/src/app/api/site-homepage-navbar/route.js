import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';


// GET: Fetch all navbar items
export async function GET() {
  try {
    const navItems = await prisma.siteHomePageNavbar.findMany();
    return NextResponse.json(navItems, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch navbar items' }, { status: 500 });
  }
}

// POST: Create a new navbar item
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, slug, page_link } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 });
    }

    const navItem = await prisma.siteHomePageNavbar.create({
      data: {
        title,
        slug,
        page_link,
      },
    });
    return NextResponse.json(navItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create navbar item' }, { status: 500 });
  }
}