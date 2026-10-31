// src/components/SemesterExamScheduleDialog.js
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Add, Close, Delete } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import SchoolSelect from "@/components/sure-success-point-school/selectors/SchoolSelect";
import ClassSubjectSelect from "@/components/sure-success-point-school/selectors/ClassSubjectSelect";
import classMap from "../../../../../../utils/classmap";

const drawerWidth = 280;
const appBarHeight = 64;

const textFieldStyles = {
  "& .MuiInputBase-input": { color: "#fff" },
  "& .MuiInputLabel-root": { color: "#aaa" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#00c853" },
  backgroundColor: "#333",
  borderRadius: "4px",
};

const SemesterExamScheduleDialog = ({
  open,
  handleClose,
  handleSaveAndClose,
  editSchedule,
  className,
}) => {
  const [commonFields, setCommonFields] = useState({
    schoolId: "",
    semester: "SEMESTER_I",
    classId: "",
    schoolName: "",
  });
  const [scheduleEntries, setScheduleEntries] = useState([
    {
      id: null,
      classSubjectId: "",
      classId: "",
      subjectId: "",
      examDate: "",
      durationMinutes: "150",
      examHall: "",
    },
  ]);

  const classInfo = classMap[className?.toLowerCase()] || { id: 2, name: "UKG" };

  useEffect(() => {
    if (open && className) {
      setCommonFields((prev) => ({ ...prev, classId: classInfo.id }));
    }
    if (editSchedule) {
      setCommonFields({
        schoolId: editSchedule.schoolId.toString(),
        semester: editSchedule.semester,
        classId: editSchedule.classId.toString(),
        schoolName: "",
      });
      setScheduleEntries([
        {
          id: editSchedule.id,
          classSubjectId: editSchedule.classSubjectId.toString(),
          classId: editSchedule.classId.toString(),
          subjectId: editSchedule.subjectId.toString(),
          examDate: new Date(editSchedule.examDate).toISOString().slice(0, 16),
          durationMinutes: editSchedule.durationMinutes.toString(),
          examHall: editSchedule.examHall || "",
        },
      ]);
    }
  }, [open, className, editSchedule]);

  const fetchSchoolName = async () => {
    const token = Cookies.get("administration_token");
    if (!token || !commonFields.schoolId) return;

    try {
      const response = await axios.get(`/api/schools/select`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const school = response.data.find((s) => s.id === parseInt(commonFields.schoolId));
      if (school) {
        setCommonFields((prev) => ({ ...prev, schoolName: school.name }));
        setScheduleEntries((prev) =>
          prev.map((entry) => ({
            ...entry,
            examHall: entry.examHall || school.name,
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching school name:", err.message);
      toast.error("Failed to fetch school name.");
    }
  };

  useEffect(() => {
    if (commonFields.schoolId) {
      fetchSchoolName();
    }
  }, [commonFields.schoolId]);

  const handleCommonFieldChange = (field, value) => {
    setCommonFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleScheduleEntryChange = (index, field, value) => {
    setScheduleEntries((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleClassSubjectChange = (index, classSubjectId, classId, subjectId) => {
    setScheduleEntries((prev) =>
      prev.map((entry, i) =>
        i === index
          ? { ...entry, classSubjectId, classId, subjectId }
          : entry
      )
    );
  };

  const addScheduleEntry = () => {
    if (editSchedule) return; // Prevent adding entries in edit mode
    setScheduleEntries((prev) => [
      ...prev,
      {
        id: null,
        classSubjectId: "",
        classId: commonFields.classId,
        subjectId: "",
        examDate: "",
        durationMinutes: "150",
        examHall: commonFields.schoolName || "",
      },
    ]);
  };

  const removeScheduleEntry = (index) => {
    if (editSchedule || scheduleEntries.length === 1) {
      toast.error("Cannot remove the only entry or in edit mode.");
      return;
    }
    setScheduleEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveChanges = async () => {
    const token = Cookies.get("administration_token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }

    try {
      const payload = scheduleEntries.map((entry) => ({
        classSubjectId: parseInt(entry.classSubjectId),
        classId: parseInt(entry.classId || commonFields.classId),
        subjectId: parseInt(entry.subjectId),
        schoolId: parseInt(commonFields.schoolId),
        semester: commonFields.semester,
        examDate: new Date(entry.examDate).toISOString(),
        durationMinutes: parseInt(entry.durationMinutes),
        examHall: entry.examHall || null,
        ...(entry.id && { id: parseInt(entry.id) }),
      }));

      if (editSchedule) {
        await axios.put(`/api/semester-exam-schedules/${editSchedule.id}`, payload[0], {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`/api/semester-exam-schedules`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      toast.success("🎉 Exam schedules saved successfully!");
      handleSaveAndClose();
    } catch (err) {
      console.error("Save Error:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "❌ Error saving exam schedules.");
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
      onClose={handleClose}
      fullScreen
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
          backgroundColor: "#212121",
          color: "#fff",
          "&:hover": { backgroundColor: "#212121" },
        }}
      >
        <ListItemIcon>
          <Add />
        </ListItemIcon>
        <ListItemText
          sx={{ color: "#fff" }}
          primary={editSchedule ? `Edit Semester Exam Schedule - ${className}` : `Add Semester Exam Schedules (Batch) - ${className}`}
        />
        <Button
          onClick={handleClose}
          variant="outlined"
          color="error"
          sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
        >
          <Close />
        </Button>
      </ListItemButton>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#000", color: "#fff" }}>
        <DialogContent>
          <Box sx={{ maxWidth: "800px", mx: "auto", p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#fff" }}>
              Common Details
            </Typography>
            <SchoolSelect
              selectedSchool={commonFields.schoolId}
              setSelectedSchool={(value) => handleCommonFieldChange("schoolId", value)}
            />
            <FormControl fullWidth sx={{ mb: 2, ...textFieldStyles }}>
              <InputLabel sx={{ color: "#aaa" }}>Semester</InputLabel>
              <Select
                value={commonFields.semester}
                onChange={(e) => handleCommonFieldChange("semester", e.target.value)}
                sx={{ color: "#fff", "& .MuiSvgIcon-root": { color: "#fff" } }}
              >
                <MenuItem value="SEMESTER_I">Semester I</MenuItem>
                <MenuItem value="SEMESTER_II">Semester II</MenuItem>
                <MenuItem value="SEMESTER_III">Semester III</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="h6" sx={{ mt: 3, mb: 2, color: "#fff" }}>
              Schedule Entries
            </Typography>
            {scheduleEntries.map((entry, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, border: "1px solid #555", borderRadius: "4px" }}>
                <Typography variant="subtitle1" sx={{ mb: 1, color: "#fff" }}>
                  Schedule Entry {index + 1}
                </Typography>
                <ClassSubjectSelect
                  selectedClassSubject={entry.classSubjectId}
                  setSelectedClassSubject={(value, classId, subjectId) =>
                    handleClassSubjectChange(index, value, classId, subjectId)
                  }
                  className={className}
                />
                <TextField
                  sx={textFieldStyles}
                  label="Exam Date & Time"
                  type="datetime-local"
                  fullWidth
                  margin="normal"
                  value={entry.examDate}
                  onChange={(e) => handleScheduleEntryChange(index, "examDate", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                />
                <TextField
                  sx={textFieldStyles}
                  label="Duration (minutes)"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={entry.durationMinutes}
                  onChange={(e) => handleScheduleEntryChange(index, "durationMinutes", e.target.value)}
                  required
                />
                <TextField
                  sx={textFieldStyles}
                  label="Exam Hall"
                  fullWidth
                  margin="normal"
                  value={entry.examHall}
                  onChange={(e) => handleScheduleEntryChange(index, "examHall", e.target.value)}
                />
                {!editSchedule && (
                  <IconButton
                    onClick={() => removeScheduleEntry(index)}
                    sx={{ color: "#f44336", mt: 1 }}
                    disabled={scheduleEntries.length === 1}
                  >
                    <Delete />
                  </IconButton>
                )}
              </Box>
            ))}
            {!editSchedule && (
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={addScheduleEntry}
                sx={{ mt: 2, color: "#00c853", borderColor: "#00c853" }}
              >
                Add Schedule Entry
              </Button>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained" color="error">
            Cancel
          </Button>
          <Button
            onClick={handleSaveChanges}
            variant="contained"
            color="primary"
            disabled={
              !commonFields.schoolId ||
              !commonFields.semester ||
              scheduleEntries.some(
                (entry) => !entry.classSubjectId || !entry.classId || !entry.subjectId || !entry.examDate || !entry.durationMinutes
              )
            }
          >
            Save Schedules
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default SemesterExamScheduleDialog;
