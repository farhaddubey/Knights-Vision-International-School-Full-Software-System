import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

// GET all school enquiries
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const skip = (page - 1) * pageSize;

    const enquiries = await prisma.schoolEnquiry.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { school: true },
    });

    const totalEnquiries = await prisma.schoolEnquiry.count();

    console.log('[API /api/school-enquiry] Response:', {
      page,
      pageSize,
      totalEnquiries,
      totalPages: Math.ceil(totalEnquiries / pageSize),
      enquiryCount: enquiries.length,
    });

    return NextResponse.json({
      enquiries,
      total: totalEnquiries,
      page,
      pageSize,
      totalPages: Math.ceil(totalEnquiries / pageSize),
    });
  } catch (error) {
    console.error('❌ GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch enquiries', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST new school enquiries
export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const enquiries = Array.isArray(body) ? body : [body];

    const createdEnquiries = await prisma.schoolEnquiry.createMany({
      data: enquiries.map((enquiry) => ({
        fullName: enquiry.fullName || '',
        email: enquiry.email || null,
        phone: enquiry.phone || null,
        role: enquiry.role || 'STUDENT',
        enquiryType: enquiry.enquiryType || 'GENERAL_QUERY',
        subject: enquiry.subject || '',
        message: enquiry.message || '',
        attachmentUrl: enquiry.attachmentUrl || null,
        schoolId: enquiry.schoolId ? parseInt(enquiry.schoolId) : null,
        classOrGrade: enquiry.classOrGrade || null,
        identification: enquiry.identification || null,
        preferredContactMethod: enquiry.preferredContactMethod || 'EMAIL',
        status: enquiry.status || 'PENDING',
        adminNotes: enquiry.adminNotes || null,
      })),
    });

    console.log('[API /api/school-enquiry] POST Response:', createdEnquiries);

    return NextResponse.json(createdEnquiries, { status: 201 });
  } catch (error) {
    console.error('❌ POST Error:', error);
    return NextResponse.json({ error: 'Failed to create enquiries', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}