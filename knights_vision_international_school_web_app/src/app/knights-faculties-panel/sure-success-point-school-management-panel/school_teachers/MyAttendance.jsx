import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  IconButton,
} from "@mui/material";
import { EmojiPeople, RotateRight, Clear } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { jwtDecode } from "jwt-decode";

const drawerWidth = 280;
const appBarHeight = 64;

const EmployeeWiseAttendance = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [salary, setSalary] = useState("");
  const [monthYear, setMonthYear] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async (selectedMonthYear = monthYear) => {
    const token = Cookies.get("faculties_token");
    if (!token) {
      setError("User not authenticated. Please log in.");
      setLoading(false);
      toast.error("No token found. Please log in.");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const userId = Number(decoded?.id);
      if (!userId) {
        throw new Error("Invalid user ID in token");
      }

      console.log("✅ User ID extracted from token:", userId);
      const [year, month] = selectedMonthYear.split("-");
      const response = await axios.get(
        `/api-schools-panel/employee-attendance-logs/get-attendance-all-by-userId?userId=${userId}&month=${month}&year=${year}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const userData = response.data;
      console.log("User Data Fetched:", userData);

      if (!userData || !userData.username || !Array.isArray(userData.attendance_logs)) {
        throw new Error("Invalid user data format");
      }

      setSalary(userData.per_day_salary);
      setUsername(userData.username);
      setRole(userData.role || "");
      setAttendanceLogs(userData.attendance_logs);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError(error.message || "Failed to fetch attendance data");
      setLoading(false);
      toast.error(error.message || "Failed to fetch attendance data");
    }
  };

  const clearFilters = () => {
    const now = new Date();
    setMonthYear(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
    fetchEmployees();
  };

  const handleSearch = () => {
    setLoading(true);
    fetchEmployees(monthYear);
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
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setError(null);
            setLoading(true);
            fetchEmployees();
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `${drawerWidth}px`,
        width: `calc(100vw - ${drawerWidth}px)`,
        height: `calc(100vh - ${appBarHeight}px)`,
        bgcolor: "#000",
        color: "#fff",
      }}
    >
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
          bgcolor: "#004d40",
          color: "#fff",
          "&:hover": { bgcolor: "#004d40" },
          py: 1,
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <ListItemIcon sx={{ minWidth: 30, color: "#fff" }}>
          <EmojiPeople />
        </ListItemIcon>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <TextField
            label="Select Month"
            type="month"
            value={monthYear}
            size="small"
            onChange={(e) => setMonthYear(e.target.value)}
            InputLabelProps={{ shrink: true }}
            aria-label="Select month and year for attendance logs"
            sx={{
              maxWidth: 200,
              minWidth: 150,
              backgroundColor: "#000",
              "& .MuiInputBase-input": { color: "#fff" },
              "& .MuiInputLabel-root": { color: "#fff" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#fff" },
                "&:hover fieldset": { borderColor: "#fff" },
                "&.Mui-focused fieldset": { borderColor: "#fff" },
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            sx={{ textTransform: "none" }}
            aria-label="Search attendance logs"
          >
            Search
          </Button>
          <IconButton
            aria-label="Clear month filter"
            onClick={clearFilters}
            sx={{ color: "#fff" }}
          >
            <Clear />
          </IconButton>
        </Box>
        <ListItemText
          primary="Employee Attendance Logs"
          primaryTypographyProps={{ fontWeight: "bold", color: "#fff" }}
        />
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ textTransform: "none" }}
          >
            All Attendance & Salary Logs
          </Button>
          <Button
            onClick={() => fetchEmployees()}
            variant="outlined"
            sx={{
              color: "#00c853",
              borderColor: "#00c853",
              bgcolor: "#212121",
              "&:hover": { borderColor: "#00c853", bgcolor: "#333" },
              textTransform: "none",
            }}
            aria-label="Refresh attendance logs"
          >
            <RotateRight />
          </Button>
        </Box>
      </ListItemButton>

      <Box sx={{ p: 1, bgcolor: "#181818" }}>
        {/* Header Row */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            p: 1,
            bgcolor: "#333",
            borderRadius: 1,
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Date
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Entry Time
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Exit Time
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Total Hours
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Late Minutes
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Penalty
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Overtime Min
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Salary
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Base Salary
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Bonus Salary
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Net Salary
          </Typography>
        </Box>

        {/* Data Rows */}
        <Box sx={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
          {attendanceLogs.length > 0 ? (
            attendanceLogs.map((log) => (
              <Box
                key={log.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  p: 1,
                  bgcolor: "#181818",
                  mb: 1,
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {log?.date ? new Date(log.date).toLocaleDateString() : ""}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {log?.entry_time}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {log?.leave_time}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {log?.total_hours ?? ""}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {log?.late_minutes ?? ""}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {log?.penalty ?? ""}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {log?.overtime_minutes ?? ""}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {salary}
                </Typography>
                   <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {log?.base_salary_per_day}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {log?.bonus_salary_per_day}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {log?.net_salary_of_the_day ?? ""}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2" sx={{ textAlign: "center", color: "#fff", p: 2 }}>
              No Attendance Logs Found
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default EmployeeWiseAttendance;