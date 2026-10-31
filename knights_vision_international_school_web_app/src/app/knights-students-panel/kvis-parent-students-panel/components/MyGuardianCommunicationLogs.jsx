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
import { Search as SearchIcon, ChevronLeft, ChevronRight, Chat as ChatIcon } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import ViewGuardianCommunicationLogDialog from "./dialogs/ViewGuardianCommunicationLogDialog";
import Cookies from "js-cookie";

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 10;
const greenAccent = "#00c853";

const MyGuardianCommunicationLogs = () => {
  const [className, setClassName] = useState("");
  const [allLogs, setAllLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    setPage(currentPage);
    fetchLogs();
  }, []);

  useEffect(() => {
    const filtered = allLogs.filter((log) =>
      log.summary?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredLogs(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setPage(1);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", "1");
    router.push(`?${newSearchParams.toString()}`);
  }, [searchQuery, allLogs]);

  const fetchLogs = async () => {
    const token = Cookies.get("student_token");
    if (!token) {
      setError("User not authenticated. Please log in.");
      toast.error("User not authenticated. Please log in.");
      router.push("/login");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/a1-knights-students-panel/students/myguardiancommunicationlogs", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, pageSize: 1000 }, // Fetch all logs for client-side filtering
      });

      if (!response.data || !Array.isArray(response.data.logs)) {
        throw new Error("Invalid response format");
      }

      setAllLogs(response.data.logs);
      setFilteredLogs(response.data.logs);
      setTotalPages(Math.ceil(response.data.logs.length / pageSize));
      setClassName(response.data.className || "Unknown");
    } catch (err) {
      console.error("Fetch Logs Error:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.error || "Failed to fetch communication logs.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", value.toString());
    router.push(`?${newSearchParams.toString()}`);
  };

  const handleOpenViewDialog = (log) => {
    setSelectedLog(log);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedLog(null);
  };

  const paginatedLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize);

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
          <ChatIcon />
        </ListItemIcon>
        <ListItemText primary={`My Guardian Communication Logs - ${className}`} />
        <TextField
          variant="outlined"
          placeholder="Search Logs..."
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
            Communication Type
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Method
          </Typography>
          <Typography variant="body2" sx={{ flex: 1.5, fontWeight: "bold", color: "#fff" }}>
            Summary
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: "bold", color: "#fff" }}>
            Actions
          </Typography>
        </Box>
        <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 200}px)`, overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
          <List>
            {paginatedLogs.length > 0 ? (
              paginatedLogs.map((log) => (
                <ListItem
                  key={log.id}
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
                    {log.id}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {log.communicationType}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {log.method}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1.5, color: "#fff" }}>
                    {log.summary || "N/A"}
                  </Typography>
                  <Box sx={{ flex: 0.8 }}>
                    <Button
                      variant="outlined"
                      sx={{ color: greenAccent, borderColor: greenAccent }}
                      onClick={() => handleOpenViewDialog(log)}
                    >
                      View
                    </Button>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
                No communication logs found for {className}.
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

      <ViewGuardianCommunicationLogDialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        log={selectedLog}
        className={className}
      />
    </Box>
  );
};

export default MyGuardianCommunicationLogs;