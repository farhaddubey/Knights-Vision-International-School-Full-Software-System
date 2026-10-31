"use client";

import React from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
} from "@mui/material";
import { Add, Close, CalendarToday } from "@mui/icons-material";
import { toast } from "react-toastify";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import textFieldStyles from "../../../../mui_styles/TextFieldStyles";
import selectStyles from "../../../../mui_styles/SelectStyles";

const drawerWidth = 280;
const appBarHeight = 64;

// Inline DatePicker styles for dark theme with white text
const datePickerStyles = {
  "& .MuiInputBase-input": { color: "#fff" }, // Input text
  "& .MuiInputLabel-root": { color: "#aaa" }, // Label
  "& .MuiInputLabel-root.Mui-focused": { color: "#fff" }, // Focused label
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#555" }, // Default border
    "&:hover fieldset": { borderColor: "#777" }, // Hover border
    "&.Mui-focused fieldset": { borderColor: "#00c757" }, // Focused border
    "& .MuiSvgIcon-root": { color: "#fff" }, // Calendar icon
  },
  "& .MuiPickersPopper-root": {
    "& .MuiPaper-root": {
      backgroundColor: "#222", // Popper background
      color: "#fff", // Popper text
    },
    "& .MuiPickersCalendarHeader-label": { color: "#fff" }, // Month/Year label
    "& .MuiDayPicker-weekDayLabel": { color: "#fff" }, // Weekday labels
    "& .MuiPickersDay-root": {
      color: "#fff", // Day text
      backgroundColor: "#222", // Day background
      "&:hover": { backgroundColor: "#666" }, // Day hover
      "&.Mui-selected": {
        backgroundColor: "#00c757", // Selected day
        color: "#fff",
        "&:hover": { backgroundColor: "#00a548" },
      },
      "&.Mui-disabled": { color: "#666" }, // Disabled days
    },
    "& .MuiPickersArrowSwitcher-button": { color: "#fff" }, // Navigation arrows
  },
};

