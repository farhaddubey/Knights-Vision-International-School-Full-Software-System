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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  ListItemButton,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import { Inventory, Edit, Close, AddBusiness, Settings, RotateRight, Search as SearchIcon } from "@mui/icons-material";

const appBarHeight = 64;

const SalaryRecords = () => {
  const [salaries, setSalaries] = useState([]);
  const [filteredSalaries, setFilteredSalaries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editFields, setEditFields] = useState({});

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
      // Decode userId from token
      const decoded = jwtDecode(token);
      const userId = decoded.id;
      if (!userId) {
        setError("Invalid token: user ID not found.");
        setLoading(false);
        return;
      }

      const response = await withRetry(() =>
        axios.get(
          `/api-schools-panel/employee_salaries/salary_by_id_year?userId=${userId}&year=${selectedYear}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      );

      // Format salary data as specified
      const formattedSalaries = response.data.map((item, index) => ({
        id: item.id ?? index,
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
        createdAt: item.created_at ? new Date(item.created_at).toLocaleString() : "Not recorded",
        updatedAt: item.updated_at ? new Date(item.updated_at).toLocaleString() : "Not updated",
        userId: item.user_id ?? null,
      }));

      setSalaries(formattedSalaries);
      setFilteredSalaries(formattedSalaries);
      console.log("Updated State:", formattedSalaries);
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

  // Handle year selection change
  const handleYearChange = (event) => {
    const newYear = parseInt(event.target.value);
    if (!isNaN(newYear) && newYear > 0) {
      setSelectedYear(newYear);
      setLoading(true);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, [selectedYear]);

  const handleOpenModal = (item = {}) => {
    console.log("Opening Modal with Item:", item);
    setEditFields(item);
    setOpen(true);
  };

  const handleCloseModal = () => {
    const userConfirmed = window.confirm("Are you sure you want to close the modal, unsaved?");
    if (userConfirmed) {
      setOpen(false);
      setEditFields({});
    }
  };

  const handleSaveAndCloseModal = () => {
    setOpen(false);
    setEditFields({});
  };

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
          <ListItemText sx={{ color: "#fff" }} primary="Salary Records" />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FormControl sx={{ minWidth: 150, bgcolor: "#333", borderRadius: 1 }}>
            <InputLabel sx={{ color: "#fff" }}>Select Year</InputLabel>
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
          <Button variant="contained" color="primary">
            <Settings /> View Salary Records
          </Button>
          <TextField
            size="small"
            placeholder="Search..."
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
                "&.Mui-focused fieldset": { borderColor: "#00c853" },
              },
              width: 200,
            }}
          />
          <Button
            onClick={fetchSalaries}
            variant="outlined"
            sx={{ color: "#00c853", bgcolor: "#212121", minWidth: 40, padding: "6px" }}
          >
            <RotateRight />
          </Button>
        </Box>
      </ListItemButton>

      <Box sx={{ bgcolor: "#0d0d0d", borderRadius: 2, boxShadow: 3 }}>
        {/* 🔰 Header Row */}
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
            Month
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
            Net Salary
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>
            Salary Paid
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>
            Remaining Salary
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>
            Date
          </Typography>
        </Box>

        {/* 📜 Data Rows */}
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
              No salary records found for {selectedYear}.
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
                    {item.monthYear}
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
  {/* Created - {new Date(item.createdAt).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })}<br /> */}
  Updated - {new Date(item.updatedAt).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })}
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

export default SalaryRecords;