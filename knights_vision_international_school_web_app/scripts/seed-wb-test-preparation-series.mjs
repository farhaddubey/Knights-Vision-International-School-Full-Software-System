import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const APPLY = process.argv.includes('--apply');
const ACADEMIC_YEAR = 2026;
const MAIN_BRANCH_CODE = 'SSPS-MAIN';
const SERIES_TITLE_PREFIX = 'Knights WB Test Preparation Series';
const REQUIRED_SUBJECTS = [
  'English',
  'Bengali',
  'Mathematics',
  'Physical Science',
  'Life Science',
  'History',
  'Geography',
];

const X_SCHEDULE_MONTHS = [
  ...[7, 8, 9, 10, 11, 12].map((month) => ({ className: 'X', year: 2026, month })),
];

const monthLabel = (year, month) =>
  new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(year, month - 1, 1)));

const dateKey = (date) => date.toISOString().slice(0, 10);
const makeUtcDate = (year, month, day) => new Date(Date.UTC(year, month - 1, day, 12));

// Class XS runs two deliberately paced rounds across the combined January /
// February window. Each paper is followed by one independent-study and doubt-
// clearing day. A Sunday becomes the second rest day before the next paper.
const XS_ROUNDS = [
  {
    round: 1,
    startDate: makeUtcDate(2027, 1, 1),
    title: `${SERIES_TITLE_PREFIX} - XS Round 1 (January 2027)`,
    legacyPeriod: 'January 2027',
  },
  {
    round: 2,
    startDate: makeUtcDate(2027, 1, 20),
    title: `${SERIES_TITLE_PREFIX} - XS Round 2 (January-February 2027)`,
    legacyPeriod: 'February 2027',
  },
];

function normaliseSubjectName(name) {
  return String(name ?? '').trim().toLowerCase();
}

function nextAvailableWorkingDate(candidate, holidays, reservedDates) {
  while (
    candidate.getUTCDay() === 0
    || holidays.has(dateKey(candidate))
    || reservedDates.has(dateKey(candidate))
  ) {
    candidate.setUTCDate(candidate.getUTCDate() + 1);
  }
  reservedDates.add(dateKey(candidate));
  return candidate;
}

function plannedStudyGapDates({ startDate, count, holidays, reservedDates }) {
  const dates = [];
  let candidate = new Date(startDate);
  for (let index = 0; index < count; index += 1) {
    const examDate = nextAvailableWorkingDate(candidate, holidays, reservedDates);
    dates.push(new Date(examDate));

    // Exam day + one study/doubt-clearing day. When that next possible date is
    // Sunday, Sunday is the additional rest day and the next paper is Monday.
    candidate = new Date(examDate);
    candidate.setUTCDate(candidate.getUTCDate() + 2);
    if (candidate.getUTCDay() === 0) candidate.setUTCDate(candidate.getUTCDate() + 1);
  }
  return dates;
}

async function main() {
  const branch = await prisma.schoolBranch.findFirst({
    where: { code: MAIN_BRANCH_CODE, schoolId: 1 },
    select: { id: true, name: true, code: true },
  });

  if (!branch) {
    throw new Error(`Main branch ${MAIN_BRANCH_CODE} was not found.`);
  }

  const [classes, holidays] = await Promise.all([
    prisma.schoolClass.findMany({
      where: {
        schoolId: 1,
        branchId: branch.id,
        academicYear: ACADEMIC_YEAR,
        name: { in: ['X', 'XS'] },
      },
      select: {
        id: true,
        name: true,
        section: true,
        classSubjects: {
          select: { id: true, subject: { select: { name: true } } },
        },
      },
    }),
    prisma.holidayCalendar.findMany({
      where: {
        date: {
          gte: makeUtcDate(2026, 7, 1),
          lt: makeUtcDate(2027, 3, 1),
        },
      },
      select: { date: true, title: true },
      orderBy: { date: 'asc' },
    }),
  ]);

  const classesByName = new Map(classes.map((schoolClass) => [schoolClass.name, schoolClass]));
  const holidayDates = new Set(holidays.map((holiday) => dateKey(holiday.date)));
  const plannedExams = [];

  for (const monthPlan of X_SCHEDULE_MONTHS) {
    const schoolClass = classesByName.get(monthPlan.className);
    if (!schoolClass) {
      throw new Error(`Class ${monthPlan.className} is missing for ${MAIN_BRANCH_CODE}, academic year ${ACADEMIC_YEAR}.`);
    }

    const subjectByName = new Map(
      schoolClass.classSubjects.map((classSubject) => [normaliseSubjectName(classSubject.subject.name), classSubject]),
    );
    const missingSubjects = REQUIRED_SUBJECTS.filter((subject) => !subjectByName.has(normaliseSubjectName(subject)));
    if (missingSubjects.length > 0) {
      throw new Error(`Class ${monthPlan.className} is missing required subjects: ${missingSubjects.join(', ')}.`);
    }

    const reservedDates = new Set();
    REQUIRED_SUBJECTS.forEach((subjectName, index) => {
      const classSubject = subjectByName.get(normaliseSubjectName(subjectName));
      const examDate = nextAvailableWorkingDate(makeUtcDate(monthPlan.year, monthPlan.month, index + 1), holidayDates, reservedDates);
      const period = monthLabel(monthPlan.year, monthPlan.month);
      const title = `${SERIES_TITLE_PREFIX} - ${period}`;

      plannedExams.push({
        className: monthPlan.className,
        classSubjectId: classSubject.id,
        subjectName,
        title: `${SERIES_TITLE_PREFIX} — ${period}`,
        // Keep Class X titles byte-for-byte compatible with the existing records.
        title: `${SERIES_TITLE_PREFIX} \u2014 ${period}`,
        examDate,
        totalMarks: 100,
        academicYear: ACADEMIC_YEAR,
        syllabus: `${SERIES_TITLE_PREFIX}: ${subjectName} monthly preparation test for ${period}.`,
        lookupTitles: [`${SERIES_TITLE_PREFIX} â€” ${period}`],
        legacyPeriod: period,
      });
    });
  }

  const xsClass = classesByName.get('XS');
  if (!xsClass) {
    throw new Error(`Class XS is missing for ${MAIN_BRANCH_CODE}, academic year ${ACADEMIC_YEAR}.`);
  }
  const xsSubjectByName = new Map(
    xsClass.classSubjects.map((classSubject) => [normaliseSubjectName(classSubject.subject.name), classSubject]),
  );
  const missingXsSubjects = REQUIRED_SUBJECTS.filter((subject) => !xsSubjectByName.has(normaliseSubjectName(subject)));
  if (missingXsSubjects.length > 0) {
    throw new Error(`Class XS is missing required subjects: ${missingXsSubjects.join(', ')}.`);
  }
  const xsReservedDates = new Set();
  for (const round of XS_ROUNDS) {
    const dates = plannedStudyGapDates({
      startDate: round.startDate,
      count: REQUIRED_SUBJECTS.length,
      holidays: holidayDates,
      reservedDates: xsReservedDates,
    });
    REQUIRED_SUBJECTS.forEach((subjectName, index) => {
      const classSubject = xsSubjectByName.get(normaliseSubjectName(subjectName));
      plannedExams.push({
        className: 'XS',
        classSubjectId: classSubject.id,
        subjectName,
        title: round.title,
        legacyPeriod: round.legacyPeriod,
        examDate: dates[index],
        totalMarks: 100,
        academicYear: ACADEMIC_YEAR,
        syllabus: `${SERIES_TITLE_PREFIX}: XS Round ${round.round}, ${subjectName}. One study and doubt-clearing day follows each paper; Sunday adds the second rest day.`,
      });
    });
  }

  const existing = await prisma.boardExam.findMany({
    where: {
      classSubjectId: { in: [...new Set(plannedExams.map((exam) => exam.classSubjectId))] },
      academicYear: ACADEMIC_YEAR,
      title: { contains: SERIES_TITLE_PREFIX },
    },
    select: { id: true, classSubjectId: true, title: true, examDate: true, totalMarks: true, syllabus: true, academicYear: true },
  });
  const matchingExisting = (exam) => existing.find((current) => (
    current.classSubjectId === exam.classSubjectId
    && (current.title === exam.title || current.title.includes(exam.legacyPeriod))
  ));
  const needsUpdate = (current, exam) => (
    current.title !== exam.title
    || current.examDate.getTime() !== exam.examDate.getTime()
    || Number(current.totalMarks) !== Number(exam.totalMarks)
    || current.academicYear !== exam.academicYear
    || current.syllabus !== exam.syllabus
  );
  const pending = plannedExams.filter((exam) => !matchingExisting(exam));
  // This revision intentionally changes the paced Class XS programme only.
  // Leave the already-published Class X calendar untouched.
  const pendingUpdates = plannedExams.filter((exam) => {
    const current = matchingExisting(exam);
    return exam.className === 'XS' && current && needsUpdate(current, exam);
  });

  const output = {
    mode: APPLY ? 'apply' : 'check',
    branch: `${branch.name} (${branch.code})`,
    academicYear: ACADEMIC_YEAR,
    holidays: holidays.map((holiday) => ({ date: dateKey(holiday.date), title: holiday.title })),
    scheduled: plannedExams.length,
    alreadyPresent: plannedExams.length - pending.length,
    toCreate: pending.length,
    toUpdate: pendingUpdates.length,
    schedule: plannedExams.map((exam) => ({
      className: exam.className,
      date: dateKey(exam.examDate),
      subject: exam.subjectName,
      title: exam.title,
    })),
  };

  if (!APPLY) {
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  let created = 0;
  let updated = 0;
  for (const exam of plannedExams) {
    const current = matchingExisting(exam);
    if (current) {
      if (exam.className !== 'XS' || !needsUpdate(current, exam)) continue;
      await prisma.boardExam.update({
        where: { id: current.id },
        data: {
          title: exam.title,
          examDate: exam.examDate,
          totalMarks: exam.totalMarks,
          academicYear: exam.academicYear,
          syllabus: exam.syllabus,
        },
      });
      updated += 1;
    } else {
      await prisma.boardExam.create({
        data: {
          classSubjectId: exam.classSubjectId,
          title: exam.title,
          examDate: exam.examDate,
          totalMarks: exam.totalMarks,
          academicYear: exam.academicYear,
          syllabus: exam.syllabus,
        },
      });
      created += 1;
    }
  }

  console.log(JSON.stringify({ ...output, created, updated }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