const CreateSyllabusDialog = ({
  open,
  onClose,
  selectedClassSubject,
  syllabusTopics,
  newSchedules,
  setNewSchedules,
  fetchSyllabusSchedules,
  className,
}) => {
  const handleAddSchedule = () => {
    setNewSchedules([
      ...newSchedules,
      {
        date: null,
        topicTitle: "",
        syllabusId: "",
        isCompleted: false,
        articleLinks1: "",
        articleLinks2: "",
        videoLinks: "",
        videoLinks2: "",
        instructions_for_students: "",
        instructions_for_teachers: "",
        notes: "",
        isHoliday: false,
        homeworkDescription: "",
        homeworkDueDate: null,
      },
    ]);
  };

  const handleScheduleChange = (index, field, value) => {
    const updatedSchedules = [...newSchedules];
    updatedSchedules[index][field] = value;
    setNewSchedules(updatedSchedules);
  };

  const handleCreateSchedules = async () => {
    if (!selectedClassSubject) {
      toast.error("No class subject selected.");
      return;
    }

    const invalidSchedules = newSchedules.filter(
      (s) => !s.date || (!s.topicTitle && !s.isHoliday)
    );
    if (invalidSchedules.length > 0) {
      toast.error("All schedules must have a date and either a topic or be marked as a holiday.");
      return;
    }

    try {
      const payload = newSchedules.map((s) => ({
        classSubjectId: selectedClassSubject.id,
        date: s.date.toISOString().slice(0, 10),
        topicTitle: s.topicTitle,
        syllabusId: s.syllabusId ? parseInt(s.syllabusId) : null,
        isCompleted: s.isCompleted,
        articleLinks1: s.articleLinks1 || null,
        articleLinks2: s.articleLinks2 || null,
        videoLinks: s.videoLinks || null,
        videoLinks2: s.videoLinks2 || null,
        instructions_for_students: s.instructions_for_students || null,
        instructions_for_teachers: s.instructions_for_teachers || null,
        notes: s.notes || null,
        isHoliday: s.isHoliday,
        homeworkDescription: s.homeworkDescription || null,
        homeworkDueDate: s.homeworkDueDate ? s.homeworkDueDate.toISOString().slice(0, 10) : null,
      }));

      const response = await axios.post(`/api/SyllabusScheduleDailyPlan/${className.toLowerCase()}/syllabus-schedule`, {
        schedules: payload,
      });
      toast.success("Syllabus schedules created successfully.");
      fetchSyllabusSchedules(selectedClassSubject.id);
      onClose();
    } catch (err) {
      console.error("Create Schedules Error:", err.message);
      toast.error("Failed to create schedules: " + (err.response?.data?.error || err.message));
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
          <ListItemText sx={{ color: "#fff" }} primary={`Create Syllabus for ${selectedClassSubject?.subject.name || "Unknown"} - ${className}`} />
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
          <Box sx={{ flex: 1, overflowY: "auto", height: "87vh" }}>
            <DialogContent sx={{ bgcolor: "#000", color: "#fff" }}>
              <Box sx={{ mt: 2 }}>
                {newSchedules.map((schedule, index) => (
                  <Box
                    key={index}
                    sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, bgcolor: "#000", borderRadius: 1, p: 2, mb: 2 }}
                  >
                    <Box sx={{bgcolor:"#666", display:"block"}}>
                    <DatePicker
                      fullwidth
                      label="Date"
                      value={schedule.date}
                      onChange={(date) => handleScheduleChange(index, "date", date)}
                      slotProps={{ textField: { sx: datePickerStyles } }}
                      disabled={schedule.isHoliday}
                    />
                    </Box>
                    <TextField
                      label="Topic Title"
                      value={schedule.topicTitle}
                      onChange={(e) => handleScheduleChange(index, "topicTitle", e.target.value)}
                      sx={{ ...textFieldStyles }}
                      disabled={schedule.isHoliday}
                    />
                    <FormControl sx={{ ...selectStyles }}>
                      <InputLabel sx={{ color: "#aaa" }}>Syllabus Topic</InputLabel>
                      <Select
                        value={schedule.syllabusId}
                        onChange={(e) => handleScheduleChange(index, "syllabusId", e.target.value)}
                        disabled={schedule.isHoliday}
                        sx={{ color: "#fff" }}
                      >
                        <MenuItem value="">None</MenuItem>
                        {syllabusTopics.map((topic) => (
                          <MenuItem key={topic.id} value={topic.id}>
                            {topic.topic}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl sx={{ ...selectStyles }}>
                      <InputLabel sx={{ color: "#aaa" }}>Completed</InputLabel>
                      <Select
                        value={schedule.isCompleted}
                        onChange={(e) => handleScheduleChange(index, "isCompleted", e.target.value)}
                        disabled={schedule.isHoliday}
                        sx={{ color: "#fff" }}
                      >
                        <MenuItem value={true}>Yes</MenuItem>
                        <MenuItem value={false}>No</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label="Article Link 1 (URL)"
                      value={schedule.articleLinks1}
                      onChange={(e) => handleScheduleChange(index, "articleLinks1", e.target.value)}
                      sx={{ ...textFieldStyles }}
                      disabled={schedule.isHoliday}
                    />
                    <TextField
                      label="Article Link 2 (URL)"
                      value={schedule.articleLinks2}
                      onChange={(e) => handleScheduleChange(index, "articleLinks2", e.target.value)}
                      sx={{ ...textFieldStyles }}
                      disabled={schedule.isHoliday}
                    />
                    <TextField
                      label="Video Link 1 (URL)"
                      value={schedule.videoLinks}
                      onChange={(e) => handleScheduleChange(index, "videoLinks", e.target.value)}
                      sx={{ ...textFieldStyles }}
                      disabled={schedule.isHoliday}
                    />
                    <TextField
                      label="Video Link 2 (URL)"
                      value={schedule.videoLinks2}
                      onChange={(e) => handleScheduleChange(index, "videoLinks2", e.target.value)}
                      sx={{ ...textFieldStyles }}
                      disabled={schedule.isHoliday}
                    />
                    <TextField
                      label="Instructions for Students"
                      value={schedule.instructions_for_students}
                      onChange={(e) => handleScheduleChange(index, "instructions_for_students", e.target.value)}
                      multiline
                      rows={3}
                      sx={{ ...textFieldStyles }}
                    />
                    <TextField
                      label="Instructions for Teachers"
                      value={schedule.instructions_for_teachers}
                      onChange={(e) => handleScheduleChange(index, "instructions_for_teachers", e.target.value)}
                      multiline
                      rows={3}
                      sx={{ ...textFieldStyles }}
                    />
                    <TextField
                      label="Notes"
                      value={schedule.notes}
                      onChange={(e) => handleScheduleChange(index, "notes", e.target.value)}
                      multiline
                      rows={3}
                      sx={{ ...textFieldStyles }}
                    />
                    <TextField
                      label="Homework Description"
                      value={schedule.homeworkDescription}
                      onChange={(e) => handleScheduleChange(index, "homeworkDescription", e.target.value)}
                      multiline
                      rows={3}
                      sx={{ ...textFieldStyles }}
                      disabled={schedule.isHoliday}
                    />
                                        <Box sx={{bgcolor:"#666", display:"block"}}>
                    <DatePicker
                      label="Homework Due Date"
                      value={schedule.homeworkDueDate}
                      onChange={(date) => handleScheduleChange(index, "homeworkDueDate", date)}
                      slotProps={{ textField: { sx: datePickerStyles } }}
                      disabled={schedule.isHoliday}
                    /></Box>
                    <FormControl sx={{ ...selectStyles }}>
                      <InputLabel sx={{ color: "#aaa" }}>Holiday</InputLabel>
                      <Select
                        value={schedule.isHoliday}
                        onChange={(e) => handleScheduleChange(index, "isHoliday", e.target.value)}
                        sx={{ color: "#fff" }}
                      >
                        <MenuItem value={true}>Yes</MenuItem>
                        <MenuItem value={false}>No</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                ))}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddSchedule}
                  sx={{ bgcolor: "#00c757", mt: 2, color: "#fff", "&:hover": { bgcolor: "#00a548" } }}
                  startIcon={<Add sx={{ color: "#fff" }} />}
                >
                  Add Another Day
                </Button>
              </Box>
            </DialogContent>
            <DialogActions sx={{ bgcolor: "#000" }}>
              <Button onClick={onClose} variant="contained" color="error" sx={{ color: "#fff" }}>
                Cancel
              </Button>
              <Button onClick={handleCreateSchedules} sx={{ color: "#00c757" }}>
                Save
              </Button>
            </DialogActions>
          </Box>
        </Box>
      </Dialog>
    </LocalizationProvider>
  );
};

export default CreateSyllabusDialog;