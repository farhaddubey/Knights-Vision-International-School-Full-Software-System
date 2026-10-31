"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  TextField,
  CircularProgress,
  Pagination,
  PaginationItem,
} from "@mui/material";
import { Search as SearchIcon, ChevronLeft, ChevronRight, EmojiPeople } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logo from "@/public/knights.png";

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 50;

const textFieldStyles = {
  "& .MuiInputBase-input": { color: "#fff" },
  "& .MuiInputLabel-root": { color: "#aaa" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#555" },
    "&:hover fieldset": { borderColor: "#777" },
    "&.Mui-focused fieldset": { borderColor: "#00c757" },
  },
};

// Function to extract class label
const extractClassLabel = (className) => {
  return `Class: ${className.replace("Class_", "")}`;
};

// Function to format subject name
const formatSubjectName = (name) => {
  if (!name || name === "N/A") return "N/A";
  if (name.length <= 14) return name;
  // Check for two syllables (simplified as words with a space or hyphen)
  if (name.includes(" ") || name.includes("-")) {
    return `${name.slice(0, 14)}`;
  }
  return name.slice(0, 14);
};

// Grading function with colors and grade points
const getGrade = (percentage) => {
  if (percentage >= 90) return { grade: "AA", color: [0, 128, 0], point: 10 }; // Green
  if (percentage >= 80) return { grade: "A+", color: [0, 255, 0], point: 9 }; // Light Green
  if (percentage >= 60) return { grade: "A", color: [135, 206, 235], point: 8 }; // Sky Blue
  if (percentage >= 45) return { grade: "B+", color: [255, 255, 0], point: 7 }; // Yellow
  if (percentage >= 35) return { grade: "B", color: [255, 165, 0], point: 6 }; // Orange
  if (percentage >= 25) return { grade: "C", color: [255, 255, 224], point: 5 }; // Light Yellow
  return { grade: "D", color: [255, 0, 0], point: 4 }; // Red
};

// Function to calculate CGPA for each semester and overall
const calculateCGPA = (resultsBySemester, classSubjects) => {
  let sem1Points = 0, sem2Points = 0, sem3Points = 0;
  let subjectCount = classSubjects.length;

  classSubjects.forEach((cs) => {
    const sem1Result = resultsBySemester.find((r) => r.semester === "SEMESTER_I")?.results.find((r) => r.classSubjectId === cs.id) || {};
    const sem2Result = resultsBySemester.find((r) => r.semester === "SEMESTER_II")?.results.find((r) => r.classSubjectId === cs.id) || {};
    const sem3Result = resultsBySemester.find((r) => r.semester === "SEMESTER_III")?.results.find((r) => r.classSubjectId === cs.id) || {};

    const sem1Total = Math.floor(sem1Result.semesterExamMarks || 0) + Math.floor(sem1Result.vivaMarks || 0) + Math.floor(sem1Result.internalMarks || 0);
    const sem2Total = Math.floor(sem2Result.semesterExamMarks || 0) + Math.floor(sem2Result.vivaMarks || 0) + Math.floor(sem2Result.internalMarks || 0);
    const sem3Total = Math.floor(sem3Result.semesterExamMarks || 0) + Math.floor(sem3Result.vivaMarks || 0) + Math.floor(sem3Result.internalMarks || 0);

    sem1Points += getGrade(sem1Total).point;
    sem2Points += getGrade(sem2Total).point;
    sem3Points += getGrade(sem3Total).point;
  });

  const sem1CGPA = subjectCount ? (sem1Points / subjectCount).toFixed(2) : "0.00";
  const sem2CGPA = subjectCount ? (sem2Points / subjectCount).toFixed(2) : "0.00";
  const sem3CGPA = subjectCount ? (sem3Points / subjectCount).toFixed(2) : "0.00";
  const overallCGPA = subjectCount ? ((sem1Points + sem2Points + sem3Points) / (subjectCount * 3)).toFixed(2) : "0.00";

  return { sem1CGPA, sem2CGPA, sem3CGPA, overallCGPA };
};

