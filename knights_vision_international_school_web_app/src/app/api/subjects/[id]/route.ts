import {  NextResponse, NextRequest } from "next/server";
import prisma from '@/src/lib/prisma';

// Generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .slice(0, 50); // Ensure within 50 chars
};
// Utility function to convert BigInt and numbers to strings in nested objects and arrays
const transformToString = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint' || typeof obj === 'number') return obj.toString();
  if (Array.isArray(obj)) return obj.map(transformToString);
  if (typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = transformToString(obj[key]);
      }
    }
    return result;
  }
  return obj;
};
export async function PUT(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const subjects = Array.isArray(data) ? data : [data];

    // Validate input
    const uniqueSlugs = new Set();
    for (const subject of subjects) {
      if (!subject.id) {
        return NextResponse.json({ error: 'Subject ID is required for updates' }, { status: 400 });
      }
      if (!subject.name) {
        return NextResponse.json({ error: 'Subject name is required' }, { status: 400 });
      }
      if (subject.name.length > 50) {
        return NextResponse.json({ error: 'Subject name must be 50 characters or less' }, { status: 400 });
      }
      if (subject.description && subject.description.length > 65535) {
        return NextResponse.json({ error: 'Description must be 65,535 characters or less' }, { status: 400 });
      }
      const slug = subject.slug || generateSlug(subject.name);
      if (uniqueSlugs.has(slug)) {
        return NextResponse.json({ error: `Duplicate slug: ${slug}` }, { status: 400 });
      }
      uniqueSlugs.add(slug);

      // Check existing slug in database (excluding the subject being updated)
      const existingSubject = await prisma.subject.findFirst({
        where: { slug, NOT: { id: subject.id } },
      });
      if (existingSubject) {
        return NextResponse.json({ error: `Slug ${slug} already exists` }, { status: 400 });
      }
    }

    // Update subjects
    const updatedSubjects = await Promise.all(
      subjects.map((subject) =>
        prisma.subject.update({
          where: { id: subject.id },
          data: {
            name: subject.name,
            slug: subject.slug || generateSlug(subject.name),
            description: subject.description || null,
          },
        })
      )
    );

    // Transform response to convert BigInt and numbers to strings
    const transformedSubjects = transformToString(updatedSubjects);

    return NextResponse.json({
      message: 'Subjects updated successfully',
      subjects: transformedSubjects,
    }, { status: 200 });
  } catch (error) {
    console.error("PUT Error:", error.message);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Unique constraint violation: Slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update subjects', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = parseInt(url.pathname.split('/').pop());

    await prisma.subject.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Subject deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error("DELETE Error:", error.message);
    return NextResponse.json({ error: "Failed to delete subject", detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}