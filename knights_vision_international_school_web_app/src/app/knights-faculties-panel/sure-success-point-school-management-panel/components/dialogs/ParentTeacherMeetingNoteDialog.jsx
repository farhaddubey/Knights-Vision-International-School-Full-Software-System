"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  MenuItem,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { toast } from "react-toastify";

const textFieldStyles = {
  "& .MuiInputBase-input": { color: "#fff" },
  "& .MuiInputLabel-root": { color: "#aaa" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#555" },
    "&:hover fieldset": { borderColor: "#777" },
    "&.Mui-focused fieldset": { borderColor: "#00c757" },
  },
  mb: 2,
};

const ParentTeacherMeetingNoteDialog = ({ open, mode, note, classId, className, onClose }) => {
  const [formData, setFormData] = useState([
    {
      studentId: "",
      meetingDate: "",
      summary: "",
      detailedNotes: "",
      actionPoints: [{ action: "", dueBy: "" }],
      guardianFeedback: "",
    },
  ]);
  const [students, setStudents] = useState([]);

  const classMap = {
    'v': { id: 4, name: 'Class V' },
    'vi': { id: 5, name: 'Class VI' },
    'vii': { id: 6, name: 'Class VII' },
    'viii': { id: 7, name: 'Class VIII' },
    'ix': { id: 8, name: 'Class IX' },
    'x': { id: 9, name: 'Class X' },
  };

  const classInfo = classMap[className.toLowerCase()] || { id: 4, name: 'Class V' };

  useEffect(() => {
    if (open) {
      fetchStudents();
    }
  }, [open, classId]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`/api/ParentTeacherMeetingNotes/${className.toLowerCase()}/students`, { params: { classId } });
      if (!response.data || !Array.isArray(response.data.students)) {
        throw new Error("Invalid response format");
      }
      setStudents(response.data.students);
    } catch (err) {
      console.error("Error fetching students:", err.message);
      toast.error("Failed to fetch students.");
    }
  };

  const handleInputChange = (index, field, value) => {
    const newFormData = [...formData];
    newFormData[index][field] = value;
    setFormData(newFormData);
  };

  const handleActionPointChange = (noteIndex, actionIndex, field, value) => {
    const newFormData = [...formData];
    newFormData[noteIndex].actionPoints[actionIndex][field] = value;
    setFormData(newFormData);
  };

  const handleAddActionPoint = (noteIndex) => {
    const newFormData = [...formData];
    newFormData[noteIndex].actionPoints.push({ action: "", dueBy: "" });
    setFormData(newFormData);
  };

  const handleRemoveActionPoint = (noteIndex, actionIndex) => {
    const newFormData = [...formData];
    if (newFormData[noteIndex].actionPoints.length > 1) {
      newFormData[noteIndex].actionPoints = newFormData[noteIndex].actionPoints.filter(
        (_, i) => i !== actionIndex
      );
      setFormData(newFormData);
    }
  };

  const handleAddNote = () => {
    setFormData([
      ...formData,
      {
        studentId: "",
        meetingDate: "",
        summary: "",
        detailedNotes: "",
        actionPoints: [{ action: "", dueBy: "" }],
        guardianFeedback: "",
      },
    ]);
  };

  const handleRemoveNote = (index) => {
    if (formData.length > 1) {
      setFormData(formData.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    try {
      const notesToSubmit = formData.map((note) => ({
        classId,
        studentId: parseInt(note.studentId),
        schoolId: 1,
        branchId: 1,
        meetingDate: new Date(note.meetingDate),
        summary: note.summary,
        detailedNotes: note.detailedNotes || null,
        actionPoints: note.actionPoints.filter((action) => action.action && action.dueBy),
        guardianFeedback: note.guardianFeedback || null,
        takenById: 1,
      }));

      await axios.post(`/api/ParentTeacherMeetingNotes/${className.toLowerCase()}/parent-teacher-meeting-notes`, { notes: notesToSubmit });
      toast.success("Meeting notes added successfully!");
      onClose();
      setFormData([
        {
          studentId: "",
          meetingDate: "",
          summary: "",
          detailedNotes: "",
          actionPoints: [{ action: "", dueBy: "" }],
          guardianFeedback: "",
        },
      ]);
    } catch (err) {
      console.error("Error adding meeting notes:", err.message);
      toast.error("Failed to add meeting notes.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ bgcolor: "#333", color: "#fff" }}>
        {mode === "view" ? `Meeting Note Details` : `Add Meeting Notes for ${classInfo.name}`}
      </DialogTitle>
      <DialogContent sx={{ bgcolor: "#181818", color: "#fff" }}>
        {mode === "view" && note ? (
          <Box>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Student</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{note.student.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Meeting Date</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{new Date(note.meetingDate).toLocaleDateString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Summary</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{note.summary}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Detailed Notes</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{note.detailedNotes || "N/A"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Guardian Feedback</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{note.guardianFeedback || "N/A"}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Typography sx={{ color: "#fff", mt: 2, mb: 1 }}>Action Points</Typography>
            {note.actionPoints && note.actionPoints.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#333" }}>
                    <TableCell sx={{ color: "#fff" }}>Action</TableCell>
                    <TableCell sx={{ color: "#fff" }}>Due By</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {note.actionPoints.map((action, index) => (
                    <TableRow key={index} sx={{ bgcolor: "#222", "&:hover": { bgcolor: "#2a2a2a" } }}>
                      <TableCell sx={{ color: "#fff" }}>{action.action}</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{action.dueBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography sx={{ color: "#fff", p: 2 }}>No action points available.</Typography>
            )}
          </Box>
        ) : (
          <Box>
            {formData.map((note, noteIndex) => (
              <Box key={noteIndex} sx={{ mb: 3, p: 2, bgcolor: "#222", borderRadius: 1 }}>
                <Typography sx={{ color: "#fff", mb: 2 }}>Meeting Note {noteIndex + 1}</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  <TextField
                    select
                    label="Student"
                    value={note.studentId}
                    onChange={(e) => handleInputChange(noteIndex, "studentId", e.target.value)}
                    sx={{ ...textFieldStyles, width: "300px" }}
                    required
                  >
                    {students.map((student) => (
                      <MenuItem key={student.id} value={student.id}>
                        {student.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Meeting Date"
                    type="date"
                    value={note.meetingDate}
                    onChange={(e) => handleInputChange(noteIndex, "meetingDate", e.target.value)}
                    sx={{ ...textFieldStyles, width: "200px" }}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                  <TextField
                    label="Summary"
                    value={note.summary}
                    onChange={(e) => handleInputChange(noteIndex, "summary", e.target.value)}
                    sx={{ ...textFieldStyles, width: "400px" }}
                    multiline
                    rows={2}
                    required
                  />
                  <TextField
                    label="Detailed Notes"
                    value={note.detailedNotes}
                    onChange={(e) => handleInputChange(noteIndex, "detailedNotes", e.target.value)}
                    sx={{ ...textFieldStyles, width: "400px" }}
                    multiline
                    rows={3}
                  />
                  <TextField
                    label="Guardian Feedback"
                    value={note.guardianFeedback}
                    onChange={(e) => handleInputChange(noteIndex, "guardianFeedback", e.target.value)}
                    sx={{ ...textFieldStyles, width: "400px" }}
                    multiline
                    rows={3}
                  />
                </Box>
                <Typography sx={{ color: "#fff", mt: 2, mb: 1 }}>Action Points</Typography>
                {note.actionPoints.map((action, actionIndex) => (
                  <Box key={actionIndex} sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
                    <TextField
                      label="Action"
                      value={action.action}
                      onChange={(e) => handleActionPointChange(noteIndex, actionIndex, "action", e.target.value)}
                      sx={{ ...textFieldStyles, width: "300px" }}
                      required
                    />
                    <TextField
                      label="Due By"
                      type="date"
                      value={action.dueBy}
                      onChange={(e) => handleActionPointChange(noteIndex, actionIndex, "dueBy", e.target.value)}
                      sx={{ ...textFieldStyles, width: "200px" }}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                    {note.actionPoints.length > 1 && (
                      <IconButton
                        onClick={() => handleRemoveActionPoint(noteIndex, actionIndex)}
                        sx={{ color: "#ff4444" }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddActionPoint(noteIndex)}
                  sx={{ color: "#00c757", borderColor: "#00c757", mb: 2 }}
                >
                  Add Action Point
                </Button>
                {formData.length > 1 && (
                  <IconButton onClick={() => handleRemoveNote(noteIndex)} sx={{ color: "#ff4444", ml: 2 }}>
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            ))}
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddNote}
              sx={{ color: "#00c757", borderColor: "#00c757", mb: 2 }}
            >
              Add Another Note
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ bgcolor: "#333" }}>
        <Button onClick={onClose} sx={{ color: "#fff" }}>
          Close
        </Button>
        {mode === "add" && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ bgcolor: "#00c757", "&:hover": { bgcolor: "#00a550" } }}
            disabled={formData.some(
              (note) =>
                !note.studentId ||
                !note.meetingDate ||
                !note.summary ||
                note.actionPoints.some((action) => !action.action || !action.dueBy)
            )}
          >
            Save Notes
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ParentTeacherMeetingNoteDialog;