"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  CircularProgress,
  Pagination,
  PaginationItem,
  TextField,
} from "@mui/material";
import { ChevronLeft, ChevronRight, EmojiPeople, Search as SearchIcon } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import LeaveRequestsDialog from "./dialogs/LeaveRequestsDialog";
import LeaveRequestDetailsDialog from './dialogs/LeaveRequestDetailsDialog';
import StudentDetailsDialog from './dialogs/StudentDetailsDialog';
import Cookies from "js-cookie";

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 100;

const AttendanceManagement = ({ className }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredLeaveRequests, setFilteredLeaveRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [leaveRequestsDialogOpen, setLeaveRequestsDialogOpen] = useState(false);
  const [leaveRequestDetailsDialogOpen, setLeaveRequestDetailsDialogOpen] = useState(false);
  const [studentDetailsDialogOpen, setStudentDetailsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [dialogView, setDialogView] = useState("attendance");

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    setPage(currentPage);
    fetchLeaveRequests(currentPage);
  }, [currentPage, className]);

  const fetchLeaveRequests = async (pageNum = 1) => {
    const token = Cookies.get("faculties_token");
    if (!token) {
      console.log("token not found");
      setError("User not authenticated.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api-schools-panel/attendance/${className.toLowerCase()}/leave-requests`, {
        params: { page: pageNum, pageSize, status: "ALL" },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.data || !Array.isArray(response.data.leaveRequests)) {
        throw new Error("Invalid response format");
      }

      setLeaveRequests(response.data.leaveRequests);
      setFilteredLeaveRequests(response.data.leaveRequests);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching leave requests:", err.message);
      setError("Failed to fetch leave requests.");
      toast.error("Failed to fetch leave requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    if (query === '') {
      setFilteredLeaveRequests(leaveRequests);
    } else {
      const filtered = leaveRequests.filter((request) =>
        request.studentName?.toLowerCase().includes(query) ||
        request.reason?.toLowerCase().includes(query) ||
        (request.approved === null ? "pending" : request.approved ? "approved" : "rejected").toLowerCase().includes(query)
      );
      setFilteredLeaveRequests(filtered);
    }
  };

  const handleOpenLeaveRequestDetailsDialog = (request) => {
    if (!request?.id) {
      console.error("Invalid request for details dialog:", request);
      toast.error("Cannot open request details: Invalid request data.");
      return;
    }
    setSelectedRequest(request);
    setLeaveRequestDetailsDialogOpen(true);
  };

  const handleOpenStudentDetailsDialog = (request, view) => {
    if (!request?.studentId) {
      console.error("Invalid student for details dialog:", request);
      toast.error("Cannot open student details: Invalid student data.");
      return;
    }
    setSelectedStudent({ id: request.studentId, name: request.studentName });
    setDialogView(view);
    setStudentDetailsDialogOpen(true);
  };

  const handleCloseLeaveRequestsDialog = () => {
    setLeaveRequestsDialogOpen(false);
  };

  const handleCloseLeaveRequestDetailsDialog = () => {
    setLeaveRequestDetailsDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleCloseStudentDetailsDialog = () => {
    setStudentDetailsDialogOpen(false);
    setSelectedStudent(null);
  };


  const handlePageChange = (event, value) => {
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", value.toString());
    router.push(`?${newSearchParams.toString()}`);
    fetchLeaveRequests(value);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress size={120} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ textAlign: "center", mt: 4 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        minWidth: `calc(100vw - ${drawerWidth}px)`,
        backgroundColor: "#212121",
        height: `calc(100vh - ${appBarHeight}px)`,
        color: "#fff",
      }}
    >
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <ListItemButton
        sx={{
          backgroundColor: "#b71c1c",
          color: "#fff",
          "&:hover": { backgroundColor: "#b71c1c" },
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "6px 16px",
          borderRadius: 1,
        }}
      >
        <ListItemIcon sx={{ color: "#fff" }}>
          <EmojiPeople />
        </ListItemIcon>
        <ListItemText primary={`${className} Attendance Management`} />
        <TextField
          variant="outlined"
          placeholder="Search Requests..."
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: '#fff', mr: 1 }} />,
            style: { color: '#fff', backgroundColor: '#333', borderRadius: 4 },
          }}
          sx={{
            width: '300px',
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#fff' },
              '&:hover fieldset': { borderColor: '#fff' },
              '&.Mui-focused fieldset': { borderColor: '#00c853' },
            },
          }}
        />
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
          >
            View all Leaves
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => setLeaveRequestsDialogOpen(true)}
          >
            Approve Leave Requests
          </Button>
        </Box>
      </ListItemButton>

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
          <Typography variant="body2" sx={{ flex: 0.5, fontWeight: "bold", color: "#fff" }}>
            Request ID
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Student Name
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Date Range
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Reason
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: "bold", color: "#fff" }}>
            Status
          </Typography>
          <Typography variant="body2" sx={{ flex: 1.2, fontWeight: "bold", color: "#fff" }}>
            Actions
          </Typography>
        </Box>
        <Box sx={{ maxHeight: `80vh`, overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
          <List>
            {filteredLeaveRequests.length > 0 ? (
              filteredLeaveRequests.map((request) => (
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
                    cursor: "pointer",
                  }}
                >
                  <Typography variant="body2" sx={{ flex: 0.5, color: "#fff" }}>
                    {request.id}
                  </Typography>
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
                  <Box sx={{ flex: 1.2, display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="#00c853"
                      sx={{color:"#00c853"}}
                      onClick={(e) => {
                      handleOpenLeaveRequestDetailsDialog(request)
                      }}
                    >
                      Approve Status
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenStudentDetailsDialog(request, "attendance");
                      }}
                      sx={{ color: "#ff9800", borderColor: "#ff9800" }}
                    >
                      Student Attendance
                    </Button>
                    <Button
                      variant="outlined"
                      color="info"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenStudentDetailsDialog(request, "leave");
                      }}
                      sx={{ color: "#03a9f4", borderColor: "#03a9f4" }}
                    >
                      Leave History
                    </Button>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
                No leave requests found for {className}.
              </Typography>
            )}
          </List>
        </Box>
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            left: '60%',
            transform: 'translateX(-50%)',
            zIndex: 1300,
            display: 'flex',
            justifyContent: 'center',
            p: 1,
            bgcolor: '#181818',
            borderRadius: 2,
            boxShadow: 4,
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            sx={{
              '& .MuiPaginationItem-root': {
                color: '#fff',
                '&:hover': { bgcolor: '#333' },
                '&.Mui-selected': {
                  bgcolor: '#00c853',
                  color: '#000',
                  '&:hover': { bgcolor: '#00c853' },
                },
              },
            }}
            renderItem={(item) => (
              <PaginationItem
                components={{ previous: ChevronLeft, next: ChevronRight }}
                {...item}
              />
            )}
          />
        </Box>
      </Box>
      <LeaveRequestsDialog
        open={leaveRequestsDialogOpen}
        onClose={handleCloseLeaveRequestsDialog}
        className={className}
      />
      <LeaveRequestDetailsDialog
        open={leaveRequestDetailsDialogOpen}
        onClose={handleCloseLeaveRequestDetailsDialog}
        request={selectedRequest}
        className={className}
      />
      <StudentDetailsDialog
        open={studentDetailsDialogOpen}
        onClose={handleCloseStudentDetailsDialog}
        studentId={selectedStudent?.id}
        studentName={selectedStudent?.name}
        className={className}
        view={dialogView}
      />
    </Box>
  );
};

export default AttendanceManagement;