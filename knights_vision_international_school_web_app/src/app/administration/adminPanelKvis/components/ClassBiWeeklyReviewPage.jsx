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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  List,
  ListItem,
} from "@mui/material";
import { Search as SearchIcon, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import BiWeeklyReviewDialog from "./dialogs/BiWeeklyReviewDialog";
import CreateBiWeeklyReviewDialog from "./dialogs/CreateBiWeeklyReviewDialog";
const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 10;

const ClassBiWeeklyReviewPage = ({ className }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [classSubjects, setClassSubjects] = useState([]);
  const [filteredClassSubjects, setFilteredClassSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [createReviewDialogOpen, setCreateReviewDialogOpen] = useState(false);
  const [selectedClassSubject, setSelectedClassSubject] = useState(null);
  const [biWeeklyReviews, setBiWeeklyReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [newReview, setNewReview] = useState({
    startDate: null,
    endDate: null,
    generalRemarks: "",
    suggestions: "",
    studentReviews: [],
  });
  const [students, setStudents] = useState([]);
  const [homeworkData, setHomeworkData] = useState([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    setPage(currentPage);
    fetchClassSubjects(currentPage);
  }, [currentPage, className]);

  const fetchClassSubjects = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/BiWeeklyHomeworkReview/${className.toLowerCase()}/class-subjects`, {
        params: { page: pageNum, pageSize },
      });

      if (!response.data || !Array.isArray(response.data.classSubjects)) {
        throw new Error("Invalid response format");
      }

      setClassSubjects(response.data.classSubjects);
      setFilteredClassSubjects(response.data.classSubjects);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching class subjects:", err.message);
      setError("Failed to fetch class subjects.");
      toast.error("Failed to fetch class subjects.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBiWeeklyReviews = async (classSubjectId) => {
    try {
      setReviewLoading(true);
      const response = await axios.get(`/api/BiWeeklyHomeworkReview/${className.toLowerCase()}/bi-weekly-reviews`, {
        params: { classSubjectId },
      });
      setBiWeeklyReviews(response.data.reviews || []);
    } catch (err) {
      console.error("Error fetching bi-weekly reviews:", err.message);
      toast.error("Failed to fetch bi-weekly reviews.");
      setBiWeeklyReviews([]);
    } finally {
      setReviewLoading(false);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      const response = await axios.get(`/api/BiWeeklyHomeworkReview/${className.toLowerCase()}/students/${classId}`);
      setStudents(response.data.students || []);
    } catch (err) {
      console.error("Error fetching students:", err.message);
      toast.error("Failed to fetch students.");
      setStudents([]);
    }
  };

  const fetchHomeworkData = async (classSubjectId, startDate, endDate) => {
    try {
      const { data: { schedules } } = await axios.get(`/api/BiWeeklyHomeworkReview/${className.toLowerCase()}/syllabus-schedule-homework`, {
        params: {
          classSubjectId,
          startDate: startDate.toISOString().slice(0, 10),
          endDate: endDate.toISOString().slice(0, 10),
        },
      });
      setHomeworkData(schedules);
    } catch (err) {
      console.error("Failed to fetch homework data:", err);
      toast.error("Failed to fetch homework data.");
      setHomeworkData([]);
    }
  };

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredClassSubjects(
      classSubjects.filter((cs) => cs.subject.name.toLowerCase().indexOf(query) !== -1)
    );
    setPage(1);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("page", "1");
    router.push(`?${newSearchParams.toString()}`);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("page", newPage.toString());
    router.push(`?${newSearchParams.toString()}`);
    fetchClassSubjects(newPage);
  };

  const handleOpenReviewDialog = (classSubject) => {
    setSelectedClassSubject(classSubject);
    fetchBiWeeklyReviews(classSubject.id);
    fetchStudents(classSubject.classId);
    setReviewDialogOpen(true);
  };

  const handleCloseReviewDialog = () => {
    setReviewDialogOpen(false);
    setSelectedClassSubject(null);
    setBiWeeklyReviews([]);
    setStudents([]);
  };

  const handleOpenCreateReviewDialog = () => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 13); // 14-day period
    setNewReview({
      ...newReview,
      startDate,
      endDate,
      studentReviews: students.map((student) => ({
        studentId: student.id,
        totalTopicsReviewed: 0,
        totalHomeworkCompleted: 0,
        completionRate: 0,
        status: "PENDING",
        remarks: "",
      })),
    });
    fetchHomeworkData(selectedClassSubject.id, startDate, endDate);
    setCreateReviewDialogOpen(true);
  };

  const handleCloseCreateReviewDialog = () => {
    setCreateReviewDialogOpen(false);
    setNewReview({ startDate: null, endDate: null, generalRemarks: "", suggestions: "", studentReviews: [] });
    setHomeworkData([]);
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
          padding: "8px 16px",
          borderRadius: 1,
        }}
      >
        <SearchIcon sx={{ color: "#fff" }} />
        <Typography variant="h6">{className} Bi-Weekly Homework Reviews</Typography>
        <TextField
          variant="outlined"
          placeholder="Search Subjects..."
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
        <Button
          variant="outlined"
          color="primary"
          onClick={() => router.push(`/administration/adminPanelSureSuccessPointSchool/${className.toLowerCase()}`)}
          sx={{ color: "#00c757", borderColor: "#00c757" }}
        >
          View Syllabus
        </Button>
      </Box>

  <Box sx={{ bgcolor: "#181818", borderRadius: 2, p: 1, maxHeight: '83vh', overflowY: 'auto' }}>
  <List>
    {/* Header Row */}
    <ListItem sx={{ bgcolor: "#333", borderRadius: 1, mb: 1 }}>
      <Box sx={{ display: 'flex', width: '100%', color: '#fff', fontWeight: 'bold' }}>
        <Box sx={{ flex: 1 }}>ID</Box>
        <Box sx={{ flex: 2 }}>Subject</Box>
        <Box sx={{ flex: 2 }}>Teacher</Box>
        <Box sx={{ flex: 3 }}>Actions</Box>
      </Box>
    </ListItem>

    {/* Content Rows */}
    {filteredClassSubjects.length > 0 ? (
      filteredClassSubjects.map((cs) => (
        <ListItem
          key={cs.id}
          sx={{
            bgcolor: "#1e1e1e",
            mb: 1,
            borderRadius: 1,
            '&:hover': { bgcolor: "#222" },
          }}
        >
          <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', color: '#fff' }}>
            <Box sx={{ flex: 1 }}>{cs.id}</Box>
            <Box sx={{ flex: 2 }}>{cs.subject.name}</Box>
            <Box sx={{ flex: 2 }}>{cs.teacher?.name || "Unassigned"}</Box>
            <Box sx={{ flex: 3 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleOpenReviewDialog(cs)}
                sx={{
                  color: "#00c757",
                  borderColor: "#00c757",
                  textTransform: 'none',
                }}
              >
                Review Homework
              </Button>
            </Box>
          </Box>
        </ListItem>
      ))
    ) : (
      <ListItem sx={{ color: '#fff', justifyContent: 'center' }}>
        No subjects found.
      </ListItem>
    )}
  </List>

<Box
  sx={{
    position: 'fixed',       // Make it float
    bottom: 16,              // Distance from bottom of screen
    left: '55%',             // Center horizontally
    transform: 'translateX(-50%)', // Perfect center shift
    zIndex: 1300,            // Make sure it stays on top
    display: 'flex',
    justifyContent: 'center',
    p: 1,
    bgcolor: '#181818',
    borderRadius: 2,
    boxShadow: 4,            // Slight shadow for depth
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

      <BiWeeklyReviewDialog
        open={reviewDialogOpen}
        onClose={handleCloseReviewDialog}
        selectedClassSubject={selectedClassSubject}
        biWeeklyReviews={biWeeklyReviews}
        reviewLoading={reviewLoading}
        handleOpenCreateReviewDialog={handleOpenCreateReviewDialog}
        className={className}
      />

      <CreateBiWeeklyReviewDialog
        open={createReviewDialogOpen}
        onClose={handleCloseCreateReviewDialog}
        selectedClassSubject={selectedClassSubject}
        students={students}
        newReview={newReview}
        setNewReview={setNewReview}
        homeworkData={homeworkData}
        fetchHomeworkData={fetchHomeworkData}
        fetchBiWeeklyReviews={fetchBiWeeklyReviews}
        className={className}
      />
    </Box>
  );
};

export default ClassBiWeeklyReviewPage;