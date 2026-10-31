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
    height: 70vh;
    background-color: #181818;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 16px;
  }
  .custom-calendar .react-calendar__tile {
    color: #fff;
    border-radius: 4px;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
  .custom-calendar .react-calendar__tile:hover {
    background-color: #333;
  }
  .custom-calendar .react-calendar__month-view__days__day--weekend {
    background-color: #ff69b4;
    color: #fff;
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
  .custom-calendar .react-calendar__tile--approved {
    background-color: blue;
    color: #fff;
  }
  .custom-calendar .react-calendar__tile--rejected {
    background-color: red;
    color: #fff;
  }
  .custom-calendar .react-calendar__tile--pending {
    background-color: #ffa500;
    color: #fff;
  }
`;

const LeaveRequestHistoryDialog = ({ open, onClose, studentId, studentName, className, embedded = false }) => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !studentId) {
      setLeaveRequests([]);
      setLoading(false);
      return;
    }

    const fetchLeaveRequests = async () => {
      if (!Number.isInteger(studentId) || !month.match(/^\d{4}-\d{2}$/)) {
        console.error("Invalid studentId or month:", { studentId, month });
        toast.error("Invalid request parameters.");
        setLeaveRequests([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(`/api/attendance/${className.toLowerCase()}/leave-requests/history/${studentId}`, {
          params: { month },
        });
        setLeaveRequests(response.data.leaveRequests || []);
      } catch (err) {
        console.error("Fetch Leave Requests Error:", err.message, err.response?.data);
        toast.error("Failed to fetch leave requests: " + (err.response?.data?.error || err.message));
        setLeaveRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, [open, studentId, month, className]);

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
  };

  const getTileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const dateStr = date.toISOString().slice(0, 10);
    const requests = leaveRequests.filter(
      (r) => dateStr >= r.fromDate.slice(0, 10) && dateStr <= r.toDate.slice(0, 10)
    );
    if (!requests.length) return null;

    const request = requests[0];
    return (
      <Box
        sx={{
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
        title={`${request.approved ? "Approved" : request.approved === false ? "Rejected" : "Pending"}: ${request.reason}`}
      >
        {request.approved ? "A" : request.approved === false ? "R" : "P"}
      </Box>
    );
  };

  const getTileClassName = ({ date, view }) => {
    if (view !== "month") return null;
    const dateStr = date.toISOString().slice(0, 10);
    const requests = leaveRequests.filter(
      (r) => dateStr >= r.fromDate.slice(0, 10) && dateStr <= r.toDate.slice(0, 10)
    );
    const isSunday = date.getDay() === 0;

    if (isSunday) {
      return "react-calendar__tile--weekly-off";
    }
    if (requests.length) {
      const request = requests[0];
      if (request.approved) return "react-calendar__tile--approved";
      if (request.approved === false) return "react-calendar__tile--rejected";
      return "react-calendar__tile--pending";
    }
    return null;
  };

  const isValidDate = (monthStr) => {
    const date = new Date(monthStr + "-01");
    return !isNaN(date.getTime());
  };

  const content = (
    <>
      <style>{calendarStyles}</style>
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
            ) : isValidDate(month) ? (
              <Box sx={{ width: "70vw", height: "70vh", mx: "auto" }}>
                <Calendar
                  value={new Date(month + "-01")}
                  tileContent={getTileContent}
                  tileClassName={getTileClassName}
                  className="custom-calendar"
                />
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">Legend:</Typography>
                  <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 16, height: 16, backgroundColor: "blue", borderRadius: "50%" }} />
                      <Typography variant="body2">Approved</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 16, height: 16, backgroundColor: "red", borderRadius: "50%" }} />
                      <Typography variant="body2">Rejected</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 16, height: 16, backgroundColor: "#ffa500", borderRadius: "50%" }} />
                      <Typography variant="body2">Pending</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 16, height: 16, backgroundColor: "#ff69b4", borderRadius: "50%" }} />
                      <Typography variant="body2">Weekly Off</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Typography sx={{ color: "#fff", textAlign: "center" }}>
                Invalid month selected. Please choose a valid month.
              </Typography>
            )}
          </DialogContent>
        </Box>
      </Box>
      {!embedded && (
        <DialogActions sx={{ bgcolor: "#000" }}>
          <Button onClick={onClose} variant="contained" color="error">
            Close
          </Button>
        </DialogActions>
      )}
    </>
  );

  if (embedded) {
    return content;
  }

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
        <ListItemText sx={{ color: "#fff" }} primary={`Leave Request History for ${studentName || "Unknown"} - ${className}`} />
        <Button
          onClick={onClose}
          variant="outlined"
          color="error"
          sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
        >
          <Close />
        </Button>
      </ListItemButton>
      {content}
    </Dialog>
  );
};

export default LeaveRequestHistoryDialog;