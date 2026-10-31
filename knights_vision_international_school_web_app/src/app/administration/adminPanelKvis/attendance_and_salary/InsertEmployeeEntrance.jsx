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
import { Inventory, Edit, Close, EmojiPeople, ManageAccounts, Settings, RotateRight, Search, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { ToastContainer, toast } from 'react-toastify';
import { useRouter, useSearchParams } from 'next/navigation';
import AttendanceLogDialog from "./AttendanceLogEntranceDialog";

const appBarHeight = 64;
const drawerWidth = 280;
const pageSize = 20;
const greenAccent = '#00c853';

const EmployeeWiseAttendance = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openInsertion, setOpenInsertion] = useState(false);
  const [editFields, setEditFields] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Sync page state with URL
  useEffect(() => {
    console.log('[EmployeeWiseAttendance] Current page from URL:', currentPage);
    setPage(currentPage);
  }, [currentPage]);

  const fetchEmployees = async (pageNum = 1) => {
    try {
      const token = Cookies.get("administration_token");
      console.log('[fetchEmployees] Token present:', !!token);
      if (!token) {
        throw new Error("Authentication token is missing!");
      }

      const response = await axios.get("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: pageNum, pageSize },
      });

      console.log('[fetchEmployees] Response:', response.data);

      if (!response.data || !Array.isArray(response.data.users)) {
        throw new Error('Invalid response format: users array missing');
      }

      setEmployees(response.data.users);
      setFilteredEmployees(response.data.users);
      setTotalPages(response.data.totalPages || 1);
      console.log('[fetchEmployees] totalPages set to:', response.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setError(error.response?.data?.error || "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[EmployeeWiseAttendance] Fetching employees for page:', page);
    fetchEmployees(page);
  }, [page]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = employees.filter((employee) =>
      employee.username?.toLowerCase().includes(query) ||
      employee.factory_name?.toLowerCase().includes(query) ||
      employee.department?.toLowerCase().includes(query) ||
      employee.uid_aadhar?.toString().includes(query) ||
      employee.biometric_id?.toString().includes(query)
    );
    setFilteredEmployees(filtered);
  };

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;

  const checkAttendanceExists = async (userId) => {
    const token = Cookies.get("administration_token");
    console.log("Checking attendance for user:", userId.id, "on date:", formattedDate);

    try {
      const response = await axios.get(
        `/api/factory-workers-attendance-logs?user=${userId.id}&date=${formattedDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Attendance API Response:", response.data);
      return response.data.length > 0;
    } catch (error) {
      console.error("Error checking attendance:", error.response?.data || error.message);
      return false;
    }
  };

  const handleInsertionOpenModal = async (factoryReport = {}) => {
    const attendanceExists = await checkAttendanceExists(factoryReport);
    if (attendanceExists) {
      console.error("Attendance already exists for today");
      toast.error("Attendance log already exists for today.");
      return;
    }

    console.log("Opening Modal with Factory Report:", factoryReport);

    const currentDate = new Date();
    const formattedTime = currentDate.toTimeString().split(" ")[0].slice(0, 5);

    const timeToDecimal = (time) => {
      if (!time) return 0;
      const [hours, minutes] = time.split(":").map(Number);
      return Number(hours) + Number(minutes) / 60;
    };

    const systemEntryTime = Number(timeToDecimal(factoryReport?.regular_entry_time || "07:00"));
    const systemLeaveTime = Number(timeToDecimal(factoryReport?.regular_leave_time || "17:00"));
    const entryTime = Number(timeToDecimal(factoryReport?.entry_time || formattedTime));
    const exitTime = Number(timeToDecimal(factoryReport?.exit_time || formattedTime));
    const totalHours = exitTime - entryTime > 0 ? exitTime - entryTime : 0;
    const lateMinutes = entryTime > systemEntryTime ? Math.round((entryTime - systemEntryTime) * 60) : 0;
    const penalty = Math.min(Math.floor(lateMinutes / 5) * 10, 50);
    const overtimeMinutes = exitTime > systemLeaveTime ? Math.round((exitTime - systemLeaveTime) * 60) : 0;
    const extraPerHalfHourSalaryRate = Number(factoryReport?.extra_per_half_hour_salary) || 0;
    const perDayBonusSalary = Number(factoryReport?.per_day_bonus_salary) || 0;
    const baseSalary = Number(factoryReport?.base_salary) || 0;
    const perDaySalary = Number(factoryReport?.per_day_salary) || 0;

    const overtimeSalary = Math.floor(overtimeMinutes / 30) * extraPerHalfHourSalaryRate;
    let baseSalaryPerDay = 0;
    if (factoryReport?.salarySystem === "DayWise") {
      baseSalaryPerDay = perDaySalary;
    } else {
      baseSalaryPerDay = (baseSalary / 30).toFixed(2);
    }

    const netSalaryOfTheDay = (Number(baseSalaryPerDay) + perDayBonusSalary + overtimeSalary - penalty).toFixed(2);

    const updatedFields = {
      date: formattedDate,
      entry_time: factoryReport?.entry_time || formattedTime,
      exit_time: factoryReport?.exit_time || formattedTime,
      total_hours: totalHours.toFixed(2),
      late_minutes: lateMinutes,
      penalty: penalty,
      overtime_minutes: overtimeMinutes,
      overtime_salary: overtimeSalary,
      bonus: perDayBonusSalary,
      base_salary: baseSalaryPerDay,
      log_id: factoryReport?.uid_aadhar || 0,
      user_id: factoryReport?.id || "N/A",
      net_salary_of_the_day: netSalaryOfTheDay,
    };

    setEditFields(updatedFields);
    console.log("Updated fields:", updatedFields);
    setOpenInsertion(true);
  };

  const handleCloseModal = () => {
    const userConfirmed = window.confirm("Are you sure you want to close the modal, unsaved?");
    if (userConfirmed) {
      setOpenInsertion(false);
      setEditFields({});
    }
  };

  const handleSaveAndCloseModal = () => {
    setOpenInsertion(false);
    setEditFields({});
  };

  const handlePageChange = (event, value) => {
    console.log('[EmployeeWiseAttendance] Page changed to:', value);
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
        theme="light"
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
          <Settings />
        </ListItemIcon>
        <ListItemText primary="Global Employee Attendance Management Panel" />
        <TextField
          placeholder="Search by Name, Factory, Department, UID, or Biometric ID"
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
          onClick={() => fetchEmployees(page)}
          variant="outlined"
          sx={{ color: greenAccent, borderColor: greenAccent }}
        >
          <RotateRight />
        </Button>
        <Button variant="contained" color="primary">
          <ManageAccounts /> Employee Entrance Management Panel
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
          <Typography variant="body2" sx={{ flex: 1.2, fontWeight: "bold", color: "#fff" }}>Employee Name</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Factory</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Department</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Entry Time</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Exit Time</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Break Time</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>UID</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Biometric ID</Typography>
          <Box sx={{ flex: 1 }}></Box>
        </Box>

        <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 150}px)`, overflowY: "auto", bgcolor: "#121212", borderRadius: 1, paddingBottom: 10 }}>
          <List>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <ListItem
                  key={employee.id}
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
                  <Typography variant="body2" sx={{ flex: 1.2, color: "#fff" }}>
                    {employee?.username ?? "Unknown"}<br />{employee?.role}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {employee?.factory_name ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {employee?.department ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {employee?.entry_time ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {employee?.exit_time ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {employee?.break_time ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {employee?.uid_aadhar ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {employee?.biometric_id ?? "N/A"}
                  </Typography>
                  <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
                    <Button variant="outlined" color="primary" size="small" onClick={() => handleInsertionOpenModal(employee)}>
                      <EmojiPeople /> Add Entrance
                    </Button>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: '#fff', textAlign: 'center', p: 2 }}>
                No employees found.
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

      <AttendanceLogDialog
        openInsertion={openInsertion}
        handleCloseModal={handleCloseModal}
        handleSaveAndCloseModal={handleSaveAndCloseModal}
        editFields={editFields}
        setEditFields={setEditFields}
      />
    </Box>
  );
};

export default EmployeeWiseAttendance;