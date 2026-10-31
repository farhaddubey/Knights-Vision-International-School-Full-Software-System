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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
} from "@mui/material";
import { Search as SearchIcon, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import SemesterResultDialog from "./dialogs/SemesterResultDialog";

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 10;

const textFieldStyles = {
  "& .MuiInputBase-input": { color: "#fff" },
  "& .MuiInputLabel-root": { color: "#aaa" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#555" },
    "&:hover fieldset": { borderColor: "#777" },
    "&.Mui-focused fieldset": { borderColor: "#00c757" },
  },
};

const ClassSemesterResultsPage = ({ className }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [classSubjects, setClassSubjects] = useState([]);
  const [filteredClassSubjects, setFilteredClassSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [selectedClassSubject, setSelectedClassSubject] = useState(null);
  const [batchResultsDialogOpen, setBatchResultsDialogOpen] = useState(false);
  const [batchResults, setBatchResults] = useState({ classSubjectIds: [], semester: "" });
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
      const response = await axios.get(`/api/SemesterResults/${className.toLowerCase()}/class-subjects`, {
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

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredClassSubjects(
      classSubjects.filter((cs) => cs.subject.name.toLowerCase().includes(query))
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

  const handleOpenResultsDialog = (classSubject) => {
    setSelectedClassSubject(classSubject);
    setResultsDialogOpen(true);
  };

  const handleCloseResultsDialog = () => {
    setResultsDialogOpen(false);
    setSelectedClassSubject(null);
  };

  const handleOpenBatchResultsDialog = () => {
    setBatchResults({ classSubjectIds: [], semester: "" });
    setBatchResultsDialogOpen(true);
  };

  const handleCloseBatchResultsDialog = () => {
    setBatchResultsDialogOpen(false);
    setBatchResults({ classSubjectIds: [], semester: "" });
  };

  const handleBatchResultsChange = (field, value) => {
    setBatchResults((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateBatchResults = async () => {
    if (!batchResults.classSubjectIds.length || !batchResults.semester) {
      toast.error("Select at least one subject and a semester.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        classSubjects: batchResults.classSubjectIds.map((id) => ({
          classSubjectId: id,
          classId: classSubjects.find((cs) => cs.id === id).classId,
          branchId: classSubjects.find((cs) => cs.id === id).branchId,
          schoolId: classSubjects.find((cs) => cs.id === id).schoolId,
          subjectId: classSubjects.find((cs) => cs.id === id).subjectId,
          semester: batchResults.semester,
        })),
      };

      await axios.post(`/api/SemesterResults/${className.toLowerCase()}/semester-results/batch`, payload);
      toast.success("Batch semester results initialized successfully.");
      handleCloseBatchResultsDialog();
    } catch (err) {
      console.error("Create Batch Results Error:", err.message);
      toast.error("Failed to create batch results: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
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
        p: 2,
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
          mb: 2,
        }}
      >
        <SearchIcon sx={{ color: "#fff" }} />
        <Typography variant="h6" sx={{ color: "#fff" }}>{className} Semester Results</Typography>
        <TextField
          variant="outlined"
          placeholder="Search Subjects..."
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: "#fff", mr: 1 }} />,
            style: { color: "#fff", backgroundColor: "#222", borderRadius: 4 },
          }}
          sx={{
            width: "300px",
            ...textFieldStyles,
          }}
        />
      </Box>

      <Box sx={{ bgcolor: "#181818", borderRadius: 2, maxHeight:'82vh', overflowY:'scroll' }}>
        <List sx={{ bgcolor: "#181818" }}>
          {filteredClassSubjects.length > 0 ? (
            filteredClassSubjects.map((cs, index) => (
              <React.Fragment key={cs.id}>
                <ListItem
                  sx={{
                    bgcolor: "#181818",
                    "&:hover": { bgcolor: "#222" },
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1,
                  }}
                >
                  <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
                    <ListItemText
                      primary={`ID: ${cs.id}`}
                      secondary={`Subject: ${cs.subject.name} | Teacher: ${cs.teacher?.username || "Unassigned"}`}
                      primaryTypographyProps={{ color: "#fff", fontWeight: "bold" }}
                      secondaryTypographyProps={{ color: "#aaa" }}
                    />
                  </Box>
                  <ListItemSecondaryAction>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleOpenResultsDialog(cs)}
                      sx={{ color: "#00c757", borderColor: "#00c757" }}
                    >
                      Manage Semester Results
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < filteredClassSubjects.length - 1 && <Divider sx={{ bgcolor: "#111" }} />}
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <ListItemText
                primary="No subjects found."
                primaryTypographyProps={{ color: "#fff", textAlign: "center" }}
              />
            </ListItem>
          )}
        </List>
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
                  bgcolor: "#00c757",
                  color: "#000",
                  "&:hover": { bgcolor: "#00c757" },
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

      <SemesterResultDialog
        open={resultsDialogOpen}
        handleCloseModal={handleCloseResultsDialog}
        classSubject={selectedClassSubject}
        className={className}
      />
    </Box>
  );
};

export default ClassSemesterResultsPage;