"use client";

import React from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemButton,
  ListItemIcon,
  ListItemText,
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
};

const StudentAssignmentsDialog = ({
  open,
  onClose,
  selectedAssignment,
  studentAssignments,
  setStudentAssignments,
  fetchAssignments,
  selectedClassSubject,
  setLoading,
  className,
}) => {
  const handleStudentAssignmentChange = (index, field, value) => {
    const updatedStudentAssignments = [...studentAssignments];
    updatedStudentAssignments[index][field] = value;
    if (field === "isSubmitted" && !value) {
      updatedStudentAssignments[index].marksObtained = null;
      updatedStudentAssignments[index].remarks = "";
      updatedStudentAssignments[index].qualityTag = null;
    }
    setStudentAssignments(updatedStudentAssignments);
  };

  const handleUpdateStudentAssignments = async () => {
    try {
      setLoading(true);
      const payload = studentAssignments.map((sa) => ({
        id: sa.id,
        isSubmitted: sa.isSubmitted,
        submittedAt: sa.isSubmitted ? new Date().toISOString() : null,
        marksObtained: sa.isSubmitted ? parseInt(sa.marksObtained) || null : null,
        remarks: sa.isSubmitted ? sa.remarks || null : null,
        qualityTag: sa.isSubmitted ? sa.qualityTag || null : null,
      }));

      await axios.put(`/api/Assignments/${className.toLowerCase()}/student-assignments`, { studentAssignments: payload });
      toast.success("Student assignments updated successfully.");
      fetchAssignments(selectedClassSubject.id);
      onClose();
    } catch (err) {
      console.error("Update Student Assignments Error:", err.message);
      toast.error("Failed to update student assignments: " + (err.response?.data?.error || err.message));
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
          primary={`Update Submissions for ${selectedAssignment?.title || "Unknown"} - ${className}`}
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
      <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#000", color: "#fff", p: 2 }}>
        <Box sx={{ flex: 1, overflowY: "auto", pr: 1, maxHeight: "80vh" }}>
          <DialogContent sx={{ bgcolor: "#000", color: "#fff" }}>
            <Table sx={{ bgcolor: "#181818" }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "#333" }}>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Student</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Submitted</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Marks (0-3)</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Remarks</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Quality Tag</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studentAssignments.length > 0 ? (
                  studentAssignments.map((sa, index) => (
                    <TableRow key={sa.id} sx={{ bgcolor: "#181818", "&:hover": { bgcolor: "#222" } }}>
                      <TableCell sx={{ color: "#fff" }}>{`${sa.student.firstName} ${sa.student.lastName}`}</TableCell>
                      <TableCell>
                        <Checkbox
                          checked={sa.isSubmitted}
                          onChange={(e) => handleStudentAssignmentChange(index, "isSubmitted", e.target.checked)}
                          sx={{ color: "#fff", "&.Mui-checked": { color: "#00c757" } }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={sa.marksObtained || ""}
                          onChange={(e) => handleStudentAssignmentChange(index, "marksObtained", e.target.value)}
                          disabled={!sa.isSubmitted}
                          inputProps={{ min: 0, max: 3 }}
                          sx={{ ...textFieldStyles, width: "80px" }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={sa.remarks || ""}
                          onChange={(e) => handleStudentAssignmentChange(index, "remarks", e.target.value)}
                          disabled={!sa.isSubmitted}
                          multiline
                          rows={2}
                          sx={{ ...textFieldStyles }}
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl sx={{ ...textFieldStyles, minWidth: "150px" }}>
                          <InputLabel sx={{ color: "#aaa" }}>Quality Tag</InputLabel>
                          <Select
                            value={sa.qualityTag || ""}
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
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ color: "#fff", textAlign: "center" }}>
                      No student assignments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions sx={{ bgcolor: "#000" }}>
            <Button onClick={onClose} variant="contained" color="error">
              Cancel
            </Button>
            <Button onClick={handleUpdateStudentAssignments} sx={{ color: "#00c757" }}>
              Save
            </Button>
          </DialogActions>
        </Box>
      </Box>
    </Dialog>
  );
};

export default StudentAssignmentsDialog;