/*
 * Sure Success Point School fee matrix (2026).
 *
 * Safe default: reports the target matrix. Use --apply to write it.
 * KSAT_GENERAL is the approved table. DIRECT_GENERAL adds the approved direct
 * admission differential. KSAT_STANDARD is General - INR 200 per field,
 * KSAT_SUPPORT is 50% of General, and KSAT_SUPPORT_PLUS is zero.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

// Schema order: monthlyFee, admissionFee, readmissionFee.
const GENERAL = {
  LKG: [400, 3000, 2500],
  UKG: [400, 3000, 2500],
  I: [500, 3000, 2500],
  II: [500, 3000, 2500],
  III: [600, 3000, 2500],
  IV: [600, 3000, 2500],
  V: [700, 3500, 3000],
  VI: [700, 3500, 3000],
  VII: [800, 3500, 3000],
  VIII: [800, 3500, 3000],
  IX: [1000, 4500, 4000],
  X: [1000, 5000, 5000],
  XS: [1000, 0, 0],
  XI: [2000, 10000, 10000],
  XII: [2000, 10000, 10000],
  XIIS: [2000, 0, 0],
  XIIIJ: [3000, 20000, 20000],
};

const FEE_CATEGORIES = ['KSAT_GENERAL', 'DIRECT_GENERAL', 'KSAT_STANDARD', 'KSAT_SUPPORT', 'KSAT_SUPPORT_PLUS'];
const fields = (values) => ({ monthlyFee: values[0], admissionFee: values[1], readmissionFee: values[2] });
const subtract200 = (values) => values.map((value) => Math.max(0, value - 200));
const half = (values) => values.map((value) => value / 2);

function valuesFor(className, category) {
  const general = GENERAL[className];
  if (!general) throw new Error(`No approved KSAT_GENERAL matrix row exists for class ${className}.`);
  switch (category) {
    case 'KSAT_GENERAL':
      return general;
    case 'DIRECT_GENERAL':
      return [general[0] + 200, general[1] + 5000, general[2] + 3000];
    case 'KSAT_STANDARD':
      return subtract200(general);
    case 'KSAT_SUPPORT':
      return half(general);
    case 'KSAT_SUPPORT_PLUS':
      return [0, 0, 0];
    default:
      throw new Error(`Unsupported fee category ${category}.`);
  }
}

async function main() {
  const school = await prisma.school.findUnique({ where: { slug: 'sure-success-point-school' }, select: { id: true, name: true } });
  if (!school) throw new Error('Sure Success Point School was not found. No fee rows were changed.');
  const classes = await prisma.schoolClass.findMany({
    where: { schoolId: school.id },
    select: { id: true, name: true, section: true, branch: { select: { code: true, name: true } } },
    orderBy: [{ branchId: 'asc' }, { id: 'asc' }],
  });
  if (!classes.length) throw new Error('Sure Success Point School classes were not found. No fee rows were changed.');

  const unsupported = classes.filter((schoolClass) => !GENERAL[schoolClass.name]);
  if (unsupported.length) throw new Error(`Unsupported class names: ${unsupported.map((item) => item.name).join(', ')}. No fee rows were changed.`);

  const targets = classes.flatMap((schoolClass) => FEE_CATEGORIES.map((category) => ({
    classId: schoolClass.id,
    className: schoolClass.name,
    branch: schoolClass.branch.code,
    category,
    ...fields(valuesFor(schoolClass.name, category)),
  })));

  if (!APPLY) {
    console.log(JSON.stringify({ mode: 'check', classes: classes.length, feeSchemes: targets.length, targets }, null, 2));
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const target of targets) {
      await tx.feeScheme.upsert({
        where: { classId_category: { classId: target.classId, category: target.category } },
        create: { classId: target.classId, category: target.category, monthlyFee: target.monthlyFee, admissionFee: target.admissionFee, readmissionFee: target.readmissionFee },
        update: { monthlyFee: target.monthlyFee, admissionFee: target.admissionFee, readmissionFee: target.readmissionFee },
      });
    }
  }, { maxWait: 10_000, timeout: 60_000 });

  console.log(JSON.stringify({ mode: 'apply', updatedFeeSchemes: targets.length, classes: classes.length, matrix: GENERAL }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
