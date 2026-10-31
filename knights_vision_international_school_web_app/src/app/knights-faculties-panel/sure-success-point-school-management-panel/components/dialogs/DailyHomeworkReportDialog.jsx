"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { Assessment, Close } from "@mui/icons-material";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

const drawerWidth = 280;
const appBarHeight = 64;

const textFieldStyles = {
  "& .MuiInputBase-input": { color: "#fff" },
  "& .MuiInputLabel-root": { color: "#aaa" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#555" },
    "&:hover fieldset": { borderColor: "#777" },
    "&.Mui-focused fieldset": { borderColor: "#00c853" },
  },
};

const statusColors = {
  PENDING: { variant: "outlined", color: "warning" },
  SUBMITTED: { variant: "contained", color: "success" },
  LATE: { variant: "contained", color: "error" },
  NEEDS_IMPROVEMENT: { variant: "contained", color: "warning" },
  EXCELLENT: { variant: "contained", color: "success" },
};

const DailyHomeworkReportDialog = ({ open, onClose, classSubjectId, className, subjectName, studentId, studentName }) => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [homeworkRecords, setHomeworkRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [daysInMonth, setDaysInMonth] = useState([]);

  useEffect(() => {
    if (open && classSubjectId && studentId) {
      fetchHomeworkReport();
    }
  }, [open, classSubjectId, month, studentId]);

  const fetchHomeworkReport = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("faculties_token");
      if (!token) throw new Error("User not authenticated");

      const response = await axios.get(`/api-schools-panel/class_teachers_panel/homework/report`, {
        params: { classSubjectId, month, studentId },
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Homework Report Response:", response.data); // Debug
      setHomeworkRecords(response.data.homeworkRecords || []);

      const [year, monthIndex] = month.split("-").map(Number);
      const days = new Date(year, monthIndex, 0).getDate();
      setDaysInMonth(Array.from({ length: days }, (_, i) => i + 1));
    } catch (err) {
      console.error("Error fetching homework report:", err.message);
      toast.error(err.response?.data?.error || "Failed to fetch homework report.");
      setHomeworkRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
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
      <Box
        sx={{
          backgroundColor: "#212121",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          p: 1,
        }}
      >
        <Assessment sx={{ mr: 1 }} />
        <Typography variant="h6">
          Homework Report for {studentName} - {className} - {subjectName}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ pr: "100px" }}>
          <FormControl size="small" sx={{ minWidth: 200, ...textFieldStyles }}>
            <InputLabel sx={{ color: "#aaa" }}>Select Month</InputLabel>
            <Select value={month} onChange={handleMonthChange}>
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const monthStr = date.toISOString().slice(0, 7);
                return (
                  <MenuItem key={monthStr} value={monthStr}>
                    {date.toLocaleString("default", { month: "long", year: "numeric" })}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
        <Button
          onClick={onClose}
          variant="outlined"
          color="error"
          sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
        >
          <Close />
        </Button>
      </Box>
      <DialogContent sx={{ bgcolor: "#181818", p: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <CircularProgress size={60} sx={{ color: "#00c757" }} />
          </Box>
        ) : (
          <Box sx={{ bgcolor: "#181818", borderRadius: 2 }}>
            <Box
              sx={{
                display: "flex",
                p: 1,
                bgcolor: "#333",
                borderRadius: 1,
                position: "sticky",
                top: 0,
                zIndex: 10,
                overflowX: "auto",
              }}
            >
              <Typography variant="body2" sx={{ flex: 2, fontWeight: "bold", color: "#fff", minWidth: "150px" }}>
                Date
              </Typography>
              <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff", minWidth: "100px", textAlign: "center" }}>
                Status
              </Typography>
            </Box>
            <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 200}px)`, overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
              <List>
                {homeworkRecords.length > 0 ? (
                  homeworkRecords.map((record, index) => (
                    <ListItem
                      key={record.date || index} // Fallback to index if date is undefined
                      sx={{
                        display: "flex",
                        p: 1,
                        bgcolor: "#181818",
                        mb: 1,
                        borderRadius: 1,
                        borderBottom: "2px solid #333",
                        overflowX: "auto",
                      }}
                    >
                      <ListItemText
                        primary={record.date ? new Date(record.date).toLocaleDateString() : "Invalid Date"}
                        sx={{ flex: 2, color: "#fff", minWidth: "150px" }}
                      />
                      <Box sx={{ flex: 1, minWidth: "100px", textAlign: "center" }}>
                        <Button
                          variant={statusColors[record.status]?.variant || "outlined"}
                          color={statusColors[record.status]?.color || "error"}
                          sx={{ width: "80px" }}
                          // disabled
                        >
                          {record.status ? record.status.replace("_", " ") : "N/A"}
                        </Button>
                      </Box>
                    </ListItem>
                  ))
                ) : (
                  <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
                    No homework records found for this month.
                  </Typography>
                )}
              </List>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ bgcolor: "#181818" }}>
        <Button onClick={onClose} variant="contained" color="error">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DailyHomeworkReportDialog;