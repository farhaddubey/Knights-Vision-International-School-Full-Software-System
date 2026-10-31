import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

// ✅ PUT update country
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const country = await prisma.country.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name,
        code: body.code,
        currencyId: body.currencyId,
        timezoneId: body.timezoneId,
        contactInfo: body.contactInfo,
        translations: body.translations,
      },
    });
    return NextResponse.json(country);
  } catch (error) {
    console.error('❌ PUT Error:', error);
    return NextResponse.json({ error: 'Failed to update country' }, { status: 500 });
  }
}


export async function DELETE(request, { params }) {
  try {
    const countryId = parseInt(params.id);

    // ✅ Step 1: Check if country exists
    const country = await prisma.country.findUnique({ where: { id: countryId } });
    if (!country) {
      return NextResponse.json({ error: 'Country not found' }, { status: 404 });
    }

    // ✅ Step 2: Find all LegalServiceCenter IDs for this country
    const serviceCenters = await prisma.legalServiceCenter.findMany({
      where: { countryId },
      select: { id: true },
    });
    const serviceCenterIds = serviceCenters.map((sc) => sc.id);

    // ✅ Step 3: Delete all related children that depend on LegalServiceCenter
    await prisma.serviceCenterService.deleteMany({
      where: { serviceCenterId: { in: serviceCenterIds } },
    });
    await prisma.legal_servicesSlot.deleteMany({
      where: { serviceCenterId: { in: serviceCenterIds } },
    });
    await prisma.operatingHours.deleteMany({
      where: { serviceCenterId: { in: serviceCenterIds } },
    });

    // ✅ Step 4: Delete other records linked to country
    await prisma.legal_servicesRequest.deleteMany({ where: { countryId } });
    await prisma.tax.deleteMany({ where: { countryId } });
    await prisma.analytics.deleteMany({ where: { countryId } });
    await prisma.state.deleteMany({ where: { countryId } });

    // ✅ Step 5: Now safely delete LegalServiceCenters
    await prisma.legalServiceCenter.deleteMany({ where: { countryId } });

    // ✅ Step 6: Finally, delete the country itself
    await prisma.country.delete({ where: { id: countryId } });

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error('❌ DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to forcibly delete country' }, { status: 500 });
  }
}