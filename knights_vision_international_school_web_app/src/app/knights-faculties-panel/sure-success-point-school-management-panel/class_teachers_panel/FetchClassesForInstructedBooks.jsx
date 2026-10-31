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
import { Search as SearchIcon, ChevronLeft, ChevronRight, Book as BookIcon } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import ViewBooksDialog from "../components/dialogs/ViewBooksDialog";

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 10;

const ClassSubjectBooksPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewBooksDialogOpen, setViewBooksDialogOpen] = useState(false);
  const [addBooksDialogOpen, setAddBooksDialogOpen] = useState(false);
  const [selectedClassSubjectId, setSelectedClassSubjectId] = useState(null);
  const [selectedSubjectName, setSelectedSubjectName] = useState("");
  const [selectedClassName, setSelectedClassName] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    setPage(currentPage);
    fetchSubjects(currentPage);
  }, [currentPage]);

  const fetchSubjects = async (pageNum = 1, search = "") => {
    try {
      setLoading(true);
      setError(null);
      const token = Cookies.get("faculties_token");
      if (!token) throw new Error("User not authenticated");

      console.log(`DEBUG: Fetching subjects for page=${pageNum}, search=${search}`);
      const response = await axios.get("/api-schools-panel/class_teachers_panel/class-subjects", {
        params: { page: pageNum, pageSize, searchQuery: search },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.data || !Array.isArray(response.data.classSubjects)) {
        throw new Error("Invalid response format");
      }

      console.log(`DEBUG: Fetched ${response.data.classSubjects.length} subjects`, response.data.classSubjects);
      setSubjects(response.data.classSubjects);
      setFilteredSubjects(response.data.classSubjects);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("DEBUG: Error fetching subjects:", err.message);
      setError(err.response?.data?.error || err.message || "Failed to fetch subjects");
      toast.error(err.response?.data?.error || err.message || "Failed to fetch subjects");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    fetchSubjects(1, query);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", "1");
    router.push(`?${newSearchParams.toString()}`);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", value.toString());
    router.push(`?${newSearchParams.toString()}`);
    fetchSubjects(value, searchQuery);
  };

  const handleOpenViewBooksDialog = (classSubjectId, subjectName, className) => {
    setSelectedClassSubjectId(classSubjectId);
    setSelectedSubjectName(subjectName);
    setSelectedClassName(className);
    setViewBooksDialogOpen(true);
  };

  const handleCloseViewBooksDialog = () => {
    setViewBooksDialogOpen(false);
    setSelectedClassSubjectId(null);
    setSelectedSubjectName("");
    setSelectedClassName("");
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
          <BookIcon />
        </ListItemIcon>
        <ListItemText primary="My Classes Subject Books" />
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
            Description
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Actions
          </Typography>
        </Box>
        <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 200}px)`, overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
          <List>
            {filteredSubjects.length > 0 ? (
              filteredSubjects.map((subject) => (
                <ListItem
                  key={subject.id}
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
                    {subject.id}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {subject.className}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {subject.subject.name}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {subject.subject.description || "N/A"}
                  </Typography>
                  <Box sx={{ flex: 1, display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleOpenViewBooksDialog(subject.id, subject.subject.name, subject.className)}
                      sx={{ color: "#00c757", borderColor: "#00c757" }}
                    >
                      View Books
                    </Button>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
                No subjects found for your classes.
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

      <ViewBooksDialog
        open={viewBooksDialogOpen}
        onClose={handleCloseViewBooksDialog}
        classSubjectId={selectedClassSubjectId}
        subjectName={selectedSubjectName}
        className={selectedClassName}
      />
    </Box>
  );
};

export default ClassSubjectBooksPage;