"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
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
  TextField,
} from "@mui/material";
import { Edit, Close } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import jwtDecode from "jwt-decode";

const drawerWidth = 280;
const appBarHeight = 64;
const greenAccent = "#00c853";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const textFieldStyles = {
  "& .MuiInputBase-input": { color: "#fff" },
  "& .MuiInputLabel-root": { color: "#aaa" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#555" },
    "&:hover fieldset": { borderColor: "#777" },
    "&.Mui-focused fieldset": { borderColor: greenAccent },
  },
};

const MyBoardExamResults = () => {
  const [className, setClassName] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("November");
  const [academicYear, setAcademicYear] = useState(2025);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
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

    const fetchSubjects = async () => {
      const token = Cookies.get("student_token");
      if (!token) {
        toast.error("User not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("/api/a1-knights-students-panel/students/myboardexamresults", {
          headers: { Authorization: `Bearer ${token}` },
          params: { fetch: "subjects" },
        });
        setSubjects(response.data.subjects);
      } catch (err) {
        console.error("Fetch Subjects Error:", err.response?.data || err.message);
        setError("Failed to fetch subjects.");
        toast.error("Failed to fetch subjects.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [className]);

  const fetchResults = async (classSubjectId) => {
    const token = Cookies.get("student_token");
    if (!token) {
      toast.error("User not authenticated. Please log in.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const monthIndex = monthNames.indexOf(selectedMonth) + 1;
      const response = await axios.get("/api/a1-knights-students-panel/students/myboardexamresults", {
        headers: { Authorization: `Bearer ${token}` },
        params: { classSubjectId, month: monthIndex, academicYear },
      });
      setResults(response.data.results);
    } catch (err) {
      console.error("Fetch Results Error:", err.response?.data || err.message);
      setError("Failed to fetch board exam results.");
      toast.error("Failed to fetch board exam results.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (subject) => {
    setSelectedSubject(subject);
    fetchResults(subject.id);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSubject(null);
    setResults([]);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    if (selectedSubject) {
      fetchResults(selectedSubject.id);
    }
  };

  const handleYearChange = (e) => {
    setAcademicYear(parseInt(e.target.value));
    if (selectedSubject) {
      fetchResults(selectedSubject.id);
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
        bgcolor: "#212121",
        color: "#fff",
        p: 3,
        overflowY: "auto",
      }}
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
          backgroundColor: "#181818",
          color: "#fff",
          "&:hover": { backgroundColor: "#181818" },
          mb: 2,
        }}
      >
        <ListItemIcon sx={{ color: greenAccent }}>
          <Edit />
        </ListItemIcon>
        <ListItemText primary={`My Board Exam Results - ${className}`} />
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

      {/* Subjects List */}
      <Box sx={{ mb: 4, p: 2, bgcolor: "#181818", borderRadius: 2 }}>
        <Typography variant="h6" sx={{ color: greenAccent, mb: 2 }}>
          Subjects
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            p: 1,
            bgcolor: "#333",
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" sx={{ flex: 0.5, fontWeight: "bold", color: "#fff" }}>
            ID
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Subject Name
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.5, fontWeight: "bold", color: "#fff" }}>
            Action
          </Typography>
        </Box>
        <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 200}px)`, overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
          <List>
            {subjects.length > 0 ? (
              subjects.map((subject) => (
                <ListItem
                  key={subject.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    p: 1,
                    bgcolor: "#181818",
                    mb: 1,
                    borderRadius: 1,
                    borderBottom: "2px solid #333",
                  }}
                >
                  <Typography variant="body2" sx={{ flex: 0.5, color: "#fff" }}>
                    {subject.id}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {subject.subject.name}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{ flex: 0.5, bgcolor: greenAccent, color: "#000", "&:hover": { bgcolor: "#00a548" } }}
                    onClick={() => handleOpenDialog(subject)}
                  >
                    View Results
                  </Button>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
                No subjects found for {className}.
              </Typography>
            )}
          </List>
        </Box>
      </Box>

      {/* Results Dialog */}
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
            backgroundColor: "#181818",
            color: "#fff",
            "&:hover": { backgroundColor: "#181818" },
          }}
        >
          <ListItemIcon sx={{ color: greenAccent }}>
            <Edit />
          </ListItemIcon>
          <ListItemText primary={`Board Exam Results for ${selectedSubject?.subject.name || "Unknown"} - ${className}`} />
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl sx={{ minWidth: 150, ...textFieldStyles }}>
              <InputLabel sx={{ color: "#aaa" }}>Month</InputLabel>
              <Select value={selectedMonth} onChange={handleMonthChange}>
                {monthNames.map((month) => (
                  <MenuItem key={month} value={month}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Academic Year"
              type="number"
              value={academicYear}
              onChange={handleYearChange}
              size="small"
              sx={{ width: "150px", ...textFieldStyles }}
            />
            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
            >
              <Close />
            </Button>
          </Box>
        </ListItemButton>
        <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#212121", color: "#fff", p: 2 }}>
          <Box sx={{ flex: 1, overflowY: "auto", pr: 1, maxHeight: "80vh" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography variant="body2">Total Results: {results.length}</Typography>
            </Box>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                <CircularProgress sx={{ color: greenAccent }} />
              </Box>
            ) : (
              <Box sx={{ overflowX: "auto", whiteSpace: "nowrap", pb: 2 }}>
                <List sx={{ display: "inline-flex", gap: 2 }}>
                  {results.length === 0 ? (
                    <Typography>No board exam results found for the selected period.</Typography>
                  ) : (
                    results.map((result) => (
                      <ListItem
                        key={result.id}
                        sx={{
                          bgcolor: result.totalMarks >= 60 ? "rgba(0, 200, 83, 0.1)" : "rgba(244, 67, 54, 0.1)",
                          borderRadius: 1,
                          width: "400px",
                          display: "inline-block",
                          "&:hover": {
                            bgcolor: result.totalMarks >= 60 ? "rgba(0, 200, 83, 0.2)" : "rgba(244, 67, 54, 0.2)",
                          },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body1">
                              <strong>Title:</strong> {result.title || "N/A"}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2"><strong>Written Marks:</strong> {result.writtenMarks ?? "N/A"}/90</Typography>
                              <Typography variant="body2"><strong>Oral Marks:</strong> {result.oralMarks ?? "N/A"}/10</Typography>
                              <Typography variant="body2"><strong>Total Marks:</strong> {result.totalMarks ?? "N/A"}/100</Typography>
                              <Typography variant="body2"><strong>Remarks:</strong> {result.remarks || "N/A"}</Typography>
                              <Typography variant="body2">
                                <strong>Exam Date:</strong> {result.examDate ? new Date(result.examDate).toLocaleDateString("en-IN") : "N/A"}
                              </Typography>
                              <Typography variant="body2"><strong>Academic Year:</strong> {result.academicYear}</Typography>
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

export default MyBoardExamResults;