"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  Box,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";

const ExamScheduleDialog = ({ open, onClose, classId, className, semester }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    if (open && semester) {
      fetchSchedules();
    }
  }, [open, semester, classId, className]);

  const fetchSchedules = async () => {
    const token = Cookies.get("administration_token");
    if (!token) {
      setError("User not authenticated.");
      setLoading(false);
      toast.error("Please log in to continue.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/semester-exam-schedules`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { className: className.toLowerCase(), semester, page: 1, pageSize: 30 },
      });

      if (!response.data || !Array.isArray(response.data.schedules)) {
        throw new Error("Invalid response format");
      }

      setSchedules(response.data.schedules);
    } catch (err) {
      console.error("Error fetching exam schedules:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to fetch exam schedules.");
      toast.error(err.response?.data?.error || "Failed to fetch exam schedules.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: "#333", color: "#fff" }}>
        Exam Schedules - {className} - {semester?.replace("_", " ")}
      </DialogTitle>
      <DialogContent sx={{ bgcolor: "#181818", color: "#fff" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress size={60} sx={{ color: "#00c853" }} />
          </Box>
        ) : error ? (
          <Typography color="#fff" sx={{ textAlign: "center", p: 2 }}>
            {error}
          </Typography>
        ) : schedules.length > 0 ? (
          <List>
            {schedules.map((schedule) => (
              <ListItem
                key={schedule.id}
                sx={{
                  bgcolor: "#333",
                  mb: 1,
                  borderRadius: 1,
                  p: 2,
                  "&:hover": { bgcolor: "#444" },
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    Subject: {schedule.subjectName}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    Date: {new Date(schedule.examDate).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    Duration: {schedule.durationMinutes} minutes
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    Hall: {schedule.examHall || "N/A"}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
            No exam schedules found for {semester?.replace("_", " ")}.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ bgcolor: "#333" }}>
        <Button onClick={onClose} sx={{ color: "#00c853" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExamScheduleDialog;