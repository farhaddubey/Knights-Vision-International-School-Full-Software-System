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
  MenuItem,
} from "@mui/material";
import { Search as SearchIcon, ChevronLeft, ChevronRight, Star as StarIcon } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import KnightsCdtpSessionDialog from "./dialogs/KnightsCdtpSessionDialog";

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

const DynamicClassKnightsCdtpSessionPage = ({ className }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionTypeFilter, setSessionTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("view");
  const [selectedSession, setSelectedSession] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // Validate className against ClassName enum
  const validClassNames = [
    "LKG", "UKG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", 
    "IX", "X", "XS", "XI", "XII", "XIIS", "XIII", "XIIIJ"
  ];
  const isValidClass = validClassNames.includes(className.toUpperCase());
  const classInfo = { id: null, name: isValidClass ? `Class ${className}` : "Invalid Class" };

  useEffect(() => {
    if (!isValidClass) {
      setError("Invalid class name provided.");
      setLoading(false);
      return;
    }
    setPage(currentPage);
    fetchSessions(currentPage, searchQuery, sessionTypeFilter);
  }, [currentPage, sessionTypeFilter, className]);

  const fetchSessions = async (pageNum = 1, search = "", type = "") => {
    const token = Cookies.get("faculties_token");
    if (!token) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/MonthlyKnightsCdtpSessions/${className.toLowerCase()}/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { className, page: pageNum, pageSize, searchQuery: search, sessionType: type },
      });

      if (!response.data || !Array.isArray(response.data.sessions)) {
        throw new Error("Invalid response format");
      }

      setSessions(response.data.sessions);
      setFilteredSessions(response.data.sessions);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError(`Failed to fetch Knights CDTP sessions for ${classInfo.name}.`);
      toast.error(`Failed to fetch Knights CDTP sessions for ${classInfo.name}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    fetchSessions(1, query, sessionTypeFilter);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", "1");
    router.push(`?${newSearchParams.toString()}`);
  };

  const handleTypeFilterChange = (event) => {
    const type = event.target.value;
    setSessionTypeFilter(type);
    fetchSessions(1, searchQuery, type);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", "1");
    router.push(`?${newSearchParams.toString()}`);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", value.toString());
    router.push(`?${newSearchParams.toString()}`);
    fetchSessions(value, searchQuery, sessionTypeFilter);
  };

  const handleOpenDialog = (mode, session = null) => {
    setDialogMode(mode);
    setSelectedSession(session);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSession(null);
    fetchSessions(page, searchQuery, sessionTypeFilter);
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
          <StarIcon />
        </ListItemIcon>
        <ListItemText primary={`Knights CDTP Sessions ${classInfo.name.replace('Class ', '')}`} />
        <TextField
          variant="outlined"
          placeholder="Search by Title..."
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
        <TextField
          select
          label="Session Type"
          value={sessionTypeFilter}
          onChange={handleTypeFilterChange}
          sx={{ ...textFieldStyles, width: "250px" }}
        >
          <MenuItem value="">All Types</MenuItem>
          {["MOTIVATIONAL_STORY", "TALENT_ZONE_UNLOCK", "CAREER_FLASHCARD", "SUPER_HABIT", "CHARACTER_LESSON"].map((type) => (
            <MenuItem key={type} value={type}>
              {type.replace(/_/g, " ")}
            </MenuItem>
          ))}
        </TextField>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => handleOpenDialog("add")}
          sx={{ color: "#00c757", borderColor: "#00c757" }}
        >
          Add Session
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
            Title
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Session Date
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Type
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: "bold", color: "#fff" }}>
            Actions
          </Typography>
        </Box>
        <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 200}px)`, overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
          <List>
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session) => (
                <ListItem
                  key={session.id}
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
                    {session.id}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {session.title}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {new Date(session.sessionDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {session.sessionType.replace(/_/g, " ")}
                  </Typography>
                  <Box sx={{ flex: 0.8, display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleOpenDialog("view", session)}
                      sx={{ color: "#00c757", borderColor: "#00c757" }}
                    >
                      View
                    </Button>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
                No Knights CDTP sessions found for {classInfo.name}.
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

      <KnightsCdtpSessionDialog
        open={dialogOpen}
        mode={dialogMode}
        session={selectedSession}
        className={className}
        onClose={handleCloseDialog}
      />
    </Box>
  );
};

export default DynamicClassKnightsCdtpSessionPage;