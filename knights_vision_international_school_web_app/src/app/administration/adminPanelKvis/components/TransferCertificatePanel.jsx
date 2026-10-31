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
import { Search, ChevronLeft, ChevronRight, Assignment } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import TransferCertificateDialog from "./dialogs/TransferCertificateDialog";
import FeePaymentDialog from "./dialogs/FeePaymentDialog";
import classMap from "../../../../../utils/classmap";

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 10;
const greenAccent = "#00c853";

const TransferCertificatePanel = ({ className }) => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [academicYear, setAcademicYear] = useState(2025);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openTCDialog, setOpenTCDialog] = useState(false);
  const [openFeeDialog, setOpenFeeDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [dueMonths, setDueMonths] = useState([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const classInfo = classMap[className.toLowerCase()];

  useEffect(() => {
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
      const response = await axios.get(`/api/classes/${className.toLowerCase()}/students/eligible-for-tc`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { classId: classInfo.id, page: pageNum, pageSize, academicYear },
      });
      if (!response.data || !Array.isArray(response.data.students)) {
        throw new Error("Invalid response format");
      }
      setStudents(response.data.students);
      setFilteredStudents(response.data.students);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.error || `Failed to fetch eligible students for ${classInfo.name}.`);
      toast.error(`Failed to fetch eligible students for ${classInfo.name}.`);
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

  const checkFeeStatus = async (student) => {
    const token = Cookies.get("administration_token");
    try {
      const response = await axios.get("/api/monthly-fees/status", {
        headers: { Authorization: `Bearer ${token}` },
        params: { studentId: student.id, admissionId: student.finalAdmissionId, academicYear },
      });
      const unpaidMonths = response.data.unpaidMonths || [];
      if (unpaidMonths.length > 0) {
        setDueMonths(unpaidMonths);
        setSelectedStudent(student);
        setOpenFeeDialog(true);
        toast.error("Outstanding fees detected. Please clear all dues before generating TC.");
      } else {
        setSelectedStudent(student);
        setOpenTCDialog(true);
      }
    } catch (err) {
      toast.error("Failed to check fee status.");
    }
  };

  const handleCloseFeeDialog = () => {
    setOpenFeeDialog(false);
    setSelectedStudent(null);
    setDueMonths([]);
  };

  const handleCloseTCDialog = () => {
    setOpenTCDialog(false);
    setSelectedStudent(null);
    fetchStudents(page);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: "#212121" }}>
        <CircularProgress size={120} sx={{ color: greenAccent }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ textAlign: "center", mt: 4, bgcolor: "#212121" }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        width: `calc(100vw - ${drawerWidth}px)`,
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
        <ListItemIcon sx={{ fontSize: 30, color: greenAccent, fontWeight: "bold" }}>
          <Assignment />
        </ListItemIcon>
        <ListItemText primary={`Transfer Certificate Panel ${classInfo.name.replace('Class ', '')}`} />
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
            Current Class
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
                    onClick={() => checkFeeStatus(student)}
                    sx={{ flex: 0.5, bgcolor: greenAccent, color: "#000", "&:hover": { bgcolor: "#00a548" } }}
                  >
                    Generate TC
                  </Button>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
                No students eligible for TC in {classInfo.name} for academic year {academicYear}.
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

      <FeePaymentDialog
        open={openFeeDialog}
        onClose={handleCloseFeeDialog}
        student={selectedStudent}
        dueMonths={dueMonths}
        academicYear={academicYear}
        onSuccess={() => {
          setOpenFeeDialog(false);
          setOpenTCDialog(true);
        }}
      />

      <TransferCertificateDialog
        open={openTCDialog}
        onClose={handleCloseTCDialog}
        student={selectedStudent}
        academicYear={academicYear}
        className={className}
      />
    </Box>
  );
};

export default TransferCertificatePanel;