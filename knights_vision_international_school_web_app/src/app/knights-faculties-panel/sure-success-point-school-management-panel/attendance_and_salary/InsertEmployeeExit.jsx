import { useState, useEffect } from "react";
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
import { Inventory, Edit, RotateRight, Search, ChevronLeft, ChevronRight, ManageAccounts } from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import { useRouter, useSearchParams } from 'next/navigation';
import AttendanceLogExitUpdateDialog from "./AttendanceLogExitUpdateDialog";

const drawerWidth = 280;
const appBarHeight = 64;
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

  useEffect(() => {
    console.log('[EmployeeWiseAttendance] Current page from URL:', currentPage);
    setPage(currentPage);
  }, [currentPage]);

  const fetchEmployees = async (pageNum = 1) => {
    try {
      const token = Cookies.get("faculties_token");
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
      (employee.username?.toLowerCase() || "").includes(query) ||
      (employee.factory_name?.toLowerCase() || "").includes(query) ||
      (employee.department?.toLowerCase() || "").includes(query) ||
      (employee.uid_aadhar?.toString() || "").includes(query) ||
      (employee.biometric_id?.toString() || "").includes(query)
    );
    setFilteredEmployees(filtered);
  };

  const today = new Date();
  const isFriday = today.getDay() === 5; // 5 is Friday
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`; // e.g., 2025-08-05

  const isWithinExitWindow = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTimeInMinutes = hours * 60 + minutes;

    if (isFriday) {
      const startTime = 10 * 60; // 10:00 AM
      const endTime = 12 * 60; // 12:00 PM
      return currentTimeInMinutes >= startTime && currentTimeInMinutes <= endTime;
    } else {
      const startTime = 15 * 60 + 45; // 3:45 PM
      const endTime = 18 * 60; // 6:00 PM
      return currentTimeInMinutes >= startTime && currentTimeInMinutes <= endTime;
    }
  };

  const checkAttendanceExists = async (userId) => {
    const token = Cookies.get("faculties_token");
    try {
      const response = await axios.get(
        `/api-schools-panel/employee-attendance-logs?user=${userId}&date=${formattedDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Attendance API Response:", response.data);
      if (response.data.length === 0) {
        return { exists: false, log: null };
      }
      const log = response.data[0];
      return {
        exists: true,
        log: log.entry_time ? log : null,
        exitUpdated: log.entry_time && log.leave_time
      };
    } catch (error) {
      console.error("Error checking attendance:", error.response?.data || error.message);
      return { exists: false, log: null, exitUpdated: false };
    }
  };

  const calculateLatePenalty = (entryTime) => {
    const timeToMinutes = (time) => {
      if (!time) return 0;
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const entryMinutes = timeToMinutes(entryTime);

    if (isFriday) {
      const reportingTime = 6 * 60 + 45; // 06:45 AM
      const graceTime = 7 * 60 + 15; // 07:15 AM
      const lateMinutes = entryMinutes > reportingTime ? entryMinutes - reportingTime : 0;

      if (entryMinutes <= reportingTime) {
        return { lateMinutes: 0, penalty: 0 };
      }

      if (entryMinutes > graceTime) {
        return { lateMinutes, penalty: 50 };
      }

      const lateIntervals = Math.ceil(lateMinutes / 5);
      const penalties = [10, 20, 30, 40, 50];
      const penalty = penalties[Math.min(lateIntervals - 1, penalties.length - 1)];

      return { lateMinutes, penalty };
    } else {
      const reportingTime = 9 * 60 + 15; // 9:15 AM
      const lateMinutes = entryMinutes > reportingTime ? entryMinutes - reportingTime : 0;

      if (lateMinutes <= 0) return { lateMinutes: 0, penalty: 0 };

      const lateIntervals = Math.floor(lateMinutes / 5);
      let penalty = 0;
      if (lateIntervals <= 1) penalty = lateIntervals * 10;
      else if (lateIntervals <= 2) penalty = 10 + (lateIntervals - 1) * 20;
      else penalty = 10 + 20 + (lateIntervals - 2) * 30;

      return { lateMinutes, penalty: Math.min(penalty, 50) };
    }
  };

  const fetchAndSetAttendanceDetails = async (employee) => {
    const now = new Date();
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

    // // Check exit window
    // if (!isWithinExitWindow()) {
    //   const message = isFriday
    //     ? "Exit panel can only be opened between 10:00 AM and 12:00 PM on Fridays."
    //     : "Exit panel can only be opened between 3:45 PM and 6:00 PM.";
    //   toast.error(message);
    //   return;
    // }

    // Check authentication
    const token = Cookies.get("faculties_token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }

    // Check if attendance log exists and needs exit update
    const { exists, log, exitUpdated } = await checkAttendanceExists(employee.id);
    if (!exists) {
      toast.error("No attendance log found for today.");
      return;
    }
    if (exitUpdated) {
      toast.info("Exit time already updated for today.");
      toast.error("Exit time already updated for today.");
      return;
    }
    if (!log) {
      toast.error("No valid entry time found for today.");
      return;
    }

    try {
      const currentExitTime = now.toTimeString().split(" ")[0].slice(0, 5);

      const timeToDecimal = (time) => {
        if (!time) return 0;
        const [hours, minutes] = time.split(":").map(Number);
        return Number(hours) + Number(minutes) / 60;
      };

      const systemEntryTime = employee.regular_entry_time || (isFriday ? "06:45" : "07:00");
      const systemLeaveTime = employee.regular_leave_time || (isFriday ? "10:45" : "17:00");
      const entryTimeDecimal = timeToDecimal(log.entry_time);
      const exitTimeDecimal = timeToDecimal(currentExitTime);
      const totalHours = Math.max(exitTimeDecimal - entryTimeDecimal, 0);
      const { lateMinutes, penalty } = calculateLatePenalty(log.entry_time);
      const overtimeMinutes = exitTimeDecimal > timeToDecimal(systemLeaveTime) ? Math.round((exitTimeDecimal - timeToDecimal(systemLeaveTime)) * 60) : 0;
      const overtimeSalary = Math.floor(overtimeMinutes / 30) * (Number(employee.extra_per_half_hour_salary) || 20);

      let baseSalaryPerDay = 0;
      if (employee.salary_system === "Daily" && employee.per_day_salary) {
        baseSalaryPerDay = Number(employee.per_day_salary);
      } else {
        baseSalaryPerDay = Number(employee.base_salary || 0) / 30;
      }
      const bonusSalary = Number(employee.per_day_bonus_salary) || 0;
      const netSalaryOfTheDay = (baseSalaryPerDay + bonusSalary + overtimeSalary - penalty).toFixed(2);

      setEditFields({
        id: log.id,
        date: formattedDate,
        entry_time: log.entry_time,
        exit_time: currentExitTime,
        total_hours: totalHours.toFixed(2),
        late_minutes: lateMinutes,
        penalty: penalty,
        overtime_minutes: overtimeMinutes,
        overtime_salary: overtimeSalary,
        base_salary: baseSalaryPerDay.toFixed(2),
        bonus_salary_per_day: bonusSalary.toFixed(2),
        net_salary_of_the_day: netSalaryOfTheDay,
        user_id: employee.id,
        username: employee.username || "Unknown",
        role: employee.role || "N/A",
        rfid_card_no: employee.rfid_card_no || "N/A",
        regular_entry_time: systemEntryTime,
        regular_leave_time: systemLeaveTime,
      });

      console.log("Updated fields:", editFields);
      setOpenInsertion(true);
    } catch (error) {
      console.error("Error fetching attendance details:", error);
      toast.error("Failed to fetch attendance details.");
    }
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
    fetchEmployees(page); // Refresh employee list
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
        <Button variant="contained" sx={{ bgcolor: "#1b5e20" }}>
          <ManageAccounts /> Employee Exit Management Panel
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
          <Typography variant="body2" sx={{ flex: 1.8, fontWeight: "bold", color: "#fff" }}>Employee Name</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Department</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Entry Time</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Exit Time</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>UID</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>RFID</Typography>
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
                  <Typography variant="body2" sx={{ flex: 1.8, color: "#fff" }}>
                                        {employee?.username ?? "Unknown"}<br />{employee?.role ?? "N/A"}<br/>{employee?.email}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {employee?.department ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {employee?.regular_entry_time ?? (isFriday ? "06:45" : "07:00")}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {employee?.regular_leave_time ?? (isFriday ? "10:45" : "17:00")}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {employee?.uid_aadhar ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {employee?.rfid_card_no ? "XXXXXXXXXX" : "N/A"}
                  </Typography>
                  <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
                    <Button variant="outlined" color="primary" onClick={() => fetchAndSetAttendanceDetails(employee)}>
                      <Edit /> Update Exit
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
      <AttendanceLogExitUpdateDialog
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