const ClassSemesterResultCard = ({ className }) => {
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [classSubjects, setClassSubjects] = useState([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    setPage(currentPage);
    fetchStudents(currentPage);
    fetchClassSubjects();
  }, [currentPage, className]);

  const fetchStudents = async (pageNum = 1, search = "") => {
    try {
      setLoading(true);
      setError(null);
      console.log(`DEBUG: Fetching students for class=${className}, page=${pageNum}, search=${search}`);
      const response = await axios.get(`/api/SemesterResults/${className.toLowerCase()}/students`, {
        params: { page: pageNum, pageSize, searchQuery: search },
      });

      if (!response.data || !Array.isArray(response.data.students)) {
        throw new Error("Invalid response format");
      }

      const normalizedStudents = response.data.students.map((student) => ({
        id: student.id,
        firstName: student.firstName || "N/A",
        lastName: student.lastName || "",
        admissionNumber: student.admissionNumber || "N/A",
        rollNumber: student.rollNumber || "N/A",
        guardianName: student.guardianName || "N/A",
        studentCategory: student.studentCategory || "N/A",
      }));

      console.log(`DEBUG: Fetched ${normalizedStudents.length} students`, normalizedStudents);
      setStudents(normalizedStudents);
      setFilteredStudents(normalizedStudents);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("DEBUG: Error fetching students:", err.message);
      setError(`Failed to fetch students: ${err.message}`);
      toast.error(`Failed to fetch students: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassSubjects = async () => {
    try {
      console.log(`DEBUG: Fetching class subjects for class=${className}`);
      const response = await axios.get(`/api/SemesterResults/${className.toLowerCase()}/class-subjects`, {
        params: { page: 1, pageSize: 100 },
      });
      if (!response.data || !Array.isArray(response.data.classSubjects)) {
        throw new Error("Invalid response format");
      }
      console.log(`DEBUG: Fetched ${response.data.classSubjects.length} class subjects`, response.data.classSubjects);
      setClassSubjects(response.data.classSubjects);
    } catch (err) {
      console.error("DEBUG: Error fetching class subjects:", err.message);
      toast.error("Failed to fetch class subjects.");
    }
  };

  const fetchResults = async (studentId) => {
    try {
      console.log(`DEBUG: Fetching results for studentId=${studentId}`);
      const semesters = ["SEMESTER_I", "SEMESTER_II", "SEMESTER_III"];
      const resultsBySemester = await Promise.all(
        semesters.map(async (semester) => {
          const response = await axios.get(`/api/SemesterResults/${className.toLowerCase()}/semester-results`, {
            params: { studentId, semester },
          });
          console.log(`DEBUG: Fetched results for ${semester}`, response.data.results);
          return { semester, results: response.data.results || [] };
        })
      );
      return resultsBySemester;
    } catch (err) {
      console.error("DEBUG: Error fetching semester results:", err.message);
      toast.error("Failed to fetch semester results.");
      return [];
    }
  };


  async function loadImageFromURL(imageURL) {
    console.log(`DEBUG: Loading image from URL=${imageURL}`);
    const response = await fetch(imageURL);
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("DEBUG: Image loaded successfully");
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  }
function addDiagonalWatermark(doc, text) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(200, 0, 0);
  doc.setGState(new doc.GState({ opacity: 0.25 }));

  const angle = -30;

  const spacingX = 15; // tighter horizontally
  const spacingY = 24; // more vertical space to avoid overlap

  for (let y = -50; y < pageHeight + 50; y += spacingY) {
    for (let x = -70; x < pageWidth + 70; x += spacingX) {
      doc.saveGraphicsState();
      doc.text(text, x, y, { angle });
      doc.restoreGraphicsState();
    }
  }

  doc.setGState(new doc.GState({ opacity: 1 }));
}



const handleGeneratePdf = async (studentId) => {
  setPdfLoading(true);

  try {
    toast.info("Generating Result Card");

    const student = students.find((s) => s.id === studentId);

    if (!student) {
      throw new Error("Student not found");
    }

    const resultsBySemester = await fetchResults(studentId);
    const currentYear = new Date().getFullYear();

    const doc = new jsPDF({ format: "a4" });

    // Keep the existing watermark.
    addDiagonalWatermark(doc, "Sure Success Point School");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

  
  
  
    // ============================================================
    // 1. PREMIUM SCHOOL HEADER
    // ============================================================

    const DEEP_EMERALD = [6, 77, 59];   // #064D3B
    const EMERALD = [19, 108, 71];      // #136C47
    const GOLD = [198, 163, 76];        // #C6A34C
    const DARK = [37, 48, 71];
    const GRAY = [102, 112, 133];

    const schoolName = "Sure Success Point School";

    // Deep royal emerald school banner
    doc.setFillColor(...DEEP_EMERALD);
    doc.rect(10, 7, 190, 22, "F");

    // Elegant gold bottom border
    doc.setFillColor(...GOLD);
    doc.rect(10, 28.3, 190, 0.7, "F");

    // Large school name
    doc.setFont("times", "bold");
    doc.setFontSize(37);
    doc.setTextColor(255, 255, 255);

    const maxNameWidth = 181;
    const actualNameWidth = doc.getTextWidth(schoolName);

    if (actualNameWidth > maxNameWidth) {
      doc.setFontSize(
        (37 * maxNameWidth) / actualNameWidth
      );
    }

    doc.text(schoolName, pageWidth / 2, 19.5, {
      align: "center",
    });

    // Institutional motto
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(236, 250, 245);

    doc.text(
      "Institution of Humanism, Hardwork, Discipline, Technology & Excellence",
      pageWidth / 2,
      25.5,
      { align: "center" }
    );

    // ============================================================
    // 2. REGISTRATION DETAILS + RIGHT-ALIGNED SCHOOL LOGO
    // ============================================================

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.7);
    doc.setTextColor(...DARK);

    // Left column
    doc.text("Regd. No.: S/1L 60976", 11, 35);
    doc.text("Institution ID: KNIGHTS0000001", 11, 40);
    doc.text(
      "Najirpur, Alinagar, Kaliachak, Malda - India",
      11,
      45
    );

    // Middle column
    doc.text("UDISE: 19060419603", 112, 35);
    doc.text("Branch: Najirpur", 112, 40);
    doc.text("www.suresuccesspoint.com", 112, 45);

    // School logo at the far right
    const logoX = 181;
    const logoY = 31;
    const logoSize = 15;

    try {
      doc.addImage(
        "/knights.png",
        "PNG",
        logoX,
        logoY,
        logoSize,
        logoSize
      );
    } catch (logoError) {
      console.warn(
        "School logo could not be loaded:",
        logoError
      );
    }

    // ============================================================
    // 3. ANNUAL REPORT TITLE + ACADEMIC SESSION
    // ============================================================

    // Emerald rectangular title bar
    doc.setFillColor(...EMERALD);
    doc.roundedRect(
      10,
      49,
      190,
      8,
      1,
      1,
      "F"
    );

    // Report title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);

    doc.text(
      "ANNUAL PROGRESS REPORT CARD",
      94,
      54.4,
      { align: "center" }
    );

    // Academic session — right aligned
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);

    doc.text(
      `SESSION: ${currentYear}`,
      196,
      54.3,
      { align: "right" }
    );
  
    // ============================================================
    // 4. STUDENT INFORMATION SECTION
    // ============================================================

    const infoTop = 61;

    // Soft background behind student information
    doc.setFillColor(250, 252, 250);
    doc.setDrawColor(222, 230, 225);
    doc.setLineWidth(0.25);
    doc.roundedRect(10, 59, 190, 31, 1.2, 1.2, "FD");

    // Utility: draw a labeled student field.
    const drawStudentField = (label, value, x, y, maxWidth) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...GRAY);
      doc.text(label, x, y);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.2);
      doc.setTextColor(...DARK);

      const safeValue = String(value ?? "N/A");
      const availableWidth = maxWidth || 50;

      // Prevent long identifiers from overlapping columns.
      const lines = doc.splitTextToSize(
        safeValue,
        availableWidth
      );

      doc.text(lines[0] || "N/A", x, y + 4);
    };

    const fullName = [
      student.firstName,
      student.lastName,
    ].filter(Boolean).join(" ");

    const admissionNo = student.admissionNumber || "N/A";

    // Column 1
    drawStudentField(
      "Student Name",
      fullName,
      14,
      infoTop + 3,
      62
    );

    drawStudentField(
      "Guardian",
      student.guardianName || "N/A",
      14,
      infoTop + 14,
      62
    );

    // Column 2
    drawStudentField(
      "Class / Section",
      `${extractClassLabel(className)} / ${
        student.class?.section || "A"
      }`,
      82,
      infoTop + 3,
      35
    );

    drawStudentField(
      "Roll Number",
      student.rollNumber || "N/A",
      82,
      infoTop + 14,
      35
    );

    // Column 3
    drawStudentField(
      "Admission Number",
      admissionNo,
      123,
      infoTop + 3,
      43
    );

    drawStudentField(
      "Branch",
      student.class?.branchName || "Najirpur",
      123,
      infoTop + 14,
      40
    );

    // Student UID — bottom of information block
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    doc.text("Student UID:", 14, 86);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    doc.text(
      String(admissionNo),
      38,
      86,
      { maxWidth: 122 }
    );

    // ============================================================
    // 5. STUDENT PHOTOGRAPH — RIGHT SIDE
    // ============================================================

    const photoX = 174;
    const photoY = 60;
    const photoWidth = 23;
    const photoHeight = 29;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(160, 170, 165);
    doc.setLineWidth(0.4);
    doc.rect(
      photoX,
      photoY,
      photoWidth,
      photoHeight,
      "FD"
    );

    // Use the actual photo field from your student API.
    // Adjust these property names if your backend differs.
    const studentPhoto =
      student.photoUrl ||
      student.profileImageUrl ||
      student.imageUrl ||
      student.photo ||
      null;

    if (studentPhoto) {
      try {
        const photoData = await loadImageFromURL(studentPhoto);

        // jsPDF can detect supported image formats from data.
        doc.addImage(
          photoData,
          undefined,
          photoX + 0.5,
          photoY + 0.5,
          photoWidth - 1,
          photoHeight - 1
        );
      } catch (photoError) {
        console.warn(
          "Student photograph could not be loaded:",
          photoError
        );

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...GRAY);
        doc.text(
          "PHOTO",
          photoX + photoWidth / 2,
          photoY + photoHeight / 2,
          { align: "center" }
        );
      }
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...GRAY);
      doc.text(
        "PHOTO",
        photoX + photoWidth / 2,
        photoY + photoHeight / 2,
        { align: "center" }
      );
    }

    // ============================================================
    // 6. CALCULATE CGPA — ORIGINAL LOGIC
    // ============================================================

    const {
      sem1CGPA,
      sem2CGPA,
      sem3CGPA,
      overallCGPA,
    } = calculateCGPA(
      resultsBySemester,
      classSubjects
    );

    // ============================================================
    // 7. SEMESTER RESULT DATA — ORIGINAL LOGIC
    // ============================================================

    const tableData = classSubjects.map((cs) => {
      const sem1Result =
        resultsBySemester
          .find((r) => r.semester === "SEMESTER_I")
          ?.results.find(
            (r) => r.classSubjectId === cs.id
          ) || {};

      const sem2Result =
        resultsBySemester
          .find((r) => r.semester === "SEMESTER_II")
          ?.results.find(
            (r) => r.classSubjectId === cs.id
          ) || {};

      const sem3Result =
        resultsBySemester
          .find((r) => r.semester === "SEMESTER_III")
          ?.results.find(
            (r) => r.classSubjectId === cs.id
          ) || {};

      const sem1Total =
        Math.floor(sem1Result.semesterExamMarks || 0) +
        Math.floor(sem1Result.vivaMarks || 0) +
        Math.floor(sem1Result.internalMarks || 0);

      const sem2Total =
        Math.floor(sem2Result.semesterExamMarks || 0) +
        Math.floor(sem2Result.vivaMarks || 0) +
        Math.floor(sem2Result.internalMarks || 0);

      const sem3Total =
        Math.floor(sem3Result.semesterExamMarks || 0) +
        Math.floor(sem3Result.vivaMarks || 0) +
        Math.floor(sem3Result.internalMarks || 0);

      const annualTotal = Math.floor(
        (sem1Total + sem2Total + sem3Total) / 3
      );

      const annualPercentage = Math.floor(
        (annualTotal / 100) * 100
      );

      return [
        formatSubjectName(cs.subject?.name || "N/A"),

        Math.floor(sem1Result.semesterExamMarks || 0),
        Math.floor(sem1Result.vivaMarks || 0),
        Math.floor(sem1Result.internalMarks || 0),
        sem1Total,
        getGrade(sem1Total).grade,

        Math.floor(sem2Result.semesterExamMarks || 0),
        Math.floor(sem2Result.vivaMarks || 0),
        Math.floor(sem2Result.internalMarks || 0),
        sem2Total,
        getGrade(sem2Total).grade,

        Math.floor(sem3Result.semesterExamMarks || 0),
        Math.floor(sem3Result.vivaMarks || 0),
        Math.floor(sem3Result.internalMarks || 0),
        sem3Total,
        getGrade(sem3Total).grade,

        annualPercentage,
        getGrade(annualPercentage).grade,

        sem1Result.remarks ||
          sem2Result.remarks ||
          sem3Result.remarks ||
          "",
      ];
    });

    // ============================================================
    // 8. SEMESTER SUMMARY — ORIGINAL LOGIC
    // ============================================================

    const calculateSemesterTotals = (semester) => {
      return (
        resultsBySemester
          .find((r) => r.semester === semester)
          ?.results.reduce(
            (acc, r) => ({
              semesterExamMarks:
                acc.semesterExamMarks +
                Math.floor(r.semesterExamMarks || 0),

              vivaMarks:
                acc.vivaMarks +
                Math.floor(r.vivaMarks || 0),

              internalMarks:
                acc.internalMarks +
                Math.floor(r.internalMarks || 0),

              totalMarks:
                acc.totalMarks +
                Math.floor(
                  (r.semesterExamMarks || 0) +
                  (r.vivaMarks || 0) +
                  (r.internalMarks || 0)
                ),
            }),
            {
              semesterExamMarks: 0,
              vivaMarks: 0,
              internalMarks: 0,
              totalMarks: 0,
            }
          ) || {
            semesterExamMarks: 0,
            vivaMarks: 0,
            internalMarks: 0,
            totalMarks: 0,
          }
      );
    };

    const sem1Totals =
      calculateSemesterTotals("SEMESTER_I");

    const sem2Totals =
      calculateSemesterTotals("SEMESTER_II");

    const sem3Totals =
      calculateSemesterTotals("SEMESTER_III");

    const totalFullMarks = classSubjects.length * 100;

    const annualTotal = Math.floor(
      (
        sem1Totals.totalMarks +
        sem2Totals.totalMarks +
        sem3Totals.totalMarks
      ) / 3
    );

    const annualPercentage = totalFullMarks
      ? Math.floor(
          (annualTotal / totalFullMarks) * 100
        )
      : 0;

    tableData.push([
      "Total",

      sem1Totals.semesterExamMarks,
      sem1Totals.vivaMarks,
      sem1Totals.internalMarks,
      sem1Totals.totalMarks,
      getGrade(
        totalFullMarks
          ? (sem1Totals.totalMarks / totalFullMarks) * 100
          : 0
      ).grade,

      sem2Totals.semesterExamMarks,
      sem2Totals.vivaMarks,
      sem2Totals.internalMarks,
      sem2Totals.totalMarks,
      getGrade(
        totalFullMarks
          ? (sem2Totals.totalMarks / totalFullMarks) * 100
          : 0
      ).grade,

      sem3Totals.semesterExamMarks,
      sem3Totals.vivaMarks,
      sem3Totals.internalMarks,
      sem3Totals.totalMarks,
      getGrade(
        totalFullMarks
          ? (sem3Totals.totalMarks / totalFullMarks) * 100
          : 0
      ).grade,

      annualPercentage,
      getGrade(annualPercentage).grade,
    ]);

    // CGPA row
    tableData.push([
      "CGPA",
      "", "", "", "", sem1CGPA,
      "", "", "", "", sem2CGPA,
      "", "", "", "", sem3CGPA,
      overallCGPA, "",
      "",
    ]);

    // ============================================================
    // 9. MAIN ACADEMIC MARKS TABLE
    // ============================================================

    doc.autoTable({
      head: [
        [
          { content: "Subject", rowSpan: 2 },
          {
            content: "1st Terminal",
            colSpan: 5,
            styles: {
              halign: "center",
              fillColor: "#4CAF50",
            },
          },
          {
            content: "2nd Terminal",
            colSpan: 5,
            styles: {
              halign: "center",
              fillColor: "#4CAF50",
            },
          },
          {
            content: "3rd Terminal",
            colSpan: 5,
            styles: {
              halign: "center",
              fillColor: "#4CAF50",
            },
          },
          {
            content: "Annual",
            colSpan: 2,
            styles: { halign: "center" },
          },
        ],
        [
          "TEM", "VM", "IAM", "TM", "ISG",
          "TEM", "VM", "IAM", "TM", "ISG",
          "TEM", "VM", "IAM", "TM", "ISG",
          "%", "Grade",
        ],
      ],

      body: tableData,

      // Changed from 70 to 93 to clear the photo.
      startY: 93,

      theme: "grid",

      styles: {
        fontSize: 8,
        cellPadding: 1,
        halign: "center",
      },

      headStyles: {
        fillColor: "#4CAF50",
        textColor: "#fff",
      },

      margin: { left: 10, right: 10 },

      columnStyles: {
        0: { cellWidth: 24, halign: "left" },

        1: { cellWidth: 9.7, fillColor: [240, 248, 255] },
        2: { cellWidth: 9.7, fillColor: [240, 248, 255] },
        3: { cellWidth: 9.7, fillColor: [240, 248, 255] },
        4: { cellWidth: 9.7, fillColor: [240, 248, 255] },
        5: { cellWidth: 9.7, fillColor: [240, 248, 255] },

        6: { cellWidth: 9.7, fillColor: [245, 245, 220] },
        7: { cellWidth: 9.7, fillColor: [245, 245, 220] },
        8: { cellWidth: 9.7, fillColor: [245, 245, 220] },
        9: { cellWidth: 9.7, fillColor: [245, 245, 220] },
        10: { cellWidth: 9.7, fillColor: [245, 245, 220] },

        11: { cellWidth: 9.7, fillColor: [255, 228, 225] },
        12: { cellWidth: 9.7, fillColor: [255, 228, 225] },
        13: { cellWidth: 9.7, fillColor: [255, 228, 225] },
        14: { cellWidth: 9.7, fillColor: [255, 228, 225] },
        15: { cellWidth: 9.7, fillColor: [255, 228, 225] },

        16: { cellWidth: 9.7 },
        17: { cellWidth: 10 },
      },
    });

    // ============================================================
    // 10. ABBREVIATION TABLE — ORIGINAL
    // ============================================================

    const sharedStartY = pageHeight - 130;

    doc.autoTable({
      head: [["Abbreviation", "Description"]],

      body: [
        ["TEM", "Terminal Exam Marks (Maximum: 70)"],
        ["IAM", "Internal Assignment Marks (Maximum: 24)"],
        ["VM", "Viva Marks (Maximum: 6)"],
        ["TM", "Total Marks (SM + IAM + VM = 100)"],
        ["ISG", "Individual Subject Grade"],
        ["AIC", "Academics In Charge"],
        ["HOD", "Head of Department"],
        ["CGPA", "Cumulative Grade Point Average"],
      ],

      theme: "grid",
      styles: { fontSize: 9, cellPadding: 1 },
      headStyles: {
        fillColor: "#4CAF50",
        textColor: "#fff",
      },
      margin: { left: 10 },
      tableWidth: 87,
      startY: sharedStartY,
    });

    // ============================================================
    // 11. GRADING SCALE TABLE — ORIGINAL
    // ============================================================

    doc.autoTable({
      head: [[
        "Grade Scale (%)",
        "Grade",
        "Performance Indicator",
        "Grade Point",
      ]],

      body: [
        ["90-100", "AA", "Outstanding", "10"],
        ["80-89", "A+", "Excellent", "9"],
        ["60-79", "A", "Very Good", "8"],
        ["45-59", "B+", "Good", "7"],
        ["35-44", "B", "Satisfactory", "6"],
        ["25-34", "C", "Marginal", "5"],
        ["Below 25", "D", "Dissatisfactory", "4"],
      ],

      theme: "grid",

      styles: {
        fontSize: 9,
        cellPadding: 1,
      },

      headStyles: {
        fillColor: "#4CAF50",
        textColor: "#fff",
      },

      margin: { left: 100 },
      tableWidth: 100,
      startY: sharedStartY,

      didParseCell: (data) => {
        if (
          data.section === "body" &&
          data.column.index === 1
        ) {
          const percentage =
            parseFloat(
              data.row.cells[0].text[0].split("-")[0]
            ) || 0;

          const { color } = getGrade(percentage);
          data.cell.styles.fillColor = color;
        }
      },
    });

    // ============================================================
    // 12. SIGNATURE TABLE — ORIGINAL
    // ============================================================

    doc.autoTable({
      head: [[
        "Designations",
        "Class Teacher",
        "AIC",
        "HOD",
        "eSeal",
      ]],

      body: [["Authorized by", "", "", "", ""]],

      theme: "grid",

      styles: {
        fontSize: 9,
        cellPadding: 2,
      },

      bodyStyles: {
        minCellHeight: 16,
      },

      startY: doc.lastAutoTable.finalY + 10,
      margin: { left: 10 },
      tableWidth: 190,
    });

    // ============================================================
    // 13. SCHOOL FOOTER — ORIGINAL
    // ============================================================

    doc.autoTable({
      head: [[
        "Check results online at www.sspointschool.in or use our students' app, Sure Success - Learn & Grow.",
      ]],

      theme: "grid",

      styles: {
        fontSize: 10,
        cellPadding: 2,
        halign: "center",
      },

      startY: doc.lastAutoTable.finalY,
      margin: { left: 10, right: 10 },
      tableWidth: 190,
      showHead: "everyPage",
    });

    // ============================================================
    // 14. ACADEMIC EXCELLENCE NOTE — ORIGINAL
    // ============================================================

    doc.autoTable({
      head: [[
        "N.B: Academic Excellence Award is granted to Knights students securing AA Grade in current Academic Year.",
      ]],

      body: [[
        "It is recognized under the Knights Career Development Program of Sure Success Point School — an advanced, software-integrated, joint-orient, future-ready educational framework designed to empower students through holistic development, disciplined academic growth, and structured career preparation.",
      ]],

      theme: "grid",

      styles: {
        fillColor: "#cfd8dc",
        fontSize: 9,
        cellPadding: 2,
        textColor: 0,
        lineColor: [255, 0, 0],
        lineWidth: 0.7,
        fontStyle: "bold",
      },

      headStyles: {
        fillColor: "#757575",
        fontStyle: "bold",
        lineColor: [255, 0, 0],
        lineWidth: 0.7,
        textColor: "#ffc107",
      },

      startY: doc.lastAutoTable.finalY + 2,
      margin: { left: 10, right: 10 },
      tableWidth: 190,
    });

    // ============================================================
    // 15. SAVE RESULT CARD — ORIGINAL
    // ============================================================

    const safeFileName =
      `${student.firstName}_${student.lastName}`
        .replace(/[^a-zA-Z0-9-_]/g, "_");

    doc.save(`Result_${safeFileName}_Annual.pdf`);

    console.log(
      "DEBUG: PDF generated successfully for",
      safeFileName
    );

    console.log("DEBUG: tableData", tableData);

    console.log("DEBUG: CGPA", {
      sem1CGPA,
      sem2CGPA,
      sem3CGPA,
      overallCGPA,
    });

    toast.success("Result card generated successfully.");

  } catch (err) {
    console.error(
      "DEBUG: Generate PDF Error:",
      err.message,
      err.stack
    );

    toast.error(
      `Failed to generate result card: ${err.message}`
    );

  } finally {
    setPdfLoading(false);
  }
};


  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    fetchStudents(1, query);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", "1");
    router.push(`?${newSearchParams.toString()}`);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", value.toString());
    router.push(`?${newSearchParams.toString()}`);
    fetchStudents(value, searchQuery);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: "#181818" }}>
        <CircularProgress size={120} sx={{ color: "#00c757" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="#fff" sx={{ textAlign: "center", mt: 4, bgcolor: "#181818" }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        minWidth: `calc(100vw - ${drawerWidth}px)`,
        backgroundColor: "#181818",
        height: `calc(100vh - ${appBarHeight}px)`,
        color: "#fff",
      }}
    >
      <ToastContainer
        position="bottom-center"
        autoClose={10000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <ListItemButton
        sx={{
          backgroundColor: "#b71c1c",
          color: "#fff",
          "&:hover": { backgroundColor: "#b71c1c" },
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "8px 16px",
          borderRadius: 1,
        }}
      >
        <ListItemIcon sx={{ color: "#fff" }}>
          <EmojiPeople />
        </ListItemIcon>
        <ListItemText primary={`${className} Semester Result Cards`} />
        <TextField
          variant="outlined"
          placeholder="Search Students..."
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: "#fff", mr: 1 }} />,
            style: { color: "#fff", backgroundColor: "#333", borderRadius: 4 },
          }}
          sx={{
            width: "300px",
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#fff" },
              "&:hover fieldset": { borderColor: "#fff" },
              "&.Mui-focused fieldset": { borderColor: "#00c757" },
            },
          }}
        />
      </ListItemButton>

      <Box sx={{ bgcolor: "#181818", borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            p: 1,
            bgcolor: "#333",
            borderRadius: 1,
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Typography variant="body2" sx={{ flex: 0.5, fontWeight: "bold", color: "#fff" }}>
            ID
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Name
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: "bold", color: "#fff" }}>
            Admission No.
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: "bold", color: "#fff" }}>
            Roll No.
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: "bold", color: "#fff" }}>
            Category
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: "bold", color: "#fff" }}>
            Actions
          </Typography>
        </Box>
        <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 200}px)`, overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
          <List>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <ListItem
                  key={student.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    p: 1,
                    bgcolor: "#181818",
                    mb: 1,
                    borderRadius: 1,
                    borderBottom: "2px solid #333",
                    "&:hover": { bgcolor: "#222" },
                  }}
                >
                  <Typography variant="body2" sx={{ flex: 0.5, color: "#fff" }}>
                    {student.id}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {`${student.firstName} ${student.lastName}`}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 0.8, color: "#fff" }}>
                    {student.admissionNumber || "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 0.8, color: "#fff" }}>
                    {student.rollNumber || "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 0.8, color: "#fff" }}>
                    {student.studentCategory || "N/A"}
                  </Typography>
                  <Box sx={{ flex: 0.8, display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleGeneratePdf(student.id)}
                      disabled={pdfLoading}
                      sx={{ color: "#00c757", borderColor: "#00c757" }}
                    >
                      {pdfLoading ? "Generating..." : "Download Result"}
                    </Button>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
                No students found for {className}.
              </Typography>
            )}
          </List>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            p: 1,
            bgcolor: "#181818",
            borderRadius: 2,
            mt: 2,
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            sx={{
              "& .MuiPaginationItem-root": {
                color: "#fff",
                "&:hover": { bgcolor: "#333" },
                "&.Mui-selected": {
                  bgcolor: "#00c757",
                  color: "#000",
                  "&:hover": { bgcolor: "#00c757" },
                },
              },
            }}
            renderItem={(item) => (
              <PaginationItem
                components={{ previous: ChevronLeft, next: ChevronRight }}
                {...item}
              />
            )}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ClassSemesterResultCard;