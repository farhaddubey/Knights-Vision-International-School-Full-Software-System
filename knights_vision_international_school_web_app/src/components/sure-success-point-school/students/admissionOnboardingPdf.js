"use client";

import { jsPDF } from "jspdf";

function safeText(value, fallback = "Not recorded") {
  const result = String(value ?? "").trim();
  return result || fallback;
}

function studentName(student) {
  return [student?.firstName, student?.middleName, student?.lastName]
    .filter(Boolean)
    .join(" ") || "Student";
}

/**
 * A private handover sheet for a one-time student account code. The server
 * stores only a bcrypt hash; the raw code exists only in this in-memory
 * response and this guardian handover download.
 */
export function downloadStudentAccountCodePdf({ student, activation, classLabel = "Not recorded", purpose = "ACTIVATION" }) {
  if (!student || !activation?.activationCode) return;

  const document = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const expiresAt = activation.expiresAt ? new Date(activation.expiresAt) : null;
  const isPasswordRecovery = purpose === "PASSWORD_RESET";
  const accessTitle = isPasswordRecovery ? "Student Password Recovery Details" : "Student Digital Access & Admission Details";
  const codeTitle = isPasswordRecovery ? "ONE-TIME STUDENT PASSWORD RECOVERY" : "ONE-TIME STUDENT ACCOUNT ACTIVATION";
  const line = (label, value, y) => {
    document.setFont("helvetica", "bold");
    document.text(`${label}:`, 20, y);
    document.setFont("helvetica", "normal");
    document.text(safeText(value), 68, y, { maxWidth: 118 });
  };

  document.setFillColor(18, 51, 33);
  document.rect(0, 0, 210, 34, "F");
  document.setTextColor(255, 255, 255);
  document.setFont("helvetica", "bold");
  document.setFontSize(18);
  document.text("Sure Success Point School", 105, 15, { align: "center" });
  document.setFontSize(10);
  document.text(accessTitle, 105, 23, { align: "center" });
  document.setFont("helvetica", "normal");
  document.setFontSize(8);
  document.text("Deliver only to the verified student or guardian", 105, 29, { align: "center" });

  document.setTextColor(25, 25, 25);
  document.setFontSize(11);
  document.setFont("helvetica", "bold");
  document.text("ADMISSION IDENTITY", 20, 47);
  document.setFont("helvetica", "normal");
  document.setFontSize(10);
  let y = 59;
  line("Student", studentName(student), y); y += 9;
  line("Admission no.", student.admissionNumber, y); y += 9;
  line("Class", classLabel, y); y += 9;
  line("Guardian", student.guardianName, y); y += 9;
  line("Guardian contact", student.guardianContact, y); y += 14;

  document.setFillColor(238, 247, 241);
  document.roundedRect(18, y - 5, 174, 42, 2, 2, "F");
  document.setTextColor(16, 84, 45);
  document.setFont("helvetica", "bold");
  document.setFontSize(11);
  document.text(codeTitle, 23, y + 4);
  document.setFontSize(9);
  document.text("Activation code", 23, y + 13);
  document.setFont("courier", "bold");
  document.setFontSize(14);
  document.text(activation.activationCode, 23, y + 22);
  document.setFont("helvetica", "normal");
  document.setFontSize(8);
  document.text(`Expires: ${expiresAt ? expiresAt.toLocaleString("en-IN") : "seven days from issue"}`, 23, y + 31);
  y += 53;

  document.setTextColor(25, 25, 25);
  document.setFont("helvetica", "bold");
  document.setFontSize(11);
  document.text(isPasswordRecovery ? "HOW TO RESET ACCESS" : "HOW TO START DIGITAL ACCESS", 20, y);
  document.setFont("helvetica", "normal");
  document.setFontSize(9);
  const steps = [
    "Open the SSPS Student App or the Student Portal.",
    "Choose 'Activate or reset account'.",
    "Enter this admission number, the one-time code above, and a new password of at least 12 characters.",
    isPasswordRecovery ? "After the reset, sign in with the admission number and the new password." : "After activation, use the admission number and the chosen password to sign in.",
  ];
  steps.forEach((step, index) => {
    document.text(`${index + 1}. ${step}`, 24, y + 9 + (index * 9), { maxWidth: 162 });
  });
  y += 51;

  document.setFillColor(255, 244, 205);
  document.roundedRect(18, y - 4, 174, 42, 2, 2, "F");
  document.setTextColor(90, 70, 10);
  document.setFont("helvetica", "bold");
  document.setFontSize(10);
  document.text(isPasswordRecovery ? "SECURITY REMINDER" : "DIGITAL FEATURES & SECURITY", 23, y + 4);
  document.setFont("helvetica", "normal");
  document.setFontSize(8.5);
  const features = isPasswordRecovery
    ? "This code was issued because the student or guardian requested password recovery. It works once, expires automatically, and invalidates any earlier unused code. UID and Aadhaar are never passwords. Keep the code private and set a new password that is not shared with anyone."
    : "The Student App and Portal provide the student's own attendance, homework, assignments, exam results, fee status, school calendar, notices and learning resources. The account is personal and class-scoped. UID and Aadhaar are never passwords. Keep the activation code private; it works once and is erased by the system after activation.";
  document.text(document.splitTextToSize(features, 162), 23, y + 12);

  document.setTextColor(100, 100, 100);
  document.setFontSize(8);
  document.text("This is a private system-generated student-account handover sheet. It is not a payment receipt.", 105, 279, { align: "center" });
  document.save(`SSPS-Student-${isPasswordRecovery ? "Password-Recovery" : "Digital-Access"}-${safeText(student.admissionNumber, "Student")}.pdf`);
}

export function downloadAdmissionOnboardingPdf({ student, activation, classLabel = "Not recorded" }) {
  downloadStudentAccountCodePdf({ student, activation, classLabel, purpose: "ACTIVATION" });
}
