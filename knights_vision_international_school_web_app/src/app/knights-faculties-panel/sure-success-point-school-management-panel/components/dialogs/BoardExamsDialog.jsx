import React, { useState, useEffect } from "react";
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
import { CalendarToday, Close, Print } from "@mui/icons-material";
import { toast } from "react-toastify";
import BoardExamResultsDialog from "./BoardExamResultsDialog";
import jsPDF from "jspdf";
import "jspdf-autotable";

const drawerWidth = 280;
const appBarHeight = 64;

const BoardExamsDialog = ({
  open,
  onClose,
  classSubject,
  className,
  academicYear,
  month,
  monthlyBoardExams = [],
  monthlyStudents = [],
  onRefresh,
}) => {
  const [boardExams, setBoardExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [createBoardExamDialogOpen, setCreateBoardExamDialogOpen] = useState(false);
  const [boardExamResultsDialogOpen, setBoardExamResultsDialogOpen] = useState(false);
  const [selectedBoardExam, setSelectedBoardExam] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (!open || !classSubject) return;
    setExamsLoading(true);
    setBoardExams(Array.isArray(monthlyBoardExams) ? monthlyBoardExams : []);
    setStudents(Array.isArray(monthlyStudents) ? monthlyStudents : []);
    setExamsLoading(false);
  }, [classSubject, monthlyBoardExams, monthlyStudents, open]);

  const handleOpenCreateBoardExamDialog = () => {
    setCreateBoardExamDialogOpen(true);
  };


  const handleOpenBoardExamResultsDialog = (boardExam) => {
    setSelectedBoardExam(boardExam);
    setBoardExamResultsDialogOpen(true);
  };

  const handleCloseBoardExamResultsDialog = () => {
    setBoardExamResultsDialogOpen(false);
    setSelectedBoardExam(null);
    onRefresh?.();
  };

  const handleDownloadSubjectSchedule = () => {
    if (!boardExams.length) {
      toast.info(`No ${month} schedule is available for this subject yet.`);
      return;
    }
    try {
      const doc = new jsPDF();
      const subjectName = classSubject?.subject?.name || "Subject";
      doc.setFillColor(0, 150, 136);
      doc.rect(0, 0, doc.internal.pageSize.width, 36, "F");
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text(`WB Test Preparation Series - ${subjectName}`, 14, 18);
      doc.setFontSize(10);
      doc.text(`Class ${className.toUpperCase()} | ${month} ${academicYear}`, 14, 27);
      doc.autoTable({
        head: [["Title", "Syllabus", "Exam Date", "Total Marks"]],
        body: boardExams.map((exam) => [
          exam.title || "WB Test Preparation Series",
          exam.syllabus || "-",
          new Date(exam.examDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
          exam.totalMarks ?? "-",
        ]),
        startY: 44,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [0, 150, 136], textColor: [255, 255, 255] },
      });
      doc.save(`wb_test_preparation_${className}_${subjectName}_${month}_${academicYear}.pdf`);
      toast.success("Subject schedule downloaded.");
    } catch (error) {
      console.error("Error generating subject schedule PDF:", error);
      toast.error("Failed to generate the subject schedule PDF.");
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
          <CalendarToday sx={{ color: "#fff" }} />
        </ListItemIcon>
        <ListItemText
          sx={{ color: "#fff" }}
          primary={`Board Exams for ${classSubject?.subject.name || "Unknown"} - ${className}`}
        />
        <Box>
          <Button
            variant="outlined"
            onClick={handleDownloadSubjectSchedule}
            disabled={!boardExams.length}
            startIcon={<Print />}
            sx={{ mr: 1, color: "#fff", borderColor: "#fff", "&:hover": { borderColor: "#b2dfdb" } }}
          >
            Download This Schedule
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={()=>toast.warn("Permission Denied...")}
            sx={{ mr: 1, bgcolor: "#00c757", color: "#000", "&:hover": { bgcolor: "#00a548" } }}
          >
            Create Board Exam
          </Button>
          <IconButton onClick={onClose} sx={{ color: "#f44336" }}>
            <Close sx={{ color: "#fff" }} />
          </IconButton>
        </Box>
      </ListItemButton>
      <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#222", color: "#fff" }}>
        <Box sx={{ flex: 1, overflowY: "auto", maxHeight: "87vh" }}>
          <DialogContent sx={{ bgcolor: "#000", color: "#fff" }}>
            {examsLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                <CircularProgress size={120} sx={{ color: "#00c757" }} />
              </Box>
            ) : (
              <Table sx={{ bgcolor: "#181818" }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#333" }}>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Title</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Syllabus</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Exam Date</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Total Marks</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {boardExams.length > 0 ? (
                    boardExams.map((exam) => (
                      <TableRow key={exam.id} sx={{ bgcolor: "#181818", "&:hover": { bgcolor: "#222" } }}>
                        <TableCell sx={{ color: "#fff" }}>{exam.title}</TableCell>
                        <TableCell sx={{ color: "#fff" }}>{exam.syllabus || "N/A"}</TableCell>
                        <TableCell sx={{ color: "#fff" }}>
                          {new Date(exam.examDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell sx={{ color: "#fff" }}>{exam.totalMarks}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => handleOpenBoardExamResultsDialog(exam)}
                            sx={{ color: "#00c757", borderColor: "#00c757" }}
                          >
                            Update Results
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ color: "#fff", textAlign: "center" }}>
                        No board exams found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </DialogContent>
          <DialogActions sx={{ bgcolor: "#000" }}>
            <Button onClick={onClose} variant="contained" color="error" sx={{ color: "#fff" }}>
              Close
            </Button>
          </DialogActions>
        </Box>
      </Box>
      <BoardExamResultsDialog
        open={boardExamResultsDialogOpen}
        onClose={handleCloseBoardExamResultsDialog}
        boardExam={selectedBoardExam}
        students={students}
        className={className}
        fetchBoardExams={onRefresh}
      />
    </Dialog>
  );
};

export default BoardExamsDialog;
