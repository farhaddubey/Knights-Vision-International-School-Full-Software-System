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
import { Search, ChevronLeft, ChevronRight, Payment } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import MonthlyFeeDialog from "./dialogs/MonthlyFeeDialog";

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 100;
const greenAccent = "#00c757";

const DynamicClassMonthlyFeeManagementSystem = ({ className }) => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [academicYear, setAcademicYear] = useState(2025);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openFeeDialog, setOpenFeeDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // Validate className against ClassName enum
  const validClassNames = [
    "LKG", "UKG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII",
    "IX", "X", "XS", "XI", "XII", "XIIS", "XIII", "XIIIJ"
  ];
  const isValidClass = validClassNames.includes(className.toUpperCase());
  const classInfo = { name: isValidClass ? `Class ${className}` : "Invalid Class" };

  useEffect(() => {
    if (!isValidClass) {
      setError("Invalid class name provided.");
      setLoading(false);
      return;
    }
    setPage(currentPage);
    fetchStudents(currentPage);
  }, [currentPage, academicYear, className]);

  const fetchStudents = async (pageNum = 1) => {
    const token = Cookies.get("administration_token");
    if (!token) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/MonthlyFeeManagement/${className.toLowerCase()}/students`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { className, page: pageNum, pageSize, academicYear },
      });
      if (!response.data || !Array.isArray(response.data.students)) {
        throw new Error("Invalid response format");
      }
      setStudents(response.data.students);
      setFilteredStudents(response.data.students);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch students.");
      toast.error("Failed to fetch students.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = students.filter(
      (student) =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(query) ||
        student.admissionNumber?.toLowerCase().includes(query)
    );
    setFilteredStudents(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize) || 1);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", value.toString());
    router.push(`?${newSearchParams.toString()}`);
    fetchStudents(value);
  };

  const handleOpenFeeDialog = (student) => {
    setSelectedStudent(student);
    setOpenFeeDialog(true);
  };

  const handleCloseFeeDialog = () => {
    setOpenFeeDialog(false);
    setSelectedStudent(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: "#181818" }}>
        <CircularProgress size={120} sx={{ color: greenAccent }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ textAlign: "center", mt: 4, bgcolor: "#181818" }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        width: `calc(100vw - ${drawerWidth}px)`,
        backgroundColor: "#181818",
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
          backgroundColor: "#009688",
          color: "#fff",
          "&:hover": { backgroundColor: "#009688" },
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "8px 16px",
          borderRadius: 1,
        }}
      >
        <ListItemIcon sx={{ fontSize: 30, color: "#fff", fontWeight: "bold" }}>
          <Payment />
        </ListItemIcon>
        <ListItemText primary={`${classInfo.name} Monthly Fee Management`} />
        <TextField
          placeholder="Search by Name or Admission No."
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
        <TextField
          label="Academic Year"
          type="number"
          value={academicYear}
          onChange={(e) => setAcademicYear(parseInt(e.target.value))}
          size="small"
          sx={{
            width: "150px",
            backgroundColor: "#333",
            borderRadius: "4px",
            "& .MuiInputBase-input": { color: "#fff" },
            "& .MuiInputLabel-root": { color: "#aaa" },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: greenAccent },
          }}
        />
        <Button
          onClick={() => fetchStudents(page)}
          variant="outlined"
          sx={{ color: greenAccent, borderColor: greenAccent }}
        >
          Refresh
        </Button>
      </ListItemButton>

      <Box sx={{ bgcolor: "#181818", borderRadius: 2, overflow: "hidden", mt: 2 }}>
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
            Name
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Class
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: "bold", color: "#fff" }}>
            Admission No.
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.5, fontWeight: "bold", color: "#fff" }}>
            Action
          </Typography>
        </Box>
        <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 200}px)`, overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
          <List>
            {filteredStudents.length > 0 ? (
              filteredStudents.slice((page - 1) * pageSize, page * pageSize).map((student) => (
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
                  <Typography variant="body2" sx={{ flex: 0.5, color: "#fff" }}>
                    {student.id}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {`${student.firstName} ${student.lastName}`}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {`${student.class?.name || "N/A"} ${student.class?.section || ""}`.trim()}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 0.8, color: "#fff" }}>
                    {student.admissionNumber || "N/A"}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenFeeDialog(student)}
                    sx={{ flex: 0.5, bgcolor: greenAccent, color: "#000", "&:hover": { bgcolor: "#00a548" } }}
                  >
                    Manage Fees
                  </Button>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
                No students found for {classInfo.name} in academic year {academicYear}.
              </Typography>
            )}
          </List>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            p: 1,
            bgcolor: "#181818",
            borderRadius: 2,
            mt: 2,
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

      <MonthlyFeeDialog
        open={openFeeDialog}
        onClose={handleCloseFeeDialog}
        student={selectedStudent}
        academicYear={academicYear}
      />
    </Box>
  );
};

export default DynamicClassMonthlyFeeManagementSystem;