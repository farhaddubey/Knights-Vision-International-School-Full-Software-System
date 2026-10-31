import React, { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  CircularProgress,
} from "@mui/material";
import { CalendarToday, Close, Add, Delete } from "@mui/icons-material";
import { toast } from "react-toastify";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import textFieldStyles from "../../../../mui_styles/TextFieldStyles";

const drawerWidth = 280;
const appBarHeight = 64;

// Inline DatePicker styles for dark theme with white text
const datePickerStyles = {
  "& .MuiInputBase-input": { color: "#fff" },
  "& .MuiInputLabel-root": { color: "#aaa" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#fff" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#555" },
    "&:hover fieldset": { borderColor: "#777" },
    "&.Mui-focused fieldset": { borderColor: "#00c757" },
    "& .MuiSvgIcon-root": { color: "#fff" },
  },
  "& .MuiPickersPopper-root": {
    "& .MuiPaper-root": {
      backgroundColor: "#222",
      color: "#fff",
    },
    "& .MuiPickersCalendarHeader-label": { color: "#fff" },
    "& .MuiDayPicker-weekDayLabel": { color: "#fff" },
    "& .MuiPickersDay-root": {
      color: "#fff",
      backgroundColor: "#222",
      "&:hover": { backgroundColor: "#666" },
      "&.Mui-selected": {
        backgroundColor: "#00c757",
        color: "#fff",
        "&:hover": { backgroundColor: "#00a548" },
      },
      "&.Mui-disabled": { color: "#666" },
    },
    "& .MuiPickersArrowSwitcher-button": { color: "#fff" },
  },
};

const CreateBoardExamDialog = ({ open, onClose, classSubject, className, academicYear, month }) => {
  const [boardExams, setBoardExams] = useState([
    {
      title: "",
      syllabus: "",
      examDate: null,
      totalMarks: 100,
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleBoardExamChange = (index, field, value) => {
    const updatedBoardExams = [...boardExams];
    updatedBoardExams[index][field] = value;
    setBoardExams(updatedBoardExams);
  };

  const addBoardExam = () => {
    setBoardExams([
      ...boardExams,
      {
        title: "",
        syllabus: "",
        examDate: null,
        totalMarks: 100,
      },
    ]);
  };

  const removeBoardExam = (index) => {
    if (boardExams.length === 1) {
      toast.error("At least one board exam is required.");
      return;
    }
    setBoardExams(boardExams.filter((_, i) => i !== index));
  };

  const handleCreateBoardExams = async () => {
    if (!classSubject) {
      toast.error("No class subject selected.");
      return;
    }

    const invalidExams = boardExams.some(
      (exam) => !exam.title || !exam.examDate || !exam.totalMarks
    );
    if (invalidExams) {
      toast.error("Title, exam date, and total marks are required for each board exam.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        boardExams: boardExams.map((exam) => ({
          classSubjectId: classSubject.id,
          title: exam.title,
          syllabus: exam.syllabus || null,
          examDate: exam.examDate.toISOString().slice(0, 10),
          totalMarks: parseInt(exam.totalMarks),
          academicYear,
        })),
      };

      console.log("Sending payload:", JSON.stringify(payload, null, 2));

      const response = await axios.post(`/api/BoardExams/${className.toLowerCase()}/board-exams/batch`, payload);
      if (response.status === 200) {
        toast.success("Board exams created successfully.");
        onClose();
      } else {
        throw new Error("Unexpected response status: " + response.status);
      }
    } catch (err) {
      console.error("Create Batch Board Exams Error:", err.message);
      toast.error("Failed to create board exams: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
            primary={`Create Board Exams for ${classSubject?.subject.name || "Unknown"} - ${className}`}
          />
          <Button
            onClick={onClose}
            variant="outlined"
            color="error"
            sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
          >
            <Close sx={{ color: "#fff" }} />
          </Button>
        </ListItemButton>
        <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#222", color: "#fff" }}>
          <Box sx={{ flex: 1, overflowY: "auto", maxHeight: "87vh" }}>
            <DialogContent sx={{ bgcolor: "#000", color: "#fff" }}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                  <CircularProgress size={120} sx={{ color: "#00c757" }} />
                </Box>
              ) : (
                <>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<Add sx={{ color: "#fff" }} />}
                      onClick={addBoardExam}
                      sx={{ bgcolor: "#00c757", color: "#fff", "&:hover": { bgcolor: "#00a548" } }}
                    >
                      Add Board Exam
                    </Button>
                  </Box>
                  {boardExams.map((exam, index) => (
                    <Box
                      key={index}
                      sx={{ mb: 3, p: 2, bgcolor: "#000", borderRadius: 1 }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography variant="h6" sx={{ color: "#fff" }}>
                          Board Exam {index + 1}
                        </Typography>
                        <IconButton
                          onClick={() => removeBoardExam(index)}
                          sx={{ color: "#f44336" }}
                          disabled={boardExams.length === 1}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                        <TextField
                          label="Title"
                          value={exam.title}
                          onChange={(e) => handleBoardExamChange(index, "title", e.target.value)}
                          sx={{ ...textFieldStyles }}
                        />
                        <TextField
                          label="Syllabus"
                          value={exam.syllabus}
                          onChange={(e) => handleBoardExamChange(index, "syllabus", e.target.value)}
                          multiline
                          rows={3}
                          sx={{ ...textFieldStyles }}
                          placeholder="e.g., Algebra, Geometry"
                        />
                        <Box sx={{ bgcolor: "#666", display: "block" }}>
                          <DatePicker
                            label="Exam Date"
                            value={exam.examDate}
                            onChange={(date) => handleBoardExamChange(index, "examDate", date)}
                            slotProps={{ textField: { sx: datePickerStyles } }}
                          />
                        </Box>
                        <TextField
                          label="Total Marks"
                          value={exam.totalMarks}
                          onChange={(e) => handleBoardExamChange(index, "totalMarks", e.target.value)}
                          type="number"
                          sx={{ ...textFieldStyles }}
                          placeholder="e.g., 100"
                        />
                      </Box>
                    </Box>
                  ))}
                </>
              )}
            </DialogContent>
            <DialogActions sx={{ bgcolor: "#000" }}>
              <Button onClick={onClose} variant="contained" color="error" sx={{ color: "#fff" }} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleCreateBoardExams} sx={{ color: "#00c757" }} disabled={loading}>
                Save All
              </Button>
            </DialogActions>
          </Box>
        </Box>
      </Dialog>
    </LocalizationProvider>
  );
};

export default CreateBoardExamDialog;