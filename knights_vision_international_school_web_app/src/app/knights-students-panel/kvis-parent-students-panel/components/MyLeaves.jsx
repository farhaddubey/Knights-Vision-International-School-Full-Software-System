"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
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
  Divider,
} from "@mui/material";
import { CalendarToday, Close, Add } from "@mui/icons-material";
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

const MyLeaves = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [newLeave, setNewLeave] = useState({
    fromDate: "",
    toDate: "",
    reason: "",
  });

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      const token = Cookies.get("student_token");
      if (!token) {
        toast.error("User not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get("/api/a1-knights-students-panel/students/myleaves", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeaveRequests(response.data.leaveRequests);
        setFilteredRequests(response.data.leaveRequests);
      } catch (error) {
        console.error("Fetch Leave Requests Error:", error.response?.data || error.message);
        toast.error(error.response?.data?.error || "Failed to fetch leave requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, []);

  useEffect(() => {
    if (filter === "ALL") {
      setFilteredRequests(leaveRequests);
    } else {
      setFilteredRequests(
        leaveRequests.filter((req) => (filter === "APPROVED" ? req.approved : !req.approved))
      );
    }
  }, [filter, leaveRequests]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleNewLeaveChange = (e) => {
    const { name, value } = e.target;
    setNewLeave((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateLeave = async () => {
    const token = Cookies.get("student_token");
    if (!token) {
      toast.error("User not authenticated. Please log in.");
      return;
    }

    if (!newLeave.fromDate || !newLeave.toDate || !newLeave.reason) {
      toast.error("All fields are required.");
      return;
    }

    if (new Date(newLeave.fromDate) > new Date(newLeave.toDate)) {
      toast.error("From Date must be before or equal to To Date.");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(newLeave.fromDate) < today) {
      toast.error("From Date cannot be in the past.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "/api/a1-knights-students-panel/students/myleaves",
        {
          fromDate: newLeave.fromDate,
          toDate: newLeave.toDate,
          reason: newLeave.reason,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLeaveRequests((prev) => [...prev, response.data.leaveRequest]);
      setNewLeave({ fromDate: "", toDate: "", reason: "" });
      toast.success("Leave request created successfully.");
    } catch (error) {
      console.error("Create Leave Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "Failed to create leave request.");
    } finally {
      setLoading(false);
    }
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
        <ListItemText primary="My Leave Requests" />
      </ListItemButton>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <CircularProgress sx={{ color: greenAccent }} />
        </Box>
      )}

      {/* Create New Leave Request */}
      <Box sx={{ mb: 4, p: 2, bgcolor: "#111", borderRadius: 2 }}>
        <Typography variant="h6" sx={{ color: greenAccent, mb: 2 }}>
          Create New Leave Request
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 2 }}>
          <TextField
            label="From Date"
            name="fromDate"
            type="date"
            value={newLeave.fromDate}
            onChange={handleNewLeaveChange}
            InputLabelProps={{ shrink: true }}
            sx={{ ...textFieldStyles, mb: 2 }}
            required
          />
          <TextField
            label="To Date"
            name="toDate"
            type="date"
            value={newLeave.toDate}
            onChange={handleNewLeaveChange}
            InputLabelProps={{ shrink: true }}
            sx={{ ...textFieldStyles, mb: 2 }}
            required
          />
          <TextField
            label="Reason"
            name="reason"
            value={newLeave.reason}
            onChange={handleNewLeaveChange}
            sx={{ ...textFieldStyles, mb: 2 }}
            required
          />
        </Box>
        <Button
          onClick={handleCreateLeave}
          variant="contained"
          startIcon={<Add />}
          sx={{ bgcolor: greenAccent, color: "#000", "&:hover": { bgcolor: "#00a548" } }}
          disabled={loading}
        >
          Submit Leave Request
        </Button>
      </Box>

      {/* Filter and Summary */}
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <FormControl sx={{ minWidth: 200, ...textFieldStyles }}>
          <InputLabel sx={{ color: "#aaa" }}>Filter</InputLabel>
          <Select value={filter} onChange={handleFilterChange}>
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="APPROVED">Approved</MenuItem>
            <MenuItem value="UNAPPROVED">Unapproved</MenuItem>
          </Select>
        </FormControl>
        <Typography variant="body2">
          Total Leaves: {leaveRequests.length} | Approved: {leaveRequests.filter((r) => r.approved).length} | Unapproved: {leaveRequests.filter((r) => !r.approved).length}
        </Typography>
      </Box>

      {/* Leave Requests List */}
      <Box sx={{ bgcolor: "#111", borderRadius: 2, p: 2 }}>
        <Typography variant="h6" sx={{ color: greenAccent, mb: 2 }}>
          Leave History
        </Typography>
        {filteredRequests.length === 0 ? (
          <Typography>No leave requests found.</Typography>
        ) : (
          <List>
            {filteredRequests.map((request) => (
              <React.Fragment key={request.id}>
                <ListItem
                  sx={{
                    bgcolor: request.approved ? "rgba(0, 200, 83, 0.1)" : "rgba(244, 67, 54, 0.1)",
                    borderRadius: 1,
                    mb: 1,
                    "&:hover": { bgcolor: request.approved ? "rgba(0, 200, 83, 0.2)" : "rgba(244, 67, 54, 0.2)" },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body1">
                        <strong>From:</strong> {new Date(request.fromDate).toLocaleDateString("en-IN")} <strong>To:</strong> {new Date(request.toDate).toLocaleDateString("en-IN")}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2"><strong>Reason:</strong> {request.reason}</Typography>
                        <Typography variant="body2">
                          <strong>Status:</strong> {request.approved ? "Approved" : "Unapproved"}
                          {request.approved && request.approvedBy ? ` by ${request.approvedBy.name}` : ""}
                          {request.approved && request.approvedAt ? ` on ${new Date(request.approvedAt).toLocaleString("en-IN")}` : ""}
                        </Typography>
                        <Typography variant="body2"><strong>Created:</strong> {new Date(request.createdAt).toLocaleString("en-IN")}</Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider sx={{ bgcolor: "#555" }} />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default MyLeaves;