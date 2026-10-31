"use client";

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
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
} from "@mui/material";
import { CalendarToday, Close, Download } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { Bounce } from "react-toastify";
import jsPDF from "jspdf";
import "jspdf-autotable";

const drawerWidth = 280;
const appBarHeight = 64;

const BoardExamResultsDialog = ({ open, onClose, boardExam, students, className }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (boardExam && students.length) {
      fetchResults();
    }
  }, [boardExam, students]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api-schools-panel/class_teachers_panel/BoardExams/${className.toLowerCase()}/board-exam-results`, {
        params: { boardExamId: boardExam.id },
      });
      const existingResults = response.data.results || [];
      const initialResults = students.map((student) => {
        const existing = existingResults.find((r) => r.studentId === student.id) || {};
        return {
          studentId: student.id,
          studentName: `${student.firstName} ${student.middleName || ""} ${student.lastName}`.trim(),
          writtenMarks: existing.writtenMarks != null ? existing.writtenMarks : "-",
          oralMarks: existing.oralMarks != null ? existing.oralMarks : "-",
          remarks: existing.remarks || "-",
        };
      });
      setResults(initialResults);
    } catch (err) {
      console.error("Error fetching board exam results:", err.message);
      toast.error("Failed to fetch board exam results.");
      setResults(students.map((student) => ({
        studentId: student.id,
        studentName: `${student.firstName} ${student.middleName || ""} ${student.lastName}`.trim(),
        writtenMarks: "-",
        oralMarks: "-",
        remarks: "-",
      })));
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

      // Header: School Title
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Sure Success Point School", 105, 20, { align: "center" });

      // Subheader: Test Series Info
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text("Knights West Bengal Board Preparation Test Series (KWBBPTS)", 105, 27, {
        align: "center",
      });

      // Exam details
      pdf.setFontSize(12);
      pdf.text(`Board Exam: ${boardExam?.title || "Unknown"}`, 105, 34, { align: "center" });
      pdf.text(`Class: ${className}`, 105, 42, { align: "center" });

      // Horizontal separator
      pdf.setLineWidth(0.5);
      pdf.line(20, 47, 190, 47);

      // Table body data
      const tableData = results.map((result) => [
        result.studentName,
        result.writtenMarks,
        result.oralMarks,
        (parseFloat(result.writtenMarks || 0) + parseFloat(result.oralMarks || 0)).toFixed(2),
        result.remarks,
      ]);

      // Table with fresh feel color palette
      pdf.autoTable({
        head: [["Student Name", "Written Marks (90)", "Oral Marks (10)", "Total Marks", "Remarks"]],
        body: tableData,
        startY: 52,
        margin: { left: 20, right: 20 },
        styles: {
          font: "helvetica",
          fontSize: 10,
          textColor: [33, 33, 33],
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [63, 81, 181], // Indigo base
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [232, 240, 254], // Soft blue tint
        },
      });

      // Download trigger
      pdf.save(`BoardExam_${boardExam?.title || "Unknown"}.pdf`);
      toast.success("📄 PDF downloaded successfully.");
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
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
      <ListItemButton
        sx={{
          backgroundColor: "#009688",
          color: "#fff",
          "&:hover": { backgroundColor: "#009688" },
        }}
      >
        <ListItemIcon>
          <CalendarToday sx={{ color: "#fff" }} />
        </ListItemIcon>
        <ListItemText
          sx={{ color: "#fff" }}
          primary={`Board Exam Results for ${boardExam?.title || "Unknown"} - ${className}`}
        />
        <Box>
          <IconButton
            onClick={handleDownloadPDF}
            sx={{ color: "#fff" }}
          >
            <Download sx={{ color: "#fff" }} />
          </IconButton>
          <IconButton onClick={onClose} sx={{ color: "#f44336" }}>
            <Close sx={{ color: "#fff" }} />
          </IconButton>
        </Box>
      </ListItemButton>
      <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#222", color: "#fff" }}>
        <Box sx={{ flex: 1, overflowY: "auto", maxHeight: "87vh" }}>
          <Box sx={{ bgcolor: "#000", color: "#fff" }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                <CircularProgress size={120} sx={{ color: "#00c757" }} />
              </Box>
            ) : (
              <Table sx={{ bgcolor: "#181818" }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#333" }}>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Student Name</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Written Marks (90)</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Oral Marks (10)</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Total Marks</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.length > 0 ? (
                    students.map((student, index) => (
                      <TableRow key={student.id} sx={{ bgcolor: "#181818", "&:hover": { bgcolor: "#222" } }}>
                        <TableCell sx={{ color: "#fff" }}>
                          {`${student.firstName} ${student.middleName || ""} ${student.lastName}`.trim()}
                        </TableCell>
                        <TableCell sx={{ color: "#fff" }}>
                          {results[index]?.writtenMarks}
                        </TableCell>
                        <TableCell sx={{ color: "#fff" }}>
                          {results[index]?.oralMarks}
                        </TableCell>
                        <TableCell sx={{ color: "#fff" }}>
                          {(parseFloat(results[index]?.writtenMarks || 0) + parseFloat(results[index]?.oralMarks || 0)).toFixed(2)}
                        </TableCell>
                        <TableCell sx={{ color: "#fff" }}>
                          {results[index]?.remarks}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ color: "#fff", textAlign: "center" }}>
                        No students found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </Box>
          <DialogActions sx={{ bgcolor: "#000" }}>
            <Button onClick={onClose} variant="contained" color="error" sx={{ color: "#fff" }} disabled={loading}>
              Close
            </Button>
          </DialogActions>
        </Box>
      </Box>
    </Dialog>
  );
};

export default BoardExamResultsDialog;