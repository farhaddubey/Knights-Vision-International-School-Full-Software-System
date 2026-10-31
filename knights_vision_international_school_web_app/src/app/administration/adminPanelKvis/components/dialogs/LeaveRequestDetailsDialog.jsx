"use client";

import React from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { CalendarToday, Close } from "@mui/icons-material";
import { toast } from "react-toastify";

const drawerWidth = 280;
const appBarHeight = 64;

const LeaveRequestDetailsDialog = ({ open, onClose, request, className }) => {
  const handleApproveReject = async (approved) => {
    try {
      const response = await axios.post(`/api/attendance/${className.toLowerCase()}/leave-requests/${request.id}`, {
        approved,
        approvedById: 1, // Replace with actual teacher ID from auth context
        approvedAt: new Date().toISOString(),
      });
      if (response.status === 200) {
        const compliment = approved ? "Great job staying on top of your responsibilities!" : "";
        toast.success(`Leave request ${approved ? "approved" : "rejected"} successfully. ${compliment}`);
        onClose(); // Close dialog after action
      }
    } catch (err) {
      console.error("Update Leave Request Error:", err.message);
      toast.error("Failed to update leave request.");
    }
  };

  if (!request) return null;

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
      maxWidth="sm"
      fullWidth
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
        <ListItemText sx={{ color: "#fff" }} primary={`Leave Request Details - ${className}`} />
        <Button
          onClick={onClose}
          variant="outlined"
          color="error"
          sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
        >
          <Close />
        </Button>
      </ListItemButton>
      <DialogContent sx={{ backgroundColor: "#000", color: "#fff", p: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="body1">
            <strong>Student Name:</strong> {request.studentName}
          </Typography>
          <Typography variant="body1">
            <strong>Date Range:</strong> {request.fromDate.slice(0, 10)} to {request.toDate.slice(0, 10)}
          </Typography>
          <Typography variant="body1">
            <strong>Reason:</strong> {request.reason}
          </Typography>
          <Typography variant="body1">
            <strong>Status:</strong> {request.approved === null ? "Pending" : request.approved ? "Approved" : "Rejected"}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ bgcolor: "#000" }}>
        {request.approved === null && (
          <>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleApproveReject(true)}
            >
              Approve
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleApproveReject(false)}
            >
              Reject
            </Button>
          </>
        )}
        <Button onClick={onClose} variant="contained" color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeaveRequestDetailsDialog;