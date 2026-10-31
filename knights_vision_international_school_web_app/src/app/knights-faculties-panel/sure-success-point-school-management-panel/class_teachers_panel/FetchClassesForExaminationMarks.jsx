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
import Cookies from "js-cookie";
import SemesterResultDialog from "../components/dialogs/SemesterResultDialog";

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

const ClassSemesterResultsPage = () => {
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
      // Group subjects by className to send separate requests
      const groupedByClass = batchResults.classSubjectIds.reduce((acc, id) => {
        const subject = classSubjects.find((cs) => cs.id === id);
        if (subject) {
          const className = subject.className.toLowerCase();
          if (!acc[className]) {
            acc[className] = [];
          }
          acc[className].push({
            classSubjectId: id,
            classId: subject.classId,
            branchId: subject.branchId,
            schoolId: subject.schoolId,
            subjectId: subject.subjectId,
            semester: batchResults.semester,
          });
        }
        return acc;
      }, {});

      const token = Cookies.get("faculties_token");
      if (!token) throw new Error("User not authenticated");

      // Send requests for each class
      const requests = Object.entries(groupedByClass).map(([className, subjects]) =>
        axios.post(
          `/api-schools-panel/class_teachers_panel/SemesterResults/${className}/semester-results/batch`,
          { classSubjects: subjects },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );

      await Promise.all(requests);
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
        <Typography variant="h6" sx={{ color: "#fff" }}>My Classes Semester Results</Typography>
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
            ...textFieldStyles,
          }}
        />
        <Button
          variant="outlined"
          color="primary"
          sx={{ color: "#00c757", borderColor: "#00c757" }}
          onClick={handleOpenBatchResultsDialog}
        >
          Create Batch Results
        </Button>
      </Box>

      <Box sx={{ bgcolor: "#181818", borderRadius: 2, maxHeight: "82vh", overflowY: "scroll" }}>
        <List sx={{ bgcolor: "#181818" }}>
          <ListItem sx={{ bgcolor: "#333", borderRadius: 1, mb: 1 }}>
            <Box sx={{ display: "flex", width: "100%", color: "#fff", fontWeight: "bold" }}>
              <Box sx={{ flex: 1 }}>ID</Box>
              <Box sx={{ flex: 2 }}>Class</Box>
              <Box sx={{ flex: 2 }}>Subject</Box>
              <Box sx={{ flex: 3 }}>Actions</Box>
            </Box>
          </ListItem>
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
                  <Box sx={{ display: "flex", width: "100%", color: "#fff" }}>
                    <Box sx={{ flex: 1 }}>{cs.id}</Box>
                    <Box sx={{ flex: 2 }}>{cs.className}</Box>
                    <Box sx={{ flex: 2 }}>{cs.subject.name}</Box>
                    <Box sx={{ flex: 3 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleOpenResultsDialog(cs)}
                        sx={{ color: "#00c757", borderColor: "#00c757", textTransform: "none" }}
                      >
                        Manage Semester Results
                      </Button>
                    </Box>
                  </Box>
                </ListItem>
                {index < filteredClassSubjects.length - 1 && <Divider sx={{ bgcolor: "#111" }} />}
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <ListItemText
                primary="No subjects found for your classes."
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
        className={selectedClassSubject?.className || ""}
      />

      <Dialog
        open={batchResultsDialogOpen}
        onClose={handleCloseBatchResultsDialog}
        PaperProps={{ sx: { bgcolor: "#181818", color: "#fff", minWidth: "500px" } }}
      >
        <DialogTitle sx={{ bgcolor: "#333", color: "#fff" }}>Create Batch Semester Results</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, ...textFieldStyles }}>
            <InputLabel sx={{ color: "#aaa" }}>Semester</InputLabel>
            <Select
              value={batchResults.semester}
              onChange={(e) => handleBatchResultsChange("semester", e.target.value)}
              sx={{ color: "#fff", backgroundColor: "#222" }}
            >
              <MenuItem value="First">First</MenuItem>
              <MenuItem value="Second">Second</MenuItem>
            </Select>
          </FormControl>
          <Typography sx={{ mt: 2, color: "#fff" }}>Select Subjects:</Typography>
          <List sx={{ maxHeight: "300px", overflowY: "auto" }}>
            {classSubjects.map((cs) => (
              <ListItem key={cs.id} sx={{ bgcolor: "#222", mb: 1, borderRadius: 1 }}>
                <Checkbox
                  checked={batchResults.classSubjectIds.includes(cs.id)}
                  onChange={(e) => {
                    const ids = e.target.checked
                      ? [...batchResults.classSubjectIds, cs.id]
                      : batchResults.classSubjectIds.filter((id) => id !== cs.id);
                    handleBatchResultsChange("classSubjectIds", ids);
                  }}
                  sx={{ color: "#fff", "&.Mui-checked": { color: "#00c757" } }}
                />
                <ListItemText
                  primary={`${cs.className} - ${cs.subject.name}`}
                  primaryTypographyProps={{ color: "#fff" }}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ bgcolor: "#333" }}>
          <Button onClick={handleCloseBatchResultsDialog} sx={{ color: "#fff" }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateBatchResults}
            variant="contained"
            sx={{ bgcolor: "#00c757", color: "#000", "&:hover": { bgcolor: "#00a548" } }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassSemesterResultsPage;