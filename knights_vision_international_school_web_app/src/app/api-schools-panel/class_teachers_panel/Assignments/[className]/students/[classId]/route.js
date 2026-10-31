import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { className, classId } = params;
const classMap = {
  'lkg':   { id: 1,  name: 'LKG' },
  'ukg':   { id: 2,  name: 'UKG' },
  'i':     { id: 3,  name: 'I' },
  'ii':     { id: 4,  name: 'II' },
  'iii':     { id: 5,  name: 'III' },
  'iv':     { id: 6,  name: 'IV' },
  'v':     { id: 7,  name: 'V' },
  'vi':     { id: 8,  name: 'VI' },
  'vii':     { id: 9,  name: 'VII' },
  'viii':     { id: 10, name: 'VIII' },
  'ix':     { id: 11, name: 'IX' },
  'x':    { id: 12, name: 'X' },
  'xs':    { id: 13, name: 'XS' },
  'xi': {id:14, name:'XI'},
  'xii': {id:15, name:'XII'},
  'xiis': {id:16, name:'XIIS'},
  'xiiij': {id:16, name:'XIIIJ'},
};
    const classInfo = classMap[className.toLowerCase()];
    if (!classInfo) {
      return NextResponse.json({ error: 'Invalid class name' }, { status: 400 });
    }

    const parsedClassId = parseInt(classId, 10);
    if (!parsedClassId) {
      return NextResponse.json({ error: 'Missing or invalid classId' }, { status: 400 });
    }

    const students = await prisma.student.findMany({
      where: { classId: parsedClassId },
      orderBy: { firstName: 'asc' },
    });

    return NextResponse.json({ students }, { status: 200 });
  } catch (error) {
    console.error(`GET Assignments/${params.className}/students/${params.classId} Error:`, error.message);
    return NextResponse.json({ error: 'Failed to fetch students', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}