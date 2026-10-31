"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Report as ReportIcon, Close } from "@mui/icons-material";
import { toast } from "react-toastify";

const drawerWidth = 280;
const appBarHeight = 64;

const ViewBehaviourLogDialog = ({ open, onClose, logId, className }) => {
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (logId) {
      fetchLog();
    }
  }, [logId, className]);

  const fetchLog = async () => {
    const token = Cookies.get("administration_token");
    if (!token) {
      toast.error("User not authenticated.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`/api/MonthlyStudentBehaviourLogs/${className.toLowerCase()}/logs/${logId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLog(response.data);
    } catch (err) {
      console.error("Error fetching behaviour log:", err.message);
      toast.error("Failed to fetch behaviour log.");
    } finally {
      setLoading(false);
    }
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
          <ReportIcon />
        </ListItemIcon>
        <ListItemText
          sx={{ color: "#fff" }}
          primary="View Behaviour Log"
        />
        <Button
          onClick={onClose}
          variant="outlined"
          color="error"
          sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
        >
          <Close />
        </Button>
      </ListItemButton>
      <DialogContent sx={{ bgcolor: "#000", color: "#fff" }}>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : log ? (
          <Box>
            <Typography variant="h6">Log Details</Typography>
            <Typography>Student: {log.student.name}</Typography>
            <Typography>Category: {log.category}</Typography>
            <Typography>Type: {log.type}</Typography>
            <Typography>Severity Level: {log.severityLevel}</Typography>
            <Typography>Incident Date: {new Date(log.incidentDate).toLocaleDateString()}</Typography>
            <Typography>Class Subject: {log.classSubject?.subject.name || "N/A"}</Typography>
            <Typography>Description: {log.description || "N/A"}</Typography>
            <Typography>Punishment: {log.punishment?.title || "N/A"}</Typography>
            <Typography>Resolved: {log.isResolved ? "Yes" : "No"}</Typography>
            <Typography>Resolved By: {log.resolvedBy || "N/A"}</Typography>
            <Typography>Resolved Note: {log.resolvedNote || "N/A"}</Typography>
          </Box>
        ) : (
          <Typography>No data available</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewBehaviourLogDialog;