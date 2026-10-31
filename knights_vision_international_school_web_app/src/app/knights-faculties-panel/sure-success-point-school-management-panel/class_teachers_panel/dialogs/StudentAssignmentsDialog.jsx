"use client";

import React from "react";
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
};

const StudentAssignmentsDialog = ({
  open,
  onClose,
  selectedAssignment,
  studentAssignments,
  className,
}) => {
  const handleDownloadPDF = async () => {
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Add header
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Sure Success Point School", 105, 20, { align: "center" });
      pdf.setFontSize(12);
      pdf.text(`Assignment: ${selectedAssignment?.title || "Unknown"}`, 105, 30, { align: "center" });
      pdf.text(`Class: ${className}`, 105, 38, { align: "center" });
      pdf.setLineWidth(0.5);
      pdf.line(20, 45, 190, 45); // Horizontal line

      // Prepare table data
      const tableData = studentAssignments.map((sa) => [
        `${sa.student.firstName} ${sa.student.lastName}`,
        sa.isSubmitted ? "Yes" : "No",
        sa.marksObtained || "-",
        sa.remarks || "-",
        sa.qualityTag || "None",
      ]);

      // Generate table using autoTable
      pdf.autoTable({
        head: [["Student", "Submitted", "Marks (0-3)", "Remarks", "Quality Tag"]],
        body: tableData,
        startY: 50,
        margin: { left: 20, right: 20 },
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
      });

      // Download PDF
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
          primary={`View Submissions for ${selectedAssignment?.title || "Unknown"} - ${className}`}
        />
        <Button
          onClick={handleDownloadPDF}
          variant="outlined"
          sx={{ position: "absolute", right: 80, top: 8, color: "#00c757", borderColor: "#00c757" }}
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
      <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#000", color: "#fff"}}>
        <Box sx={{ flex: 1, overflowY: "auto", pr: 1, height: "84vh" }}>
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