import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

// PUT update school enquiry
export async function PUT(req, { params }) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    const updatedEnquiry = await prisma.schoolEnquiry.update({
      where: { id: parseInt(id) },
      data: {
        fullName: body.fullName || '',
        email: body.email || null,
        phone: body.phone || null,
        role: body.role || 'STUDENT',
        enquiryType: body.enquiryType || 'GENERAL_QUERY',
        subject: body.subject || '',
        message: body.message || '',
        attachmentUrl: body.attachmentUrl || null,
        schoolId: body.schoolId ? parseInt(body.schoolId) : null,
        classOrGrade: body.classOrGrade || null,
        identification: body.identification || null,
        preferredContactMethod: body.preferredContactMethod || 'EMAIL',
        status: body.status || 'PENDING',
        adminNotes: body.adminNotes || null,
      },
    });

    console.log('[API /api/school-enquiry/[id]] PUT Response:', updatedEnquiry);

    return NextResponse.json(updatedEnquiry);
  } catch (error) {
    console.error('❌ PUT Error:', error);
    return NextResponse.json({ error: 'Failed to update enquiry', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE school enquiry
export async function DELETE(req, { params }) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await prisma.schoolEnquiry.delete({
      where: { id: parseInt(id) },
    });

    console.log('[API /api/school-enquiry/[id]] DELETE Response:', { id });

    return NextResponse.json({ message: 'Enquiry deleted successfully' });
  } catch (error) {
    console.error('❌ DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete enquiry', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}