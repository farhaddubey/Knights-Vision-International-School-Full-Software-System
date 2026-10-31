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
  TextField,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import { Print, Edit, Search, ArrowLeft, ArrowCircleRight, Rotate90DegreesCcw } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import jsPDF from "jspdf";
import "jspdf-autotable";
import BoardExamsDialog from "./dialogs/BoardExamsDialog";
const drawerWidth = 280;
const appBarHeight = 64;
const greenAccent = "#00c853";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const wbSeriesSubjectNames = new Set([
  'english',
  'bengali',
  'mathematics',
  'physical science',
  'life science',
  'history',
  'geography',
]);

const isWbSeriesClassSubject = (classSubject) =>
  ['X', 'XS'].includes(classSubject?.className?.toUpperCase()) &&
  wbSeriesSubjectNames.has(classSubject?.subject?.name?.trim().toLowerCase());

const getAcademicSessionYear = () => {
  const today = new Date();
  return today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
};

const getSeriesMonths = (className) =>
  className?.toUpperCase() === 'XS'
    ? monthNames.slice(0, 2)
    : monthNames.slice(6, 12);

const BoardExamResultManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("July");
  const [academicYear, setAcademicYear] = useState(getAcademicSessionYear);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    const token = Cookies.get("faculties_token");
    if (!token) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/api-schools-panel/class_teachers_panel/class-subjects", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, pageSize: 100 }, // Fetch all subjects (adjust pageSize if needed)
      });
      if (!response.data || !Array.isArray(response.data.classSubjects)) {
        throw new Error("Invalid response format");
      }
      const seriesSubjects = response.data.classSubjects.filter(isWbSeriesClassSubject);
      setSubjects(seriesSubjects);
      setFilteredSubjects(seriesSubjects);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch subjects.");
      toast.error(err.response?.data?.error || "Failed to fetch subjects.");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    const token = Cookies.get("faculties_token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }
    if (!selectedSubject) {
      toast.error("Please select a subject to generate PDF.");
      return;
    }
    try {
      const monthIndex = monthNames.indexOf(selectedMonth) + 1;
      const className = selectedSubject.className.toLowerCase();
      const response = await axios.get(`/api-schools-panel/class_teachers_panel/classes/${className}/board-exam-results/data`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { classId: selectedSubject.classId, academicYear, month: monthIndex },
      });

      const { subjects: fetchedSubjects, students, boardExams } = response.data;
      const subjects = fetchedSubjects.filter((subject) =>
        wbSeriesSubjectNames.has(subject?.subject?.name?.trim().toLowerCase()),
      );

      const doc = new jsPDF();

      // Set dark background
      doc.setFillColor(33, 33, 33); // #212121
      doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');

      // Title
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255); // White text
      doc.text(`Board Exam Results - ${selectedSubject.className} (${academicYear}, ${selectedMonth})`, 14, 20);

      // Table headers
      const head = [
        [
          { content: 'Student Name', colSpan: 1, styles: { halign: 'left', fillColor: [51, 51, 51], textColor: [255, 255, 255], fontStyle: 'bold' } },
          ...subjects.flatMap((subject) => [
            { content: subject.subject.name, colSpan: 3, styles: { halign: 'center', fillColor: [51, 51, 51], textColor: [255, 255, 255], fontStyle: 'bold' } },
            {}, // Placeholder for W
            {}, // Placeholder for O
          ]),
        ],
        [
          { content: '', styles: { fillColor: [51, 51, 51], textColor: [255, 255, 255] } },
          ...subjects.flatMap(() => [
            { content: 'W', styles: { halign: 'center', fillColor: [51, 51, 51], textColor: [255, 255, 255], fontStyle: 'bold' } },
            { content: 'O', styles: { halign: 'center', fillColor: [51, 51, 51], textColor: [255, 255, 255], fontStyle: 'bold' } },
            { content: 'T', styles: { halign: 'center', fillColor: [51, 51, 51], textColor: [255, 255, 255], fontStyle: 'bold' } },
          ]),
        ],
      ];

      // Table body
      const body = students.map((student) => [
        { content: student.name, styles: { halign: 'left', fillColor: [24, 24, 24], textColor: [255, 255, 255] } },
        ...subjects.flatMap((subject) => {
          const exam = boardExams.find((e) => e.classSubjectId === subject.id);
          if (!exam) return [
            { content: '-', styles: { halign: 'center', fillColor: [24, 24, 24], textColor: [255, 255, 255] } },
            { content: '-', styles: { halign: 'center', fillColor: [24, 24, 24], textColor: [255, 255, 255] } },
            { content: '-', styles: { halign: 'center', fillColor: [24, 24, 24], textColor: [255, 255, 255] } },
          ];
          const result = exam.BoardExamResult.find((r) => r.studentId === student.id);
          return result
            ? [
                { content: result.writtenMarks.toFixed(1), styles: { halign: 'center', fillColor: [24, 24, 24], textColor: [255, 255, 255] } },
                { content: result.oralMarks.toFixed(1), styles: { halign: 'center', fillColor: [24, 24, 24], textColor: [255, 255, 255] } },
                { content: result.totalMarks.toFixed(1), styles: { halign: 'center', fillColor: [24, 24, 24], textColor: [255, 255, 255] } },
              ]
            : [
                { content: '-', styles: { halign: 'center', fillColor: [24, 24, 24], textColor: [255, 255, 255] } },
                { content: '-', styles: { halign: 'center', fillColor: [24, 24, 24], textColor: [255, 255, 255] } },
                { content: '-', styles: { halign: 'center', fillColor: [24, 24, 24], textColor: [255, 255, 255] } },
              ];
        }),
      ]);

      // Generate table
      doc.autoTable({
        head,
        body,
        startY: 30,
        theme: 'plain',
        styles: {
          fontSize: 10,
          cellPadding: 2,
          textColor: [255, 255, 255],
          fillColor: [24, 24, 24], // #181818
          lineColor: [85, 85, 85], // #555
          lineWidth: 0.5,
        },
        headStyles: {
          fillColor: [51, 51, 51], // #333
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { halign: 'left' },
        },
        margin: { top: 30, left: 14, right: 14 },
      });

      doc.save(`board_exam_results_${selectedSubject.className}_${academicYear}_${selectedMonth}.pdf`);
      toast.success(`🎉 PDF generated successfully for ${selectedMonth} ${academicYear}!`);
    } catch (err) {
      console.error(`Error generating PDF for ${selectedMonth}:`, err);
      toast.error(`❌ Failed to generate PDF for ${selectedMonth}.`);
    }
  };

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredSubjects(
      subjects.filter(
        (s) =>
          s.subject.name.toLowerCase().includes(query) ||
          s.className.toLowerCase().includes(query)
      )
    );
  };

  const handleOpenDialog = (subject) => {
    setSelectedSubject(subject);
    setSelectedMonth(subject.className?.toUpperCase() === 'XS' ? 'January' : 'July');
    setAcademicYear(getAcademicSessionYear());
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSubject(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: "#212121" }}>
        <CircularProgress size={120} sx={{ color: greenAccent }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ textAlign: "center", mt: 4, bgcolor: "#212121" }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        width: `calc(100vw - ${drawerWidth}px)`,
        backgroundColor: "#212121",
        height: `calc(100vh - ${appBarHeight}px)`,
        color: "#fff",
      }}
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
      />
      <ListItemButton
        sx={{
          backgroundColor: "#181818",
          color: "#fff",
          "&:hover": { backgroundColor: "#181818" },
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "8px 16px",
          borderRadius: 1,
        }}
      >
        <ListItemIcon sx={{ fontSize: 30, color: greenAccent, fontWeight: "bold" }}>
          <Edit />
        </ListItemIcon>
        <ListItemText
          primary="Knights WB Test Preparation Series — My Classes"
          secondary="Class X and XS only; seven West Bengal board subjects only."
          secondaryTypographyProps={{ sx: { color: '#aaa' } }}
        />
        <TextField
          variant="outlined"
          placeholder="Search Subjects or Classes..."
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <Search sx={{ color: "#fff", mr: 1 }} />,
            style: { color: "#fff", backgroundColor: "#222", borderRadius: 4 },
          }}
          sx={{
            width: "300px",
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#555" },
              "&:hover fieldset": { borderColor: "#777" },
              "&.Mui-focused fieldset": { borderColor: greenAccent },
            },
          }}
        />
        <FormControl size="small" sx={{ width: "150px", backgroundColor: "#333", borderRadius: "4px" }}>
          <InputLabel sx={{ color: "#aaa" }}>Month</InputLabel>
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            sx={{
              color: "#fff",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: greenAccent },
            }}
          >
            {getSeriesMonths(selectedSubject?.className || 'X').map((month) => (
              <MenuItem key={month} value={month}>
                {month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Academic Year"
          type="number"
          value={academicYear}
          onChange={(e) => setAcademicYear(parseInt(e.target.value))}
          size="small"
          sx={{
            width: "150px",
            backgroundColor: "#333",
            borderRadius: "4px",
            "& .MuiInputBase-input": { color: "#fff" },
            "& .MuiInputLabel-root": { color: "#aaa" },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: greenAccent },
          }}
        />
        <Button
          onClick={fetchSubjects}
          variant="outlined"
          sx={{ color: greenAccent, borderColor: greenAccent }}
        >
          <Rotate90DegreesCcw/>
        </Button>
        <Button
        size="small"
          variant="contained"
          color="primary"
          onClick={handleGeneratePDF}
          sx={{ bgcolor: greenAccent, color: "#000", "&:hover": { bgcolor: "#00a548" } }}
        >
          <Print /> Download PDF
        </Button>
      </ListItemButton>

      <Box sx={{ bgcolor: "#181818", borderRadius: 2, overflow: "hidden" }}>
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
            Class
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Subject Name
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.5, fontWeight: "bold", color: "#fff" }}>
            Action
          </Typography>
        </Box>
        <Box sx={{ height: "80vh", overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
          <List>
            {filteredSubjects.length > 0 ? (
              filteredSubjects.map((subject) => (
                <ListItem
                  key={subject.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    p: 1,
                    bgcolor: "#181818",
                    mb: 1,
                    borderRadius: 1,
                    borderBottom: "2px solid #333",
                  }}
                >
                  <Typography variant="body2" sx={{ flex: 0.5, color: "#fff" }}>
                    {subject.id}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {subject.className}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {subject.subject.name}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenDialog(subject)}
                    sx={{ flex: 0.5, bgcolor: greenAccent, color: "#000", "&:hover": { bgcolor: "#00a548" } }}
                  >
                    Manage Board Exams
                  </Button>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
                No subjects found for your classes.
              </Typography>
            )}
          </List>
        </Box>
      </Box>

      <BoardExamsDialog
        open={openDialog}
        onClose={handleCloseDialog}
        classSubject={selectedSubject}
        className={selectedSubject?.className || ""}
        academicYear={academicYear}
        month={selectedMonth}
      />
    </Box>
  );
};

export default BoardExamResultManagement;
