import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

export async function GET(request) {
  console.log('[GET] Starting file fetch');
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const pageSize = parseInt(searchParams.get('pageSize')) || 30;
    const skip = (page - 1) * pageSize;
    console.log('[GET] Page:', page, 'PageSize:', pageSize, 'Skip:', skip);

    const totalFiles = await prisma.files.count();
    const totalPages = Math.ceil(totalFiles / pageSize);
    console.log('[GET] Total Files:', totalFiles, 'Total Pages:', totalPages);

    const files = await prisma.files.findMany({
      skip,
      take: pageSize,
      orderBy: { created_at: 'desc' },
    });
    console.log('[GET] Fetched files:', files.length);

    return NextResponse.json(
      { files, totalPages, currentPage: page },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (err) {
    console.error('[GET] Error fetching files:', err.message, err.stack);
    return NextResponse.json({ error: `Failed to fetch files: ${err.message}` }, { status: 500 });
  } finally {
    console.log('[GET] Disconnecting Prisma');
    await prisma.$disconnect();
  }
}

export async function POST(request) {
  console.log('[POST] Starting file record creation');
  try {
    const { name, mime, size, key, url } = await request.json();
    console.log('[POST] Data received:', { name, mime, size, key, url });

    if (!name || !mime || !size || !key || !url) {
      console.log('[POST] Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mime)) {
      console.log('[POST] Invalid mime type:', mime);
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      );
    }
    if (size > 10 * 1024) {
      console.log('[POST] File size exceeds 10MB');
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    const fileRecord = await prisma.files.create({
      data: {
        name,
        mime,
        size,
        url,
        key,
      },
    });
    console.log('[POST] Prisma record created:', fileRecord.id);

    return NextResponse.json(fileRecord, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (err) {
    console.error('[POST] Error creating file record:', err.message, err.stack);
    return NextResponse.json({ error: `Failed to create file record: ${err.message}` }, { status: 500 });
  } finally {
    console.log('[POST] Disconnecting Prisma');
    await prisma.$disconnect();
  }
}

export async function DELETE(request) {
  console.log('[DELETE] Starting file deletion');
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    const key = searchParams.get('key');
    console.log('[DELETE] File ID:', fileId, 'Key:', key);

    if (!fileId || !key) {
      console.log('[DELETE] Missing fileId or key');
      return NextResponse.json({ error: 'Missing fileId or key' }, { status: 400 });
    }

    await prisma.files.delete({
      where: { id: parseInt(fileId) },
    });
    console.log('[DELETE] Prisma record deleted:', fileId);

    return NextResponse.json(
      { message: 'File deleted successfully' },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (err) {
    console.error('[DELETE] Error deleting file:', err.message, err.stack);
    return NextResponse.json({ error: `Failed to delete file: ${err.message}` }, { status: 500 });
  } finally {
    console.log('[DELETE] Disconnecting Prisma');
    await prisma.$disconnect();
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}