import prisma from '@/src/lib/prisma';


// GET all school center cities
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const skip = (page - 1) * pageSize;

    const cities = await prisma.featureSchoolCenterCities.findMany({
      skip,
      take: pageSize,
      orderBy: { id: 'desc' },
    });

    const totalCities = await prisma.featureSchoolCenterCities.count();

    console.log('[API /api/feature-school-center-cities] Response:', {
      page,
      pageSize,
      totalCities,
      totalPages: Math.ceil(totalCities / pageSize),
      cityCount: cities.length,
    });

    return NextResponse.json({
      cities,
      total: totalCities,
      page,
      pageSize,
      totalPages: Math.ceil(totalCities / pageSize),
    });
  } catch (error) {
    console.error('❌ GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch cities', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST new school center cities
export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const cities = Array.isArray(body) ? body : [body];

    const createdCities = await prisma.featureSchoolCenterCities.createMany({
      data: cities.map((city) => ({
        img_url: city.img_url || null,
        title: city.title || null,
      })),
    });

    console.log('[API /api/feature-school-center-cities] POST Response:', createdCities);

    return NextResponse.json(createdCities, { status: 201 });
  } catch (error) {
    console.error('❌ POST Error:', error);
    return NextResponse.json({ error: 'Failed to create cities', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}