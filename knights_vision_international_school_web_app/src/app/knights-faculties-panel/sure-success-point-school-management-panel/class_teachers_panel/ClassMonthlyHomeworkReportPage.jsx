"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Pagination,
  PaginationItem,
  List,
  ListItem,
} from "@mui/material";
import { Search as SearchIcon, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import ClassMonthlyHomeworkReportDialog from "./dialogs/ClassMonthlyHomeworkReportDialog";

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 10;

const ClassMonthlyHomeworkReportPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [classSubjects, setClassSubjects] = useState([]);
  const [filteredClassSubjects, setFilteredClassSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedClassSubject, setSelectedClassSubject] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    setPage(currentPage);
    fetchClassSubjects(currentPage);
  }, [currentPage]);

  const fetchClassSubjects = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      const token = Cookies.get("faculties_token");
      if (!token) throw new Error("User not authenticated");

      const response = await axios.get("/api-schools-panel/class_teachers_panel/class-subjects", {
        params: { page: pageNum, pageSize },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.data || !Array.isArray(response.data.classSubjects)) {
        throw new Error("Invalid response format");
      }

      setClassSubjects(response.data.classSubjects);
      setFilteredClassSubjects(response.data.classSubjects);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching class subjects:", err.message);
      setError(err.response?.data?.error || err.message || "Failed to fetch class subjects.");
      toast.error(err.response?.data?.error || err.message || "Failed to fetch class subjects.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredClassSubjects(
      classSubjects.filter(
        (cs) =>
          cs.subject.name.toLowerCase().includes(query) ||
          cs.className.toLowerCase().includes(query)
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
    fetchClassSubjects(value);
  };

  const handleOpenReportDialog = (classSubject) => {
    setSelectedClassSubject(classSubject);
    setReportDialogOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: "#181818" }}>
        <CircularProgress size={120} sx={{ color: "#00c757" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="#fff" sx={{ textAlign: "center", mt: 4, bgcolor: "#181818" }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        minWidth: `calc(100vw - ${drawerWidth}px)`,
        backgroundColor: "#181818",
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
      <Box
        sx={{
          backgroundColor: "#333",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "8px 16px",
          borderRadius: 1,
        }}
      >
        <SearchIcon sx={{ color: "#fff" }} />
        <Typography variant="h6" sx={{ color: "#fff" }}>Class Monthly Homework Reports</Typography>
        <TextField
          variant="outlined"
          placeholder="Search Subjects or Classes..."
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: "#fff", mr: 1 }} />,
            style: { color: "#fff", backgroundColor: "#222", borderRadius: 4 },
          }}
          sx={{
            width: "300px",
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#555" },
              "&:hover fieldset": { borderColor: "#777" },
              "&.Mui-focused fieldset": { borderColor: "#00c757" },
            },
          }}
        />
      </Box>

      <Box sx={{ bgcolor: "#181818", borderRadius: 2, p: 1, maxHeight: "83vh", overflowY: "auto" }}>
        <List>
          <ListItem sx={{ bgcolor: "#333", borderRadius: 1, mb: 1 }}>
            <Box sx={{ display: "flex", width: "100%", color: "#fff", fontWeight: "bold" }}>
              <Box sx={{ flex: 1 }}>ID</Box>
              <Box sx={{ flex: 2 }}>Class</Box>
              <Box sx={{ flex: 2 }}>Subject</Box>
              <Box sx={{ flex: 3 }}>Actions</Box>
            </Box>
          </ListItem>

          {filteredClassSubjects.length > 0 ? (
            filteredClassSubjects.map((cs) => (
              <ListItem
                key={cs.id}
                sx={{
                  bgcolor: "#1e1e1e",
                  mb: 1,
                  borderRadius: 1,
                  "&:hover": { bgcolor: "#222" },
                }}
              >
                <Box sx={{ display: "flex", width: "100%", alignItems: "center", color: "#fff" }}>
                  <Box sx={{ flex: 1 }}>{cs.id}</Box>
                  <Box sx={{ flex: 2 }}>{cs.className}</Box>
                  <Box sx={{ flex: 2 }}>{cs.subject.name}</Box>
                  <Box sx={{ flex: 3, display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleOpenReportDialog(cs)}
                      sx={{
                        color: "#ffeb3b",
                        borderColor: "#ffeb3b",
                        textTransform: "none",
                      }}
                    >
                      View Class Monthly Report
                    </Button>
                  </Box>
                </Box>
              </ListItem>
            ))
          ) : (
            <ListItem sx={{ color: "#fff", justifyContent: "center" }}>
              No subjects found for your classes.
            </ListItem>
          )}
        </List>

        <Box
          sx={{
            position: "fixed",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1300,
            display: "flex",
            justifyContent: "center",
            p: 1,
            bgcolor: "#181818",
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
              "& .MuiPaginationItem-root": {
                color: "#fff",
                "&:hover": { bgcolor: "#333" },
                "&.Mui-selected": {
                  bgcolor: "#00c853",
                  color: "#000",
                  "&:hover": { bgcolor: "#00c853" },
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

      <ClassMonthlyHomeworkReportDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        classSubjectId={selectedClassSubject?.id}
        className={selectedClassSubject?.className}
        subjectName={selectedClassSubject?.subject?.name}
      />
    </Box>
  );
};

export default ClassMonthlyHomeworkReportPage;