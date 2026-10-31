import { NextRequest, NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET() {
  try {
    const topics = await prisma.knowledgeTopic.findMany();
    return NextResponse.json(topics);
  } catch (error) {
    console.error('Error fetching knowledge topics:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Failed to fetch knowledge topics.', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { title, wikigalaxy_link, youtube_link, slug, type } = data;

    // // Validation
    // if (!title || !slug) {
    //   return NextResponse.json(
    //     { error: 'Title and slug are required.' },
    //     { status: 400 }
    //   );
    // }

    // // Validate slug uniqueness
    // const existingSlug = await prisma.knowledgeTopic.findUnique({ where: { slug } });
    // if (existingSlug) {
    //   return NextResponse.json({ error: 'Slug already exists.' }, { status: 400 });
    // }

    // // Validate URLs
    // const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
    // if (wikigalaxy_link && !urlRegex.test(wikigalaxy_link)) {
    //   return NextResponse.json({ error: 'Invalid wikigalaxy_link URL.' }, { status: 400 });
    // }
    // if (youtube_link && !urlRegex.test(youtube_link)) {
    //   return NextResponse.json({ error: 'Invalid youtube_link URL.' }, { status: 400 });
    // }

    // // Validate type
    // const validTypes = ['Help', 'Knowledge', 'Tutorial', 'Book Consultant', 'LEGAL_TERM'];
    // if (type && !validTypes.includes(type)) {
    //   return NextResponse.json(
    //     { error: `Invalid type. Must be one of: ${validTypes.join(', ')}.` },
    //     { status: 400 }
    //   );
    // }

    const topic = await prisma.knowledgeTopic.create({
      data: {
        title,
        wikigalaxy_link,
        youtube_link,
        slug,
        type,
      },
    });

    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    console.error('Error creating knowledge topic:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A topic with this slug already exists.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create knowledge topic.', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}