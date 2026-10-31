"use client";

// Shared assignment viewer for authorized school panels.

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  LinearProgress,
} from "@mui/material";
import { CalendarToday, Close, Download } from "@mui/icons-material";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import "jspdf-autotable";

const drawerWidth = 280;
const appBarHeight = 64;

const StudentAssignmentsDialog = ({
  open,
  onClose,
  selectedAssignment,
  studentAssignments,
  className,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 10000); // 10 seconds
      return () => clearTimeout(timer); // Cleanup on unmount or when open changes
    }
  }, [open]);

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
      pdf.text("Sure Success Point School", pageWidth / 2, 20, { align: "center" });

      // === School Motto ===
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
      pdf.text("ASSIGNMENT REPORT", pageWidth / 2, 44, { align: "center" });

      // === Class, Assignment, Month, Website, and Powered-by in One Line ===
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.text(
        `Class: ${className} | Assignment: ${selectedAssignment?.title || "Unknown"} | Month: ${new Date().toLocaleString("default", { month: "long", year: "numeric" })}`,
        pageWidth / 2,
        52,
        { align: "center" }
      );

      // === Prepare Table Data ===
      const tableData = studentAssignments.map((sa) => [
        `${sa.student.firstName} ${sa.student.lastName}`,
        sa.isSubmitted ? "Yes" : "No",
        sa.marksObtained || "-",
        sa.remarks || "-",
        sa.qualityTag || "None",
      ]);

      // === Generate Table using autoTable ===
      pdf.autoTable({
        head: [["Student", "Submitted", "Marks (0-3)", "Remarks", "Quality Tag"]],
        body: tableData,
        startY: 58,
        margin: { left: 10, right: 10 },
        styles: {
          font: "helvetica",
          fontSize: 10,
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [0, 150, 136],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240],
        },
        didDrawPage: () => {
          // === Footer ===
          pdf.setFontSize(10);
          const footerY = pageHeight - 5;
          pdf.setTextColor(0, 0, 0);
          pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, footerY);
        },
      });

      // === Download PDF ===
      pdf.save(`Assignment_${selectedAssignment?.title || "Unknown"}.pdf`);
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
          backgroundColor: "#00463fff",
          color: "#fff",
          "&:hover": { backgroundColor: "#00463fff" },
        }}
      >
        <ListItemIcon>
          <CalendarToday />
        </ListItemIcon>
        <ListItemText
          sx={{ color: "#fff" }}
          primary={`View Submissions for ${selectedAssignment?.title || "Unknown"} - ${className}`}
        />
        <Button
          onClick={handleDownloadPDF}
          variant="outlined"
          sx={{ position: "absolute", right: 80, top: 8, color: "#00dc5fff", borderColor: "#00ff6eff" }}
        >
          <Download />
        </Button>
        <Button
          onClick={onClose}
          variant="outlined"
          color="error"
          sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
        >
          <Close />
        </Button>
      </ListItemButton>
      <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#000", color: "#fff" }}>
        <Box sx={{ flex: 1, overflowY: "auto", height: "84vh" }}>
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                bgcolor: "#000",
              }}
            >
              <LinearProgress sx={{ width: "50%", color: "#fff" }} />
            </Box>
          ) : (
            <Box sx={{ bgcolor: "#000", color: "#fff" }}>
              <Table id="assignment-table" sx={{ bgcolor: "#181818" }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#333" }}>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Student</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Submitted</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Marks (0-3)</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Remarks</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Quality Tag</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentAssignments.length > 0 ? (
                    studentAssignments.map((sa) => (
                      <TableRow key={sa.id} sx={{ bgcolor: "#181818", "&:hover": { bgcolor: "#222" } }}>
                        <TableCell sx={{ color: "#fff" }}>{`${sa.student.firstName} ${sa.student.lastName}`}</TableCell>
                        <TableCell sx={{ color: "#fff" }}>{sa.isSubmitted ? "Yes" : "No"}</TableCell>
                        <TableCell sx={{ color: "#fff" }}>{sa.marksObtained || "-"}</TableCell>
                        <TableCell sx={{ color: "#fff" }}>{sa.remarks || "-"}</TableCell>
                        <TableCell sx={{ color: "#fff" }}>
                          {sa.qualityTag || "None"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ color: "#fff", textAlign: "center" }}>
                        No student assignments found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          )}
          <DialogActions sx={{ bgcolor: "#000" }}>
            <Button onClick={onClose} variant="contained" color="error">
              Close
            </Button>
          </DialogActions>
        </Box>
      </Box>
    </Dialog>
  );
};

export default StudentAssignmentsDialog;
