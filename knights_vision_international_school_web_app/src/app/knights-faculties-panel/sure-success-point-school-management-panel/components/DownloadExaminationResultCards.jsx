"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
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
        // This is the controlled same-origin photo route. It is not a raw
        // storage URL and is read later with the current faculty token.
        profileImageUrl: student.profileImageUrl || null,
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


  async function loadImageFromURL(imageURL, token = null) {
    console.log(`DEBUG: Loading image from URL=${imageURL}`);
    const response = await fetch(imageURL, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Image request failed (${response.status}).`);
    const blob = await response.blob();
    if (!blob.type.startsWith("image/")) throw new Error("Image response was not an image.");
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("DEBUG: Image loaded successfully");
        resolve(reader.result);
      };
      reader.onerror = () => reject(new Error("Unable to read image data."));
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
    if (!student) throw new Error("Student not found");

    const resultsBySemester = await fetchResults(studentId);
    const currentYear = new Date().getFullYear();

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const PW = doc.internal.pageSize.getWidth();
    const PH = doc.internal.pageSize.getHeight();

    // ============================================================
    // 1. COLOR SYSTEM
    // ============================================================

    const C = {
      deep: [3, 65, 46],
      emerald: [0, 111, 74],
      gold: [218, 164, 43],
      goldLight: [255, 244, 204],
      navy: [15, 36, 76],
      ink: [26, 43, 63],
      muted: [99, 113, 127],
      white: [255, 255, 255],
      blue: [230, 244, 255],
      cream: [255, 248, 222],
      pink: [255, 237, 241],
      border: [214, 226, 218],
    };

    const fill = (c) => doc.setFillColor(...c);
    const stroke = (c) => doc.setDrawColor(...c);
    const color = (c) => doc.setTextColor(...c);

    const write = (
      value, x, y, size = 8,
      c = C.ink, weight = "normal", options = {}
    ) => {
      doc.setFont("helvetica", weight);
      doc.setFontSize(size);
      color(c);
      doc.text(String(value ?? ""), x, y, options);
    };

    const fitText = (
      value, x, y, maxWidth, size = 9,
      c = C.ink, weight = "bold", options = {}
    ) => {
      const str = String(value ?? "");
      doc.setFont("helvetica", weight);
      doc.setFontSize(size);

      while (
        doc.getTextWidth(str) > maxWidth &&
        size > 4.5
      ) {
        size -= 0.2;
        doc.setFontSize(size);
      }

      color(c);
      doc.text(str, x, y, options);
    };

    const panel = (
      x, y, w, h,
      bg = C.white, border = C.border, r = 1.5
    ) => {
      fill(bg);
      stroke(border);
      doc.setLineWidth(0.2);
      doc.roundedRect(x, y, w, h, r, r, "FD");
    };

    const bar = (x, y, w, title, h = 5.5) => {
      fill(C.emerald);
      doc.roundedRect(x, y, w, h, 1, 1, "F");
      write(title, x + 2, y + h - 1.7, 7.1, C.white, "bold");
    };

    // ============================================================
    // 2. BACKGROUND
    // ============================================================

    fill(C.white);
    doc.rect(0, 0, PW, PH, "F");

    addDiagonalWatermark(doc, "Sure Success Point School");

    // ============================================================
    // 3. COMPACT SCHOOL HEADER
    // ============================================================

    fill(C.deep);
    doc.rect(0, 0, PW, 22, "F");

    fill(C.gold);
    doc.rect(0, 21.3, PW, 0.7, "F");

    fill(C.gold);
    doc.circle(14.5, 11, 8, "F");

    fill(C.navy);
    doc.circle(14.5, 11, 7, "F");

    write(
      "SSPS", 14.5, 12.5, 7,
      C.white, "bold", { align: "center" }
    );

    try {
      const logoData = await loadImageFromURL("/knights.png");

      if (logoData) {
        doc.addImage(
          logoData, undefined,
          7.5, 4, 14, 14
        );
      }
    } catch (e) {
      console.warn("Logo unavailable:", e);
    }

    fitText(
      "SURE SUCCESS POINT SCHOOL",
      112, 10.8, 172, 23,
      C.white, "bold",
      { align: "center" }
    );

    fitText(
      "Institution of Humanism, Hardwork, Discipline, Technology & Excellence",
      112, 17, 166, 8,
      [238, 248, 242], "normal",
      { align: "center" }
    );

    // ============================================================
    // 4. REGISTRATION INFORMATION
    // ============================================================

    panel(7, 23.5, 196, 10, C.white, C.gold, 1);

    write("Regd. No.: S/1L 60976", 10, 27.1, 6.5);
    write("Institution ID: KNIGHTS0000001", 10, 30.8, 6.5);

    write("UDISE: 19060419603", 110, 27.1, 6.5);
    write("Branch: Najirpur", 110, 30.8, 6.5);

    fitText(
      "Najirpur, Alinagar, Kaliachak, Malda",
      201, 27.1, 52, 6.3,
      C.ink, "normal", { align: "right" }
    );

    fitText(
      "www.suresuccesspoint.com",
      201, 30.8, 52, 6.3,
      C.ink, "normal", { align: "right" }
    );

    // ============================================================
    // 5. REPORT HEADING
    // ============================================================

    fill(C.gold);
    doc.roundedRect(7, 35, 196, 8, 1.5, 1.5, "F");

    fill(C.deep);
    doc.roundedRect(7.7, 35.6, 194.6, 6.8, 1, 1, "F");

    fitText(
      "ANNUAL PROGRESS REPORT CARD",
      96, 40.3, 145, 13,
      C.white, "bold", { align: "center" }
    );

    write(
      `SESSION: ${currentYear}`,
      198, 40.1, 7,
      C.goldLight, "bold",
      { align: "right" }
    );

    // ============================================================
    // 6. STUDENT INFORMATION — SAME DESIGN
    // ============================================================

    panel(7, 44.5, 196, 28, C.white, C.gold, 1.5);

    const fullName = [
      student.firstName,
      student.lastName,
    ].filter(Boolean).join(" ");

    const admissionNo =
      student.admissionNumber || "N/A";

    const field = (label, value, x, y, w) => {
      write(label, x, y, 7, C.muted);

      fitText(
        value ?? "N/A",
        x + 26, y, w - 27, 8,
        C.ink, "bold"
      );

      stroke(C.border);
      doc.setLineWidth(0.15);
      doc.line(x, y + 1.4, x + w, y + 1.4);
    };

    field("Student Name", fullName, 11, 50, 87);

    field(
      "Guardian",
      student.guardianName || "N/A",
      11, 56, 87
    );

    field(
      "Class / Section",
      `${extractClassLabel(className)} / ${
        student.class?.section || "A"
      }`,
      11, 62, 87
    );

    field(
      "Admission No.",
      admissionNo,
      102, 50, 70
    );

    field(
      "Roll Number",
      student.rollNumber || "N/A",
      102, 56, 70
    );

    field(
      "Branch",
      student.class?.branchName || "Najirpur",
      102, 62, 70
    );

    field(
      "Student UID",
      admissionNo,
      11, 68, 161
    );

    // ============================================================
    // 7. STUDENT PHOTO
    // ============================================================

    const photoX = 178;
    const photoY = 47;
    const photoW = 20;
    const photoH = 22;

    panel(
      photoX - 0.5,
      photoY - 0.5,
      photoW + 1,
      photoH + 1,
      C.white,
      C.gold,
      0.8
    );

    const studentPhoto =
      student.photoUrl ||
      student.profileImageUrl ||
      student.imageUrl ||
      student.photo ||
      null;

    if (studentPhoto) {
      try {
        const photoData = await loadImageFromURL(
          studentPhoto,
          Cookies.get("faculties_token")
        );

        doc.addImage(
          photoData, undefined,
          photoX, photoY, photoW, photoH
        );
      } catch (e) {
        write(
          "PHOTO",
          photoX + photoW / 2,
          photoY + photoH / 2,
          6.5, C.muted, "normal",
          { align: "center" }
        );
      }
    } else {
      write(
        "PHOTO",
        photoX + photoW / 2,
        photoY + photoH / 2,
        6.5, C.muted, "normal",
        { align: "center" }
      );
    }

    // ============================================================
    // 8. CGPA — EXISTING CALCULATION
    // ============================================================

    const {
      sem1CGPA,
      sem2CGPA,
      sem3CGPA,
      overallCGPA,
    } = calculateCGPA(resultsBySemester, classSubjects);

    // ============================================================
    // 9. SEMESTER RESULTS
    // ============================================================

    const semesters = [
      "SEMESTER_I",
      "SEMESTER_II",
      "SEMESTER_III",
    ];

    const getSubjectResult = (semester, subjectId) =>
      resultsBySemester
        .find((r) => r.semester === semester)
        ?.results.find(
          (r) => r.classSubjectId === subjectId
        ) || {};

    const getMarks = (result) => {
      const TEM = Math.floor(result.semesterExamMarks || 0);
      const VM = Math.floor(result.vivaMarks || 0);
      const IAM = Math.floor(result.internalMarks || 0);

      return {
        TEM,
        VM,
        IAM,
        TM: TEM + VM + IAM,
      };
    };

    const tableData = classSubjects.map((cs) => {
      const r1 = getSubjectResult(semesters[0], cs.id);
      const r2 = getSubjectResult(semesters[1], cs.id);
      const r3 = getSubjectResult(semesters[2], cs.id);

      const m1 = getMarks(r1);
      const m2 = getMarks(r2);
      const m3 = getMarks(r3);

      const annualTotal = Math.floor(
        (m1.TM + m2.TM + m3.TM) / 3
      );

      const annualPercentage = Math.floor(
        (annualTotal / 100) * 100
      );

      return [
        formatSubjectName(cs.subject?.name || "N/A"),

        m1.TEM, m1.VM, m1.IAM, m1.TM,
        getGrade(m1.TM).grade,

        m2.TEM, m2.VM, m2.IAM, m2.TM,
        getGrade(m2.TM).grade,

        m3.TEM, m3.VM, m3.IAM, m3.TM,
        getGrade(m3.TM).grade,

        annualPercentage,
        getGrade(annualPercentage).grade,

        r1.remarks || r2.remarks || r3.remarks || "",
      ];
    });

    // ============================================================
    // 10. SEMESTER TOTALS
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

    const s1 = calculateSemesterTotals(semesters[0]);
    const s2 = calculateSemesterTotals(semesters[1]);
    const s3 = calculateSemesterTotals(semesters[2]);

    const totalFullMarks = classSubjects.length * 100;

    const annualTotal = Math.floor(
      (s1.totalMarks + s2.totalMarks + s3.totalMarks) / 3
    );

    const annualPercentage = totalFullMarks
      ? Math.floor((annualTotal / totalFullMarks) * 100)
      : 0;

    const semesterGrade = (total) =>
      getGrade(
        totalFullMarks
          ? (total / totalFullMarks) * 100
          : 0
      ).grade;

    tableData.push([
      "Total",

      s1.semesterExamMarks,
      s1.vivaMarks,
      s1.internalMarks,
      s1.totalMarks,
      semesterGrade(s1.totalMarks),

      s2.semesterExamMarks,
      s2.vivaMarks,
      s2.internalMarks,
      s2.totalMarks,
      semesterGrade(s2.totalMarks),

      s3.semesterExamMarks,
      s3.vivaMarks,
      s3.internalMarks,
      s3.totalMarks,
      semesterGrade(s3.totalMarks),

      annualPercentage,
      getGrade(annualPercentage).grade,
    ]);

    tableData.push([
      "CGPA",
      "", "", "", "", sem1CGPA,
      "", "", "", "", sem2CGPA,
      "", "", "", "", sem3CGPA,
      overallCGPA, "", "",
    ]);

    // ============================================================
    // 11. SUBJECT MARKS TABLE
    // ============================================================

    const marksRows = tableData.map((row) =>
      row.slice(0, 18)
    );

    const rowCount = marksRows.length;

    // Compact row height to preserve A4 space.
    const tableFontSize =
      rowCount > 16 ? 5.2 :
      rowCount > 12 ? 5.7 : 6.3;

    const tablePadding =
      rowCount > 16 ? 0.35 :
      rowCount > 12 ? 0.45 : 0.6;

    const colStyles = {
      0: {
        cellWidth: 29,
        halign: "left",
        fontStyle: "bold",
      },
    };

    for (let i = 1; i <= 5; i++) {
      colStyles[i] = {
        cellWidth: 9.2,
        fillColor: C.blue,
      };
    }

    for (let i = 6; i <= 10; i++) {
      colStyles[i] = {
        cellWidth: 9.2,
        fillColor: C.cream,
      };
    }

    for (let i = 11; i <= 15; i++) {
      colStyles[i] = {
        cellWidth: 9.2,
        fillColor: C.pink,
      };
    }

    colStyles[16] = {
      cellWidth: 11.5,
      fillColor: C.goldLight,
      fontStyle: "bold",
    };

    colStyles[17] = {
      cellWidth: 11.5,
      fillColor: [231, 249, 235],
      fontStyle: "bold",
    };

    doc.autoTable({
      startY: 75,

      margin: {
        left: 9,
        right: 9,
        bottom: 5,
      },

      theme: "grid",

      head: [
        [
          {
            content: "Subject",
            rowSpan: 2,
            styles: {
              fillColor: C.deep,
              halign: "left",
              valign: "middle",
            },
          },
          {
            content: "1st Terminal",
            colSpan: 5,
            styles: { fillColor: C.deep },
          },
          {
            content: "2nd Terminal",
            colSpan: 5,
            styles: { fillColor: C.deep },
          },
          {
            content: "3rd Terminal",
            colSpan: 5,
            styles: { fillColor: C.deep },
          },
          {
            content: "Annual",
            colSpan: 2,
            styles: { fillColor: C.deep },
          },
        ],
        [
          "TEM", "VM", "IAM", "TM", "ISG",
          "TEM", "VM", "IAM", "TM", "ISG",
          "TEM", "VM", "IAM", "TM", "ISG",
          "%", "Grade",
        ],
      ],

      body: marksRows,

      headStyles: {
        fillColor: C.deep,
        textColor: C.white,
        fontSize: 5.8,
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
        cellPadding: 0.5,
        minCellHeight: 4.2,
      },

      styles: {
        font: "helvetica",
        fontSize: tableFontSize,
        textColor: C.ink,
        cellPadding: tablePadding,
        minCellHeight: 4.3,
        halign: "center",
        valign: "middle",
        lineColor: C.border,
        lineWidth: 0.12,
        overflow: "linebreak",
      },

      columnStyles: colStyles,

      didParseCell: (data) => {
        if (data.section !== "body") return;

        const row = data.row.index;
        const col = data.column.index;

        if (row >= marksRows.length - 2) {
          data.cell.styles.fontStyle = "bold";

          if (row === marksRows.length - 1) {
            data.cell.styles.fillColor = C.goldLight;
          }

          return;
        }

        if ([5, 10, 15, 17].includes(col)) {
          const grade = String(data.cell.raw ?? "");

          const gradeColors = {
            AA: [164, 236, 174],
            "A+": [178, 241, 183],
            A: [216, 245, 218],
            "B+": [255, 249, 179],
            B: [255, 232, 180],
            C: [255, 210, 169],
            D: [255, 190, 195],
          };

          if (gradeColors[grade]) {
            data.cell.styles.fillColor =
              gradeColors[grade];
          }

          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    if (doc.internal.getNumberOfPages() > 1) {
      throw new Error(
        "Subject marks table exceeds one A4 page."
      );
    }

    const marksEndY = doc.lastAutoTable.finalY;

    // ============================================================
    // 12. COMPACT LOWER SECTION
    // ============================================================

    // The previous version reserved too much height.
    // This version places the lower content using
    // actual table heights and a controlled minimum gap.

    const BOTTOM_MARGIN = 5;

    const legendBody = [
      ["TEM", "Terminal Exam Marks (Maximum: 70)"],
      ["IAM", "Internal Assignment Marks (Maximum: 24)"],
      ["VM", "Viva Marks (Maximum: 6)"],
      ["TM", "Total Marks (TEM + IAM + VM = 100)"],
      ["ISG", "Individual Subject Grade"],
      ["AIC", "Academics In Charge"],
      ["HOD", "Head of Department"],
      ["CGPA", "Cumulative Grade Point Average"],
    ];

    const gradeBody = [
      ["90-100", "AA", "Outstanding", "10"],
      ["80-89", "A+", "Excellent", "9"],
      ["60-79", "A", "Very Good", "8"],
      ["45-59", "B+", "Good", "7"],
      ["35-44", "B", "Satisfactory", "6"],
      ["25-34", "C", "Marginal", "5"],
      ["Below 25", "D", "Dissatisfactory", "4"],
    ];

    // Reserve approximately 58 mm for the
    // sections after the two grading tables.
    // Leave at least 5 mm after the marks table.
    const legendY = Math.max(
      marksEndY + 5,
      PH - BOTTOM_MARGIN - 58 - 43
    );

    const legendStyles = {
      fontSize: 6.2,
      cellPadding: 0.55,
      textColor: C.ink,
      lineColor: C.border,
      lineWidth: 0.1,
      minCellHeight: 4,
    };

    const legendHead = {
      fillColor: C.emerald,
      textColor: C.white,
      fontStyle: "bold",
      fontSize: 6.8,
      cellPadding: 0.6,
    };

    doc.autoTable({
      startY: legendY,
      margin: {
        left: 9,
        right: 112,
        bottom: 5,
      },
      tableWidth: 88,
      theme: "grid",
      head: [["Abbreviation", "Description"]],
      body: legendBody,
      headStyles: legendHead,
      styles: legendStyles,
      columnStyles: {
        0: { cellWidth: 20, fontStyle: "bold" },
        1: { cellWidth: 68 },
      },
    });

    const leftLegendEnd = doc.lastAutoTable.finalY;

    doc.autoTable({
      startY: legendY,
      margin: {
        left: 100,
        right: 9,
        bottom: 5,
      },
      tableWidth: 101,
      theme: "grid",
      head: [[
        "Grade Scale (%)",
        "Grade",
        "Performance Indicator",
        "Grade Point",
      ]],
      body: gradeBody,
      headStyles: legendHead,
      styles: legendStyles,
      columnStyles: {
        0: { cellWidth: 26 },
        1: { cellWidth: 13 },
        2: { cellWidth: 46 },
        3: { cellWidth: 16 },
      },

      didParseCell: (data) => {
        if (
          data.section !== "body" ||
          data.column.index !== 1
        ) return;

        const gradeColors = {
          AA: [125, 229, 130],
          "A+": [164, 236, 168],
          A: [219, 248, 191],
          "B+": [253, 248, 160],
          B: [255, 225, 156],
          C: [255, 198, 130],
          D: [255, 154, 165],
        };

        const grade = String(data.cell.raw || "");

        if (gradeColors[grade]) {
          data.cell.styles.fillColor = gradeColors[grade];
        }

        data.cell.styles.fontStyle = "bold";
      },
    });

    const legendEnd = Math.max(
      leftLegendEnd,
      doc.lastAutoTable.finalY
    );

    if (doc.internal.getNumberOfPages() > 1) {
      throw new Error(
        "Grading tables exceed one A4 page."
      );
    }

    // ============================================================
    // 13. REMARKS & ANNUAL RESULT
    // ============================================================

    const remarksY = legendEnd + 2.5;
    const remarksH = 13;

    const remarks =
      tableData
        .slice(0, classSubjects.length)
        .map((row) => row[18])
        .find((value) => String(value || "").trim()) || "";

    panel(9, remarksY, 127, remarksH, C.white);
    bar(9, remarksY, 127, "Class Teacher's Remarks", 4.5);

    if (remarks) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.6);
      color(C.ink);

      doc.text(
        doc.splitTextToSize(
          String(remarks), 121
        ).slice(0, 2),
        12,
        remarksY + 7.5
      );
    } else {
      write("-", 12, remarksY + 9, 8, C.muted);
    }

    panel(
      139, remarksY, 62, remarksH,
      [248, 253, 249]
    );

    bar(
      139, remarksY, 62,
      "Annual Academic Result", 4.5
    );

    write(
      `${annualPercentage}%`,
      158, remarksY + 10.5, 11,
      C.deep, "bold", { align: "center" }
    );

    write(
      `Grade: ${getGrade(annualPercentage).grade}`,
      185, remarksY + 10.5, 7.5,
      C.navy, "bold", { align: "center" }
    );

    // ============================================================
    // 14. SIGNATURES
    // ============================================================

    const signY = remarksY + remarksH + 2;
    const signH = 13;

    panel(9, signY, 192, signH, C.white);

    fill(C.deep);
    doc.roundedRect(
      9, signY, 192, 4.5, 1, 1, "F"
    );

    const designations = [
      "Class Teacher",
      "AIC",
      "HOD",
      "eSeal",
    ];

    designations.forEach((title, i) => {
      const cx = 9 + 48 * i + 24;

      write(
        title, cx, signY + 3.2,
        7.5, C.white, "bold",
        { align: "center" }
      );

      write(
        "(Sign & Date)",
        cx, signY + 11.2,
        6.5, C.muted, "normal",
        { align: "center" }
      );

      if (i > 0) {
        stroke(C.border);
        doc.line(
          9 + 48 * i,
          signY + 4.5,
          9 + 48 * i,
          signY + signH
        );
      }
    });

    // ============================================================
    // 15. SCHOOL VALUES
    // ============================================================

    const valuesY = signY + signH + 1.5;

    panel(
      9, valuesY, 192, 6.5,
      [245, 250, 247]
    );

    [
      "DISCIPLINE",
      "KNOWLEDGE",
      "HARD WORK",
      "GOOD VALUES",
    ].forEach((value, i) => {
      write(
        value,
        9 + 48 * i + 24,
        valuesY + 4.4,
        7.4, C.deep, "bold",
        { align: "center" }
      );
    });

    // ============================================================
    // 16. ONLINE VERIFICATION
    // ============================================================

    const webY = valuesY + 7.5;

    fill(C.emerald);
    doc.roundedRect(
      9, webY, 192, 5.5, 1, 1, "F"
    );

    fitText(
      "Check results online at www.sspointschool.in or use our students' app, Sure Success - Learn & Grow.",
      105, webY + 3.8, 187, 7.4,
      C.white, "bold", { align: "center" }
    );

    // ============================================================
    // 17. ACADEMIC EXCELLENCE NOTE
    // ============================================================

    const noteY = webY + 6.5;

    fill(C.goldLight);
    doc.roundedRect(
      9, noteY, 192, 4.8, 1, 1, "F"
    );

    fitText(
      "N.B: Academic Excellence Award is granted to Knights students securing AA Grade in current Academic Year.",
      105, noteY + 3.3, 186, 7,
      C.navy, "bold", { align: "center" }
    );

    // ============================================================
    // 18. KNIGHTS CAREER DEVELOPMENT PROGRAM
    // ============================================================

    const programY = noteY + 5.5;

    const programText =
      "It is recognized under the Knights Career Development Program of Sure Success Point School — an advanced, software-integrated, joint-orient, future-ready educational framework designed to empower students through holistic development, disciplined academic growth, and structured career preparation.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.4);

    const programLines = doc.splitTextToSize(
      programText, 186
    );

    const programH = Math.max(
      8,
      programLines.length * 2.3 + 1.5
    );

    panel(
      9, programY, 192, programH,
      C.white, C.border, 1
    );

    color(C.ink);
    doc.text(
      programLines,
      12,
      programY + 3
    );

    // ============================================================
    // 19. ONE-PAGE VALIDATION
    // ============================================================

    const finalY = programY + programH;

    if (
      doc.internal.getNumberOfPages() !== 1 ||
      finalY > PH - BOTTOM_MARGIN
    ) {
      throw new Error(
        `Report exceeds A4 by ${Math.max(
          0,
          finalY - (PH - BOTTOM_MARGIN)
        ).toFixed(1)} mm.`
      );
    }

    // ============================================================
    // 20. SAVE
    // ============================================================

    const safeFileName =
      `${student.firstName}_${student.lastName}`
        .replace(/[^a-zA-Z0-9-_]/g, "_");

    doc.save(`Result_${safeFileName}_Annual.pdf`);

    toast.success(
      "Result card generated successfully."
    );

  } catch (err) {
    console.error(
      "Generate PDF Error:",
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
