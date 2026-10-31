"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { CalendarToday, Close } from "@mui/icons-material";
import { toast } from "react-toastify";

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
  "& .MuiInputBase-input.Mui-disabled": {
    color: "#fff !important",
    WebkitTextFillColor: "#fff !important", // Ensure disabled text is white
  },
};

const UpdateStudentAssignmentsDialog = ({
  open,
  onClose,
  selectedAssignment,
  students,
  fetchAssignments,
  className,
}) => {
  const [studentAssignments, setStudentAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && selectedAssignment?.id) {
      fetchStudentAssignments();
    }
  }, [open, selectedAssignment]);

  const fetchStudentAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/Assignments/${className.toLowerCase()}/student-assignments`,
        {
          params: { assignmentId: selectedAssignment.id },
        }
      );
      const existingAssignments = response.data.studentAssignments || [];

      // Merge existing assignments with students, creating placeholders for students without records
      const mergedAssignments = students.map((student) => {
        const existing = existingAssignments.find(
          (sa) => sa.studentId === student.id
        );
        return existing
          ? {
              studentId: existing.studentId,
              isSubmitted: existing.isSubmitted,
              marksObtained: existing.marksObtained ?? "",
              remarks: existing.remarks ?? "",
              qualityTag: existing.qualityTag ?? "",
            }
          : {
              studentId: student.id,
              isSubmitted: false,
              marksObtained: "",
              remarks: "",
              qualityTag: "",
            };
      });

      setStudentAssignments(mergedAssignments);
    } catch (err) {
      console.error("Error fetching student assignments:", err.message);
      toast.error("Failed to fetch student assignments: " + (err.response?.data?.error || err.message));
      setStudentAssignments(
        students.map((student) => ({
          studentId: student.id,
          isSubmitted: false,
          marksObtained: "",
          remarks: "",
          qualityTag: "",
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStudentAssignmentChange = (index, field, value) => {
    const updatedAssignments = [...studentAssignments];
    updatedAssignments[index][field] = value;
    setStudentAssignments(updatedAssignments);
  };

  const handleSave = async () => {
    const invalidAssignments = studentAssignments.filter(
      (sa) =>
        sa.isSubmitted &&
        (sa.marksObtained === "" ||
          isNaN(sa.marksObtained) ||
          sa.marksObtained < 0 ||
          sa.marksObtained > 3)
    );
    if (invalidAssignments.length > 0) {
      toast.error("Invalid marks: Must be between 0 and 3 for submitted assignments.");
      return;
    }

    try {
      const payload = {
        assignmentId: selectedAssignment.id,
        studentAssignments: studentAssignments.map((sa) => ({
          studentId: sa.studentId,
          isSubmitted: sa.isSubmitted,
          marksObtained: sa.isSubmitted ? parseFloat(sa.marksObtained) || null : null,
          remarks: sa.remarks || null,
          qualityTag: sa.qualityTag || null,
        })),
      };

      const response = await axios.post(
        `/api/Assignments/${className.toLowerCase()}/student-assignments/batch`,
        payload
      );
      if (response.status === 200) {
        toast.success("Student assignments updated successfully.");
        fetchAssignments(selectedAssignment.classSubjectId);
        onClose();
      } else {
        throw new Error("Unexpected response status: " + response.status);
      }
    } catch (err) {
      console.error("Batch Update Student Assignments Error:", err.message);
      toast.error("Failed to update student assignments: " + (err.response?.data?.error || err.message));
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
          primary={`Update Student Assignments for ${selectedAssignment?.title || "Unknown"} - ${className}`}
        />
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
        <Box sx={{ flex: 1, overflowY: "auto", maxHeight: "80vh" }}>
          <DialogContent sx={{ bgcolor: "#000", color: "#fff" }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                <CircularProgress size={120} sx={{ color: "#00c757" }} />
              </Box>
            ) : (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Student Assignment Updates
                </Typography>
                {studentAssignments.length === 0 ? (
                  <Typography sx={{ color: "#fff", textAlign: "center" }}>
                    No students found for this assignment.
                  </Typography>
                ) : (
                  studentAssignments.map((sa, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr 1fr",
                        gap: 2,
                        mb: 2,
                        p: 2,
                        bgcolor: "#222",
                        borderRadius: 1,
                      }}
                    >
                      <TextField
                        label="Student"
                        value={`${students[index]?.firstName || "Unknown"} ${students[index]?.lastName || ""}`}
                        disabled
                        sx={{ ...textFieldStyles }}
                      />
                      <FormControl sx={{ ...textFieldStyles }}>
                        <InputLabel sx={{ color: "#aaa" }}>Submitted</InputLabel>
                        <Select
                          value={sa.isSubmitted}
                          onChange={(e) => handleStudentAssignmentChange(index, "isSubmitted", e.target.value)}
                        >
                          <MenuItem value={true}>Yes</MenuItem>
                          <MenuItem value={false}>No</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        label="Marks Obtained (0-3)"
                        type="number"
                        value={sa.marksObtained}
                        onChange={(e) => handleStudentAssignmentChange(index, "marksObtained", e.target.value)}
                        disabled={!sa.isSubmitted}
                        sx={{ ...textFieldStyles }}
                      />
                      <TextField
                        label="Remarks"
                        value={sa.remarks}
                        onChange={(e) => handleStudentAssignmentChange(index, "remarks", e.target.value)}
                        multiline
                        rows={2}
                        sx={{ ...textFieldStyles }}
                      />
                      <FormControl sx={{ ...textFieldStyles }}>
                        <InputLabel sx={{ color: "#aaa" }}>Quality Tag</InputLabel>
                        <Select
                          value={sa.qualityTag}
                          onChange={(e) => handleStudentAssignmentChange(index, "qualityTag", e.target.value)}
                          disabled={!sa.isSubmitted}
                        >
                          <MenuItem value="">None</MenuItem>
                          <MenuItem value="EXCELLENT">Excellent</MenuItem>
                          <MenuItem value="GOOD">Good</MenuItem>
                          <MenuItem value="NEEDS_IMPROVEMENT">Needs Improvement</MenuItem>
                          <MenuItem value="PLAGIARIZED">Plagiarized</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  ))
                )}
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ bgcolor: "#000" }}>
            <Button onClick={onClose} variant="contained" color="error">
              Cancel
            </Button>
            <Button onClick={handleSave} sx={{ color: "#00c757" }} disabled={loading}>
              Save
            </Button>
          </DialogActions>
        </Box>
      </Box>
    </Dialog>
  );
};

export default UpdateStudentAssignmentsDialog;
