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
import { Print, Edit, Search } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import BoardExamsDialog from "./dialogs/BoardExamsDialog";
import jsPDF from "jspdf";
import "jspdf-autotable";

const drawerWidth = 280;
const appBarHeight = 64;
const greenAccent = "#00c853";

// Define ClassName enum values (matching the Prisma schema)
const validClassNames = ['X', 'XS'];

const wbSeriesSubjectNames = new Set([
  'english',
  'bengali',
  'mathematics',
  'physical science',
  'life science',
  'history',
  'geography',
]);

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const getAcademicSessionYear = () => {
  const today = new Date();
  return today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
};

const getSeriesMonths = (className) =>
  className?.toUpperCase() === 'XS'
    ? monthNames.slice(0, 2)
    : monthNames.slice(6, 12);

const isWbSeriesSubject = (classSubject) =>
  wbSeriesSubjectNames.has(classSubject?.subject?.name?.trim().toLowerCase());

const BoardExamResultManagement = ({ className }) => {
  const [subjects, setSubjects] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(
    className?.toUpperCase() === 'XS' ? 'January' : 'July',
  );
  const [academicYear, setAcademicYear] = useState(getAcademicSessionYear);
  const [branchId, setBranchId] = useState(null);
  const [schoolId, setSchoolId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  useEffect(() => {
    const token = Cookies.get("administration_token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setSchoolId(decoded.schoolId);
        setBranchId(decoded.branchId);
        console.log("Decoded JWT:", { schoolId: decoded.schoolId, branchId: decoded.branchId });
      } catch (err) {
        console.error("Error decoding token:", err.message);
        toast.error("Invalid authentication token.");
        setError("Invalid authentication token.");
        setLoading(false);
      }
    } else {
      toast.error("User not authenticated. Please log in.");
      setError("User not authenticated.");
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    // Validate className against ClassName enum
    const normalizedClassName = className?.toUpperCase();
    if (!validClassNames.includes(normalizedClassName)) {
      setError('Invalid class name');
      setLoading(false);
      return;
    }
    const sessionYear = getAcademicSessionYear();
    setAcademicYear(sessionYear);
    setSelectedMonth(normalizedClassName === 'XS' ? 'January' : 'July');
    fetchSubjects(sessionYear);
  }, [className]);

  const fetchSubjects = async (requestedAcademicYear = academicYear) => {
    const token = Cookies.get("administration_token");
    if (!token) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      // Dynamically calculate the current academic year
      const response = await axios.get(`/api/classes/${className.toLowerCase()}/subjects`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { academicYear: requestedAcademicYear, branchId: 1 }, // Main Campus is the established central schedule scope.
      });
      if (!response.data || !Array.isArray(response.data.subjects)) {
        throw new Error("Invalid response format");
      }
      setSubjects(response.data.subjects.filter(isWbSeriesSubject));
    } catch (err) {
      setError(err.response?.data?.error || `Failed to fetch subjects for ${className.toUpperCase()}.`);
      toast.error(`Failed to fetch subjects for ${className.toUpperCase()}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (subject) => {
    setSelectedSubject(subject);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSubject(null);
  };

  const handleGeneratePDF = async () => {
    const token = Cookies.get("administration_token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }
    try {
      const monthIndex = monthNames.indexOf(selectedMonth) + 1;
      const response = await axios.get(`/api/classes/${className.toLowerCase()}/board-exam-results/data`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { academicYear, month: monthIndex, branchId: 1 },
      });

      const { subjects: fetchedSubjects, students, boardExams } = response.data;
      const subjects = fetchedSubjects.filter(isWbSeriesSubject);

      const doc = new jsPDF();

      // Set dark background
      doc.setFillColor(33, 33, 33); // #212121
      doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');

      // Title
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255); // White text
      doc.text(`Board Exam Results - ${className.toUpperCase()} (${academicYear}, ${selectedMonth})`, 14, 20);

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

      doc.save(`board_exam_results_${className}_${academicYear}_${selectedMonth}.pdf`);
      toast.success(`🎉 PDF generated successfully for ${selectedMonth} ${academicYear}!`);
    } catch (err) {
      console.error(`Error generating PDF for ${selectedMonth}:`, err);
      toast.error(`❌ Failed to generate PDF for ${selectedMonth}.`);
    }
  };

const handleGenerateSchedulePDF = async () => {
    const token = Cookies.get("administration_token");
    // if (!token || !branchId) {
    //   toast.error("User not authenticated or branch ID missing.");
    //   return;
    // }
    try {
      const monthIndex = monthNames.indexOf(selectedMonth) + 1;
      const response = await axios.get(`/api/classes/${className.toLowerCase()}/board-exam-schedule`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { academicYear, month: monthIndex, branchId },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `board_exam_schedule_${className}_${academicYear}_${selectedMonth}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      toast.success(`🎉 Schedule PDF downloaded successfully for ${selectedMonth} ${academicYear}!`);
    } catch (err) {
      console.error(`Error downloading schedule PDF for ${selectedMonth}:`, err);
      toast.error(`❌ Failed to download schedule PDF for ${selectedMonth}.`);
    }
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
          primary={`Knights WB Test Preparation Series — Class ${className.toUpperCase()}`}
          secondary="Only English, Bengali, Mathematics, Physical Science, Life Science, History, and Geography."
          secondaryTypographyProps={{ sx: { color: '#aaa' } }}
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
            {getSeriesMonths(className).map((month) => (
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
          Refresh
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleGeneratePDF}
          sx={{ bgcolor: greenAccent, color: "#000", "&:hover": { bgcolor: "#00a548" } }}
        >
          <Print /> Download PDF
        </Button>
                <Button
          variant="contained"
          color="primary"
          onClick={handleGenerateSchedulePDF}
          sx={{ bgcolor: greenAccent, color: "#000", "&:hover": { bgcolor: "#00a548" } }}
        >
          <Print /> Download Exam Schedule
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
            Subject Name
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.5, fontWeight: "bold", color: "#fff" }}>
            Action
          </Typography>
        </Box>
        <Box sx={{ height: "80vh", overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
          <List>
            {subjects.length > 0 ? (
              subjects.map((subject) => (
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
                No subjects found for {className.toUpperCase()}.
              </Typography>
            )}
          </List>
        </Box>
      </Box>

      <BoardExamsDialog
        open={openDialog}
        onClose={handleCloseDialog}
        classSubject={selectedSubject}
        className={className}
        academicYear={academicYear}
        month={selectedMonth}
      />
    </Box>
  );
};

export default BoardExamResultManagement;
