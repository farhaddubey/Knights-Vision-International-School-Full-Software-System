"use client";

import React from "react";
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
} from "@mui/material";
import { CalendarToday, Close } from "@mui/icons-material";
import { toast } from "react-toastify";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import textFieldStyles from "../../../../mui_styles/TextFieldStyles";
import textDisabledFieldStyles from "../../../../mui_styles/TextDisableFieldStyles";

const drawerWidth = 280;
const appBarHeight = 64;

const CreateBiWeeklyReviewDialog = ({
  open,
  onClose,
  selectedClassSubject,
  students,
  newReview,
  setNewReview,
  homeworkData,
  fetchHomeworkData,
  fetchBiWeeklyReviews,
  className,
}) => {
  const handleReviewChange = (field, value) => {
    setNewReview((prev) => ({ ...prev, [field]: value }));
  };

  const handleStudentReviewChange = (index, field, value) => {
    const updatedStudentReviews = [...newReview.studentReviews];
    updatedStudentReviews[index][field] = value;
    if (field === "totalTopicsReviewed" || field === "totalHomeworkCompleted") {
      const totalTopics = parseInt(updatedStudentReviews[index].totalTopicsReviewed) || 0;
      const completed = parseInt(updatedStudentReviews[index].totalHomeworkCompleted) || 0;
      updatedStudentReviews[index].completionRate = totalTopics > 0 ? (completed / totalTopics) * 100 : 0;
      updatedStudentReviews[index].status =
        updatedStudentReviews[index].completionRate < 50
          ? "NEEDS_IMPROVEMENT"
          : updatedStudentReviews[index].completionRate >= 80
          ? "EXCELLENT"
          : "PENDING";
    }
    setNewReview((prev) => ({ ...prev, studentReviews: updatedStudentReviews }));
  };

  const handleCreateReview = async () => {
    if (!selectedClassSubject || !newReview.startDate || !newReview.endDate) {
      toast.error("Missing required fields (class subject or dates).");
      return;
    }

    const invalidStudentReviews = newReview.studentReviews.filter(
      (sr) => sr.totalTopicsReviewed < sr.totalHomeworkCompleted || sr.totalTopicsReviewed === 0
    );
    if (invalidStudentReviews.length > 0) {
      toast.error(
        "Invalid student reviews: completed homework cannot exceed total topics, and topics must be greater than 0."
      );
      return;
    }

    try {
      const payload = {
        classSubjectId: selectedClassSubject.id,
        startDate: newReview.startDate.toISOString().slice(0, 10),
        endDate: newReview.endDate.toISOString().slice(0, 10),
        reviewedById: 1, // Replace with authenticated user ID
        generalRemarks: newReview.generalRemarks || null,
        suggestions: newReview.suggestions || null,
        studentReviews: newReview.studentReviews.map((sr) => ({
          studentId: sr.studentId,
          totalTopicsReviewed: parseInt(sr.totalTopicsReviewed),
          totalHomeworkCompleted: parseInt(sr.totalHomeworkCompleted),
          completionRate: parseFloat(sr.completionRate),
          status: sr.status,
          remarks: sr.remarks || null,
        })),
      };

      await axios.post(`/api/BiWeeklyHomeworkReview/${className.toLowerCase()}/bi-weekly-reviews`, payload);
      toast.success("Bi-weekly review created successfully.");
      fetchBiWeeklyReviews(selectedClassSubject.id);
      onClose();
    } catch (err) {
      console.error("Create Review Error:", err.message);
      toast.error("Failed to create review: " + (err.response?.data?.error || err.message));
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
            <CalendarToday />
          </ListItemIcon>
          <ListItemText
            sx={{ color: "#fff" }}
            primary={`Create Bi-Weekly Homework Review for ${selectedClassSubject?.subject.name || "Unknown"} - ${className}`}
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
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2, p: 2, bgcolor: "#222", borderRadius: 1 }}>
                  <DatePicker
                    label="Start Date"
                    value={newReview.startDate}
                    onChange={(date) => {
                      handleReviewChange("startDate", date);
                      const endDate = new Date(date);
                      endDate.setDate(date.getDate() + 13);
                      handleReviewChange("endDate", endDate);
                      fetchHomeworkData(selectedClassSubject.id, date, endDate);
                    }}
                    renderInput={(params) => <TextField {...params} sx={{ ...textDisabledFieldStyles }} />}
                  />
                  <DatePicker
                    label="End Date"
                    value={newReview.endDate}
                    onChange={(date) => handleReviewChange("endDate", date)}
                    disabled
                    renderInput={(params) => <TextField {...params} sx={{ ...textDisabledFieldStyles }} />}
                  />
                  <TextField
                    label="General Remarks"
                    value={newReview.generalRemarks}
                    onChange={(e) => handleReviewChange("generalRemarks", e.target.value)}
                    multiline
                    rows={3}
                    sx={{ ...textFieldStyles }}
                  />
                  <TextField
                    label="Suggestions"
                    value={newReview.suggestions}
                    onChange={(e) => handleReviewChange("suggestions", e.target.value)}
                    multiline
                    rows={3}
                    sx={{ ...textFieldStyles }}
                  />
                </Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Student Reviews
                </Typography>
                {homeworkData.length > 0 && (
                  <Typography sx={{ mb: 2 }}>Total Homework Assignments in Period: {homeworkData.length}</Typography>
                )}
                {newReview.studentReviews.map((sr, index) => (
                  <Box
                    key={index}
                    sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2, p: 2, bgcolor: "#222", borderRadius: 1 }}
                  >
                    <TextField
                      label="Student"
                      value={`${students[index]?.firstName} ${students[index]?.lastName}`}
                      disabled
                      sx={{ ...textDisabledFieldStyles }}
                    />
                    <TextField
                      label="Total Topics Reviewed"
                      type="number"
                      value={sr.totalTopicsReviewed}
                      onChange={(e) => handleStudentReviewChange(index, "totalTopicsReviewed", e.target.value)}
                      sx={{ ...textFieldStyles }}
                    />
                    <TextField
                      label="Total Homework Completed"
                      type="number"
                      value={sr.totalHomeworkCompleted}
                      onChange={(e) => handleStudentReviewChange(index, "totalHomeworkCompleted", e.target.value)}
                      sx={{ ...textFieldStyles }}
                    />
                    <TextField
                      label="Completion Rate (%)"
                      value={sr.completionRate.toFixed(2)}
                      disabled
                      sx={{ ...textDisabledFieldStyles }}
                    />
                    <FormControl sx={{ ...textFieldStyles }}>
                      <InputLabel sx={{ color: "#aaa" }}>Status</InputLabel>
                      <Select
                        value={sr.status}
                        onChange={(e) => handleStudentReviewChange(index, "status", e.target.value)}
                      >
                        <MenuItem value="PENDING">Pending</MenuItem>
                        <MenuItem value="NEEDS_IMPROVEMENT">Needs Improvement</MenuItem>
                        <MenuItem value="EXCELLENT">Excellent</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label="Remarks"
                      value={sr.remarks}
                      onChange={(e) => handleStudentReviewChange(index, "remarks", e.target.value)}
                      multiline
                      rows={3}
                      sx={{ ...textFieldStyles }}
                    />
                  </Box>
                ))}
              </Box>
            </DialogContent>
            <DialogActions sx={{ bgcolor: "#000" }}>
              <Button onClick={onClose} variant="contained" color="error">
                Cancel
              </Button>
              <Button onClick={handleCreateReview} sx={{ color: "#00c757" }}>
                Save
              </Button>
            </DialogActions>
          </Box>
        </Box>
      </Dialog>
    </LocalizationProvider>
  );
};

export default CreateBiWeeklyReviewDialog;