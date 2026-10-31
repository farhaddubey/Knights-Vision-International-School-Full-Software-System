"use client";

import React, { useCallback, useEffect, useState } from "react";
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
import MonthlyBoardExamResultsDialog from "./dialogs/MonthlyBoardExamResultsDialog";
import jsPDF from "jspdf";
import "jspdf-autotable";

const drawerWidth = 280;
const appBarHeight = 64;
const greenAccent = "#00c853";

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

const getSeriesMonths = (className) =>
  className?.toUpperCase() === 'XS'
    ? monthNames.slice(0, 2)
    : monthNames.slice(6, 12);

const getDefaultSeriesPeriod = (className, now = new Date()) => {
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  if (className?.toUpperCase() === 'XS') {
    return month <= 2
      ? { monthName: monthNames[month - 1], academicYear: year - 1 }
      : { monthName: 'January', academicYear: year };
  }
  return {
    monthName: month >= 7 ? monthNames[month - 1] : 'July',
    academicYear: month >= 4 ? year : year - 1,
  };
};

const isWbSeriesSubject = (classSubject) =>
  wbSeriesSubjectNames.has(classSubject?.subject?.name?.trim().toLowerCase());

const scheduledExamsForSubject = (subject) => {
  if (Array.isArray(subject?.scheduledExams)) return subject.scheduledExams;
  return subject?.scheduledExam ? [subject.scheduledExam] : [];
};

