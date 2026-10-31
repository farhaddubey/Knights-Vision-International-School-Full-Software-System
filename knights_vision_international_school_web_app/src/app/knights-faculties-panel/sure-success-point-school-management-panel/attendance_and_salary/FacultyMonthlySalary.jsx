import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import { Inventory, RotateRight, Search as SearchIcon } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";

const appBarHeight = 64;
const greenAccent = '#00c853';

const ViewFacultiesCurrentMonthSalary = () => {
  const [salaries, setSalaries] = useState([]);
  const [filteredSalaries, setFilteredSalaries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12 for Jan-Dec
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Retry logic for API calls
  const withRetry = async (fn, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  // Fetch salary data
  const fetchSalaries = async () => {
    const token = Cookies.get("faculties_token");
    if (!token) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const schoolId = decoded.schoolId;
      if (!schoolId) {
        setError("Invalid token: school ID not found.");
        setLoading(false);
        return;
      }

      const response = await withRetry(() =>
        axios.get(`/api-schools-panel/employee_salaries/salaries_by_month_year`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { year: selectedYear, month: selectedMonth },
        })
      );

      const formattedSalaries = response.data.map((item, index) => ({
        id: item.id ?? index,
        username: item.username ?? "Unknown",
        totalHoursWorked: parseFloat(item.total_hours_worked ?? 0),
        paymentStatus: item.payment_status ?? "Unknown",
        allowances: parseFloat(item.allowances ?? 0),
        totalLateDeduction: parseFloat(item.total_late_deduction ?? 0),
        totalOvertimeBonus: parseFloat(item.total_overtime_bonus ?? 0),
        totalSellBonus: parseFloat(item.total_sell_bonus ?? 0),
        netSalary: parseFloat(item.net_salary ?? 0),
        salaryPaid: parseFloat(item.salary_paid ?? 0),
        remainingSalaryOfMonth: parseFloat(item.remaining_salary_of_month ?? 0),
        monthYear: item.month_year ? new Date(item.month_year).toISOString().split("T")[0] : "N/A",
        createdAt: item.created_at ? new Date(item.created_at).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }) : "Not recorded",
        updatedAt: item.updated_at ? new Date(item.updated_at).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }) : "Not updated",
        userId: item.user_id ?? null,
      }));

      setSalaries(formattedSalaries);
      setFilteredSalaries(formattedSalaries);
      console.log("Updated Salary State:", formattedSalaries);
    } catch (err) {
      console.error("Error fetching salaries:", err);
      setError(
        err.response?.status === 400
          ? err.response.data.error || "Invalid request parameters."
          : err.response?.data?.error || "Failed to fetch salary data."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle search input changes
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = salaries.filter((salary) =>
      [
        salary.id.toString(),
        salary.username,
        salary.monthYear,
        salary.totalHoursWorked.toString(),
        salary.paymentStatus,
        salary.allowances.toString(),
        salary.totalLateDeduction.toString(),
        salary.totalOvertimeBonus.toString(),
        salary.totalSellBonus.toString(),
        salary.netSalary.toString(),
        salary.salaryPaid.toString(),
        salary.remainingSalaryOfMonth.toString(),
        salary.createdAt,
        salary.updatedAt,
        salary.userId?.toString(),
      ].some((field) => field?.toLowerCase().includes(query))
    );

    setFilteredSalaries(filtered);
  };

  // Handle year and month selection change
  const handleYearChange = (event) => {
    const newYear = parseInt(event.target.value);
    if (!isNaN(newYear) && newYear > 0) {
      setSelectedYear(newYear);
      setLoading(true);
    }
  };

  const handleMonthChange = (event) => {
    const newMonth = parseInt(event.target.value);
    if (!isNaN(newMonth) && newMonth >= 1 && newMonth <= 12) {
      setSelectedMonth(newMonth);
      setLoading(true);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, [selectedYear, selectedMonth]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
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
    <Box sx={{ position: "fixed", minWidth: `82vw`, backgroundColor: "#212121", height: `calc(100vh - ${appBarHeight}px)`, color: "#fff" }}>
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
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingRight: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <ListItemIcon sx={{ color: "#fff", minWidth: 40 }}>
            <Inventory />
          </ListItemIcon>
          <ListItemText sx={{ color: "#fff" }} primary="Faculty Monthly Salary Records" />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FormControl sx={{ minWidth: 120, bgcolor: "#333", borderRadius: 1 }}>
            <InputLabel sx={{ color: "#fff" }}>Year</InputLabel>
            <Select
              value={selectedYear}
              onChange={handleYearChange}
              sx={{ color: "#fff", "& .MuiSvgIcon-root": { color: "#fff" } }}
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return <MenuItem key={year} value={year}>{year}</MenuItem>;
              })}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120, bgcolor: "#333", borderRadius: 1 }}>
            <InputLabel sx={{ color: "#fff" }}>Month</InputLabel>
            <Select
              value={selectedMonth}
              onChange={handleMonthChange}
              sx={{ color: "#fff", "& .MuiSvgIcon-root": { color: "#fff" } }}
            >
              {[
                { value: 1, label: "January" },
                { value: 2, label: "February" },
                { value: 3, label: "March" },
                { value: 4, label: "April" },
                { value: 5, label: "May" },
                { value: 6, label: "June" },
                { value: 7, label: "July" },
                { value: 8, label: "August" },
                { value: 9, label: "September" },
                { value: 10, label: "October" },
                { value: 11, label: "November" },
                { value: 12, label: "December" },
              ].map((month) => (
                <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            placeholder="Search by Name..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#fff" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              bgcolor: "#333",
              borderRadius: 1,
              "& .MuiInputBase-input": { color: "#fff", padding: "6px" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#555" },
                "&:hover fieldset": { borderColor: "#777" },
                "&.Mui-focused fieldset": { borderColor: greenAccent },
              },
              width: 200,
            }}
          />
          <Button
            onClick={fetchSalaries}
            variant="outlined"
            sx={{ color: greenAccent, bgcolor: "#212121", minWidth: 40, padding: "6px" }}
          >
            <RotateRight />
          </Button>
        </Box>
      </ListItemButton>

      <Box sx={{ bgcolor: "#0d0d0d", borderRadius: 2, boxShadow: 3 }}>
        {/* Header Row */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            p: 2,
            bgcolor: "#1f1f1f",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            borderBottom: "1px solid #333",
            position: "sticky",
            top: 0,
            zIndex: 5,
          }}
        >
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>
            Employee Name
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>
            Total Hours
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>
            Payment Status
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>
            Late Deduction
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>
            Overtime Bonus
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>
            Sell Bonus
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>
            Net Salary
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>
            Salary Paid
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>
            Remaining Salary
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>
            Updated At
          </Typography>
        </Box>

        {/* Data Rows */}
        <Box
          sx={{
            maxHeight: "700px",
            overflowY: "auto",
            bgcolor: "#121212",
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          {filteredSalaries.length === 0 ? (
            <Typography sx={{ textAlign: "center", p: 4, color: "#fff" }}>
              No salary records found for {selectedMonth}/{selectedYear}.
            </Typography>
          ) : (
            <List disablePadding>
              {filteredSalaries.map((item) => (
                <ListItem
                  key={item.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    mb: 1,
                    borderRadius: 2,
                    bgcolor: "#1a1a1a",
                    transition: "0.3s",
                    "&:hover": {
                      bgcolor: "#2a2a2a",
                      transform: "scale(1.01)",
                      boxShadow: "0 0 10px rgba(100, 255, 218, 0.2)",
                    },
                  }}
                >
                  <Typography variant="body2" sx={{ flex: 1, color: "#90caf9", textAlign: "center", fontWeight: 500 }}>
                    {item.username}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#4caf50", textAlign: "center" }}>
                    {item.totalHoursWorked}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#f44336", textAlign: "center" }}>
                    {item.paymentStatus}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#ccc", textAlign: "center" }}>
                    ₹{item.totalLateDeduction}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#90caf9", textAlign: "center" }}>
                    ₹{item.totalOvertimeBonus}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#90caf9", textAlign: "center" }}>
                    ₹{item.totalSellBonus}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#4caf50", textAlign: "center" }}>
                    ₹{item.netSalary}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#4caf50", textAlign: "center" }}>
                    ₹{item.salaryPaid}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#4caf50", textAlign: "center" }}>
                    ₹{item.remainingSalaryOfMonth}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#ccc", textAlign: "center" }}>
                    {item.updatedAt}
                  </Typography>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ViewFacultiesCurrentMonthSalary;