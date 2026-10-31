export const semesterCodes = ["SEMESTER_I", "SEMESTER_II", "SEMESTER_III"] as const;
export type SemesterCode = (typeof semesterCodes)[number];

export function normalizeSemester(value: unknown): SemesterCode | null {
  const normalized = String(value ?? "").trim().toUpperCase();
  const aliases: Record<string, SemesterCode> = {
    SEMESTER_I: "SEMESTER_I",
    FIRST: "SEMESTER_I",
    1: "SEMESTER_I",
    SEMESTER_II: "SEMESTER_II",
    SECOND: "SEMESTER_II",
    2: "SEMESTER_II",
    SEMESTER_III: "SEMESTER_III",
    THIRD: "SEMESTER_III",
    3: "SEMESTER_III",
  };
  return aliases[normalized] ?? null;
}

/**
 * School academic years run April through March. The range is derived from
 * the class record, so old imports and future academic years both work.
 */
export function semesterDateRange(semester: SemesterCode, academicYear: number) {
  const startYear = Number.isInteger(academicYear) ? academicYear : new Date().getFullYear();
  if (semester === "SEMESTER_I") {
    return { start: new Date(Date.UTC(startYear, 3, 1)), end: new Date(Date.UTC(startYear, 6, 31, 23, 59, 59, 999)) };
  }
  if (semester === "SEMESTER_II") {
    return { start: new Date(Date.UTC(startYear, 7, 1)), end: new Date(Date.UTC(startYear, 10, 30, 23, 59, 59, 999)) };
  }
  return { start: new Date(Date.UTC(startYear, 11, 1)), end: new Date(Date.UTC(startYear + 1, 2, 31, 23, 59, 59, 999)) };
}

export function calculateInternalMarks(averageAssignmentMarks: number) {
  // StudentAssignment.marksObtained is scored out of three; internal work is
  // converted to the school result-card maximum of twenty-four.
  return Math.min(24, Math.max(0, (averageAssignmentMarks / 3) * 24));
}
