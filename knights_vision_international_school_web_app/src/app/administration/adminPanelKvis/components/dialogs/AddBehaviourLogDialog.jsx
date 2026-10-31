"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  MenuItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Add as AddIcon, Report as ReportIcon, Close } from "@mui/icons-material";
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
  mb: 2,
};

const AddBehaviourLogDialog = ({ open, onClose, classId, className }) => {
  const [formData, setFormData] = useState({
    studentId: "",
    classSubjectId: "",
    category: "ACADEMIC",
    type: "",
    description: "",
    severityLevel: 1,
    punishmentId: "",
    isResolved: false,
    resolvedBy: "",
    resolvedNote: "",
  });
  const [students, setStudents] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);
  const [punishments, setPunishments] = useState([]);

  useEffect(() => {
    if (open) {
      fetchOptions();
    }
  }, [open, classId, className]);

  const fetchOptions = async () => {
    const token = Cookies.get("administration_token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }
    try {
      const [studentsRes, subjectsRes, punishmentsRes] = await Promise.all([
        axios.get(`/api/MonthlyStudentBehaviourLogs/${className.toLowerCase()}/students`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { classId },
        }),
        axios.get("/api/class-subjects", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/api/punishments", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setStudents(studentsRes.data.students || []);
      setClassSubjects(subjectsRes.data || []);
      setPunishments(punishmentsRes.data || []);
    } catch (err) {
      console.error("Error fetching options:", err.message);
      toast.error("Failed to fetch options.");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const token = Cookies.get("administration_token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }
    try {
      await axios.post(`/api/MonthlyStudentBehaviourLogs/${className.toLowerCase()}/logs`, {
        ...formData,
        classSubjectId: formData.classSubjectId || null,
        punishmentId: formData.punishmentId || null,
        resolvedBy: formData.resolvedBy || null,
        resolvedNote: formData.resolvedNote || null,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Behaviour log added successfully!");
      onClose();
      setFormData({
        studentId: "",
        classSubjectId: "",
        category: "ACADEMIC",
        type: "",
        description: "",
        severityLevel: 1,
        punishmentId: "",
        isResolved: false,
        resolvedBy: "",
        resolvedNote: "",
      });
    } catch (err) {
      console.error("Error adding behaviour log:", err.message);
      toast.error("Failed to add behaviour log.");
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
          <ReportIcon />
        </ListItemIcon>
        <ListItemText
          sx={{ color: "#fff" }}
          primary={`Add Behaviour Log for Class ${className.toUpperCase()}`}
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
      <DialogContent sx={{ bgcolor: "#000", color: "#fff" }}>
        <Box sx={{ p: 2, bgcolor: "#222", borderRadius: 1 }}>
          <TextField
            select
            label="Student"
            value={formData.studentId}
            onChange={(e) => handleInputChange("studentId", e.target.value)}
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
            select
            label="Class Subject"
            value={formData.classSubjectId}
            onChange={(e) => handleInputChange("classSubjectId", e.target.value)}
            sx={{ ...textFieldStyles, width: "300px" }}
          >
            <MenuItem value="">None</MenuItem>
            {classSubjects.map((subject) => (
              <MenuItem key={subject.id} value={subject.id}>
                {subject.subject.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Category"
            value={formData.category}
            onChange={(e) => handleInputChange("category", e.target.value)}
            sx={{ ...textFieldStyles, width: "200px" }}
          >
            {["ACADEMIC", "DISCIPLINE", "ATTENDANCE", "UNIFORM", "DEVICE_MISUSE", "EXAM_MISCONDUCT"].map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Type"
            value={formData.type}
            onChange={(e) => handleInputChange("type", e.target.value)}
            sx={{ ...textFieldStyles, width: "300px" }}
            required
          />
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            sx={{ ...textFieldStyles, width: "400px" }}
            multiline
            rows={4}
          />
          <TextField
            select
            label="Severity Level"
            value={formData.severityLevel}
            onChange={(e) => handleInputChange("severityLevel", parseInt(e.target.value))}
            sx={{ ...textFieldStyles, width: "150px" }}
          >
            {[1, 2, 3, 4, 5].map((level) => (
              <MenuItem key={level} value={level}>
                {level}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Punishment"
            value={formData.punishmentId}
            onChange={(e) => handleInputChange("punishmentId", e.target.value)}
            sx={{ ...textFieldStyles, width: "300px" }}
          >
            <MenuItem value="">None</MenuItem>
            {punishments.map((punishment) => (
              <MenuItem key={punishment.id} value={punishment.id}>
                {punishment.title}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Resolved"
            value={formData.isResolved}
            onChange={(e) => handleInputChange("isResolved", e.target.value === "true")}
            sx={{ ...textFieldStyles, width: "150px" }}
          >
            <MenuItem value={true}>Yes</MenuItem>
            <MenuItem value={false}>No</MenuItem>
          </TextField>
          <TextField
            label="Resolved By"
            value={formData.resolvedBy}
            onChange={(e) => handleInputChange("resolvedBy", e.target.value)}
            sx={{ ...textFieldStyles, width: "200px" }}
          />
          <TextField
            label="Resolved Note"
            value={formData.resolvedNote}
            onChange={(e) => handleInputChange("resolvedNote", e.target.value)}
            sx={{ ...textFieldStyles, width: "400px" }}
            multiline
            rows={4}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ bgcolor: "#000" }}>
        <Button onClick={onClose} variant="contained" color="error">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{ bgcolor: "#00c757", "&:hover": { bgcolor: "#00a550" } }}
          disabled={!formData.studentId || !formData.type}
        >
          Save Log
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBehaviourLogDialog;