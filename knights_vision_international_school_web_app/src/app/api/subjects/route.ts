import {  NextResponse, NextRequest } from "next/server";
import prisma from '@/src/lib/prisma';
import { authorizationErrorResponse, requirePanelPermission } from "@/src/lib/rbac/authorization";


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

// Generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .slice(0, 50); // Ensure within 50 chars
};

export async function GET(req: NextRequest) {
  try {
    await requirePanelPermission(req, "class.read");
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const skip = (page - 1) * pageSize;

    const subjects = await prisma.subject.findMany({
      skip,
      take: pageSize,
      orderBy: { name: 'asc' },
    });

    const totalSubjects = await prisma.subject.count();

    // Transform response to convert BigInt and numbers to strings
    const transformedSubjects = transformToString(subjects);

    return NextResponse.json({
      subjects: transformedSubjects,
      total: totalSubjects,
      page,
      pageSize,
      totalPages: Math.ceil(totalSubjects / pageSize),
    }, { status: 200 });
  } catch (error) {
    return authorizationErrorResponse(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  try {
    await requirePanelPermission(req, "class.manage");

    const data = await req.json();
    const subjects = Array.isArray(data) ? data : [data];

    // Validate input
    if (subjects.length === 0) {
      return NextResponse.json({ error: 'At least one subject entry is required' }, { status: 400 });
    }

    const uniqueSlugs = new Set();
    for (const subject of subjects) {
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

      // Check existing slug in database
      const existingSubject = await prisma.subject.findFirst({
        where: { slug },
      });
      if (existingSubject) {
        return NextResponse.json({ error: `Slug ${slug} already exists` }, { status: 400 });
      }
    }

    // Prepare data for batch creation
    const subjectData = subjects.map((subject) => ({
      name: subject.name,
      slug: subject.slug || generateSlug(subject.name),
      description: subject.description || null,
    }));

    // Create subjects in batch
    const createdSubjects = await prisma.subject.createMany({
      data: subjectData,
    });

    // Transform response to convert BigInt and numbers to strings
    const transformedSubjects = transformToString(subjectData);

    return NextResponse.json({
      message: 'Subjects created successfully',
      subjects: transformedSubjects,
      count: createdSubjects.count,
    }, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Unique constraint violation: Slug already exists' }, { status: 400 });
    }
    return authorizationErrorResponse(error);
  } finally {
    await prisma.$disconnect();
  }
}
