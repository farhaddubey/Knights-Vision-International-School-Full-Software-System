"use client";

// Shared marks viewer for authorized school panels.

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  IconButton,
  Box,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { CalendarToday, Close, Download } from "@mui/icons-material";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import "jspdf-autotable";

const drawerWidth = 280;
const appBarHeight = 64;

const textFieldStyles = {
  "& .MuiInputBase-input": { color: "#fff" },
  "& .MuiInputLabel-root": { color: "#aaa" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#555" },
    "&:hover fieldset": { borderColor: "#777" },
    "&.Mui-focused fieldset": { borderColor: "#00c757" },
  },
  "& .MuiInputBase-input.Mui-disabled": {
    color: "#fff !important",
    WebkitTextFillColor: "#fff !important",
  },
};




const TestMarksViewDialog = ({ open, onClose, test, students, className }) => {
  const [testMarks, setTestMarks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && test?.id) {
      fetchTestMarks(test.id);
    }
  }, [open, test]);

  const fetchTestMarks = async (testId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api-schools-panel/class_teachers_panel/Tests/${className.toLowerCase()}/test-marks`, {
        params: { testId },
      });
      const existingTestMarks = response.data.testMarks || [];

      const mergedTestMarks = students.map((student) => {
        const existing = existingTestMarks.find((tm) => tm.studentId === student.id);
        return existing
          ? {
              studentId: existing.studentId,
              studentName: `${student.firstName} ${student.lastName || ""}`.trim(),
              marks: existing.marks ?? "-",
              maxMarks: existing.maxMarks || 30,
              remarks: existing.remarks ?? "-",
            }
          : {
              studentId: student.id,
              studentName: `${student.firstName} ${student.lastName || ""}`.trim(),
              marks: "-",
              maxMarks: 30,
              remarks: "-",
            };
      });

      setTestMarks(mergedTestMarks);
    } catch (err) {
      console.error("Error fetching test marks:", err.message);
      toast.error("Failed to fetch test marks: " + (err.response?.data?.error || err.message));
      setTestMarks(
        students.map((student) => ({
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName || ""}`.trim(),
          marks: "-",
          maxMarks: 30,
          remarks: "-",
        }))
      );
    } finally {
      setLoading(false);
    }
  };

const handleDownloadPDF = async () => {
  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgSize = 28;
    const imgY = 28;
    const margin = 10;
    const logoX = pageWidth / 2 - 120; // Adjusted for portrait page width

    // === School Logo (Left of centered text) ===
    try {
      pdf.addImage("/knights.png", "PNG", 10, imgY, imgSize, imgSize);
    } catch (imgError) {
      console.warn("DEBUG: Logo image loading failed:", imgError.message);
      toast.warn("Failed to load logo image");
    }

    // === Right Logo ===
    try {
      pdf.addImage("/knights.png", "PNG", pageWidth - imgSize - margin, imgY, imgSize, imgSize);
    } catch (imgError) {
      console.warn("DEBUG: Right logo image loading failed:", imgError.message);
      toast.warn("Failed to load right logo image");
    }

    // === School Name ===
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(40);
    pdf.setTextColor("#003087");
    pdf.text("Sure Success Point School", pageWidth / 2, 19, { align: "center" });

    // === Updated School Motto ===
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor("#333");
    pdf.setFontSize(12);
    pdf.text("Institution of Humanism, Hardwork, Discipline, Technology & Excellence", pageWidth / 2, 28, { align: "center" });
    pdf.setFont("helvetica", "normal");
    pdf.text(
      `www.sspointschool.in | Powered by Knights (KiREAD) Group`,
      pageWidth / 2,
      36,
      { align: "center" }
    );

    // === Report Title ===
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor("#000");
    pdf.text("TEST REPORT", pageWidth / 2, 44, { align: "center" });

    // === Class, Test, Month ===
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    pdf.text(
      `Class: ${className} | Test: ${test?.title || "Unknown"} | Month: ${new Date().toLocaleString("default", { month: "long", year: "numeric" })}`,
      pageWidth / 2,
      52,
      { align: "center" }
    );

    // 📄 Prepare table data
    const tableData = testMarks.map((tm) => [
      tm.studentName,
      tm.marks,
      tm.maxMarks,
      tm.remarks,
    ]);

    // 📊 Create autoTable with red accent
    pdf.autoTable({
      head: [["Student", "Marks", "Max Marks", "Remarks"]],
      body: tableData,
      startY: 58,
      margin: { left: 10, right: 10 },
      styles: {
        font: "helvetica",
        fontSize: 10,
        textColor: [0, 0, 0],
        lineColor: [180, 0, 0], // Red border
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [220, 38, 38], // 🔴 Red
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
      },
      alternateRowStyles: {
        fillColor: [255, 228, 225], // Light red-pinkish alt rows
      },
    });

    // 💾 Save PDF
    pdf.save(`TestMarks_${test?.title || "Unknown"}.pdf`);
    toast.success("PDF downloaded successfully.");
  } catch (err) {
    console.error("Error generating PDF:", err.message);
    toast.error("Failed to generate PDF: " + err.message);
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
      <ListItemButton
        sx={{
          backgroundColor: "#009688",
          color: "#fff",
          "&:hover": { backgroundColor: "#009688" },
        }}
      >
        <ListItemIcon>
          <CalendarToday />
        </ListItemIcon>
        <ListItemText
          sx={{ color: "#fff" }}
          primary={`View Marks for ${test?.title || "Unknown"} - ${className}`}
        />
        <Box>
          <IconButton
            onClick={handleDownloadPDF}
            sx={{ color: "#00c757" }}
          >
            <Download sx={{ color: "#fff" }} />
          </IconButton>
          <IconButton onClick={onClose} sx={{ color: "#f44336" }}>
            <Close sx={{ color: "#fff" }} />
          </IconButton>
        </Box>
      </ListItemButton>
      <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#000", color: "#fff" }}>
        <Box sx={{ flex: 1, overflowY: "auto", maxHeight: "90vh" }}>
          <Box sx={{ bgcolor: "#000", color: "#fff" }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                <CircularProgress size={120} sx={{ color: "#00c757" }} />
              </Box>
            ) : (
              <Table sx={{ bgcolor: "#181818" }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#333" }}>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Student</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Marks</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Max Marks</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {testMarks.length > 0 ? (
                    testMarks.map((tm) => (
                      <TableRow key={tm.studentId} sx={{ bgcolor: "#181818", "&:hover": { bgcolor: "#222" } }}>
                        <TableCell sx={{ color: "#fff" }}>{tm.studentName}</TableCell>
                        <TableCell sx={{ color: "#fff" }}>{tm.marks}</TableCell>
                        <TableCell sx={{ color: "#fff" }}>{tm.maxMarks}</TableCell>
                        <TableCell sx={{ color: "#fff" }}>{tm.remarks}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ color: "#fff", textAlign: "center" }}>
                        No students found for this test.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </Box>
          <DialogActions sx={{ bgcolor: "#000" }}>
            <Button onClick={onClose} variant="contained" color="error" disabled={loading}>
              Close
            </Button>
          </DialogActions>
        </Box>
      </Box>
    </Dialog>
  );
};

export default TestMarksViewDialog; 
