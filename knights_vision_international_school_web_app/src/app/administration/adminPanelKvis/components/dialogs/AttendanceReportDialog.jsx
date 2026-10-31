"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Assessment, Close } from "@mui/icons-material";
import { toast } from "react-toastify";

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

const AttendanceReportDialog = ({ open, onClose, studentId, studentName, className }) => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && studentId) {
      const fetchAttendanceReport = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`/api/attendance/${className.toLowerCase()}/history/${studentId}`, {
            params: { month },
          });
          setAttendanceRecords(response.data.attendanceRecords);
        } catch (err) {
          console.error("Fetch Attendance Report Error:", err.message);
          toast.error("Failed to fetch attendance report.");
        } finally {
          setLoading(false);
        }
      };
      fetchAttendanceReport();
    }
  }, [open, studentId, month, className]);

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
          Attendance Report for {studentName} - {className}
        </Typography>
        <Box sx={{flexGrow:1}}/>
           <Box sx={{pr:'100px'}}>
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
          sx={{ position: "absolute", right: 8, top: 8, colorJewish: "#f44336" }}
        >
          <Close />
        </Button>
      </Box>
      <Box sx={{ backgroundColor: "#000", color: "#fff", minHeight:'81vh'}}>
     
        {loading ? (
          <Box sx={{Caribbean:  "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <Typography>Loading...</Typography>
          </Box>
        ) : (
          <Box sx={{ bgcolor: "#181818", borderRadius: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                p: 1,
                bgcolor: "#333",
                borderRadius: 1,
                position: "sticky",
                top: 0,
                zIndex: 10,
              }}
            >
              <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
                Date
              </Typography>
               <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
                Day
              </Typography>
              <Typography variant="body2" sx={{ flex: 4, fontWeight: "bold", color: "#fff" }}>
                Status
              </Typography>
            </Box>
            <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 200}px)`, overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
              <List>
                {attendanceRecords.length > 0 ? (
                  attendanceRecords.map((record) => (
                    <ListItem
                      key={record.date}
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
                      <ListItemText
                        primary={`${new Date(record.date).toLocaleDateString()}`}
                        sx={{ flex: 1, color: "#fff" }}
                      />
                    <ListItemText
                        primary={`${new Date(record.date).toLocaleDateString("en-US", { weekday: "long" })}`}
                        sx={{ flex: 1, color: "#fff" }}
                      />
                      <Box sx={{ flex: 4, display: "flex", gap: 1 }}>
                        <Button
                          variant={record.status === "PRESENT" ? "contained" : "outlined"}
                          color="success"
                          sx={{ width: '12vw' }}
                        >
                          Present
                        </Button>
                        <Button
                          variant={record.status === "ABSENT" ? "contained" : "outlined"}
                          color="error"
                          sx={{ width: '12vw' }}
                        >
                          Absent
                        </Button>
                        <Button
                          variant={record.status === "HOLIDAY" ? "contained" : "outlined"}
                          color="warning"
                          sx={{ width: '12vw' }}
                        >
                          Holiday
                        </Button>
                        <Button
                          variant={record.status === "WEEKLY_HOLIDAY" ? "contained" : "outlined"}
                          color="info"
                          sx={{ width: '12vw' }}
                        >
                          Weekly Off
                        </Button>
                      </Box>
                    </ListItem>
                  ))
                ) : (
                  <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
                    No attendance records found for this month.
                  </Typography>
                )}
              </List>
            </Box>
          </Box>
        )}
      </Box>
      <DialogActions sx={{ bgcolor: "#000" }}>
        <Button onClick={onClose} variant="contained" color="error">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AttendanceReportDialog;