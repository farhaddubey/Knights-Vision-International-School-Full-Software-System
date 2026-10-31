import React, { useState, useEffect } from "react"; // Fixed quotes from double to single
import axios from "axios";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
} from "@mui/material";
import { toast } from "react-toastify";

const greenAccent = '#00c853';
const darkBackground = '#121212';
const darkSurface = '#1e1e1e';
const textPrimary = '#ffffff';
const textSecondary = '#b0b0b0';

const drawerWidth = 280;
const appBarHeight = 64;

const AttendanceDialog = ({ open, employee, handleClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("faculties_token");
      if (!token) throw new Error("Authentication token is missing!");
      const response = await axios.get(`/api-schools-panel/employee-attendance-logs/get-attendance-by-user-month`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId: employee.id, year: selectedYear, month: selectedMonth },
      });

      const formattedLogs = response.data.logs.map((log) => ({
        id: log.id,
        date: log.date ? new Date(log.date).toISOString().split('T')[0] : "N/A",
        entryTime: log.entry_time ?? "N/A",
        leaveTime: log.leave_time ?? "N/A",
        totalHours: parseFloat(log.total_hours ?? 0),
        lateMinutes: parseFloat(log.late_minutes ?? 0),
        penalty: parseFloat(log.penalty ?? 0),
        overtimeMinutes: parseFloat(log.overtime_minutes ?? 0),
        overtimeSalary: parseFloat(log.overtime_salary ?? 0),
        bonusSalaryPerDay: parseFloat(log.bonus_salary_per_day ?? 0),
        baseSalaryPerDay: parseFloat(log.base_salary_per_day ?? 0),
        netSalaryOfTheDay: parseFloat(log.net_salary_of_the_day ?? 0),
      }));

      setLogs(formattedLogs);
    } catch (error) {
      console.error("Error fetching attendance logs:", error);
      setError(error.response?.data?.error || "Failed to fetch attendance logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && employee) {
      fetchLogs();
    }
  }, [open, employee, selectedYear, selectedMonth]);

  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value));
    setLoading(true);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(parseInt(event.target.value));
    setLoading(true);
  };

  return (
    <Dialog
      sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        transform: "translate(0, 0)",
        '& .MuiDialog-paper': {
          backgroundColor: darkBackground,
          color: textPrimary,
        },
      }}
      open={open}
      onClose={handleClose}
      fullScreen
    >
      <DialogTitle sx={{ backgroundColor: darkSurface, color: textPrimary }}>
        Attendance Logs for {employee?.username ?? "Unknown"}
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: darkBackground }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: textSecondary }}>Year</InputLabel>
            <Select
              value={selectedYear}
              onChange={handleYearChange}
              sx={{
                bgcolor: darkSurface,
                color: textPrimary,
                '& .MuiSvgIcon-root': { color: textPrimary },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: textSecondary },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: greenAccent },
              }}
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return <MenuItem key={year} value={year}>{year}</MenuItem>;
              })}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: textSecondary }}>Month</InputLabel>
            <Select
              value={selectedMonth}
              onChange={handleMonthChange}
              sx={{
                bgcolor: darkSurface,
                color: textPrimary,
                '& .MuiSvgIcon-root': { color: textPrimary },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: textSecondary },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: greenAccent },
              }}
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
        </Box>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress sx={{ color: greenAccent }} />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ textAlign: "center", color: '#ff1744' }}> {/* Fixed duplicate color definition */}
            {error}
          </Typography>
        ) : (
          <Box>
            <Box sx={{ display: "flex", bgcolor: darkSurface, p: 1, mb: 1 }}>
              <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: textPrimary }}>Date</Typography>
              <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: textPrimary }}>Entry Time</Typography>
              <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: textPrimary }}>Leave Time</Typography>
              <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: textPrimary }}>Total Hours</Typography>
              <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: textPrimary }}>Late Minutes</Typography>
              <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: textPrimary }}>Penalty</Typography>
              <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: textPrimary }}>Overtime Salary</Typography>
              <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: textPrimary }}>Net Salary</Typography>
            </Box>
            <List>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <ListItem key={log.id} sx={{ display: "flex", bgcolor: darkSurface, mb: 1 }}>
                    <Typography variant="body2" sx={{ flex: 1, color: textPrimary }}>
                      {log.date}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: textPrimary }}>
                      {log.entryTime}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: textPrimary }}>
                      {log.leaveTime}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: textPrimary }}>
                      {log.totalHours}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: textPrimary }}>
                      {log.lateMinutes}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: textPrimary }}>
                      ₹{log.penalty}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: textPrimary }}>
                      ₹{log.overtimeSalary}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: textPrimary }}>
                      ₹{log.netSalaryOfTheDay}
                    </Typography>
                  </ListItem>
                ))
              ) : (
                <Typography sx={{ textAlign: "center", p: 2, color: textPrimary }}>
                  No attendance logs found for {selectedMonth}/{selectedYear}.
                </Typography>
              )}
            </List>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ backgroundColor: darkSurface }}>
        <Button onClick={handleClose} sx={{ color: greenAccent }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AttendanceDialog;