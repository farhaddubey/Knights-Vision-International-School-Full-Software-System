"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { styled } from "@mui/system";
import jsPDF from "jspdf";
import "jspdf-autotable";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import SchoolSelect from "@/src/app/reuse_components/SchoolSelect";
import SchoolBranchSelect from "@/src/app/reuse_components/SchoolBranchSelect";
import SchoolClassSelect from "@/src/app/reuse_components/SchoolClassSelect";
import Cookies from "js-cookie";
import textDisabledFieldStyles from "@/src/app/mui_styles/TextDisableFieldStyles";

const StyledTableCell = styled(TableCell)({
  color: "white",
  borderColor: "#444",
});

const StyledTableRow = styled(TableRow)({
  backgroundColor: "#000000",
});

const textFieldStyles = {
  "& .MuiInputBase-input": { color: "#fff" },
  "& .MuiInputLabel-root": { color: "#aaa" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#00c853" },
  backgroundColor: "#333",
  borderRadius: "4px",
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

// Function to format subject name
const formatSubjectName = (name) => {
  if (!name || name === "N/A") return "N/A";
  if (name.length <= 14) return name;
  if (name.includes(" ") || name.includes("-")) {
    return `${name.slice(0, 3)}.. ${name.slice(-8)}`;
  }
  return name.slice(0, 14);
};

const CheckResult = () => {
  const [rollNo, setRollNo] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [studentData, setStudentData] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [classSubjects, setClassSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState("");
  const drawerWidth = 280;
  const appBarHeight = 64;

  const handleSearch = async () => {
    if (!selectedSchool || !selectedBranch || !selectedClass || !rollNo) {
      setError("Please fill all fields");
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const token = Cookies.get("student_token");
      const response = await axios.get("/api/semester-results/student", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          schoolId: selectedSchool,
          branchId: selectedBranch,
          classId: selectedClass,
          rollNumber: rollNo,
        },
      });

      const { student, classSubjects, resultsBySemester } = response.data;
      setStudentData(student);
      setClassSubjects(classSubjects);
      setResultData(resultsBySemester);
    } catch (err) {
      console.error("Fetch Results Error:", err.response?.data || err.message);
      setError("Failed to fetch results. Please check your inputs.");
      toast.error("Failed to fetch results.");
    } finally {
      setLoading(false);
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
const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      toast.info("Generating Result Card");
      console.log(`DEBUG: Generating PDF for studentId=${studentData.id}`);
      if (!studentData) {
        throw new Error("Student not found");
      }

      const currentYear = new Date().getFullYear();
      const doc = new jsPDF({ format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const imgSize = 28;
      const imgX = 20;
      const imgY = 21;
      const logoX = pageWidth - imgSize - 10;

      // Header Section: Logo, School Name, and Address
      doc.setFont("helvetica", "bold");
      doc.setFontSize(49);
      doc.setTextColor("#4CAF50");
      doc.setFont("times", "bold");
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(1.2);
      doc.text("Sure Success Point School", pageWidth / 2, 20, {
        align: "center",
        renderingMode: "stroke",
      });
      doc.setDrawColor("#d50000");
      doc.setLineWidth(1);
      doc.text("Sure Success Point School", pageWidth / 2, 20, {
        align: "center",
        renderingMode: "stroke",
      });
      doc.setTextColor("#4CAF50");
      doc.text("Sure Success Point School", pageWidth / 2, 20, {
        align: "center",
        renderingMode: "fill",
      });

      doc.setFont("helvetica", "bold");
      doc.setTextColor("#00bfa5");
      doc.setFontSize(12.8);
      doc.text("Institution of Humanism, Hardwork, Discipline, Technology & Excellence", 18, 28);
      doc.setFontSize(12);
      doc.setTextColor("#333");
      doc.setFont("helvetica", "normal");
      doc.setDrawColor("#333");
      doc.setLineWidth(.3);
      doc.rect(11, 55, 16, 16);
      const imageURL = studentData.imgUrl || "/knights.png";
      try {
        const base64Image = await loadImageFromURL(imageURL);
        const imgFormat = imageURL.toLowerCase().endsWith(".png") ? "PNG" : "JPEG";
        doc.addImage(base64Image, imgFormat, 11, 55, 15, 15);
      } catch (error) {
        console.warn("DEBUG: Failed to load image:", error.message);
        toast.warn("Couldn't fetch student image, using default logo");
        try {
          doc.addImage("/knights.png", "PNG", 11, 55, 15, 15);
        } catch (defaultImgError) {
          console.warn("DEBUG: Failed to load default logo:", defaultImgError.message);
          toast.warn("Couldn't fetch default logo");
        }
      }

      doc.setFontSize(10);
      doc.text("Photo", 155, 55);
      doc.setFontSize(12);
      doc.text("Regd No.: S/1L 60976", 10, 35);
      doc.text("Institution ID.: KNIGHTS0000001", 10, 41);
      doc.text("Najirpur, Alinagar, Kaliachak, Malda -India", 10, 47);
      doc.text("UDISE: 19060419693", 128, 35);
      doc.text(`Branch.: ${studentData.class.branch.name}`, 128, 41);
      doc.text("www.sspointschool.in", 128, 47);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);

      doc.autoTable({
        head: [[`ANNUAL PROGRESS REPORT CARD - ${currentYear}`]],
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: 1,
          halign: "center",
        },
        startY: 49,
        margin: { left: 10, right: 10 },
        tableWidth: 190,
        showHead: "everyPage",
      });

      try {
        doc.addImage("/knights.png", "PNG", logoX, imgY, imgSize, imgSize);
      } catch (imgError) {
        console.warn("DEBUG: Image loading failed:", imgError.message);
        toast.warn("Failed to load logo image, continuing PDF generation");
      }

      // Student Information
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Student Name: ${studentData.firstName} ${studentData.lastName}`, 29, 59);
      doc.text(`C/O.: ${studentData.guardianName || "N/A"}`, 29, 64);
      doc.text(`UID.: ${studentData.admissionNumber || "N/A"}`, 29, 69);
      doc.text(`${studentData.class.name}${studentData.class.section ? `-${studentData.class.section}` : ""}`, 100, 64);
      doc.text(`Section - ${studentData.class.section || "A"}`, 100, 69);
      doc.text(`Roll No.: ${studentData.rollNumber || "N/A"}`, 130, 59);
      doc.text(`Reg No.: ${studentData.admissionNumber || "N/A"}`, 130, 64);
      doc.text(`Student Code.: ${studentData.admissionNumber || "N/A"}`, 130, 69);
      doc.setTextColor("#000");

      // Calculate CGPA
      const { sem1CGPA, sem2CGPA, sem3CGPA, overallCGPA } = calculateCGPA(resultData, classSubjects);

      // Table Data for All Semesters
      const tableData = classSubjects.map((cs) => {
        const sem1Result = resultData.find((r) => r.semester === "SEMESTER_I")?.results.find((r) => r.classSubjectId === cs.id) || {};
        const sem2Result = resultData.find((r) => r.semester === "SEMESTER_II")?.results.find((r) => r.classSubjectId === cs.id) || {};
        const sem3Result = resultData.find((r) => r.semester === "SEMESTER_III")?.results.find((r) => r.classSubjectId === cs.id) || {};

        const sem1Total = Math.floor(sem1Result.semesterExamMarks || 0) + Math.floor(sem1Result.vivaMarks || 0) + Math.floor(sem1Result.internalMarks || 0);
        const sem2Total = Math.floor(sem2Result.semesterExamMarks || 0) + Math.floor(sem2Result.vivaMarks || 0) + Math.floor(sem2Result.internalMarks || 0);
        const sem3Total = Math.floor(sem3Result.semesterExamMarks || 0) + Math.floor(sem3Result.vivaMarks || 0) + Math.floor(sem3Result.internalMarks || 0);
        const annualTotal = Math.floor((sem1Total + sem2Total + sem3Total) / 3);
        const annualPercentage = Math.floor((annualTotal / 100) * 100);

        return [
          formatSubjectName(cs.subject?.name || "N/A"),
          Math.floor(sem1Result.semesterExamMarks || 0),
          Math.floor(sem1Result.vivaMarks || 0),
          Math.floor(sem1Result.internalMarks || 0),
          sem1Total,
          `${getGrade(sem1Total).grade}`,
          Math.floor(sem2Result.semesterExamMarks || 0),
          Math.floor(sem2Result.vivaMarks || 0),
          Math.floor(sem2Result.internalMarks || 0),
          sem2Total,
          `${getGrade(sem2Total).grade}`,
          Math.floor(sem3Result.semesterExamMarks || 0),
          Math.floor(sem3Result.vivaMarks || 0),
          Math.floor(sem3Result.internalMarks || 0),
          sem3Total,
          `${getGrade(sem3Total).grade}`,
          annualPercentage,
          getGrade(annualPercentage).grade,
          sem1Result.remarks || sem2Result.remarks || sem3Result.remarks || "",
        ];
      });

      // Summary Row
      const sem1Totals = resultData.find((r) => r.semester === "SEMESTER_I")?.results.reduce(
        (acc, r) => ({
          semesterExamMarks: acc.semesterExamMarks + Math.floor(r.semesterExamMarks || 0),
          vivaMarks: acc.vivaMarks + Math.floor(r.vivaMarks || 0),
          internalMarks: acc.internalMarks + Math.floor(r.internalMarks || 0),
          totalMarks: acc.totalMarks + Math.floor((r.semesterExamMarks || 0) + (r.vivaMarks || 0) + (r.internalMarks || 0)),
        }),
        { semesterExamMarks: 0, vivaMarks: 0, internalMarks: 0, totalMarks: 0 }
      ) || { semesterExamMarks: 0, vivaMarks: 0, internalMarks: 0, totalMarks: 0 };

      const sem2Totals = resultData.find((r) => r.semester === "SEMESTER_II")?.results.reduce(
        (acc, r) => ({
          semesterExamMarks: acc.semesterExamMarks + Math.floor(r.semesterExamMarks || 0),
          vivaMarks: acc.vivaMarks + Math.floor(r.vivaMarks || 0),
          internalMarks: acc.internalMarks + Math.floor(r.internalMarks || 0),
          totalMarks: acc.totalMarks + Math.floor((r.semesterExamMarks || 0) + (r.vivaMarks || 0) + (r.internalMarks || 0)),
        }),
        { semesterExamMarks: 0, vivaMarks: 0, internalMarks: 0, totalMarks: 0 }
      ) || { semesterExamMarks: 0, vivaMarks: 0, internalMarks: 0, totalMarks: 0 };

      const sem3Totals = resultData.find((r) => r.semester === "SEMESTER_III")?.results.reduce(
        (acc, r) => ({
          semesterExamMarks: acc.semesterExamMarks + Math.floor(r.semesterExamMarks || 0),
          vivaMarks: acc.vivaMarks + Math.floor(r.vivaMarks || 0),
          internalMarks: acc.internalMarks + Math.floor(r.internalMarks || 0),
          totalMarks: acc.totalMarks + Math.floor((r.semesterExamMarks || 0) + (r.vivaMarks || 0) + (r.internalMarks || 0)),
        }),
        { semesterExamMarks: 0, vivaMarks: 0, internalMarks: 0, totalMarks: 0 }
      ) || { semesterExamMarks: 0, vivaMarks: 0, internalMarks: 0, totalMarks: 0 };

      const totalFullMarks = classSubjects.length * 100;
      const annualTotal = Math.floor((sem1Totals.totalMarks + sem2Totals.totalMarks + sem3Totals.totalMarks) / 3);
      const annualPercentage = totalFullMarks ? Math.floor((annualTotal / totalFullMarks) * 100) : 0;

      tableData.push([
        "Total",
        sem1Totals.semesterExamMarks,
        sem1Totals.vivaMarks,
        sem1Totals.internalMarks,
        sem1Totals.totalMarks,
        `${getGrade(sem1Totals.totalMarks / totalFullMarks * 100).grade}`,
        sem2Totals.semesterExamMarks,
        sem2Totals.vivaMarks,
        sem2Totals.internalMarks,
        sem2Totals.totalMarks,
        `${getGrade(sem2Totals.totalMarks / totalFullMarks * 100).grade}`,
        sem3Totals.semesterExamMarks,
        sem3Totals.vivaMarks,
        sem3Totals.internalMarks,
        sem3Totals.totalMarks,
        `${getGrade(sem3Totals.totalMarks / totalFullMarks * 100).grade}`,
        annualPercentage,
        getGrade(annualPercentage).grade,
        "",
      ]);

      tableData.push([
        "CGPA",
        "", "", "", "", sem1CGPA,
        "", "", "", "", sem2CGPA,
        "", "", "", "", sem3CGPA,
        overallCGPA, "",
        "",
      ]);

      doc.autoTable({
        head: [
          [
            { content: "Subject", rowSpan: 2 },
            { content: "1st Semester", colSpan: 5, styles: { halign: "center", fillColor: "#4CAF50" } },
            { content: "2nd Semester", colSpan: 5, styles: { halign: "center", fillColor: "#4CAF50" } },
            { content: "3rd Semester", colSpan: 5, styles: { halign: "center", fillColor: "#4CAF50" } },
            { content: "Annual", colSpan: 2, styles: { halign: "center" } },
            { content: "Remarks", rowSpan: 2 },
          ],
          [
            "SM", "VM", "IAM", "TM", "ISG",
            "SM", "VM", "IAM", "TM", "ISG",
            "SM", "VM", "IAM", "TM", "ISG",
            "%", "Grade",
          ],
        ],
        body: tableData,
        startY: 70,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 1, halign: "center" },
        headStyles: { fillColor: "#4CAF50", textColor: "#fff" },
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
          18: { cellWidth: 15, halign: "left" },
        },
      });

// Define shared starting Y for both tables
// const sharedStartY = doc.previousAutoTable ? doc.previousAutoTable.finalY + 10 : 20; // from top 
// Fix to bottom of A4 page (near bottom)
const pageHeight = doc.internal.pageSize.getHeight();
const sharedStartY = pageHeight  - 130; // ~40 is table height guess

doc.autoTable({
  head: [["Abbreviation", "Description"]],
  body: [
    ["SM", "Semester Exam Marks (Maximum: 70)"],
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
  headStyles: { fillColor: "#4CAF50", textColor: "#fff" },
  margin: { left: 10 },
  tableWidth: 87,
  startY: sharedStartY,
});

// Grading Scale Table - Right
doc.autoTable({
  head: [["Grade Scale (%)", "Grade", "Performance Indicator", "Grade Point"]],
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
  styles: { fontSize: 9, cellPadding: 1 },
  headStyles: { fillColor: "#4CAF50", textColor: "#fff" },
  margin: { left: 100 },
  tableWidth: 100,
  startY: sharedStartY, // Use same Y position
  didParseCell: (data) => {
    if (data.section === "body" && data.column.index === 1) {
      const percentage = parseFloat(data.row.cells[0].text[0].split("-")[0]) || 0;
      const { color } = getGrade(percentage);
      data.cell.styles.fillColor = color;
    }
  },
});
// Signatures
doc.autoTable({
  head: [["Designations", "Class Teacher", "AIC", "HOD", "eSeal"]],
  body: [["Authorized by", "", "", "", ""]],
  theme: "grid",
  styles: {
    fontSize: 9,
    cellPadding: 2,
  },
  bodyStyles: {
    minCellHeight: 16, // ⬅️ This doubles the typical row height (default is ~12)
  },
  startY: doc.lastAutoTable.finalY + 10,
  margin: { left: 10 },
  tableWidth: 190,
});


      // Footer
      doc.autoTable({
        head: [["To view results online, use the Student App or visit our official site – www.sspointschool.in"]],
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

      doc.autoTable({
        head: [["N.B: The Academic Excellence Award is granted to Knights students securing an AA grade in the current academic year."]],
        body: [
          [
            "It is recognized under the Knights Career Development Program of Sure Success Point School – an advanced, software-integrated, jointly-oriented, career-centric education system aimed at ensuring holistic development and assured career success. All systems are powered by Knights Group’s research-driven Strong Education System.",
          ],
        ],
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

      const safeFileName = `${studentData.firstName}_${studentData.lastName}`.replace(/[^a-zA-Z0-9-_]/g, "_");
      doc.save(`Result_${safeFileName}_Annual.pdf`);
      console.log(`DEBUG: PDF generated successfully for ${safeFileName}`);
      console.log("DEBUG: tableData", tableData);
      console.log("DEBUG: CGPA", { sem1CGPA, sem2CGPA, sem3CGPA, overallCGPA });
      toast.success("Result card generated successfully.");
    } catch (err) {
      console.error("DEBUG: Generate PDF Error:", err.message, err.stack);
      toast.error(`Failed to generate result card: ${err.message}`);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minWidth: `calc(100vw - ${drawerWidth}px)`,
        minHeight: "100vh",
        backgroundColor: "#181818",
        color: "#fff",
        overflowY: "auto",
        padding: 2,
      }}
    >
      <ToastContainer position="bottom-center" autoClose={5000} theme="dark" />
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 2 }}>
        <Box component="img" src="/knights.png" alt="Sure Success Point School" sx={{ width: { xs: 150, md: 300 }, height: "auto" }} />
      </Box>
      <Typography variant="h5" sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 2, color: "#fff" }}>
        Check Student&apos;s Result Here
      </Typography>
          <Box
  sx={{
    maxWidth: "700px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  }}
>
  {/* First Row - Full Width School Select */}
  <Box sx={{ width: "100%" }}>
    <SchoolSelect
      value={selectedSchool}
      selectedSchool={selectedSchool}
      setSelectedSchool={setSelectedSchool}
    />
  </Box>

  {/* Second Row - Other Inputs with equal height */}
  <Box
    sx={{
      display: "flex",
      flexWrap: "wrap",
      gap: 1.5,
      alignItems: "stretch",
    }}
  >
    <Box sx={{ flex: 1, minWidth: "150px" }}>
      <SchoolBranchSelect
        value={selectedBranch}
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
      />
    </Box>
    <Box sx={{ flex: 1, minWidth: "150px" }}>
      <SchoolClassSelect
        value={selectedClass}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
      />
    </Box>
    <Box sx={{ flex: 1, minWidth: "150px" }}>
      <TextField
        label="Roll Number"
        variant="outlined"
        value={rollNo}
        sx={textDisabledFieldStyles}
        onChange={(e) => setRollNo(e.target.value)}
        fullWidth
      />
    </Box>
    <Button
      variant="contained"
      onClick={handleSearch}
      size="small"
      disabled={loading}
      sx={{
        minWidth: "150px",
        bgcolor: "#00c853",
        "&:hover": { bgcolor: "#00a548" },
      }}
    >
      {loading ? <CircularProgress size={24} /> : "Search"}
    </Button>
  </Box>
</Box>


      {error && (
        <Typography color="error" align="center" sx={{ marginTop: 2 }}>
          {error}
        </Typography>
      )}
      {studentData && (
        <Box sx={{ marginTop: 4 }}>
          <Typography variant="h5" align="center" gutterBottom sx={{ color: "#fff" }}>
            Hi, {studentData.firstName} {studentData.lastName}.. Check Your Results Below
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row", width: "100%", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ flex: 1, padding: 1, minWidth: "200px" }}>
              <TableContainer component={Paper} sx={{ backgroundColor: "#000000" }}>
                <Table>
                  <TableBody>
                    <StyledTableRow>
                      <StyledTableCell>Name</StyledTableCell>
                      <StyledTableCell>{studentData.firstName} {studentData.lastName}</StyledTableCell>
                    </StyledTableRow>
                    <StyledTableRow>
                      <StyledTableCell>Roll Number</StyledTableCell>
                      <StyledTableCell>{studentData.rollNumber || "N/A"}</StyledTableCell>
                    </StyledTableRow>
                    <StyledTableRow>
                      <StyledTableCell>Class</StyledTableCell>
                      <StyledTableCell>{studentData.class.name}{studentData.class.section ? `-${studentData.class.section}` : ""}</StyledTableCell>
                    </StyledTableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <Box sx={{ flex: 1, padding: 1, minWidth: "200px" }}>
              <TableContainer component={Paper} sx={{ backgroundColor: "#000000" }}>
                <Table>
                  <TableBody>
                    <StyledTableRow>
                      <StyledTableCell>Guardian Name</StyledTableCell>
                      <StyledTableCell>{studentData.guardianName || "N/A"}</StyledTableCell>
                    </StyledTableRow>
                    <StyledTableRow>
                      <StyledTableCell>Admission Number</StyledTableCell>
                      <StyledTableCell>{studentData.admissionNumber || "N/A"}</StyledTableCell>
                    </StyledTableRow>
                    <StyledTableRow>
                      <StyledTableCell>Branch</StyledTableCell>
                      <StyledTableCell>{studentData.class.branch.name}</StyledTableCell>
                    </StyledTableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
          {resultData && (
            <>
              <Typography variant="h5" align="center" sx={{ marginTop: 4, color: "#fff" }}>
                Results
              </Typography>
              <TableContainer component={Paper} sx={{ backgroundColor: "#333" }}>
                <Table>
                  <TableHead>
                    <StyledTableRow>
                      <StyledTableCell>Subject</StyledTableCell>
                      <StyledTableCell>1st Semester</StyledTableCell>
                      <StyledTableCell>2nd Semester</StyledTableCell>
                      <StyledTableCell>3rd Semester</StyledTableCell>
                      <StyledTableCell>Annual %</StyledTableCell>
                      <StyledTableCell>Grade</StyledTableCell>
                    </StyledTableRow>
                  </TableHead>
                  <TableBody>
                    {classSubjects.map((cs) => {
                      const sem1Result = resultData.find((r) => r.semester === "SEMESTER_I")?.results.find((r) => r.classSubjectId === cs.id) || {};
                      const sem2Result = resultData.find((r) => r.semester === "SEMESTER_II")?.results.find((r) => r.classSubjectId === cs.id) || {};
                      const sem3Result = resultData.find((r) => r.semester === "SEMESTER_III")?.results.find((r) => r.classSubjectId === cs.id) || {};
                      const sem1Total = Math.floor(sem1Result.semesterExamMarks || 0) + Math.floor(sem1Result.vivaMarks || 0) + Math.floor(sem1Result.internalMarks || 0);
                      const sem2Total = Math.floor(sem2Result.semesterExamMarks || 0) + Math.floor(sem2Result.vivaMarks || 0) + Math.floor(sem2Result.internalMarks || 0);
                      const sem3Total = Math.floor(sem3Result.semesterExamMarks || 0) + Math.floor(sem3Result.vivaMarks || 0) + Math.floor(sem3Result.internalMarks || 0);
                      const annualTotal = Math.floor((sem1Total + sem2Total + sem3Total) / 3);
                      const annualPercentage = Math.floor((annualTotal / 100) * 100);

                      return (
                        <StyledTableRow key={cs.id}>
                          <StyledTableCell>{formatSubjectName(cs.subject?.name || "N/A")}</StyledTableCell>
                          <StyledTableCell>{sem1Total || "N/A"}</StyledTableCell>
                          <StyledTableCell>{sem2Total || "N/A"}</StyledTableCell>
                          <StyledTableCell>{sem3Total || "N/A"}</StyledTableCell>
                          <StyledTableCell>{annualPercentage || "N/A"}</StyledTableCell>
                          <StyledTableCell>{getGrade(annualPercentage).grade}</StyledTableCell>
                        </StyledTableRow>
                      );
                    })}
                    <StyledTableRow>
                      <StyledTableCell>CGPA</StyledTableCell>
                      <StyledTableCell>{calculateCGPA(resultData, classSubjects).sem1CGPA}</StyledTableCell>
                      <StyledTableCell>{calculateCGPA(resultData, classSubjects).sem2CGPA}</StyledTableCell>
                      <StyledTableCell>{calculateCGPA(resultData, classSubjects).sem3CGPA}</StyledTableCell>
                      <StyledTableCell>{calculateCGPA(resultData, classSubjects).overallCGPA}</StyledTableCell>
                      <StyledTableCell>-</StyledTableCell>
                    </StyledTableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              <Button
                variant="contained"
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                sx={{ marginTop: 4, bgcolor: "#00c853", "&:hover": { bgcolor: "#00a548" } }}
              >
                {pdfLoading ? <CircularProgress size={24} /> : "Download Result Card"}
              </Button>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CheckResult;
