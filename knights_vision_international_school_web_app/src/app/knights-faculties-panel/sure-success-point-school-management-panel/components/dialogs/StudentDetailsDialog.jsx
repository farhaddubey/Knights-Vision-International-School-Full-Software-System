"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Tabs,
  Tab,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { CalendarToday, Close } from "@mui/icons-material";
import AttendanceHistoryDialog from './AttendanceHistoryDialog';
import LeaveRequestHistoryDialog from './LeaveRequestHistoryDialog';

const drawerWidth = 280;
const appBarHeight = 64;

const StudentDetailsDialog = ({ open, onClose, studentId, studentName, className, view }) => {
  const [tabValue, setTabValue] = useState(view === "attendance" ? 0 : 1);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
        <ListItemText sx={{ color: "#fff" }} primary={`Student Details for ${studentName} - ${className}`} />
        <Button
          onClick={onClose}
          variant="outlined"
          color="error"
          sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
        >
          <Close />
        </Button>
      </ListItemButton>
      <Box sx={{ bgcolor: "#000", color: "#fff", p: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            bgcolor: "#333",
            "& .MuiTab-root": { color: "#fff" },
            "& .Mui-selected": { color: "#00c853" },
            "& .MuiTabs-indicator": { backgroundColor: "#00c853" },
          }}
        >
          <Tab label="Attendance History" />
          <Tab label="Leave History" />
        </Tabs>
        <Box sx={{ mt: 2 }}>
          {tabValue === 0 && (
            <AttendanceHistoryDialog
              open={open}
              onClose={onClose}
              studentId={studentId}
              studentName={studentName}
              className={className}
              embedded
            />
          )}
          {tabValue === 1 && (
            <LeaveRequestHistoryDialog
              open={open}
              onClose={onClose}
              studentId={studentId}
              studentName={studentName}
              className={className}
              embedded
            />
          )}
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

export default StudentDetailsDialog;