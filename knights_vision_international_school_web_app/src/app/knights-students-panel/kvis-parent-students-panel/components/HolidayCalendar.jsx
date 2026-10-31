"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
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
} from "@mui/material";
import { CalendarToday } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";

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

const MyHolidays = () => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHolidays = async () => {
      const token = Cookies.get("student_token");
      if (!token) {
        toast.error("User not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get("/api/a1-knights-students-panel/students/myholidays", {
          headers: { Authorization: `Bearer ${token}` },
          params: { month },
        });
        setHolidays(response.data.holidays);
      } catch (error) {
        console.error("Fetch Holidays Error:", error.response?.data || error.message);
        toast.error(error.response?.data?.error || "Failed to fetch holidays.");
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, [month]);

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
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
        <ListItemText primary="My Holidays" />
      </ListItemButton>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <CircularProgress sx={{ color: greenAccent }} />
        </Box>
      )}

      {/* Month Filter and Summary */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
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
        <Typography variant="body2">Total Holidays: {holidays.length}</Typography>
      </Box>

      {/* Scrollable Holidays List */}
      <Box sx={{ mb: 4, p: 2, bgcolor: "#111", borderRadius: 2 }}>
        <Typography variant="h6" sx={{ color: greenAccent, mb: 2 }}>
          Holiday List
        </Typography>
        {holidays.length === 0 ? (
          <Typography>No holidays found for the selected month.</Typography>
        ) : (
          <Box sx={{ overflowX: "auto", whiteSpace: "nowrap", pb: 2 }}>
            <List sx={{ display: "inline-flex", gap: 2 }}>
              {holidays.map((holiday) => (
                <ListItem
                  key={holiday.id}
                  sx={{
                    bgcolor: "rgba(156, 39, 176, 0.1)", // Purple for holidays
                    borderRadius: 1,
                    width: "300px",
                    display: "inline-block",
                    "&:hover": { bgcolor: "rgba(156, 39, 176, 0.2)" },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body1">
                        <strong>Date:</strong> {new Date(holiday.date).toLocaleDateString("en-IN")}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2"><strong>Title:</strong> {holiday.title}</Typography>
                        <Typography variant="body2"><strong>Applies To:</strong> {holiday.appliesTo}</Typography>
                        <Typography variant="body2"><strong>Created:</strong> {new Date(holiday.createdAt).toLocaleString("en-IN")}</Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MyHolidays;