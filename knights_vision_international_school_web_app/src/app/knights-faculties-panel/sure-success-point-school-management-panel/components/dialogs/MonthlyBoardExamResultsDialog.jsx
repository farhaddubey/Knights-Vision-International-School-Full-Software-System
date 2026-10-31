"use client";

import React from "react";
import {
  Dialog,
  DialogActions,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { Print, Close } from "@mui/icons-material";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import "jspdf-autotable";

const drawerWidth = 280;
const appBarHeight = 64;

const MonthlyBoardExamResultsDialog = ({ open, onClose, className, selectedMonth, academicYear, monthlyData }) => {
  const results = monthlyData?.students || [];
  const subjects = monthlyData?.subjects || [];
  const loading = open && !monthlyData;
const handleDownloadPDF = () => {
  try {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const imgSize = 40;
    const imgY = 10;
    const margin = 10; // 10mm margin on left and right (adjust to 5mm if needed)
    const logoX = pageWidth / 2 - 135;

    // === School Logo (Right of centered text start) ===
    try {
      doc.addImage("/knights.png", "PNG", logoX, imgY, imgSize, imgSize);
    } catch (imgError) {
      console.warn("DEBUG: Logo image loading failed:", imgError.message);
      toast.warn("Failed to load logo image");
    }

    // === Right Logo ===
    try {
      doc.addImage("/knights.png", "PNG", pageWidth - imgSize - margin, imgY, imgSize, imgSize);
    } catch (imgError) {
      console.warn("DEBUG: Right logo image loading failed:", imgError.message);
      toast.warn("Failed to load right logo image");
    }

    // === School Name ===
    doc.setFont("helvetica", "bold");
    doc.setFontSize(40);
    doc.setTextColor("#003087");
    doc.text("Sure Success Point School", pageWidth / 2, 25, { align: "center" });

    // === School Motto ===
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#333");
    doc.setFontSize(12);
    doc.text("Institution of Humanism, Hardwork, Discipline, Technology & Excellence", pageWidth / 2, 33, { align: "center" });

    // === Report Title ===
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor("#000");
    doc.text("MONTHLY BOARD EXAM REPORT", pageWidth / 2, 41, { align: "center" });

    // === Class and Month ===
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(
      `Class: ${className.toUpperCase()} | Month: ${selectedMonth} ${academicYear} | www.sspointschool.in | Powered by Knights (KiREAD) Group`,
      pageWidth / 2,
      49,
      { align: "center" }
    );

    // === Calculate Dynamic Cell Widths ===
    const totalColumns = subjects.length + 3; // Subjects + Student Name + Percentage + Grade
    const availableWidth = pageWidth - 2 * margin; // Subtract left and right margins
    const cellWidth = availableWidth / totalColumns; // Equal width for each column

    // === Prepare Table Data ===
    const head = [
      [
        { content: "Student Name", styles: { halign: "left" } },
        ...subjects.map((s) => ({ content: s.subjectName, styles: { halign: "center" } })),
        { content: "Percentage", styles: { halign: "center" } },
        { content: "Grade", styles: { halign: "center" } },
      ],
    ];

    const body = results.map((result) => [
      result.studentName,
      ...subjects.map((s) => result.marks[s.classSubjectId] || "-"),
      result.percentage.toFixed(2),
      result.grade,
    ]);

    // === Results Table ===
    doc.autoTable({
      head,
      body,
      startY: 56,
      theme: "grid",
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 2, textColor: [0, 0, 0] },
      headStyles: { fillColor: [33, 33, 33], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: cellWidth }, // Student Name
        ...subjects.reduce((acc, _, i) => ({ ...acc, [i + 1]: { cellWidth: cellWidth } }), {}),
        [subjects.length + 1]: { cellWidth: cellWidth }, // Percentage
        [subjects.length + 2]: { cellWidth: cellWidth }, // Grade
      },
      didDrawPage: (data) => {
        // === Footer ===
        doc.setFontSize(10);
        const footerY = pageHeight - 5;
        doc.setTextColor(0, 0, 0);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, footerY);

        // === Legend (Aligned to the right of "Generated on") ===
        const legendY = footerY;
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text("Grade Legend: A (90-100), B (80-89), C (70-79), D (60-69), F (<60)", pageWidth - 160, legendY);
      },
    });

    doc.save(`BoardExam_Results_${className}_${selectedMonth}_${academicYear}.pdf`);
    toast.success("📄 PDF downloaded successfully.");
  } catch (err) {
    console.error("Error generating PDF:", err.message);
    toast.error("Failed to generate PDF.");
  }
};
  return (
    <Dialog
      sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        transform: "translate(0, 0)",
      }}
      open={open}
      onClose={onClose}
      fullScreen
    >
      <Box
        sx={{
          backgroundColor: "#212121",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          p: 1,
        }}
      >
        <Print sx={{ mr: 1, color: "#00c853" }} />
        <Typography variant="h6">
          Monthly Board Exam Results - {className.toUpperCase()} - {selectedMonth} {academicYear}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          color="primary"
          onClick={handleDownloadPDF}
          sx={{ bgcolor: "#00c853", color: "#000", "&:hover": { bgcolor: "#00a548" }, mr: 2 }}
        >
          <Print /> Download PDF
        </Button>
        <IconButton
          onClick={onClose}
          sx={{ color: "#f44336" }}
        >
          <Close />
        </IconButton>
      </Box>
      <Box sx={{ bgcolor: "#181818" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <CircularProgress size={60} sx={{ color: "#00c757" }} />
          </Box>
        ) : (
          <Box
            sx={{
              overflowX: "auto",
              bgcolor: "#181818",
              borderRadius: 2,
            }}
          >
            <Box sx={{ minWidth: `${150 + subjects.length * 100 + 200}px` }}>
              <Box
                sx={{
                  display: "flex",
                  p: 1,
                  bgcolor: "#333",
                  borderRadius: 1,
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                }}
              >
                <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff", minWidth: "150px" }}>
                  Student Name
                </Typography>
                {subjects.map((subject) => (
                  <Typography
                    key={subject.classSubjectId}
                    variant="body2"
                    sx={{ flex: 1, fontWeight: "bold", color: "#fff", minWidth: "100px", textAlign: "center" }}
                  >
                    {subject.subjectName}
                  </Typography>
                ))}
                <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff", minWidth: "100px", textAlign: "center" }}>
                  Percentage
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff", minWidth: "100px", textAlign: "center" }}>
                  Grade
                </Typography>
              </Box>
              <Box sx={{ height: `80vh`, overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
                <List disablePadding>
                  {results.length > 0 ? (
                    results.map((result) => (
                      <ListItem
                        key={result.studentId}
                        sx={{
                          display: "flex",
                          p: 1,
                          bgcolor: "#181818",
                          mb: 1,
                          borderRadius: 1,
                          borderBottom: "2px solid #333",
                        }}
                      >
                        <ListItemText
                          primary={result.studentName}
                          sx={{ flex: 1, color: "#fff", minWidth: "150px" }}
                        />
                        {subjects.map((subject) => (
                          <Typography
                            key={subject.classSubjectId}
                            variant="body2"
                            sx={{ flex: 1, color: "#fff", minWidth: "100px", textAlign: "center" }}
                          >
                            {result.marks[subject.classSubjectId] || "-"}
                          </Typography>
                        ))}
                        <Typography
                          variant="body2"
                          sx={{ flex: 1, color: "#fff", minWidth: "100px", textAlign: "center" }}
                        >
                          {result.percentage.toFixed(2)}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ flex: 1, color: "#fff", minWidth: "100px", textAlign: "center" }}
                        >
                          {result.grade}
                        </Typography>
                      </ListItem>
                    ))
                  ) : (
                    <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
                      No results found for {className.toUpperCase()} in {selectedMonth} {academicYear}.
                    </Typography>
                  )}
                </List>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
      <DialogActions sx={{ bgcolor: "#181818" }}>
        <Button onClick={onClose} variant="contained" color="error">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MonthlyBoardExamResultsDialog;
