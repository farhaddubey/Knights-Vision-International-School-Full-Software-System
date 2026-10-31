"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { Assessment, Close } from "@mui/icons-material";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
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
    "&.Mui-focused fieldset": { borderColor: "#00c853" },
  },
};

const statusColors = {
  PENDING: { variant: "outlined", color: "warning", pdfColor: [200, 200, 200] },
  SUBMITTED: { variant: "contained", color: "success", pdfColor: [204, 255, 204] },
  LATE: { variant: "contained", color: "error", pdfColor: [255, 204, 204] },
  NEEDS_IMPROVEMENT: { variant: "contained", color: "warning", pdfColor: [255, 255, 204] },
  EXCELLENT: { variant: "contained", color: "success", pdfColor: [0, 153, 0] },
};

const statusAbbreviations = {
  PENDING: "PE",
  SUBMITTED: "SU",
  LATE: "LA",
  NEEDS_IMPROVEMENT: "NI",
  EXCELLENT: "EX",
};

const ClassMonthlyHomeworkReportDialog = ({ open, onClose, classSubjectId, className, subjectName }) => {
  const [homeworkRecords, setHomeworkRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [months, setMonths] = useState([]);
  const year = new Date().getFullYear();

  useEffect(() => {
    if (open && classSubjectId) {
      fetchHomeworkReport();
    }
  }, [open, classSubjectId]);

  const fetchHomeworkReport = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("student_token");
      if (!token) throw new Error("User not authenticated");

      const response = await axios.get(`/api/a1-knights-students-panel/homework/class-report`, {
        params: { classSubjectId },
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Student Homework Report Response:", response.data);
      setHomeworkRecords(response.data.homeworkRecords || []);

      // Initialize months and days
      const monthList = Array.from({ length: 12 }, (_, i) => {
        const monthIndex = i + 1;
        const daysInMonth = new Date(year, monthIndex, 0).getDate();
        return {
          month: monthIndex,
          name: new Date(year, monthIndex - 1, 1).toLocaleString("default", { month: "long" }),
          days: Array.from({ length: daysInMonth }, (_, j) => j + 1),
        };
      });
      setMonths(monthList);
    } catch (err) {
      console.error("Error fetching student homework report:", err.message);
      toast.error("Failed to fetch homework report.");
      setHomeworkRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const imgSize = 40;
    const imgY = 10;
    const margin = 10;
    const logoX = pageWidth / 2 - 135;

    // School Logo
    try {
      doc.addImage("/knights.png", "PNG", logoX, imgY, imgSize, imgSize);
    } catch (imgError) {
      console.warn("DEBUG: Logo image loading failed:", imgError.message);
      toast.warn("Failed to load logo image");
    }

    // Right Logo
    try {
      doc.addImage("/knights.png", "PNG", pageWidth - imgSize - margin, imgY, imgSize, imgSize);
    } catch (imgError) {
      console.warn("DEBUG: Right logo image loading failed:", imgError.message);
      toast.warn("Failed to load right logo image");
    }

    // School Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(40);
    doc.setTextColor("#003087");
    doc.text("Sure Success Point School", pageWidth / 2, 25, { align: "center" });

    // School Motto
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#333");
    doc.setFontSize(12);
    doc.text("Institution of Humanism, Hardwork, Discipline, Technology & Excellence", pageWidth / 2, 33, { align: "center" });

    // Report Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor("#000");
    doc.text("YEARLY DAILY HOMEWORK PROGRESS REPORT", pageWidth / 2, 41, { align: "center" });

    // Class, Subject, Year, Website, Powered-by
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(
      `Class: ${className} | Subject: ${subjectName} | Year: ${year} | www.sspointschool.in | Powered by Knights (KiREAD) Group`,
      pageWidth / 2,
      49,
      { align: "center" }
    );

    // Prepare Table Data
    const tableData = months.map((monthObj) => {
      const row = [monthObj.name];
      const record = homeworkRecords[0] || { statuses: {} };
      monthObj.days.forEach((day) => {
        const dateStr = `${year}-${monthObj.month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const status = record.statuses[dateStr] || "PENDING";
        row.push(statusAbbreviations[status]);
      });
      return row;
    });

    // Homework Table
    doc.autoTable({
      startY: 58,
      head: [["Month", ...Array.from({ length: 31 }, (_, i) => (i + 1).toString())]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2, textColor: [0, 0, 0] },
      headStyles: { fillColor: [33, 33, 33], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 30 },
        ...Array.from({ length: 31 }, (_, i) => ({ [i + 1]: { cellWidth: 8 } })).reduce((a, b) => ({ ...a, ...b }), {}),
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index > 0) {
          const statusAbbr = data.cell.text[0];
          const status = Object.keys(statusAbbreviations).find(
            (key) => statusAbbreviations[key] === statusAbbr
          );
          if (status) {
            data.cell.styles.fillColor = statusColors[status].pdfColor;
          }
        }
      },
      didDrawPage: (data) => {
        // Footer
        doc.setFontSize(10);
        const footerY = pageHeight - 5;
        doc.setTextColor(0, 0, 0);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, footerY);

        // Legend
        let x = pageWidth - 160;
        doc.setFontSize(8);
        Object.entries(statusColors).forEach(([status, { pdfColor }]) => {
          doc.setFillColor(...pdfColor);
          doc.rect(x, footerY - 4, 4, 4, "F");
          doc.setTextColor(0, 0, 0);
          doc.text(`${statusAbbreviations[status]} = ${status.replace("_", " ")}`, x + 6, footerY);
          x += 35;
        });
      },
    });

    doc.save(`Homework_Report_${className}_${subjectName}_${year}.pdf`);
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
        <Assessment sx={{ mr: 1 }} />
        <Typography variant="h6">
          My Homework Report - {className} - {subjectName} - {year}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ pr: "100px" }}>
          <Button variant="contained" color="primary" onClick={generatePDF}>
            Download PDF
          </Button>
        </Box>
        <Button
          onClick={onClose}
          variant="outlined"
          color="error"
          sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
        >
          <Close />
        </Button>
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
            <Box sx={{ minWidth: `${150 + 31 * 100}px` }}>
              {/* Sticky Header Row */}
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
                  Month
                </Typography>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <Typography
                    key={day}
                    variant="body2"
                    sx={{ flex: 1, fontWeight: "bold", color: "#fff", minWidth: "100px", textAlign: "center" }}
                  >
                    {day}
                  </Typography>
                ))}
              </Box>

              {/* Scrollable Vertical List Area */}
              <Box sx={{ height: `80vh`, overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
                <List disablePadding>
                  {months.length > 0 ? (
                    months.map((monthObj) => (
                      <ListItem
                        key={monthObj.month}
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
                          primary={monthObj.name}
                          sx={{ flex: 1, color: "#fff", minWidth: "150px" }}
                        />
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                          if (day > monthObj.days.length) {
                            return <Box key={day} sx={{ flex: 1, minWidth: "100px" }} />;
                          }
                          const dateStr = `${year}-${monthObj.month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                          const record = homeworkRecords[0] || { statuses: {} };
                          const status = record.statuses[dateStr] || "PENDING";
                          return (
                            <Box key={day} sx={{ flex: 1, minWidth: "100px", textAlign: "center" }}>
                              <Button
                                variant={statusColors[status].variant}
                                color={statusColors[status].color}
                                sx={{ width: "80px" }}
                              >
                                {status.replace("_", " ")}
                              </Button>
                            </Box>
                          );
                        })}
                      </ListItem>
                    ))
                  ) : (
                    <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
                      No homework records found.
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

export default ClassMonthlyHomeworkReportDialog;
