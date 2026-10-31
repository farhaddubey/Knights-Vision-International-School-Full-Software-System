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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { CalendarToday, Close, Add, Delete } from "@mui/icons-material";
import { toast } from "react-toastify";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import textFieldStyles from "../../../../mui_styles/TextFieldStyles";

const drawerWidth = 280;
const appBarHeight = 64;

// Inline DatePicker styles for dark theme with white text, matching CreateAssignmentDialog
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

const CreateTestDialog = ({ open, onClose, classSubject, className }) => {
  const [tests, setTests] = useState([
    {
      title: "",
      syllabus: "",
      testType: "BiWeekly",
      marks: "",
      biWeeklySlotStart: new Date(),
      biWeeklySlotEnd: (() => {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 13);
        return endDate;
      })(),
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleTestChange = (index, field, value) => {
    const updatedTests = [...tests];
    updatedTests[index][field] = value;
    if (field === "biWeeklySlotStart" && value) {
      const endDate = new Date(value);
      endDate.setDate(endDate.getDate() + 13);
      updatedTests[index].biWeeklySlotEnd = endDate;
    }
    setTests(updatedTests);
  };

  const addTest = () => {
    setTests([
      ...tests,
      {
        title: "",
        syllabus: "",
        testType: "BiWeekly",
        marks: "",
        biWeeklySlotStart: new Date(),
        biWeeklySlotEnd: (() => {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 13);
          return endDate;
        })(),
      },
    ]);
  };

  const removeTest = (index) => {
    if (tests.length === 1) {
      toast.error("At least one test is required.");
      return;
    }
    setTests(tests.filter((_, i) => i !== index));
  };

  const handleCreateTests = async () => {
    if (!classSubject) {
      toast.error("No class subject selected.");
      return;
    }

    const invalidTests = tests.some(
      (test) => !test.title || !test.testType || !test.biWeeklySlotStart || !test.biWeeklySlotEnd
    );
    if (invalidTests) {
      toast.error("Title, test type, and bi-weekly slot dates are required for each test.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        tests: tests.map((test) => ({
          classSubjectId: classSubject.id,
          title: test.title,
          testType: test.testType,
          syllabus: test.syllabus || null,
          marks: test.marks ? parseInt(test.marks) : null,
          biWeeklySlotStart: test.biWeeklySlotStart.toISOString().slice(0, 10),
          biWeeklySlotEnd: test.biWeeklySlotEnd.toISOString().slice(0, 10),
        })),
      };

      console.log("Sending payload:", JSON.stringify(payload, null, 2));

      const response = await axios.post(`/api/Tests/${className.toLowerCase()}/tests/batch`, payload);
      if (response.status === 200) {
        toast.success("Tests created successfully.");
        onClose();
      } else {
        throw new Error("Unexpected response status: " + response.status);
      }
    } catch (err) {
      console.error("Create Batch Tests Error:", err.message);
      toast.error("Failed to create tests: " + (err.response?.data?.error || err.message));
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
            primary={`Create Tests for ${classSubject?.subject.name || "Unknown"} - ${className}`}
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
                      onClick={addTest}
                      sx={{ bgcolor: "#00c757", color: "#fff", "&:hover": { bgcolor: "#00a548" } }}
                    >
                      Add Test
                    </Button>
                  </Box>
                  {tests.map((test, index) => (
                    <Box
                      key={index}
                      sx={{ mb: 3, p: 2, bgcolor: "#000", borderRadius: 1 }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography variant="h6" sx={{ color: "#fff" }}>
                          Test {index + 1}
                        </Typography>
                        <IconButton
                          onClick={() => removeTest(index)}
                          sx={{ color: "#f44336" }}
                          disabled={tests.length === 1}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                        <TextField
                          label="Title"
                          value={test.title}
                          onChange={(e) => handleTestChange(index, "title", e.target.value)}
                          sx={{ ...textFieldStyles }}
                        />
                        <TextField
                          label="Syllabus"
                          value={test.syllabus}
                          onChange={(e) => handleTestChange(index, "syllabus", e.target.value)}
                          multiline
                          rows={3}
                          sx={{ ...textFieldStyles }}
                          placeholder="e.g., Algebra, Geometry"
                        />
                        <FormControl sx={{ ...textFieldStyles }}>
                          <InputLabel sx={{ color: "#aaa" }}>Test Type</InputLabel>
                          <Select
                            value={test.testType}
                            onChange={(e) => handleTestChange(index, "testType", e.target.value)}
                            sx={{ color: "#fff" }}
                          >
                            <MenuItem value="BiWeekly">Weekly</MenuItem>
                            <MenuItem value="BiWeekly">Bi-Weekly</MenuItem>
                            <MenuItem value="Monthly">Monthly</MenuItem>
                            <MenuItem value="Half-Yearly">Half-Yearly</MenuItem>
                          </Select>
                        </FormControl>
                        <TextField
                          label="Marks"
                          value={test.marks}
                          onChange={(e) => handleTestChange(index, "marks", e.target.value)}
                          type="number"
                          sx={{ ...textFieldStyles }}
                          placeholder="e.g., 100"
                        />
                        <Box sx={{ bgcolor: "#666", display: "block" }}>
                          <DatePicker
                            label="Bi-Weekly Slot Start"
                            value={test.biWeeklySlotStart}
                            onChange={(date) => handleTestChange(index, "biWeeklySlotStart", date)}
                            slotProps={{ textField: { sx: datePickerStyles } }}
                          />
                        </Box>
                        <Box sx={{ bgcolor: "#666", display: "block" }}>
                          <DatePicker
                            label="Bi-Weekly Slot End"
                            value={test.biWeeklySlotEnd}
                            slotProps={{ textField: { sx: datePickerStyles } }}
                          />
                        </Box>
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
              <Button onClick={handleCreateTests} sx={{ color: "#00c757" }} disabled={loading}>
                Save All
              </Button>
            </DialogActions>
          </Box>
        </Box>
      </Dialog>
    </LocalizationProvider>
  );
};

export default CreateTestDialog;