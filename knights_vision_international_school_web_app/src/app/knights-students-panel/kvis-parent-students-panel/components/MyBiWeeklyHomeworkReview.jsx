"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Dialog,
  Alert,
} from "@mui/material";
import { CalendarToday, Close } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import jwtDecode from "jwt-decode";

const drawerWidth = 280;
const appBarHeight = 64;
const greenAccent = "#00c853";

const textFieldStyles = {
  "& .MuiInputBase-input": { color: "#fff" },
  "& .MuiInputLabel-root": { color: "#aaa" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#555" },
    "&:hover fieldset": { borderColor: "#777" },
    "&.Mui-focused fieldset": { borderColor: greenAccent },
  },
};

const MyBiWeeklyHomeworkReview = () => {
  const [className, setClassName] = useState("");
  const [classSubjects, setClassSubjects] = useState([]);
  const [biWeeklyReviews, setBiWeeklyReviews] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [period, setPeriod] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = Cookies.get("student_token");
    if (!token) {
      toast.error("User not authenticated. Please log in.");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const classMap = {
        5: "CLASS_VI",
      };
      setClassName(classMap[decoded.classId] || "Unknown");
    } catch (err) {
      toast.error("Invalid token.");
    }
  }, []);

  useEffect(() => {
    if (!className) return;

    const fetchClassSubjects = async () => {
      const token = Cookies.get("student_token");
      if (!token) {
        toast.error("User not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("/api/a1-knights-students-panel/students/mybiweeklyreviews", {
          headers: { Authorization: `Bearer ${token}` },
          params: { fetch: "subjects" },
        });
        setClassSubjects(response.data.classSubjects);
      } catch (err) {
        console.error("Fetch Class Subjects Error:", err.response?.data || err.message);
        setError("Failed to fetch subjects.");
        toast.error("Failed to fetch subjects.");
      } finally {
        setLoading(false);
      }
    };

    fetchClassSubjects();
  }, [className]);

  const fetchBiWeeklyReviews = async (classSubjectId) => {
    const token = Cookies.get("student_token");
    if (!token) {
      toast.error("User not authenticated. Please log in.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/a1-knights-students-panel/students/mybiweeklyreviews", {
        headers: { Authorization: `Bearer ${token}` },
        params: { classSubjectId, period },
      });
      setBiWeeklyReviews(response.data.reviews);
    } catch (err) {
      console.error("Fetch Bi-Weekly Reviews Error:", err.response?.data || err.message);
      setError("Failed to fetch bi-weekly reviews.");
      toast.error("Failed to fetch bi-weekly reviews.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (subject) => {
    setSelectedSubject(subject);
    fetchBiWeeklyReviews(subject.id);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSubject(null);
    setBiWeeklyReviews([]);
  };

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
    if (selectedSubject) {
      fetchBiWeeklyReviews(selectedSubject.id);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        right: 0,
        bottom: 0,
        bgcolor: "#000",
        color: "#fff",
        p: 3,
        overflowY: "auto",
      }}
    >
      <ListItemButton
        sx={{
          backgroundColor: "#009688",
          color: "#fff",
          "&:hover": { backgroundColor: "#009688" },
          mb: 2,
        }}
      >
        <ListItemIcon>
          <CalendarToday />
        </ListItemIcon>
        <ListItemText primary={`My Bi-Weekly Homework Reviews - ${className}`} />
      </ListItemButton>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <CircularProgress sx={{ color: greenAccent }} />
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ textAlign: "center", mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Subjects Table */}
      <Box sx={{ mb: 4, p: 2, bgcolor: "#111", borderRadius: 2 }}>
        <Typography variant="h6" sx={{ color: greenAccent, mb: 2 }}>
          Subjects
        </Typography>
        <Table sx={{ bgcolor: "#181818" }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "#333" }}>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>ID</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Subject</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Teacher</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classSubjects.length > 0 ? (
              classSubjects.map((cs) => (
                <TableRow key={cs.id} sx={{ bgcolor: "#181818", "&:hover": { bgcolor: "#222" } }}>
                  <TableCell sx={{ color: "#fff" }}>{cs.id}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{cs.subject.name}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{cs.teacher?.name || "Unassigned"}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      sx={{ color: greenAccent, borderColor: greenAccent }}
                      onClick={() => handleOpenDialog(cs)}
                    >
                      View Reviews
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} sx={{ color: "#fff", textAlign: "center" }}>
                  No subjects found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Bi-Weekly Review Dialog */}
      <Dialog
        sx={{
          position: "fixed",
          top: `${appBarHeight}px`,
          left: `calc(${drawerWidth}px)`,
          transform: "translate(0, 0)",
        }}
        open={dialogOpen}
        onClose={handleCloseDialog}
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
          <ListItemText primary={`Bi-Weekly Homework Reviews for ${selectedSubject?.subject.name || "Unknown"} - ${className}`} />
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
          >
            <Close />
          </Button>
        </ListItemButton>
        <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#000", color: "#fff", p: 2 }}>
          <Box sx={{ flex: 1, overflowY: "auto", pr: 1, maxHeight: "80vh" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <FormControl sx={{ minWidth: 200, ...textFieldStyles }}>
                <InputLabel sx={{ color: "#aaa" }}>Select Period</InputLabel>
                <Select value={period} onChange={handlePeriodChange}>
                  <MenuItem value="">All Periods</MenuItem>
                  {Array.from({ length: 12 }, (_, i) => {
                    const date = new Date();
                    date.setMonth(date.getMonth() - i);
                    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
                    const endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + 13);
                    const periodStr = `${startDate.toISOString().slice(0, 10)}-${endDate.toISOString().slice(0, 10)}`;
                    return (
                      <MenuItem key={periodStr} value={periodStr}>
                        {startDate.toLocaleString("default", { month: "long", year: "numeric" })} (
                        {startDate.toLocaleDateString("en-IN")} - {endDate.toLocaleDateString("en-IN")})
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              <Typography variant="body2">Total Reviews: {biWeeklyReviews.length}</Typography>
            </Box>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                <CircularProgress sx={{ color: greenAccent }} />
              </Box>
            ) : (
              <Box sx={{ overflowX: "auto", whiteSpace: "nowrap", pb: 2 }}>
                <List sx={{ display: "inline-flex", gap: 2 }}>
                  {biWeeklyReviews.length === 0 ? (
                    <Typography>No reviews found for the selected period.</Typography>
                  ) : (
                    biWeeklyReviews.map((review) => (
                      <ListItem
                        key={review.id}
                        sx={{
                          bgcolor: review.studentReviews[0]?.status === "NEEDS_IMPROVEMENT" ? "rgba(244, 67, 54, 0.1)" : "rgba(0, 200, 83, 0.1)",
                          borderRadius: 1,
                          width: "400px",
                          display: "inline-block",
                          "&:hover": {
                            bgcolor: review.studentReviews[0]?.status === "NEEDS_IMPROVEMENT" ? "rgba(244, 67, 54, 0.2)" : "rgba(0, 200, 83, 0.2)",
                          },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body1">
                              <strong>Period:</strong> {new Date(review.startDate).toLocaleDateString("en-IN")} -{" "}
                              {new Date(review.endDate).toLocaleDateString("en-IN")}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2"><strong>General Remarks:</strong> {review.generalRemarks || "N/A"}</Typography>
                              <Typography variant="body2"><strong>Suggestions:</strong> {review.suggestions || "N/A"}</Typography>
                              <Typography variant="body2"><strong>Reviewed By:</strong> {review.reviewedBy.name}</Typography>
                              {review.studentReviews[0] && (
                                <>
                                  <Typography variant="body2"><strong>Total Topics:</strong> {review.studentReviews[0].totalTopicsReviewed}</Typography>
                                  <Typography variant="body2"><strong>Completed:</strong> {review.studentReviews[0].totalHomeworkCompleted}</Typography>
                                  <Typography variant="body2">
                                    <strong>Completion Rate:</strong> {review.studentReviews[0].completionRate.toFixed(2)}%
                                  </Typography>
                                  <Typography variant="body2"><strong>Status:</strong> {review.studentReviews[0].status}</Typography>
                                  <Typography variant="body2"><strong>Remarks:</strong> {review.studentReviews[0].remarks || "N/A"}</Typography>
                                </>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              </Box>
            )}
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default MyBiWeeklyHomeworkReview;