const formatExamDate = (value) => new Date(value).toLocaleDateString("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const BoardExamResultManagement = ({ className }) => {
  const defaultPeriod = getDefaultSeriesPeriod(className);
  const [subjects, setSubjects] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(defaultPeriod.monthName);
  const [academicYear, setAcademicYear] = useState(defaultPeriod.academicYear);
  const [seriesSnapshot, setSeriesSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openMonthlyDialog, setOpenMonthlyDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const fetchSubjects = useCallback(async () => {
    const normalizedClassName = className?.toUpperCase();
    if (!validClassNames.includes(normalizedClassName)) {
      setError('Invalid class name');
      setLoading(false);
      return;
    }
    const token = Cookies.get("faculties_token");
    if (!token) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setSeriesSnapshot(null);
      const month = monthNames.indexOf(selectedMonth) + 1;
      const response = await axios.get(`/api-schools-panel/wb-test-preparation/${normalizedClassName.toLowerCase()}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { academicYear, month },
      });
      if (!response.data || !Array.isArray(response.data.subjects)) {
        throw new Error("Invalid response format");
      }
      setSubjects(response.data.subjects.filter(isWbSeriesSubject));
      setSeriesSnapshot(response.data);
    } catch (err) {
      setError(err.response?.data?.error || `Failed to fetch subjects for ${className.toUpperCase()}.`);
      toast.error(`Failed to fetch subjects for ${className.toUpperCase()}.`);
    } finally {
      setLoading(false);
    }
  }, [academicYear, className, selectedMonth]);

  useEffect(() => {
    const normalizedClassName = className?.toUpperCase();
    const period = getDefaultSeriesPeriod(normalizedClassName);
    setSelectedMonth(period.monthName);
    setAcademicYear(period.academicYear);
    setSeriesSnapshot(null);
  }, [className]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleOpenDialog = (subject) => {
    setSelectedSubject(subject);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSubject(null);
  };

  const handleOpenMonthlyDialog = () => {
    setOpenMonthlyDialog(true);
  };

  const handleCloseMonthlyDialog = () => {
    setOpenMonthlyDialog(false);
  };

  const handleGeneratePDF = async () => {
    const token = Cookies.get("faculties_token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }
    try {
      if (!seriesSnapshot) {
        toast.error("The monthly schedule is still loading. Please try again in a moment.");
        return;
      }
      const { subjects: snapshotSubjects, students, boardExams } = seriesSnapshot;
      const subjects = snapshotSubjects.filter(isWbSeriesSubject);

      const doc = new jsPDF();

      doc.setFillColor(33, 33, 33);
      doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');

      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text(`Board Exam Results - ${className.toUpperCase()} (${academicYear}, ${selectedMonth})`, 14, 20);

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

      const body = students.map((student) => [
        { content: student.studentName, styles: { halign: 'left', fillColor: [24, 24, 24], textColor: [255, 255, 255] } },
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

      doc.autoTable({
        head,
        body,
        startY: 30,
        theme: 'plain',
        styles: {
          fontSize: 10,
          cellPadding: 2,
          textColor: [255, 255, 255],
          fillColor: [24, 24, 24],
          lineColor: [85, 85, 85],
          lineWidth: 0.5,
        },
        headStyles: {
          fillColor: [51, 51, 51],
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

  const handleGenerateSchedulePDF = () => {
    if (!seriesSnapshot) {
      toast.error("The monthly schedule is still loading. Please try again in a moment.");
      return;
    }

    const subjectNames = new Map(seriesSnapshot.subjects.map((subject) => [
      subject.id,
      subject.subjectName || subject.subject?.name || "-",
    ]));
    const scheduledExams = seriesSnapshot.boardExams || [];
    if (!scheduledExams.length) {
      toast.info(`No ${selectedMonth} schedule is available to download yet.`);
      return;
    }

    try {
      const doc = new jsPDF();
      const classInfo = seriesSnapshot.classInfo;
      // Keep this printable schedule white. The panel stays dark, while the
      // downloaded A4 sheet remains clear, economical, and school-ready.
      doc.setFillColor(0, 137, 123);
      doc.rect(0, 0, doc.internal.pageSize.width, 5, "F");
      doc.setFontSize(16);
      doc.setTextColor(18, 53, 88);
      doc.text(`Knights WB Test Preparation Series - Class ${className.toUpperCase()}`, 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(46, 91, 125);
      doc.text(`${classInfo?.schoolName || "Sure Success Point School"} - ${classInfo?.branchName || "Assigned Branch"}`, 14, 28);
      doc.setTextColor(55, 55, 55);
      doc.text(`Monthly Schedule: ${selectedMonth} ${academicYear}`, 14, 34);
      doc.autoTable({
        head: [["Subject", "Scheduled Date", "Title", "Total Marks"]],
        body: scheduledExams.map((exam) => [
          subjectNames.get(exam.classSubjectId) || "-",
          formatExamDate(exam.examDate),
          exam.title || "WB Test Preparation Series",
          exam.totalMarks ?? "-",
        ]),
        startY: 42,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 3, textColor: [22, 22, 22], fillColor: [255, 255, 255], lineColor: [190, 206, 218], lineWidth: 0.2 },
        headStyles: { fillColor: [18, 53, 88], textColor: [255, 255, 255], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [239, 247, 250] },
      });
      doc.save(`wb_test_preparation_schedule_${className}_${selectedMonth}_${academicYear}.pdf`);
      toast.success(`Monthly schedule downloaded for ${selectedMonth} ${academicYear}.`);
    } catch (err) {
      console.error("Error generating monthly schedule PDF:", err);
      toast.error("Failed to generate the monthly schedule PDF.");
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
          secondary={seriesSnapshot?.classInfo
            ? `${seriesSnapshot.classInfo.schoolName} · ${seriesSnapshot.classInfo.branchName} · ${selectedMonth} ${academicYear}`
            : "Loading your assigned institution, branch, and monthly schedule…"}
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
          onClick={handleGenerateSchedulePDF}
          sx={{ bgcolor: greenAccent, color: "#000", "&:hover": { bgcolor: "#00a548" } }}
        >
          <Print /> Download Monthly Schedule
        </Button>
        <Button
          variant="outlined"
          onClick={handleGeneratePDF}
          sx={{ color: "#81e6b2", borderColor: "#81e6b2", "&:hover": { borderColor: "#00c853" } }}
        >
          <Print /> Download Monthly Results
        </Button>
        <Button
          variant="outlined"
          color="info"
          onClick={handleOpenMonthlyDialog}
          sx={{ color: "#03a9f4", borderColor: "#03a9f4", textTransform: "none" }}
        >
          View Monthly Results
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
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Scheduled On
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
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {scheduledExamsForSubject(subject).length ? (
                      scheduledExamsForSubject(subject).map((exam) => (
                        <Typography key={exam.id} variant="body2" sx={{ color: "#81e6b2" }}>
                          {formatExamDate(exam.examDate)}
                          {scheduledExamsForSubject(subject).length > 1 ? ` · ${exam.title.includes("Round 2") ? "Round 2" : "Round 1"}` : ""}
                        </Typography>
                      ))
                    ) : (
                      <Typography variant="body2" sx={{ color: "#ffcc80" }}>
                        Not scheduled for this month
                      </Typography>
                    )}
                  </Box>
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
        monthlyBoardExams={seriesSnapshot?.boardExams?.filter((exam) => exam.classSubjectId === selectedSubject?.id) || []}
        monthlyStudents={seriesSnapshot?.students || []}
        onRefresh={fetchSubjects}
      />
      <MonthlyBoardExamResultsDialog
        open={openMonthlyDialog}
        onClose={handleCloseMonthlyDialog}
        className={className}
        selectedMonth={selectedMonth}
        academicYear={academicYear}
        monthlyData={seriesSnapshot}
      />
    </Box>
  );
};

export default BoardExamResultManagement;
