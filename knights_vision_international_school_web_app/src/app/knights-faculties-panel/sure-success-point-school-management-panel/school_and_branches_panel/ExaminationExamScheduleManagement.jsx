"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
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
} from "@mui/material";
import { Edit, Delete, Add, RotateRight, Search, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import SemesterExamScheduleDialog from "./dialogs/SemesterExamScheduleDialog";

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 30;
const greenAccent = "#00c853";

const SemesterExamScheduleManagement = ({ className }) => {
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editSchedule, setEditSchedule] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  const fetchSchedules = async (pageNum = 1) => {
    const token = Cookies.get("faculties_token");
    if (!token) {
      setError("User not authenticated.");
      setLoading(false);
      toast.error("Please log in to continue.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/api/semester-exam-schedules`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: pageNum, pageSize, className: className?.toLowerCase() },
      });

      if (!response.data || !Array.isArray(response.data.schedules)) {
        throw new Error("Invalid response format: schedules array missing");
      }

      setSchedules(response.data.schedules);
      setFilteredSchedules(response.data.schedules);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching schedules:", err);
      setError(err.response?.data?.error || "Failed to fetch schedules.");
      toast.error("Failed to fetch schedules.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules(page);
  }, [page, className]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = schedules.filter(
      (schedule) =>
        schedule.className?.toLowerCase().includes(query) ||
        schedule.subjectName?.toLowerCase().includes(query) ||
        schedule.semester?.toLowerCase().includes(query)
    );
    setFilteredSchedules(filtered);
  };

  const handleOpenDialog = (schedule = null) => {
    setEditSchedule(schedule);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    if (window.confirm("Are you sure you want to close the modal? Unsaved changes will be lost.")) {
      setOpenDialog(false);
      setEditSchedule(null);
    }
  };

  const handleSaveAndCloseDialog = () => {
    setOpenDialog(false);
    setEditSchedule(null);
    fetchSchedules(page);
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exam schedule?")) return;
    const token = Cookies.get("faculties_token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }
    try {
      await axios.delete(`/api/semester-exam-schedules/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Exam schedule deleted successfully!");
      fetchSchedules(page);
    } catch (err) {
      console.error("Delete Error:", err.response?.data || err.message);
      toast.error("❌ Error deleting exam schedule.");
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", value.toString());
    router.push(`?${newSearchParams.toString()}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress size={120} sx={{ color: greenAccent }} />
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
        autoClose={5000}
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
          backgroundColor: "#181818",
          color: "#fff",
          "&:hover": { backgroundColor: "#181818" },
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "8px 16px",
          borderRadius: 1,
        }}
      >
        <ListItemIcon sx={{ fontSize: 30, color: "orange", fontWeight: "bold" }}>
          📅
        </ListItemIcon>
        <ListItemText primary="Semester Exam Schedule Management" />
        <TextField
          placeholder="Search by Class or Subject"
          value={searchQuery}
          onChange={handleSearch}
          size="small"
          sx={{
            width: "250px",
            backgroundColor: "#333",
            borderRadius: "4px",
            "& .MuiInputBase-input": { color: "#fff" },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: greenAccent },
          }}
          InputProps={{
            startAdornment: <Search sx={{ color: "#fff", mr: 1 }} />,
          }}
        />
        <Button
          onClick={() => fetchSchedules(page)}
          variant="outlined"
          sx={{ color: greenAccent, borderColor: greenAccent }}
        >
          <RotateRight />
        </Button>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          <Add /> Add New Schedule
        </Button>
      </ListItemButton>

      <Box sx={{ bgcolor: "#181818", borderRadius: 2, overflow: "hidden" }}>
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
            ID
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Class
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Subject
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Semester
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Exam Date
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Duration
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Exam Hall
          </Typography>
          <Box sx={{ flex: 0.8 }}></Box>
        </Box>

        <Box
          sx={{
            maxHeight: `calc(100vh - ${appBarHeight + 150}px)`,
            overflowY: "auto",
            bgcolor: "#121212",
            borderRadius: 1,
            paddingBottom: 10,
          }}
        >
          <List>
            {filteredSchedules.length > 0 ? (
              filteredSchedules.map((schedule) => (
                <ListItem
                  key={schedule.id}
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
                  <Typography variant="body2" sx={{ flex: 0.5, color: "#fff" }}>
                    {schedule.id}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {schedule.className ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {schedule.subjectName ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {schedule.semester?.replace("_", " ") ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {new Date(schedule.examDate).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {schedule.durationMinutes} min
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {schedule.examHall ?? "N/A"}
                  </Typography>
                  <Box sx={{ flex: 0.8, display: "flex", gap: 1 }}>
                    <Button variant="outlined" color="primary" onClick={() => handleOpenDialog(schedule)}>
                      <Edit /> Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                    >
                      <Delete /> Delete
                    </Button>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
                No exam schedules found.
              </Typography>
            )}
          </List>
        </Box>

        <Box
          sx={{
            position: "fixed",
            bottom: 16,
            left: `calc(${drawerWidth}px + 50%)`,
            transform: "translateX(-50%)",
            bgcolor: "#181818",
            borderRadius: 2,
            p: 1,
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
            zIndex: 1000,
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            sx={{
              "& .MuiPaginationItem-root": {
                color: "#fff",
                "&:hover": { bgcolor: "#333" },
                "&.Mui-selected": {
                  bgcolor: greenAccent,
                  color: "#000",
                  "&:hover": { bgcolor: greenAccent },
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

      <SemesterExamScheduleDialog
        open={openDialog}
        handleClose={handleCloseDialog}
        handleSaveAndClose={handleSaveAndCloseDialog}
        editSchedule={editSchedule}
        className={className}
      />
    </Box>
  );
};

export default SemesterExamScheduleManagement;