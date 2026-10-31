import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';
// CREATE: Submit a new enquiry
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      fullName, email, phone, role, enquiryType, subject, message,
      attachmentUrl, classOrGrade, identification, preferredContactMethod
    } = body;

    const enquiry = await prisma.schoolEnquiry.create({
      data: {
        fullName,
        email,
        phone,
        role,
        enquiryType,
        subject,
        message,
        attachmentUrl,
        classOrGrade,
        identification,
        preferredContactMethod,
        status: "PENDING",
      },
    });

    return NextResponse.json({ enquiry }, { status: 201 });
  } catch (error) {
    console.error("Error creating enquiry:", error);
    return NextResponse.json(
      { error: "Error creating enquiry", detail: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// READ: Fetch all enquiries
export async function GET(req) {
  try {
    const enquiries = await prisma.schoolEnquiry.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        enquiryType: true,
        subject: true,
        message: true,
        attachmentUrl: true,
        classOrGrade: true,
        identification: true,
        preferredContactMethod: true,
        status: true,
        adminNotes: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ enquiries }, { status: 200 });
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    return NextResponse.json(
      { error: "Error fetching enquiries", detail: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
