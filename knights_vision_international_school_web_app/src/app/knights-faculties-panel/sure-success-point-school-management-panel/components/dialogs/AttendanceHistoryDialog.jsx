"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { CalendarToday, Close } from "@mui/icons-material";
import Calendar from "react-calendar";
import { toast } from "react-toastify";
import "react-calendar/dist/Calendar.css";

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

const calendarStyles = `
  .custom-calendar {
    width: 70vw;
    height: 50vh;
    background-color: #181818;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 16px;
  }
  .custom-calendar .react-calendar__tile {
    color: #fff;
  }
  .custom-calendar .react-calendar__tile:hover {
    background-color: #333;
  }
  .custom-calendar .react-calendar__month-view__days__day--weekend {
    color: #f44336;
  }
  .custom-calendar .react-calendar__navigation button {
    color: #fff;
    background-color: #333;
    border-radius: 4px;
  }
  .custom-calendar .react-calendar__navigation button:hover {
    background-color: #555;
  }
  .custom-calendar .react-calendar__tile--active {
    background-color: #00c853;
    color: #000;
  }
`;

const AttendanceHistoryDialog = ({ open, onClose, studentId, studentName, className, classId = null }) => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && studentId) {
      const fetchAttendanceHistory = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`/api-schools-panel/class_teachers_panel/attendance/${className.toLowerCase()}/history/${studentId}`, {
            params: { month, ...(classId ? { classId } : {}) },
          });
          setAttendanceRecords(response.data.attendanceRecords);
        } catch (err) {
          console.error("Fetch Attendance History Error:", err.message);
          toast.error("Failed to fetch attendance history.");
        } finally {
          setLoading(false);
        }
      };
      fetchAttendanceHistory();
    }
  }, [open, studentId, month, className, classId]);

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
  };

  const getTileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const dateStr = date.toISOString().slice(0, 10);
    const record = attendanceRecords.find((r) => r.date.slice(0, 10) === dateStr);
    if (!record) return null;

    const statusColors = {
      PRESENT: "green",
      ABSENT: "red",
      HOLIDAY: "purple",
      WEEKLY_HOLIDAY: "yellow",
    };

    return (
      <Box
        sx={{
          backgroundColor: statusColors[record.status] || "gray",
          color: "#fff",
          borderRadius: "50%",
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          margin: "auto",
          mt: 1,
        }}
        title={`${record.status}${record.remarks ? `: ${record.remarks}` : ""}`}
      >
        {record.status.charAt(0)}
      </Box>
    );
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
      <style>{calendarStyles}</style>
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
        <ListItemText sx={{ color: "#fff" }} primary={`Attendance History for ${studentName} - ${className}`} />
        <Button
          onClick={onClose}
          variant="outlined"
          color="error"
          sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
        >
          <Close />
        </Button>
      </ListItemButton>
      <Box sx={{ display: 'flex', flexDirection: 'row', height: '100%', backgroundColor: '#000', color: '#fff', p: 2 }}>
        <Box sx={{ flex: 1, overflowY: 'auto', pr: 1, maxHeight: '80vh' }}>
          <DialogContent sx={{ backgroundColor: "#000", color: "#fff" }}>
            <Box sx={{ mb: 2 }}>
              <FormControl sx={{ minWidth: 200, ...textFieldStyles }}>
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
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                <Typography>Loading...</Typography>
              </Box>
            ) : (
              <Box sx={{ width: "70vw", height: "70vh", mx: "auto" }}>
                <Calendar
                  value={new Date(month + "-01")}
                  tileContent={getTileContent}
                  className="custom-calendar"
                />
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">Legend:</Typography>
                  <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 16, height: 16, backgroundColor: "green", borderRadius: "50%" }} />
                      <Typography variant="body2">Present</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 16, height: 16, backgroundColor: "red", borderRadius: "50%" }} />
                      <Typography variant="body2">Absent</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 16, height: 16, backgroundColor: "purple", borderRadius: "50%" }} />
                      <Typography variant="body2">Holiday</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 16, height: 16, backgroundColor: "yellow", borderRadius: "50%" }} />
                      <Typography variant="body2">Weekly Holiday</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
        </Box>
      </Box>
      <DialogActions sx={{ bgcolor: "#000" }}>
        <Button onClick={onClose} variant="contained" color="error">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AttendanceHistoryDialog;
