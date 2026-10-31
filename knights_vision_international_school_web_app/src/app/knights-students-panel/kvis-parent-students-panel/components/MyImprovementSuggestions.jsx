"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
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
  MenuItem,
} from "@mui/material";
import { Search as SearchIcon, ChevronLeft, ChevronRight, Lightbulb as LightbulbIcon } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import ViewImprovementSuggestionDialog from "./dialogs/ViewImprovementSuggestionDialog";
import Cookies from "js-cookie";
import jwtDecode from "jwt-decode";

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 10;
const greenAccent = "#00c853";

const suggestionCategories = [
  "DISCIPLINE",
  "UNIFORM",
  "SYLLABUS",
  "HOMEWORK",
  "TEACHER_BEHAVIOR",
  "CLEANLINESS",
  "TRANSPORT",
  "EXTRACURRICULAR",
  "TIMETABLE",
  "OTHER",
];

const MyImprovementSuggestions = () => {
  const [className, setClassName] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    category: "DISCIPLINE",
    message: "",
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async (pageNum = 1, search = "") => {
    const token = Cookies.get("student_token");
    if (!token) {
      toast.error("User not authenticated. Please log in.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/a1-knights-students-panel/students/myimprovementsuggestions", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: pageNum, pageSize, searchQuery: search },
      });

      if (!response.data || !Array.isArray(response.data.suggestions)) {
        throw new Error("Invalid response format");
      }

      setSuggestions(response.data.suggestions);
      setFilteredSuggestions(response.data.suggestions);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("Fetch Suggestions Error:", err.response?.data || err.message);
      setError("Failed to fetch improvement suggestions.");
      toast.error("Failed to fetch improvement suggestions.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    fetchSuggestions(1, query);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", "1");
    router.push(`?${newSearchParams.toString()}`);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", value.toString());
    router.push(`?${newSearchParams.toString()}`);
    fetchSuggestions(value, searchQuery);
  };

  const handleOpenViewDialog = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedSuggestion(null);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const token = Cookies.get("student_token");
    if (!token) {
      toast.error("User not authenticated. Please log in.");
      return;
    }

    if (!formData.category || !formData.message) {
      toast.error("Please select a category and provide a suggestion.");
      return;
    }

    setLoading(true);
    try {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1; // 1-12
      const year = currentDate.getFullYear(); // e.g., 2025

      await axios.post(
        "/api/a1-knights-students-panel/students/myimprovementsuggestions",
        {
          category: formData.category,
          message: formData.message,
          month,
          year,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Suggestion submitted successfully!");
      setFormData({ category: "DISCIPLINE", message: "" });
      fetchSuggestions(1, searchQuery); // Refresh the list
    } catch (err) {
      console.error("Submit Suggestion Error:", err.response?.data || err.message);
      if (err.response?.status === 409) {
        toast.error("You have already submitted a suggestion for this month.");
      } else {
        toast.error("Failed to submit suggestion.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && suggestions.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: "#181818" }}>
        <CircularProgress size={120} sx={{ color: greenAccent }} />
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
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        backgroundColor: "#181818",
        height: `calc(100vh - ${appBarHeight}px)`,
        color: "#fff",
        overflowY: "auto",
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
          backgroundColor: "#181818",
          color: "#fff",
          "&:hover": { backgroundColor: "#181818" },
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "8px 16px",
          borderRadius: 1,
          mb: 2,
        }}
      >
        <ListItemIcon sx={{ color: greenAccent }}>
          <LightbulbIcon />
        </ListItemIcon>
        <ListItemText primary={`My Improvement Suggestions - ${className}`} />
        <TextField
          variant="outlined"
          placeholder="Search Suggestions..."
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
              "&.Mui-focused fieldset": { borderColor: greenAccent },
            },
          }}
        />
      </ListItemButton>

      <Box sx={{ mb: 3, p: 2, bgcolor: "#222", borderRadius: 1 }}>
        <Typography variant="h6" sx={{ color: "#fff", mb: 1 }}>
          💡 How Can We Improve Better?
        </Typography>
        <Typography sx={{ color: "#fff", mb: 2 }}>
          👉 Tell us honestly — What should be improved this month?
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          <TextField
            select
            label="Category"
            value={formData.category}
            onChange={(e) => handleFormChange("category", e.target.value)}
            sx={{
              "& .MuiInputBase-input": { color: "#fff" },
              "& .MuiInputLabel-root": { color: "#aaa" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#555" },
                "&:hover fieldset": { borderColor: "#777" },
                "&.Mui-focused fieldset": { borderColor: greenAccent },
              },
              width: "200px",
            }}
          >
            {suggestionCategories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Your Suggestion"
            value={formData.message}
            onChange={(e) => handleFormChange("message", e.target.value)}
            multiline
            rows={4}
            sx={{
              "& .MuiInputBase-input": { color: "#fff" },
              "& .MuiInputLabel-root": { color: "#aaa" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#555" },
                "&:hover fieldset": { borderColor: "#777" },
                "&.Mui-focused fieldset": { borderColor: greenAccent },
              },
              width: "400px",
            }}
            inputProps={{ maxLength: 1000 }}
          />
        </Box>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{ bgcolor: greenAccent, color: "#000", mt: 2, "&:hover": { bgcolor: "#00a550" } }}
          disabled={loading || !formData.category || !formData.message}
        >
          Submit Suggestion
        </Button>
      </Box>

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
            Category
          </Typography>
          <Typography variant="body2" sx={{ flex: 1.5, fontWeight: "bold", color: "#fff" }}>
            Message
          </Typography>
          <Typography variant="body2" sx={{ flex: 1.5, fontWeight: "bold", color: "#fff" }}>
            Response
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: "bold", color: "#fff" }}>
            Actions
          </Typography>
        </Box>
        <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 300}px)`, overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
          <List>
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((suggestion) => (
                <ListItem
                  key={suggestion.id}
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
                    {suggestion.id}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {suggestion.category}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ flex: 1.5, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                  >
                    {suggestion.message || "N/A"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ flex: 1.5, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                  >
                    {suggestion.responseMessage || "N/A"}
                  </Typography>
                  <Box sx={{ flex: 0.8 }}>
                    <Button
                      variant="outlined"
                      sx={{ color: greenAccent, borderColor: greenAccent }}
                      onClick={() => handleOpenViewDialog(suggestion)}
                    >
                      View
                    </Button>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
                No improvement suggestions found for {className}.
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

      <ViewImprovementSuggestionDialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        suggestion={selectedSuggestion}
        className={className}
      />
    </Box>
  );
};

export default MyImprovementSuggestions;