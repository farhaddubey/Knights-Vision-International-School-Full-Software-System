
import React, { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography
} from "@mui/material";
import { CalendarToday, Close, Add, Delete } from "@mui/icons-material";
import { toast } from "react-toastify";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import textFieldStyles from "../../../../mui_styles/TextFieldStyles";

const drawerWidth = 280;
const appBarHeight = 64;

// Inline DatePicker styles for dark theme with white text, matching CreateSyllabusDialog
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

const CreateAssignmentDialog = ({
  open,
  onClose,
  selectedClassSubject,
  fetchAssignments,
  setLoading,
  className,
}) => {
  const [assignments, setAssignments] = useState([
    {
      title: "",
      description: "",
      dueDate: null,
      biWeeklySlotStart: new Date(),
      biWeeklySlotEnd: (() => {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 13);
        return endDate;
      })(),
    },
  ]);

  const handleAssignmentChange = (index, field, value) => {
    const updatedAssignments = [...assignments];
    updatedAssignments[index][field] = value;
    if (field === "biWeeklySlotStart" && value) {
      const endDate = new Date(value);
      endDate.setDate(endDate.getDate() + 13);
      updatedAssignments[index].biWeeklySlotEnd = endDate;
      updatedAssignments[index].dueDate = endDate;
    }
    setAssignments(updatedAssignments);
  };

  const handleAddAssignment = () => {
    setAssignments([
      ...assignments,
      {
        title: "",
        description: "",
        dueDate: null,
        biWeeklySlotStart: new Date(),
        biWeeklySlotEnd: (() => {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 13);
          return endDate;
        })(),
      },
    ]);
  };

  const handleRemoveAssignment = (index) => {
    if (assignments.length === 1) {
      toast.error("At least one assignment is required.");
      return;
    }
    setAssignments(assignments.filter((_, i) => i !== index));
  };

  const handleCreateAssignments = async () => {
    if (!selectedClassSubject) {
      toast.error("No class subject selected.");
      return;
    }

    const invalidAssignments = assignments.some(
      (a) => !a.title || !a.description || !a.dueDate || !a.biWeeklySlotStart || !a.biWeeklySlotEnd
    );
    if (invalidAssignments) {
      toast.error("All fields are required for each assignment.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        assignments: assignments.map((a) => ({
          classSubjectId: selectedClassSubject.id,
          title: a.title,
          description: a.description,
          dueDate: a.dueDate.toISOString().slice(0, 10),
          biWeeklySlotStart: a.biWeeklySlotStart.toISOString().slice(0, 10),
          biWeeklySlotEnd: a.biWeeklySlotEnd.toISOString().slice(0, 10),
        })),
      };

      console.log("Sending payload:", JSON.stringify(payload, null, 2));

      await axios.post(`/api/Assignments/${className.toLowerCase()}/assignments/batch`, payload);
      toast.success("Assignments created successfully.");
      fetchAssignments(selectedClassSubject.id);
      onClose();
    } catch (err) {
      console.error("Create Assignments Error:", err.message);
      toast.error("Failed to create assignments: " + (err.response?.data?.error || err.message));
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
            primary={`Create Assignments for ${selectedClassSubject?.subject.name || "Unknown"} - ${className}`}
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
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<Add sx={{ color: "#fff" }} />}
                    onClick={handleAddAssignment}
                    sx={{ bgcolor: "#00c757", color: "#fff", "&:hover": { bgcolor: "#00a548" } }}
                  >
                    Add Assignment
                  </Button>
                </Box>
                {assignments.map((assignment, index) => (
                  <Box
                    key={index}
                    sx={{ mb: 3, p: 2, bgcolor: "#000", borderRadius: 1 }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Typography variant="h6" sx={{ color: "#fff" }}>
                        Assignment {index + 1}
                      </Typography>
                      <IconButton
                        onClick={() => handleRemoveAssignment(index)}
                        sx={{ color: "#f44336" }}
                        disabled={assignments.length === 1}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                      <TextField
                        label="Title"
                        value={assignment.title}
                        onChange={(e) => handleAssignmentChange(index, "title", e.target.value)}
                        sx={{ ...textFieldStyles }}
                      />
                      <TextField
                        label="Description"
                        value={assignment.description}
                        onChange={(e) => handleAssignmentChange(index, "description", e.target.value)}
                        multiline
                        rows={3}
                        sx={{ ...textFieldStyles }}
                      />
                      <Box sx={{ bgcolor: "#666", display: "block" }}>
                        <DatePicker
                          label="Due Date"
                          value={assignment.dueDate}
                          onChange={(date) => handleAssignmentChange(index, "dueDate", date)}
                          slotProps={{ textField: { sx: datePickerStyles } }}
                        />
                      </Box>
                      <Box sx={{ bgcolor: "#666", display: "block" }}>
                        <DatePicker
                          label="Bi-Weekly Slot Start"
                          value={assignment.biWeeklySlotStart}
                          onChange={(date) => handleAssignmentChange(index, "biWeeklySlotStart", date)}
                          slotProps={{ textField: { sx: datePickerStyles } }}
                        />
                      </Box>
                      <Box sx={{ bgcolor: "#666", display: "block" }}>
                        <DatePicker
                          label="Bi-Weekly Slot End"
                          value={assignment.biWeeklySlotEnd}
                          disabled
                          slotProps={{ textField: { sx: datePickerStyles } }}
                        />
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </DialogContent>
            <DialogActions sx={{ bgcolor: "#000" }}>
              <Button onClick={onClose} variant="contained" color="error" sx={{ color: "#fff" }}>
                Cancel
              </Button>
              <Button onClick={handleCreateAssignments} sx={{ color: "#00c757" }}>
                Save All
              </Button>
            </DialogActions>
          </Box>
        </Box>
      </Dialog>
    </LocalizationProvider>
  );
};

export default CreateAssignmentDialog;