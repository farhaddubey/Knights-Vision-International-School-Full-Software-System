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
} from "@mui/material";
import { Search as SearchIcon, ChevronLeft, ChevronRight, MeetingRoom as MeetingRoomIcon } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import ViewParentTeacherMeetingNoteDialog from "./dialogs/ViewParentTeacherMeetingNoteDialog";
import Cookies from "js-cookie";
import jwtDecode from "jwt-decode";

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 10;
const greenAccent = "#00c853";

const MyParentTeacherMeetingNotes = () => {
  const [className, setClassName] = useState("");
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  useEffect(()=>{
    fetchNotes(); 
  }, [])

  const fetchNotes = async (pageNum = 1, search = "") => {
    const token = Cookies.get("student_token");
    if (!token) {
      toast.error("User not authenticated. Please log in.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/a1-knights-students-panel/students/myparentteachermeetingnotes", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: pageNum, pageSize, searchQuery: search },
      });

      if (!response.data || !Array.isArray(response.data.notes)) {
        throw new Error("Invalid response format");
      }

      setNotes(response.data.notes);
      setFilteredNotes(response.data.notes);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("Fetch Notes Error:", err.response?.data || err.message);
      setError("Failed to fetch parent-teacher meeting notes.");
      toast.error("Failed to fetch parent-teacher meeting notes.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    fetchNotes(1, query);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", "1");
    router.push(`?${newSearchParams.toString()}`);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", value.toString());
    router.push(`?${newSearchParams.toString()}`);
    fetchNotes(value, searchQuery);
  };

  const handleOpenViewDialog = (note) => {
    setSelectedNote(note);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedNote(null);
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
          <MeetingRoomIcon />
        </ListItemIcon>
        <ListItemText primary={`My Parent-Teacher Meeting Notes - ${className}`} />
        <TextField
          variant="outlined"
          placeholder="Search Notes..."
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
            Meeting Date
          </Typography>
          <Typography variant="body2" sx={{ flex: 1.5, fontWeight: "bold", color: "#fff" }}>
            Guardian Feedback
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: "bold", color: "#fff" }}>
            Actions
          </Typography>
        </Box>
        <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 200}px)`, overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
          <List>
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <ListItem
                  key={note.id}
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
                    {note.id}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {new Date(note.meetingDate).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1.5, color: "#fff" }}>
                    {note.guardianFeedback || "N/A"}
                  </Typography>
                  <Box sx={{ flex: 0.8 }}>
                    <Button
                      variant="outlined"
                      sx={{ color: greenAccent, borderColor: greenAccent }}
                      onClick={() => handleOpenViewDialog(note)}
                    >
                      View
                    </Button>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
                No parent-teacher meeting notes found for {className}.
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

      <ViewParentTeacherMeetingNoteDialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        note={selectedNote}
        className={className}
      />
    </Box>
  );
};

export default MyParentTeacherMeetingNotes;