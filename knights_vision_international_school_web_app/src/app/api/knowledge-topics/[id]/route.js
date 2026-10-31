import { NextRequest, NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET(request, { params }) {
  const { id } = params;

  try {
    const topic = await prisma.knowledgeTopic.findUnique({
      where: { id: parseInt(id) },
    });
    if (!topic) {
      return NextResponse.json({ error: 'Knowledge topic not found.' }, { status: 404 });
    }
    return NextResponse.json(topic);
  } catch (error) {
    console.error('Error fetching knowledge topic:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Failed to fetch knowledge topic.', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request, { params }) {
  const { id } = params;

  try {
    const data = await request.json();
    const { title, wikigalaxy_link, youtube_link, slug, type } = data;

    // Validation
    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Title and slug are required.' },
        { status: 400 }
      );
    }

    // Check if topic exists
    const existingTopic = await prisma.knowledgeTopic.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existingTopic) {
      return NextResponse.json({ error: 'Knowledge topic not found.' }, { status: 404 });
    }

    // Validate slug uniqueness
    if (slug !== existingTopic.slug) {
      const existingSlug = await prisma.knowledgeTopic.findUnique({ where: { slug } });
      if (existingSlug) {
        return NextResponse.json({ error: 'Slug already exists.' }, { status: 400 });
      }
    }

    // Validate URLs
    const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
    if (wikigalaxy_link && !urlRegex.test(wikigalaxy_link)) {
      return NextResponse.json({ error: 'Invalid wikigalaxy_link URL.' }, { status: 400 });
    }
    if (youtube_link && !urlRegex.test(youtube_link)) {
      return NextResponse.json({ error: 'Invalid youtube_link URL.' }, { status: 400 });
    }

    // Validate type
    const validTypes = ['Help', 'Knowledge', 'Tutorial', 'Book Consultant'];
    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}.` },
        { status: 400 }
      );
    }

    const topic = await prisma.knowledgeTopic.update({
      where: { id: parseInt(id) },
      data: {
        title,
        wikigalaxy_link,
        youtube_link,
        slug,
        type,
      },
    });

    return NextResponse.json(topic);
  } catch (error) {
    console.error('Error updating knowledge topic:', {
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
      { error: 'Failed to update knowledge topic.', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    const existingTopic = await prisma.knowledgeTopic.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existingTopic) {
      return NextResponse.json({ error: 'Knowledge topic not found.' }, { status: 404 });
    }

    await prisma.knowledgeTopic.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Knowledge topic deleted successfully.' });
  } catch (error) {
    console.error('Error deleting knowledge topic:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Failed to delete knowledge topic.', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}