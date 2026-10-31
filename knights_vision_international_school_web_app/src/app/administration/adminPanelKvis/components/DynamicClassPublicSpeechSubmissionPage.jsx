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
import { Search as SearchIcon, ChevronLeft, ChevronRight, Mic as MicIcon } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import PublicSpeechSubmissionDialog from "./dialogs/PublicSpeechSubmissionDialog";
import classMap from "../../../../../utils/classmap";

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 10;

const DynamicClassPublicSpeechSubmissionPage = ({ className }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("view");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const classInfo = classMap[className.toLowerCase()] || { id: 4, name: 'Class V' };

  useEffect(() => {
    setPage(currentPage);
    fetchSubmissions(currentPage);
  }, [currentPage, className]);

  const fetchSubmissions = async (pageNum = 1, search = "") => {
    const token = Cookies.get("administration_token");
    if (!token) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/MonthlyPublicSpeechSubmissions/${className.toLowerCase()}/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { classId: classInfo.id, page: pageNum, pageSize, searchQuery: search },
      });

      if (!response.data || !Array.isArray(response.data.submissions)) {
        throw new Error("Invalid response format");
      }

      setSubmissions(response.data.submissions);
      setFilteredSubmissions(response.data.submissions);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError(`Failed to fetch public speech submissions for ${classInfo.name}.`);
      toast.error(`Failed to fetch public speech submissions for ${classInfo.name}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    fetchSubmissions(1, query);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", "1");
    router.push(`?${newSearchParams.toString()}`);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", value.toString());
    router.push(`?${newSearchParams.toString()}`);
    fetchSubmissions(value, searchQuery);
  };

  const handleOpenDialog = (mode, submission = null) => {
    setDialogMode(mode);
    setSelectedSubmission(submission);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSubmission(null);
    fetchSubmissions(page, searchQuery);
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
      <ListItemButton
        sx={{
          backgroundColor: "#b71c1c",
          color: "#fff",
          "&:hover": { backgroundColor: "#b71c1c" },
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "8px 16px",
          borderRadius: 1,
        }}
      >
        <ListItemIcon sx={{ color: "#fff" }}>
          <MicIcon />
        </ListItemIcon>
        <ListItemText primary={`Public Speech Submissions ${classInfo.name.replace('Class ', '')}`} />
        <TextField
          variant="outlined"
          placeholder="Search by Student Name..."
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
          onClick={() => handleOpenDialog("add")}
          sx={{ color: "#00c757", borderColor: "#00c757" }}
        >
          Add Submission
        </Button>
      </ListItemButton>

      <Box sx={{ bgcolor: "#181818", borderRadius: 2, m: 2 }}>
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
            Student
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Occasion
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Title
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: "bold", color: "#fff" }}>
            Actions
          </Typography>
        </Box>
        <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 200}px)`, overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
          <List>
            {filteredSubmissions.length > 0 ? (
              filteredSubmissions.map((submission) => (
                <ListItem
                  key={submission.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    p: 1,
                    bgcolor: "#181818",
                    mb: 1,
                    borderRadius: 1,
                    borderBottom: "2px solid #333",
                    "&:hover": { bgcolor: "#222" },
                  }}
                >
                  <Typography variant="body2" sx={{ flex: 0.5, color: "#fff" }}>
                    {submission.id}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {submission.student.name}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {submission.occasion.title}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {submission.title}
                  </Typography>
                  <Box sx={{ flex: 0.8, display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleOpenDialog("view", submission)}
                      sx={{ color: "#00c757", borderColor: "#00c757" }}
                    >
                      View
                    </Button>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
                No public speech submissions found for {classInfo.name}.
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

      <PublicSpeechSubmissionDialog
        open={dialogOpen}
        mode={dialogMode}
        submission={selectedSubmission}
        classId={classInfo.id}
        className={className}
        onClose={handleCloseDialog}
      />
    </Box>
  );
};

export default DynamicClassPublicSpeechSubmissionPage;