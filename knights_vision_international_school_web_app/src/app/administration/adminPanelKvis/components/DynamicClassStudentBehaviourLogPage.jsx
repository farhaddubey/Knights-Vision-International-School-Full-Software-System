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
import { Search as SearchIcon, ChevronLeft, ChevronRight, Report as ReportIcon } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import ViewBehaviourLogDialog from "./dialogs/ViewBehaviourLogDialog";
import AddBehaviourLogDialog from "./dialogs/AddBehaviourLogDialog";

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 10;

// Define ClassName enum values (matching the Prisma schema)
const validClassNames = [
  'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XS', 'XI', 'XII', 'XIIS', 'XIII', 'XIIIJ'
];

const DynamicClassStudentBehaviourLogPage = ({ className }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [behaviourLogs, setBehaviourLogs] = useState([]);
  const [filteredBehaviourLogs, setFilteredBehaviourLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    // Validate className against ClassName enum
    if (!validClassNames.includes(className.toUpperCase())) {
      setError('Invalid class name');
      setLoading(false);
      return;
    }
    setPage(currentPage);
    fetchBehaviourLogs(currentPage);
  }, [currentPage, className]);

  const fetchBehaviourLogs = async (pageNum = 1, search = "") => {
    const token = Cookies.get("administration_token");
    if (!token) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      // Dynamically calculate the current academic year
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth(); // 0-11 (Jan-Dec)
      const currentYear = currentDate.getFullYear();
      const academicYear = currentMonth >= 3 ? currentYear : currentYear - 1;

      const response = await axios.get(`/api/MonthlyStudentBehaviourLogs/${className.toLowerCase()}/logs`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: pageNum, pageSize, searchQuery: search, academicYear, branchId: 1 },
      });

      if (!response.data || !Array.isArray(response.data.behaviourLogs)) {
        throw new Error("Invalid response format");
      }

      setBehaviourLogs(response.data.behaviourLogs);
      setFilteredBehaviourLogs(response.data.behaviourLogs);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching behaviour logs:", err);
      setError(`Failed to fetch behaviour logs for ${className.toUpperCase()}.`);
      toast.error(`Failed to fetch behaviour logs for ${className.toUpperCase()}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    fetchBehaviourLogs(1, query);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", "1");
    router.push(`?${newSearchParams.toString()}`);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", value.toString());
    router.push(`?${newSearchParams.toString()}`);
    fetchBehaviourLogs(value, searchQuery);
  };

  const handleOpenViewDialog = (logId) => {
    setSelectedLogId(logId);
    setViewDialogOpen(true);
  };

  const handleOpenAddDialog = () => {
    setAddDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedLogId(null);
  };

  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
    fetchBehaviourLogs(page, searchQuery);
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
          <ReportIcon />
        </ListItemIcon>
        <ListItemText primary={`Student Behaviour Logs ${className.toUpperCase()}`} />
        <TextField
          variant="outlined"
          placeholder="Search by Student or Type..."
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
          onClick={handleOpenAddDialog}
          sx={{ color: "#00c757", borderColor: "#00c757" }}
        >
          Add New Log
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
            Category
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Type
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.5, fontWeight: "bold", color: "#fff" }}>
            Severity
          </Typography>
          <Typography variant="body2" sx={{ flex: 0.5, fontWeight: "bold", color: "#fff" }}>
            Actions
          </Typography>
        </Box>
        <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 200}px)`, overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
          <List>
            {filteredBehaviourLogs.length > 0 ? (
              filteredBehaviourLogs.map((log) => (
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
                    {`${log.student.firstName} ${log.student.middleName || ''} ${log.student.lastName}`.trim()}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {log.category}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {log.type}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 0.5, color: "#fff" }}>
                    {log.severityLevel}
                  </Typography>
                  <Box sx={{ flex: 0.5, display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleOpenViewDialog(log.id)}
                      sx={{ color: "#00c757", borderColor: "#00c757" }}
                    >
                      View
                    </Button>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
                No behaviour logs found for {className.toUpperCase()}.
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

      <ViewBehaviourLogDialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        logId={selectedLogId}
        className={className}
      />
      
      <AddBehaviourLogDialog
        open={addDialogOpen}
        onClose={handleCloseAddDialog}
        className={className}
      />
    </Box>
  );
};

export default DynamicClassStudentBehaviourLogPage;