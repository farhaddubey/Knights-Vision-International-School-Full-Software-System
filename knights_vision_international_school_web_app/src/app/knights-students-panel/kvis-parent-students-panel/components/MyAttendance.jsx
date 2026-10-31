"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer, Bounce } from "react-toastify";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

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

const calendarStyles = `
  .custom-calendar {
    width: 100%;
    height: 60vh;
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
    background-color: ${greenAccent};
    color: #000;
  }
`;

const MyAttendance = () => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAttendance = async () => {
      const token = Cookies.get("student_token");
      if (!token) {
        toast.error("User not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get("/api/a1-knights-students-panel/students/myattendance", {
          headers: { Authorization: `Bearer ${token}` },
          params: { month },
        });
        console.log("API Response:", response.data);
        setAttendanceRecords(response.data.attendanceRecords);
      } catch (error) {
        console.error("Fetch Attendance Error:", error.response?.data || error.message);
        toast.error(error.response?.data?.error || "Failed to fetch attendance records.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [month]);

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
  };

  const getTileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const dateStr = date.toISOString().slice(0, 10);
    const record = attendanceRecords.find((r) => r.date.slice(0, 10) === dateStr);
    const isSunday = date.getDay() === 0;

    // If no record exists and it's a Sunday, mark as WEEKLY_HOLIDAY
    if (!record && isSunday) {
      console.log(`Frontend: Marking ${dateStr} as WEEKLY_HOLIDAY (Sunday)`);
      return (
        <Box
          sx={{
            backgroundColor: "#ffeb3b",
            color: "#000",
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
          title="Weekly Holiday (Sunday)"
        >
          W
        </Box>
      );
    }

    if (!record) return null;

    const statusColors = {
      PRESENT: greenAccent,
      ABSENT: "#f44336",
      HOLIDAY: "#9c27b0",
      WEEKLY_HOLIDAY: "#ffeb3b",
    };

    return (
      <Box
        sx={{
          backgroundColor: statusColors[record.status] || "#888",
          color: record.status === "WEEKLY_HOLIDAY" ? "#000" : "#fff",
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
        title={record.status}
      >
        {record.status.charAt(0)}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "#000",
        color: "#fff",
        p: 3,
      }}
    >
      <style>{calendarStyles}</style>
      <Typography variant="h5" sx={{ color: greenAccent, mb: 2 }}>
        My Attendance
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Typography variant="body2">Legend:</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: greenAccent, borderRadius: "50%" }} />
            <Typography variant="body2">Present</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: "#f44336", borderRadius: "50%" }} />
            <Typography variant="body2">Absent</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: "#9c27b0", borderRadius: "50%" }} />
            <Typography variant="body2">Holiday</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: "#ffeb3b", borderRadius: "50%" }} />
            <Typography variant="body2">Weekly Holiday (Sunday)</Typography>
          </Box>
        </Box>
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
      <Box sx={{ flexGrow: 1, my: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <CircularProgress sx={{ color: greenAccent }} />
          </Box>
        ) : (
          <Calendar
            value={new Date(month + "-01")}
            tileContent={getTileContent}
            className="custom-calendar"
          />
        )}
      </Box>
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
        transition={Bounce}
      />
    </Box>
  );
};

export default MyAttendance;