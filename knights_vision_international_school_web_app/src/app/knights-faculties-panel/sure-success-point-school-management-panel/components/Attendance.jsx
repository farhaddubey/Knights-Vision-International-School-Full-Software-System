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
  TextField,
  CircularProgress,
  Pagination,
  PaginationItem,
  Alert,
} from "@mui/material";
import { Search as SearchIcon, ChevronLeft, ChevronRight, EmojiPeople, SafetyCheck, CalendarMonth } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import AttendanceHistoryDialog from './dialogs/AttendanceHistoryDialog';
import AttendanceReportDialog from './dialogs/AttendanceReportDialog';
import MonthlyAttendanceDialog from './dialogs/MonthlyAttendanceDialog';
import Cookies from "js-cookie"; 

// Frontend: Attendance Component
const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 50;

const Attendance = ({ className }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [monthlyDialogOpen, setMonthlyDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    setPage(currentPage);
    fetchStudents(currentPage);
  }, [currentPage, className]);

  const fetchStudents = async (pageNum = 1) => {
    const token = Cookies.get('faculties_token'); 
    if (!token) {
      setError("User Not Authenticated"); 
      setLoading(false); 
      return; 
    }
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api-schools-panel/attendance/${className}`, {
        headers: { Authorization: `Bearer ${token}` }, 
        params: { page: pageNum, pageSize },
      });

      if (!response.data || !Array.isArray(response.data.students)) {
        throw new Error("Invalid response format");
      }

      setStudents(response.data.students);
      setFilteredStudents(response.data.students);
      setTotalPages(response.data.totalPages || 1);

      const initialStatus = {};
      response.data.students.forEach((student) => {
        initialStatus[student.id] = student.status || "ABSENT";
      });
      setAttendanceStatus(initialStatus);
    } catch (err) {
      console.error("Error fetching students:", err.message);
      setError("Failed to fetch students.");
      toast.error("Failed to fetch students.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (studentId, status) => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const payload = {
        status,
        date: today,
      };

      const response = await axios.post(`/api/attendance/${className}/${studentId}`, payload);

      if (response.status === 200) {
        setAttendanceStatus((prev) => ({ ...prev, [studentId]: status }));
        toast.success(`Attendance updated to ${status} for student ID ${studentId}`);
      }
    } catch (err) {
      console.error("Update Attendance Error:", err.message);
      toast.error("Failed to update attendance.");
    }
  };

  const handleOpenHistoryDialog = (student) => {
    setSelectedStudent({ id: student.id, name: `${student.firstName} ${student.lastName}` });
    setHistoryDialogOpen(true);
  };

  const handleOpenReportDialog = (student) => {
    setSelectedStudent({ id: student.id, name: `${student.firstName} ${student.lastName}` });
    setReportDialogOpen(true);
  };

  const handleOpenMonthlyDialog = () => {
    setMonthlyDialogOpen(true);
  };

  const handleCloseHistoryDialog = () => {
    setHistoryDialogOpen(false);
    setSelectedStudent(null);
  };

  const handleCloseReportDialog = () => {
    setReportDialogOpen(false);
    setSelectedStudent(null);
  };

  const handleCloseMonthlyDialog = () => {
    setMonthlyDialogOpen(false);
  };

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredStudents(
      students.filter(
        (student) =>
          student.firstName.toLowerCase().includes(query) ||
          student.lastName.toLowerCase().includes(query) ||
          student.rollNumber.toLowerCase().includes(query)
      )
    );
    setPage(1);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", "1");
    router.push(`?${newSearchParams.toString()}`);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", value.toString());
    router.push(`?${newSearchParams.toString()}`);
    fetchStudents(value);
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
          padding: "4px 16px",
          borderRadius: 1,
        }}
      >
        <ListItemIcon sx={{ color: "#fff" }}>
          <EmojiPeople />
        </ListItemIcon>
        <ListItemText primary={`${className} Attendance`} />
        <TextField
          variant="outlined"
          placeholder="Search Students..."
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: "#fff", mr: 1 }} />,
            style: { color: "#fff", backgroundColor: "#333", borderRadius: 4 },
          }}
          sx={{
            width: "300px",
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#fff" },
              "&:hover fieldset": { borderColor: "#fff" },
              "&.Mui-focused fieldset": { borderColor: "#00c853" },
            },
          }}
        />
        <Button
          variant="outlined"
          color="primary"
          onClick={handleOpenMonthlyDialog}
          sx={{ color: "#fff", borderColor: "#fff" }}
        >
          <CalendarMonth /> Explore Attendance
        </Button>
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
          <Typography variant="body2" sx={{ flex: 0.3, fontWeight: "bold", color: "#fff" }}>
            ID
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Name
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: "bold", color: "#fff" }}>
            Roll No.
          </Typography>
          <Typography variant="body2" sx={{ flex: 1.2, fontWeight: "bold", color: "#fff" }}>
            Status
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: "bold", color: "#fff" }}>
            Actions
          </Typography>
        </Box>
        <Box sx={{ overflowY: "auto", bgcolor: "#121212", borderRadius: 1, maxHeight: '80vh' }}>
          <List>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <ListItem
                  key={student.id}
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
                  <Typography variant="body2" sx={{ flex: 0.3, color: "#fff" }}>
                    {student.id}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {`${student.firstName} ${student.lastName}`}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 0.8, color: "#fff" }}>
                    {student.rollNumber}
                  </Typography>
                  <Box sx={{ flex: 1.2, display: "flex", gap: 1 }}>
                    <Button
                      variant={attendanceStatus[student.id] === "PRESENT" ? "contained" : "outlined"}
                      color="success"
                      onClick={() => handleStatusChange(student.id, "PRESENT")}
                      sx={{ minWidth: "80px" }}
                    >
                      Present
                    </Button>
                    <Button
                      variant={attendanceStatus[student.id] === "ABSENT" ? "contained" : "outlined"}
                      color="error"
                      onClick={() => handleStatusChange(student.id, "ABSENT")}
                      sx={{ minWidth: "80px" }}
                    >
                      Absent
                    </Button>
                    <Button
                      variant={attendanceStatus[student.id] === "HOLIDAY" ? "contained" : "outlined"}
                      color="error"
                      onClick={() => handleStatusChange(student.id, "HOLIDAY")}
                      sx={{ minWidth: "80px", color: "#f50057" }}
                    >
                      Holiday
                    </Button>
                    <Button
                      variant={attendanceStatus[student.id] === "WEEKLY_HOLIDAY" ? "contained" : "outlined"}
                      color="info"
                      onClick={() => handleStatusChange(student.id, "WEEKLY_HOLIDAY")}
                      sx={{ minWidth: "80px" }}
                    >
                      Sunday
                    </Button>
                  </Box>
                  <Box sx={{ flex: 0.8, display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleOpenHistoryDialog(student)}
                      sx={{ color: "#ffeb3b" }}
                    >
                      History
                    </Button>
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={() => handleOpenReportDialog(student)}
                    >
                      <SafetyCheck /> Report
                    </Button>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
                No students found for {className}.
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
      <AttendanceHistoryDialog
        open={historyDialogOpen}
        onClose={handleCloseHistoryDialog}
        studentId={selectedStudent?.id}
        studentName={selectedStudent?.name}
        className={className}
      />
      <AttendanceReportDialog
        open={reportDialogOpen}
        onClose={handleCloseReportDialog}
        studentId={selectedStudent?.id}
        studentName={selectedStudent?.name}
        className={className}
      />
      <MonthlyAttendanceDialog
        open={monthlyDialogOpen}
        onClose={handleCloseMonthlyDialog}
        className={className}
      />
    </Box>
  );
};

export default Attendance;