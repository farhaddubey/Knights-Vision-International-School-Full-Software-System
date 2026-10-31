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
  ListItemButton,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { CalendarToday, Close } from "@mui/icons-material";
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

const LeaveRequestsDialog = ({ open, onClose, className }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    if (open) {
      const fetchLeaveRequests = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`/api/attendance/${className.toLowerCase()}/leave-requests`, {
            params: { status: statusFilter === "ALL" ? undefined : statusFilter },
          });
          setLeaveRequests(response.data.leaveRequests || []);
        } catch (err) {
          console.error("Fetch Leave Requests Error:", err.message);
          toast.error("Failed to fetch leave requests.");
        } finally {
          setLoading(false);
        }
      };
      fetchLeaveRequests();
    }
  }, [open, className, statusFilter]);

  const handleApproveReject = async (requestId, approved) => {
    try {
      const response = await axios.post(`/api/attendance/${className.toLowerCase()}/leave-requests/${requestId}`, {
        approved,
        approvedById: 1, // Replace with actual teacher ID from auth context
        approvedAt: new Date().toISOString(),
      });
      if (response.status === 200) {
        const compliment = approved ? "Great job staying organized!" : "";
        toast.success(`Leave request ${approved ? "approved" : "rejected"} successfully. ${compliment}`);
        setLeaveRequests((prev) =>
          prev.map((req) =>
            req.id === requestId ? { ...req, approved, approvedAt: new Date().toISOString() } : req
          )
        );
      }
    } catch (err) {
      console.error("Update Leave Request Error:", err.message);
      toast.error("Failed to update leave request.");
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
          <CalendarToday />
        </ListItemIcon>
        <ListItemText sx={{ color: "#fff" }} primary={`${className} Leave Requests`} />
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
                <InputLabel sx={{ color: "#aaa" }}>Filter Status</InputLabel>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="ALL">All</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="APPROVED">Approved</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Box>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                <Typography>Loading...</Typography>
              </Box>
            ) : (
              <Box sx={{ maxHeight: "70vh", overflowY: "auto" }}>
                <List>
                  {leaveRequests.length > 0 ? (
                    leaveRequests.map((request) => (
                      <ListItem
                        key={request.id}
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
                        <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                          {request.studentName}
                        </Typography>
                        <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                          {request.fromDate.slice(0, 10)} to {request.toDate.slice(0, 10)}
                        </Typography>
                        <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                          {request.reason}
                        </Typography>
                        <Typography variant="body2" sx={{ flex: 0.8, color: "#fff" }}>
                          {request.approved === null ? "Pending" : request.approved ? "Approved" : "Rejected"}
                        </Typography>
                        <Box sx={{ flex: 1, display: "flex", gap: 1 }}>
                          {request.approved === null && (
                            <>
                              <Button
                                variant="outlined"
                                color="success"
                                onClick={() => handleApproveReject(request.id, true)}
                                sx={{ color: "#00c853", borderColor: "#00c853" }}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outlined"
                                color="error"
                                onClick={() => handleApproveReject(request.id, false)}
                                sx={{ color: "#f44336", borderColor: "#f44336" }}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </Box>
                      </ListItem>
                    ))
                  ) : (
                    <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
                      No leave requests found.
                    </Typography>
                  )}
                </List>
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

export default LeaveRequestsDialog;