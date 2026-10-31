import { NextRequest, NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

// GET all knowledge topics
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const skip = (page - 1) * pageSize;

    const topics = await prisma.knowledgeTopic.findMany({
      skip,
      take: pageSize,
      orderBy: { id: 'desc' },
    });

    const totalTopics = await prisma.knowledgeTopic.count();

    console.log('[API /api/knowledge-topics] Response:', {
      page,
      pageSize,
      totalTopics,
      totalPages: Math.ceil(totalTopics / pageSize),
      topicCount: topics.length,
    });

    return NextResponse.json({
      topics,
      total: totalTopics,
      page,
      pageSize,
      totalPages: Math.ceil(totalTopics / pageSize),
    });
  } catch (error) {
    console.error('❌ GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch topics', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST new knowledge topics
export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const topics = Array.isArray(body) ? body : [body];

    const createdTopics = await prisma.knowledgeTopic.createMany({
      data: topics.map((topic) => ({
        title: topic.title || '',
        wikigalaxy_link: topic.wikigalaxy_link || null,
        youtube_link: topic.youtube_link || null,
        slug: topic.slug || '',
        type: topic.type || 'HELP',
      })),
    });

    console.log('[API /api/knowledge-topics] POST Response:', createdTopics);

    return NextResponse.json(createdTopics, { status: 201 });
  } catch (error) {
    console.error('❌ POST Error:', error);
    return NextResponse.json({ error: 'Failed to create topics', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}