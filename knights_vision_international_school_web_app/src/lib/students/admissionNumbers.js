const ADMISSION_PREFIX = "SSPS";
const MAX_STUDENT_SEQUENCE = 999999;

function validAcademicYear(value) {
  const year = Number.parseInt(String(value), 10);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error("A valid admission academic year is required.");
  }
  return year;
}

function validStudentSequence(value) {
  const sequence = Number(value);
  if (!Number.isInteger(sequence) || sequence < 1 || sequence > MAX_STUDENT_SEQUENCE) {
    throw new Error("The student sequence must fit within six digits.");
  }
  return sequence;
}

/**
 * Permanent student identifier and login ID.
 *
 * The database primary key is immutable and globally unique, so using it as
 * the padded sequence is race-safe without exposing Aadhaar or any other
 * government identifier. It supports 999,999 student records.
 */
export function formatStudentAdmissionNumber(studentId, academicYear) {
  const year = validAcademicYear(academicYear);
  const sequence = validStudentSequence(studentId);
  return `${ADMISSION_PREFIX}-${year}-${String(sequence).padStart(6, "0")}`;
}

/**
 * An Admission row is a historical transaction. The first admission uses the
 * student's permanent number; later annual re-admissions receive a readable
 * suffix while the student's login/admission number stays permanent.
 */
export function formatAdmissionRecordNumber({ studentId, academicYear, admissionType = "FRESH", ordinal = 1 }) {
  const base = formatStudentAdmissionNumber(studentId, academicYear);
  if (Number(ordinal) <= 1 && String(admissionType).toUpperCase() !== "READMISSION") return base;
  if (String(admissionType).toUpperCase() === "READMISSION") return `${base}-R`;
  return `${base}-A${Number(ordinal)}`;
}

export function isStandardStudentAdmissionNumber(value) {
  return /^SSPS-\d{4}-\d{6}$/.test(String(value || ""));
}
