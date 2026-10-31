import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const ApproveLeaveRequestDialog = ({ open, onClose, request, fetchLeaveRequests }) => {
  const handleApprove = async (approve) => {
    try {
      const token = Cookies.get("faculties_token");
      if (!token) throw new Error("User not authenticated");

      await axios.patch(
        `/api-schools-panel/class_teachers_panel/leave-requests/${request.id}`,
        { approved: approve },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Leave request ${approve ? "approved" : "rejected"} successfully`);
      fetchLeaveRequests();
      onClose();
    } catch (err) {
      console.error("Error updating leave request:", err.message);
      toast.error(err.response?.data?.error || "Failed to update leave request.");
    }
  };

  if (!request) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDialog-paper": {
          backgroundColor: "#212121",
          color: "#fff",
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>Approve/Reject Leave Request</DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Request ID:</strong> {request.id}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Student:</strong> {request.studentName}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Date Range:</strong> {request.fromDate.slice(0, 10)} to {request.toDate.slice(0, 10)}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Reason:</strong> {request.reason}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Status:</strong>{" "}
            {request.approved === null ? "Pending" : request.approved ? "Approved" : "Rejected"}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">
          Cancel
        </Button>
        <Button
          onClick={() => handleApprove(true)}
          color="success"
          variant="contained"
          disabled={request.approved !== null}
        >
          Approve
        </Button>
        <Button
          onClick={() => handleApprove(false)}
          color="warning"
          variant="contained"
          disabled={request.approved !== null}
        >
          Reject
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApproveLeaveRequestDialog;