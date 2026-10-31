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
  FormControl,
  InputLabel,
} from "@mui/material";
import { Inventory, RotateRight, Search, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from 'next/navigation';

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 100;
const greenAccent = '#00c853';

const SchoolEmployeeAttendance = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to current day
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    console.log('[SchoolEmployeeAttendance] Current page from URL:', currentPage);
    setPage(currentPage);
  }, [currentPage]);

  const fetchLogs = async (pageNum = 1, date = null) => {
    try {
      const token = Cookies.get("faculties_token");
      console.log('[fetchLogs] Token present:', !!token);
      if (!token) {
        throw new Error("Authentication token is missing!");
      }

      const params = { page: pageNum, pageSize };
      if (date) {
        params.date = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      }

      const response = await axios.get("/api-schools-panel/employee-attendance-logs/get-attendance-all", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      console.log('[fetchLogs] Response:', response.data);

      if (!response.data || !Array.isArray(response.data.logs)) {
        throw new Error('Invalid response format: logs array missing');
      }

      setLogs(response.data.logs);
      setFilteredLogs(response.data.logs);
      setTotalPages(response.data.totalPages || 1);
      console.log('[fetchLogs] totalPages set to:', response.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching attendance logs:", error);
      setError(error.response?.data?.error || "Failed to fetch attendance logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[SchoolEmployeeAttendance] Fetching logs for page:', page, 'date:', selectedDate);
    fetchLogs(page, selectedDate);
  }, [page, selectedDate]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = logs.filter((log) =>
      (log.username?.toLowerCase() || "").includes(query) ||
      (log.date?.toLowerCase() || "").includes(query)
    );
    setFilteredLogs(filtered);
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setPage(1); // Reset to page 1 when date changes
  };

  const handleSearchByDate = () => {
    console.log('[SchoolEmployeeAttendance] Fetching logs for selected date:', selectedDate);
    fetchLogs(1, selectedDate);
  };

  const handlePageChange = (event, value) => {
    console.log('[SchoolEmployeeAttendance] Page changed to:', value);
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', value.toString());
    router.push(`?${newSearchParams.toString()}`);
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
    <Box sx={{ position: "fixed", minWidth: `calc(100vw - ${drawerWidth}px)`, backgroundColor: "#212121", height: `calc(100vh - ${appBarHeight}px)`, color: "#fff" }}>
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
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
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: '8px 16px',
          borderRadius: 1,
        }}
      >
        <ListItemIcon sx={{ fontSize: 30, color: 'orange', fontWeight: 'bold' }}>
          <Inventory />
        </ListItemIcon>
        <ListItemText primary="Employee Attendance Management Panel" />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <FormControl sx={{ minWidth: 150, bgcolor: "#333", borderRadius: 1 }}>
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={handleDateChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  sx={{
                    bgcolor: "#333",
                    borderRadius: 1,
                    "& .MuiInputBase-input": { color: "#fff" },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: greenAccent },
                  }}
                />
              )}
            />
          </FormControl>
        </LocalizationProvider>
        <Button
          onClick={handleSearchByDate}
          variant="contained"
          sx={{ bgcolor: greenAccent, color: '#000', '&:hover': { bgcolor: '#00a843' } }}
        >
          Fetch Logs
        </Button>
        <TextField
          placeholder="Search by Name or Date"
          value={searchQuery}
          onChange={handleSearch}
          size="small"
          sx={{
            width: '250px',
            backgroundColor: '#333',
            borderRadius: '4px',
            '& .MuiInputBase-input': { color: '#fff' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: greenAccent },
          }}
          InputProps={{
            startAdornment: <Search sx={{ color: '#fff', mr: 1 }} />,
          }}
        />
        <Button
          onClick={() => fetchLogs(page, selectedDate)}
          variant="outlined"
          sx={{ color: greenAccent, borderColor: greenAccent }}
        >
          <RotateRight />
        </Button>
      </ListItemButton>

      <Box sx={{ bgcolor: "#181818", borderRadius: 2, overflow: 'hidden' }}>
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
          <Typography variant="body2" sx={{ flex: 1.3, fontWeight: "bold", color: "#fff" }}>Name</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Date</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Entry Time</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Exit Time</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Late Minutes</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Penalty</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Overtime</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Overtime Salary</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Bonus Salary</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Net Salary</Typography>
        </Box>

        <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 150}px)`, overflowY: "auto", bgcolor: "#121212", borderRadius: 1, paddingBottom: 10 }}>
          <List>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <ListItem
                  key={log.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    p: 1,
                    bgcolor: "#181818",
                    mb: 1,
                    borderRadius: 1,
                    borderBottom: '2px solid #333',
                  }}
                >
                  <Typography variant="body2" sx={{ flex: 1.3, color: "#fff" }}>
                    {log?.username ?? "Unknown"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {log?.date ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {log?.entry_time ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {log?.leave_time ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {log?.late_minutes ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {log?.penalty ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {log?.overtime_minutes ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {log?.overtime_salary ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {log?.bonus_salary_per_day ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {log?.net_salary_of_the_day ?? "N/A"}
                  </Typography>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: '#fff', textAlign: 'center', p: 2 }}>
                No attendance logs found for {selectedDate.toISOString().split('T')[0]}.
              </Typography>
            )}
          </List>
        </Box>

        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            left: `calc(${drawerWidth}px + 50%)`,
            transform: 'translateX(-50%)',
            bgcolor: '#181818',
            borderRadius: 2,
            p: 1,
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            zIndex: 1000,
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color='primary'
            sx={{
              '& .MuiPaginationItem-root': {
                color: '#fff',
                '&:hover': { bgcolor: '#333' },
                '&.Mui-selected': {
                  bgcolor: greenAccent,
                  color: '#000',
                  '&:hover': { bgcolor: greenAccent },
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
    </Box>
  );
};

export default SchoolEmployeeAttendance;