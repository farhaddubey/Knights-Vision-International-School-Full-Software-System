import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import sharp from 'sharp';
import axios from 'axios';


const BUCKETS = {
  'sure-success-point-school': {
    workerUrl: 'https://r2-worker-sure-success.tdil-global.workers.dev',
    publicUrl: 'https://pub-c5e66ea551584a87a7de1b76622e0e95.r2.dev',
  },
  'tdil-global': {
    workerUrl: 'https://r2-worker.tdil-global.workers.dev',
    publicUrl: 'https://pub-22e919b1a64343e695f8c71c04a48e8b.r2.dev',
  },
};

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
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    const formData = await request.formData();
    const file = formData.get('file');
    const bucket = formData.get('bucket') || 'sure-success-point-school';

    if (!file) {
      console.log('[POST] Missing file');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // if (!BUCKETS[bucket]) {
    //   console.log('[POST] Invalid bucket:', bucket);
    //   return NextResponse.json({ error: 'Invalid bucket specified' }, { status: 400 });
    // }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.type)) {
      console.log('[POST] Invalid mime type:', file.type);
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Read file into buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Resize image to 200x200 and ensure size is under 200KB
    const resizedBuffer = await sharp(buffer)
      .resize({ width: 100, height: 100, fit: 'cover' })
      .toFormat('jpeg', { quality: 80 })
      .toBuffer();

    if (resizedBuffer.length > 200 * 1024) {
      console.log('[POST] Resized file size exceeds 200KB');
      return NextResponse.json({ error: 'Resized file size exceeds 200KB limit' }, { status: 400 });
    }

    // Generate unique key
    const key = `uploads/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const publicUrl = `${BUCKETS[bucket].publicUrl}/${key}`;

    // Upload to Worker
    const workerResponse = await axios.put(
      `${BUCKETS[bucket].workerUrl}/${key}`,
      resizedBuffer,
      {
        headers: {
          'X-Custom-Auth-Key': process.env.AUTH_KEY_SECRET || 'my-secure-key-123',
          'Content-Type': 'image/jpeg',
        },
      }
    );

    if (workerResponse.status !== 200) {
      console.log('[POST] Worker upload failed:', workerResponse.data);
      return NextResponse.json({ error: 'Failed to upload to R2' }, { status: 500 });
    }

    // Create Prisma record
    const fileRecord = await prisma.files.create({
      data: {
        name: file.name,
        mime: 'image/jpeg',
        size: resizedBuffer.length / 1024,
        url: publicUrl,
        key,
        bucket, // Store bucket name
      },
    });
    console.log('[POST] Prisma record created:', fileRecord.id);

    return NextResponse.json(fileRecord, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    const bucket = searchParams.get('bucket') || 'sure-success-point-school';

    if (!fileId || !key) {
      console.log('[DELETE] Missing fileId or key');
      return NextResponse.json({ error: 'Missing fileId or key' }, { status: 400 });
    }

    // Delete from R2 via Worker
    const workerResponse = await axios.delete(
      `${BUCKETS[bucket].workerUrl}/${key}`,
      {
        headers: {
          'X-Custom-Auth-Key': process.env.AUTH_KEY_SECRET || 'my-secure-key-123',
        },
      }
    );

    if (workerResponse.status !== 200) {
      console.log('[DELETE] Worker deletion failed:', workerResponse.data);
      return NextResponse.json({ error: 'Failed to delete from R2' }, { status: 500 });
    }

    // Delete Prisma record
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
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}