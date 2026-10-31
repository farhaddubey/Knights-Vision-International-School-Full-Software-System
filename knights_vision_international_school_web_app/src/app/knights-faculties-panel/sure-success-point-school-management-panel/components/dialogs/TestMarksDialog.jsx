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

const TestMarksDialog = ({ open, onClose, test, students, className, fetchTests }) => {
  const [testMarks, setTestMarks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && test?.id) {
      fetchTestMarks(test.id);
    }
  }, [open, test]);

  const fetchTestMarks = async (testId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api-schools-panel/class_teachers_panel/Tests/${className.toLowerCase()}/test-marks`, {
        params: { testId },
      });
      const existingTestMarks = response.data.testMarks || [];

      // Merge existing test marks with students, creating placeholders for students without records
      const mergedTestMarks = students.map((student) => {
        const existing = existingTestMarks.find((tm) => tm.studentId === student.id);
        return existing
          ? {
              studentId: existing.studentId,
              marks: existing.marks ?? "",
              maxMarks: existing.maxMarks || 30,
              remarks: existing.remarks ?? "",
            }
          : {
              studentId: student.id,
              marks: "",
              maxMarks: 30,
              remarks: "",
            };
      });

      setTestMarks(mergedTestMarks);
    } catch (err) {
      console.error("Error fetching test marks:", err.message);
      toast.error("Failed to fetch test marks: " + (err.response?.data?.error || err.message));
      setTestMarks(
        students.map((student) => ({
          studentId: student.id,
          marks: "",
          maxMarks: 30,
          remarks: "",
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTestMarkChange = (index, field, value) => {
    const updatedTestMarks = [...testMarks];
    updatedTestMarks[index][field] = value;
    setTestMarks(updatedTestMarks);
  };

  const handleSave = async () => {
    const invalidTestMarks = testMarks.filter(
      (tm) =>
        tm.marks !== "" &&
        (isNaN(tm.marks) || tm.marks < 0 || tm.marks > (tm.maxMarks || 30))
    );
    if (invalidTestMarks.length > 0) {
      toast.error("Invalid marks: Must be between 0 and 30.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        testId: test.id,
        testMarks: testMarks.map((tm) => ({
          studentId: tm.studentId,
          marks: tm.marks !== "" ? parseFloat(tm.marks) : null,
          maxMarks: parseInt(tm.maxMarks) || 30,
          remarks: tm.remarks || null,
        })),
      };

      const response = await axios.post(`/api-schools-panel/class_teachers_panel/Tests/${className.toLowerCase()}/test-marks/batch`, payload);
      if (response.status === 200) {
        toast.success("Test marks updated successfully.");
        fetchTests(test.classSubjectId);
        onClose();
      } else {
        throw new Error("Unexpected response status: " + response.status);
      }
    } catch (err) {
      console.error("Batch Update Test Marks Error:", err.message);
      toast.error("Failed to update test marks: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
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
          primary={`Update Marks for ${test?.title || "Unknown"} - ${className}`}
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
          <Box sx={{ bgcolor: "#000", color: "#fff" }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                <CircularProgress size={120} sx={{ color: "#00c757" }} />
              </Box>
            ) : (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Test Marks Updates
                </Typography>
                {testMarks.length === 0 ? (
                  <Typography sx={{ color: "#fff", textAlign: "center" }}>
                    No students found for this test.
                  </Typography>
                ) : (
                  testMarks.map((tm, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
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
                      <TextField
                        label="Marks (0-30)"
                        type="number"
                        value={tm.marks}
                        onChange={(e) => handleTestMarkChange(index, "marks", e.target.value)}
                        inputProps={{ min: 0, max: tm.maxMarks || 30 }}
                        sx={{ ...textFieldStyles }}
                      />
                      <TextField
                        label="Remarks"
                        value={tm.remarks}
                        onChange={(e) => handleTestMarkChange(index, "remarks", e.target.value)}
                        multiline
                        rows={2}
                        sx={{ ...textFieldStyles }}
                      />
                    </Box>
                  ))
                )}
              </>
            )}
          </Box>
          <DialogActions sx={{ bgcolor: "#000" }}>
            <Button onClick={onClose} variant="contained" color="error" disabled={loading}>
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

export default TestMarksDialog;