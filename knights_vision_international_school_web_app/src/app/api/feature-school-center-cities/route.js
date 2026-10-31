import prisma from '@/src/lib/prisma';


// GET: Fetch all FeatureSchoolCenterCities records
export async function GET(req) {
  try {
    const cities = await prisma.featureSchoolCenterCities.findMany({
      select: {
        id: true,
        img_url: true,
        title: true,
      },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(cities, { status: 200 });
  } catch (error) {
    console.error('Error fetching FeatureSchoolCenterCities records:', error);
    return NextResponse.json(
      { error: 'Error fetching FeatureSchoolCenterCities records', detail: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST: Create a new FeatureSchoolCenterCities record
export async function POST(req) {
  try {
    const data = await req.json();
    const city = await prisma.featureSchoolCenterCities.create({
      data: {
        img_url: data.img_url || null,
        title: data.title || null,
      },
    });

    return NextResponse.json(city, { status: 201 });
  } catch (error) {
    console.error('Error creating FeatureSchoolCenterCities record:', error);
    return NextResponse.json(
      { error: 'Error creating FeatureSchoolCenterCities record', detail: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}