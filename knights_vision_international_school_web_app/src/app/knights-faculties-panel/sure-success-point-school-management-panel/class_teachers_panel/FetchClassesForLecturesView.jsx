"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
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
import SubjectMainSyllabusDialog from "./dialogs/SubjectMainSyllabusDialog";
import SyllabusDialog from "./dialogs/SyllabusDialog";

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 10;

const ClassMainPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [classSubjects, setClassSubjects] = useState([]);
  const [filteredClassSubjects, setFilteredClassSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [syllabusDialogOpen, setSyllabusDialogOpen] = useState(false);
  const [subjectSyllabusDialogOpen, setSubjectSyllabusDialogOpen] = useState(false);
  const [selectedClassSubject, setSelectedClassSubject] = useState(null);
  const [syllabusSchedules, setSyllabusSchedules] = useState([]);
  const [syllabusLoading, setSyllabusLoading] = useState(false);
  const [syllabusTopics, setSyllabusTopics] = useState([]);
  const [newSchedules, setNewSchedules] = useState([
    {
      date: null,
      topicTitle: "",
      syllabusId: "",
      isCompleted: false,
      articleLinks1: "",
      articleLinks2: "",
      videoLinks: "",
      videoLinks2: "",
      instructions_for_students: "",
      instructions_for_teachers: "",
      notes: "",
      isHoliday: false,
      homeworkDescription: "",
      homeworkDueDate: null,
    },
  ]);

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

  const fetchSyllabusSchedules = async (classSubjectId) => {
    try {
      setSyllabusLoading(true);
      const token = Cookies.get("faculties_token");
      if (!token) throw new Error("User not authenticated");

      const response = await axios.get("/api-schools-panel/class_teachers_panel/SyllabusScheduleDailyPlan/syllabus-schedule", {
        params: { classSubjectId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSyllabusSchedules(response.data.schedules || []);
    } catch (err) {
      console.error("Error fetching syllabus schedules:", err.message);
      toast.error("Failed to fetch syllabus schedules.");
      setSyllabusSchedules([]);
    } finally {
      setSyllabusLoading(false);
    }
  };

  const fetchSyllabusTopics = async (classSubjectId) => {
    try {
      const token = Cookies.get("faculties_token");
      if (!token) throw new Error("User not authenticated");

      const response = await axios.get(`/api-schools-panel/class_teachers_panel/SyllabusScheduleDailyPlan/subject-syllabus/${classSubjectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSyllabusTopics(response.data.topics || []);
    } catch (err) {
      console.error("Error fetching syllabus topics:", err.message);
      toast.error("Failed to fetch syllabus topics.");
      setSyllabusTopics([]);
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

  const handleOpenSyllabusDialog = (classSubject) => {
    setSelectedClassSubject(classSubject);
    fetchSyllabusSchedules(classSubject.id);
    setSyllabusDialogOpen(true);
  };

  const handleOpenSubjectSyllabusDialog = (classSubject) => {
    setSelectedClassSubject(classSubject);
    // SubjectSyllabus belongs to the branch-specific ClassSubject record,
    // not the globally reused Subject catalogue record.
    fetchSyllabusTopics(classSubject.id);
    setSubjectSyllabusDialogOpen(true);
  };

  const handleCloseSyllabusDialog = () => {
    setSyllabusDialogOpen(false);
    setSelectedClassSubject(null);
    setSyllabusSchedules([]);
  };

  const handleCloseSubjectSyllabusDialog = () => {
    setSubjectSyllabusDialogOpen(false);
    setSelectedClassSubject(null);
    setSyllabusTopics([]);
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
      <Box
        sx={{
          backgroundColor: "#b71c1c",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "8px 8px",
          borderRadius: 1,
        }}
      >
        <SearchIcon sx={{ color: "#fff" }} />
        <Typography variant="h6">My Classes and Subjects</Typography>
        <TextField
          variant="outlined"
          placeholder="Search Subjects or Classes..."
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
              "&.Mui-focused fieldset": { borderColor: "#00c757" },
            },
          }}
        />
      </Box>

      <Box sx={{ bgcolor: "#181818", borderRadius: 1, maxHeight: "83vh", overflowY: "auto", p: 1 }}>
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
                  <Box sx={{ flex: 2 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleOpenSubjectSyllabusDialog(cs)}
                      sx={{
                        color: "#c9004aff",
                        borderColor: "#c9004aff",
                        textTransform: "none",
                      }}
                    >
                      Browse Subject Syllabus
                    </Button>
                  </Box>
                  <Box sx={{ flex: 2 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleOpenSyllabusDialog(cs)}
                      sx={{
                        color: "#00c757",
                        borderColor: "#00c757",
                        textTransform: "none",
                      }}
                    >
                      Browse Daily Syllabus
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
            left: "60%",
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
      <SyllabusDialog
        open={syllabusDialogOpen}
        onClose={handleCloseSyllabusDialog}
        selectedClassSubject={selectedClassSubject}
        syllabusSchedules={syllabusSchedules}
        syllabusLoading={syllabusLoading}
        className={selectedClassSubject?.className || ""}
      />
      <SubjectMainSyllabusDialog
        open={subjectSyllabusDialogOpen}
        onClose={handleCloseSubjectSyllabusDialog}
        selectedClassSubject={selectedClassSubject}
        syllabusTopics={syllabusTopics}
        syllabusLoading={syllabusLoading}
        className={selectedClassSubject?.className || ""}
      />
    </Box>
  );
};

export default ClassMainPage;
