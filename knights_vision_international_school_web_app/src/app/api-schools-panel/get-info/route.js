import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';


export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const schoolId = parseInt(searchParams.get('schoolId') || '0', 10);
  const branchId = parseInt(searchParams.get('branchId') || '0', 10);
  const academicYear = parseInt(searchParams.get('academicYear') || '2025', 10);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const date = searchParams.get('date') ? new Date(searchParams.get('date')) : new Date();

  try {
    if (type === 'schools') {
      const schools = await prisma.school.findMany({
        select: { id: true, name: true, address: true },
        orderBy: { name: 'asc' },
      });
      return NextResponse.json({ schools });
    } else if (type === 'branches' && schoolId) {
      const branches = await prisma.schoolBranch.findMany({
        where: { schoolId },
        select: { id: true, name: true, code: true, address: true },
        orderBy: { name: 'asc' },
      });
      return NextResponse.json({ branches });
    } else if (type === 'students' && branchId) {
      const students = await prisma.student.findMany({
        where: { branchId, academicYear },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          rollNumber: true,
          admissionNumber: true,
          lastExamResult: true,
          gender: true,
          class: { select: { id: true, name: true, section: true } },
        },
        orderBy: { firstName: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
      const total = await prisma.student.count({ where: { branchId, academicYear } });
      return NextResponse.json({ students, totalPages: Math.ceil(total / pageSize) });
    } else if (type === 'prayer-oath' && branchId) {
      const assignments = await prisma.prayerOathAssignment.findMany({
        where: { branchId, academicYear, date: { gte: new Date(date.setHours(0, 0, 0, 0)), lte: new Date(date.setHours(23, 59, 59, 999)) } },
        select: {
          student: { select: { id: true, firstName: true, lastName: true, class: { select: { id: true, name: true, section: true } } } },
          role: true,
          gender: true,
          classId: true,
        },
      });
      return NextResponse.json({ assignments });
    } else {
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data: ' + error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request) {
  const { branchId, academicYear, date, genderRatio, gender } = await request.json();
  if (!branchId || !academicYear || !date || !genderRatio || !['MALE', 'FEMALE'].includes(gender)) {
    return NextResponse.json({ error: 'Missing or invalid required parameters' }, { status: 400 });
  }

  try {
    const startDate = new Date('2025-01-01');
    const currentDate = new Date(date);
    const cycleLength = genderRatio.boysDays + genderRatio.girlsDays;
    if (cycleLength === 0) {
      return NextResponse.json({ error: 'Invalid gender ratio: total days cannot be zero' }, { status: 400 });
    }
    const cycleDay = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24)) % cycleLength;
    const expectedGender = cycleDay < genderRatio.boysDays ? 'MALE' : 'FEMALE';
    if (expectedGender !== gender) {
      return NextResponse.json({ error: `Gender mismatch: Expected ${expectedGender} for this day` }, { status: 400 });
    }

    // Check existing assignments for the day
    const existingAssignments = await prisma.prayerOathAssignment.findMany({
      where: { branchId, academicYear, date: { gte: new Date(currentDate.setHours(0, 0, 0, 0)), lte: new Date(currentDate.setHours(23, 59, 59, 999)) } },
    });
    if (existingAssignments.length > 0) {
      return NextResponse.json({ message: 'Assignments already exist for this day' });
    }

    // Fetch students excluding prayer leaders from the last 14 days
    const twoWeeksAgo = new Date(currentDate);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const recentPrayerLeaders = await prisma.prayerOathAssignment.findMany({
      where: { branchId, academicYear, role: 'PRAYER', date: { gte: twoWeeksAgo } },
      select: { studentId: true },
    });
    const excludedIds = recentPrayerLeaders.map((a) => a.studentId);

    const students = await prisma.student.findMany({
      where: { branchId, academicYear, gender, id: { notIn: excludedIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        gender: true,
        lastExamResult: true,
        class: { select: { id: true, name: true, section: true } },
        classId: true,
      },
    });

    if (students.length < 6) {
      return NextResponse.json({ error: `Insufficient eligible students: need at least 6, found ${students.length}` }, { status: 400 });
    }

    // Separate juniors (V, VI) and seniors (VII, VIII, IX, X)
    const juniors = students.filter((s) => ['Class V', 'Class VI'].includes(s.class.name));
    const seniors = students.filter((s) => ['Class VII', 'Class VIII', 'Class IX', 'Class X'].includes(s.class.name));

    // Shuffle arrays
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    // Select 2 juniors and 2 seniors for prayer
    const shuffledJuniors = shuffleArray([...juniors]);
    const shuffledSeniors = shuffleArray([...seniors]);
    const prayerLeaders = [
      ...shuffledJuniors.slice(0, Math.min(2, shuffledJuniors.length)),
      ...shuffledSeniors.slice(0, Math.min(2, shuffledSeniors.length)),
    ].slice(0, 4);

    if (prayerLeaders.length < 4) {
      return NextResponse.json({ error: `Insufficient junior or senior students: need 4, found ${prayerLeaders.length}` }, { status: 400 });
    }

    // Select oath leaders from top 10%
    let eligibleOathStudents = gender === 'MALE' ? seniors : students;
    eligibleOathStudents = eligibleOathStudents.filter((s) => !prayerLeaders.some((p) => p.id === s.id));
    eligibleOathStudents.sort((a, b) => (b.lastExamResult || 0) - (a.lastExamResult || 0));
    const top10PercentCount = Math.max(1, Math.floor(eligibleOathStudents.length * 0.1));
    const topStudents = shuffleArray([...eligibleOathStudents.slice(0, top10PercentCount)]);
    const oathLeaders = topStudents.slice(0, Math.min(2, topStudents.length));

    if (oathLeaders.length < 2) {
      return NextResponse.json({ error: `Insufficient top students for oath: need 2, found ${oathLeaders.length}` }, { status: 400 });
    }

    // Save assignments
    const assignments = [
      ...prayerLeaders.map((student) => ({
        studentId: student.id,
        branchId,
        classId: student.classId,
        role: 'PRAYER',
        gender,
        date: currentDate,
        academicYear,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      ...oathLeaders.map((student) => ({
        studentId: student.id,
        branchId,
        classId: student.classId,
        role: 'OATH',
        gender,
        date: currentDate,
        academicYear,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    ];

    await prisma.$transaction(assignments.map((a) => prisma.prayerOathAssignment.create({ data: a })));

    return NextResponse.json({ prayerLeaders, oathLeaders });
  } catch (error) {
    console.error('Error assigning prayer/oath leaders:', error);
    return NextResponse.json({ error: 'Failed to assign leaders: ' + error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}