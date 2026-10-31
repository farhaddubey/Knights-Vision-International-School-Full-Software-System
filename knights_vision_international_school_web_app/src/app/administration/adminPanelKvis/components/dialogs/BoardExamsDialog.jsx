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
import { CalendarToday, Close } from "@mui/icons-material";
import { toast } from "react-toastify";
import CreateBoardExamDialog from "./CreateBoardExamDialog";
import BoardExamResultsDialog from "./BoardExamResultsDialog";

const drawerWidth = 280;
const appBarHeight = 64;

const BoardExamsDialog = ({ open, onClose, classSubject, className, academicYear, month }) => {
  const [boardExams, setBoardExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [createBoardExamDialogOpen, setCreateBoardExamDialogOpen] = useState(false);
  const [boardExamResultsDialogOpen, setBoardExamResultsDialogOpen] = useState(false);
  const [selectedBoardExam, setSelectedBoardExam] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (classSubject) {
      fetchBoardExams(classSubject.id);
      fetchStudents(classSubject.classId);
    }
  }, [classSubject]);

  const fetchBoardExams = async (classSubjectId) => {
    try {
      setExamsLoading(true);
      const response = await axios.get(`/api/BoardExams/${className.toLowerCase()}/board-exams`, {
        params: { classSubjectId, academicYear, month },
      });
      setBoardExams(response.data.boardExams || []);
    } catch (err) {
      console.error("Error fetching board exams:", err.message);
      toast.error("Failed to fetch board exams.");
      setBoardExams([]);
    } finally {
      setExamsLoading(false);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      const response = await axios.get(`/api/BoardExams/${className.toLowerCase()}/students/${classId}`);
      setStudents(response.data.students || []);
    } catch (err) {
      console.error("Error fetching students:", err.message);
      toast.error("Failed to fetch students.");
      setStudents([]);
    }
  };

  const handleOpenCreateBoardExamDialog = () => {
    setCreateBoardExamDialogOpen(true);
  };

  const handleCloseCreateBoardExamDialog = () => {
    setCreateBoardExamDialogOpen(false);
    fetchBoardExams(classSubject.id);
  };

  const handleOpenBoardExamResultsDialog = (boardExam) => {
    setSelectedBoardExam(boardExam);
    setBoardExamResultsDialogOpen(true);
  };

const handleDeleteBoardExam = async (boardExamId) => {
  try {
    const res = await fetch("/api/BoardExams/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: boardExamId }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Delete error:", data.error);
      alert("❌ Failed to delete exam: " + data.error);
      return;
    }

    alert("✅ " + data.message);

    // Optional: Refresh list or remove deleted exam from state
    setBoardExams((prev) => prev.filter((exam) => exam.id !== boardExamId));
  } catch (err) {
    console.error("Unexpected error:", err);
    alert("❌ Something went wrong!");
  }
};


  const handleCloseBoardExamResultsDialog = () => {
    setBoardExamResultsDialogOpen(false);
    setSelectedBoardExam(null);
    fetchBoardExams(classSubject.id);
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
            variant="contained"
            color="primary"
            onClick={handleOpenCreateBoardExamDialog}
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
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Student Actions</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Test Actions</TableCell>
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
                        <TableCell>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() =>     handleDeleteBoardExam(exam.id)}
                          >
                            Delete
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

      <CreateBoardExamDialog
        open={createBoardExamDialogOpen}
        onClose={handleCloseCreateBoardExamDialog}
        classSubject={classSubject}
        className={className}
        academicYear={academicYear}
        month={month}
      />
      <BoardExamResultsDialog
        open={boardExamResultsDialogOpen}
        onClose={handleCloseBoardExamResultsDialog}
        boardExam={selectedBoardExam}
        students={students}
        className={className}
        fetchBoardExams={fetchBoardExams}
      />
    </Dialog>
  );
};

export default BoardExamsDialog;