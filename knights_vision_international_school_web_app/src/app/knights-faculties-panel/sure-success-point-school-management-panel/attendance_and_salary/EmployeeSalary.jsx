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
  Dialog,
  DialogContent,
  Pagination,
  PaginationItem,
} from "@mui/material";
import { Inventory, Close, Search, ChevronLeft, ChevronRight, RotateRight, MonetizationOn, Schedule } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter, useSearchParams } from 'next/navigation';
import PaymentProceedDialog from './PaymentProceedDialog';

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 20;
const greenAccent = '#00c853';
const redAccent = '#f44336';

const SalaryHistoryDialog = ({ open, onClose, employee, salaryRecords, salaryPage, totalSalaryPages, handleSalaryPageChange, handleOpenPaymentDialog }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        transform: "translate(0, 0)",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", backgroundColor: "#000", color: "#fff",  }}>
        <ListItemButton
          sx={{
            backgroundColor: "#004d40",
            color: "#fff",
            "&:hover": { backgroundColor: "#004d40" },
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <ListItemIcon sx={{ color: "#fff" }}>
            <MonetizationOn />
          </ListItemIcon>
          <ListItemText primary={`Salary Records for ${employee?.username || "Employee"}`} />
        </ListItemButton>
        <Button
          aria-label="close"
          onClick={onClose}
          variant="contained"
          color="error"
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close />
        </Button>
<Box sx={{ height:"90vh"}}>
        <Box sx={{ bgcolor: "#181818", borderRadius: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", p: 1, bgcolor: "#333", borderRadius: 1, position: "sticky", top: 0, zIndex: 10 ,}}>
            <Typography variant="body2" sx={{ flex: 1.2, fontWeight: "bold", color: "#fff" }}>Month-Year</Typography>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Total Hours</Typography>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Payment Status</Typography>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Allowances</Typography>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Late Deduction</Typography>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Overtime Bonus</Typography>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Sell Bonus</Typography>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Net Salary</Typography>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Salary Paid</Typography>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Remaining Salary</Typography>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Action</Typography>
          </Box>
          <Box sx={{ maxHeight: `calc(80vh - ${appBarHeight + 100}px)`, overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
            {salaryRecords.length > 0 ? (
              salaryRecords.map((salary) => (
                <Box
                  key={salary.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    p: 1,
                    bgcolor: "#181818",
                    mb: 1,
                    borderRadius: 1,
                    borderBottom: "2px solid #333",
                  }}
                >
                  <Typography variant="body2" sx={{ flex: 1.2, color: "#fff" }}>
                    {salary?.month_year ? new Date(salary.month_year).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {salary?.total_hours_worked ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {salary?.payment_status ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {salary?.allowances ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {salary?.total_late_deduction ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {salary?.total_overtime_bonus ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {salary?.total_sell_bonus ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {salary?.net_salary ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {salary?.salary_paid ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {salary?.remaining_salary_of_month ?? "N/A"}
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <Button
                      variant="outlined"
                      color="success"
                      size="small"
                      onClick={() => handleOpenPaymentDialog(salary)}
                      disabled={salary?.payment_status === "Paid"}
                    >
                      Pay
                    </Button>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography variant="body2" sx={{ textAlign: "center", color: "#fff", p: 2 }}>
                No salary records found
              </Typography>
            )}
          </Box>
          <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalSalaryPages}
              page={salaryPage}
              onChange={handleSalaryPageChange}
              color="primary"
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
      </Box>
    </Dialog>
  );
};

const AttendanceLogsDialog = ({ open, onClose, employee, attendanceLogs, selectedDate, handleDateChange }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        transform: "translate(0, 0)",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", backgroundColor: "#000", color: "#fff" }}>
        <ListItemButton
          sx={{
            backgroundColor: "#004d40",
            color: "#fff",
            "&:hover": { backgroundColor: "#004d40" },
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <ListItemIcon sx={{ color: "#fff" }}>
            <Schedule />
          </ListItemIcon>
          <ListItemText primary={`Attendance Logs for ${employee?.username || "Employee"}`} />
          <TextField
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            size="small"
            sx={{
              width: '200px',
              backgroundColor: '#333',
              borderRadius: '4px',
              '& .MuiInputBase-input': { color: '#fff' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: greenAccent },
            }}
          />
        </ListItemButton>
        <Button
          aria-label="close"
          onClick={onClose}
          variant="contained"
          color="error"
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close />
        </Button>
        <Box sx={{height:'90vh'}}>
        <Box sx={{ bgcolor: "#181818", borderRadius: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", p: 1, bgcolor: "#333", borderRadius: 1, position: "sticky", top: 0, zIndex: 10 }}>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Date</Typography>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Entry Time</Typography>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Exit Time</Typography>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Total Hours</Typography>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Late Minutes</Typography>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Penalty</Typography>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Overtime Minutes</Typography>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Overtime Salary</Typography>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Bonus Salary</Typography>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Base Salary</Typography>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Net Salary</Typography>
          </Box>
          <Box sx={{ maxHeight: `calc(80vh - ${appBarHeight + 100}px)`, overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
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
                    borderBottom: "2px solid #333",
                  }}
                >
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {log?.date ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: log?.late_minutes > 0 ? redAccent : greenAccent }}>
                    {log?.entry_time ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: log?.leave_time ? greenAccent : redAccent }}>
                    {log?.leave_time ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {log?.total_hours ?? "N/A"}
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
                    {log?.base_salary_per_day ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {log?.net_salary_of_the_day ?? "N/A"}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" sx={{ textAlign: "center", color: "#fff", p: 2 }}>
                No attendance logs found for {selectedDate}
              </Typography>
            )}
          </Box>
        </Box>
        </Box>
      </Box>
    </Dialog>
  );
};

const FactoryEmployeeSalary = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSalaryDialog, setOpenSalaryDialog] = useState(false);
  const [openAttendanceDialog, setOpenAttendanceDialog] = useState(false);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [page, setPage] = useState(1);
  const [salaryPage, setSalaryPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSalaryPages, setTotalSalaryPages] = useState(1);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    console.log('[FactoryEmployeeSalary] Current page from URL:', currentPage);
    setPage(currentPage);
  }, [currentPage]);

  const fetchEmployees = async (pageNum = 1) => {
    try {
      const token = Cookies.get("faculties_token");
      console.log('[fetchEmployees] Token present:', !!token);
      if (!token) {
        throw new Error("Authentication token is missing!");
      }

      const response = await axios.get("/api-schools-panel/users/employee_m_salary_panel", {
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

  const fetchSalaryRecords = async (employeeId, pageNum = 1) => {
    const token = Cookies.get("faculties_token");
    if (!token) {
      toast.error("Authentication token is missing!");
      return;
    }

    try {
      const response = await axios.get(`/api-schools-panel/employee-salaries`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { user: employeeId, page: pageNum, pageSize },
      });

      console.log('[fetchSalaryRecords] Salary Data:', response.data);

      setSalaryRecords(response.data || []);
      setTotalSalaryPages(Math.ceil(response.data.length / pageSize) || 1);
    } catch (error) {
      console.error("Error fetching salary data:", error);
      toast.error("Failed to fetch salary details.");
    }
  };

  const fetchAttendanceLogs = async (employeeId, date) => {
    const token = Cookies.get("faculties_token");
    if (!token) {
      toast.error("Authentication token is missing!");
      return;
    }

    try {
      const response = await axios.get(`/api-schools-panel/employee-attendance-logs`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { user: employeeId, date },
      });

      console.log('[fetchAttendanceLogs] Attendance Data:', response.data);

      setAttendanceLogs(response.data || []);
    } catch (error) {
      console.error("Error fetching attendance logs:", error);
      toast.error(`Failed to fetch attendance logs: ${error.response?.data?.error || error.message}`);
    }
  };

  useEffect(() => {
    console.log('[FactoryEmployeeSalary] Fetching employees for page:', page);
    fetchEmployees(page);
  }, [page]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = employees.filter((employee) =>
      employee.username?.toLowerCase().includes(query) ||
      employee.department?.toLowerCase().includes(query) ||
      employee.role?.toLowerCase().includes(query) ||
      employee.factory?.factory_name?.toLowerCase().includes(query)
    );
    setFilteredEmployees(filtered);
  };

  const handleOpenSalaryDialog = async (employee) => {
    setSelectedEmployee(employee);
    await fetchSalaryRecords(employee.id, 1);
    setOpenSalaryDialog(true);
  };

  const handleOpenAttendanceDialog = async (employee) => {
    setSelectedEmployee(employee);
    await fetchAttendanceLogs(employee.id, selectedDate);
    setOpenAttendanceDialog(true);
  };

  const handleCloseSalaryDialog = () => {
    const userConfirmed = window.confirm("Are you sure you want to close the salary dialog?");
    if (userConfirmed) {
      setOpenSalaryDialog(false);
      setSalaryRecords([]);
      setSelectedEmployee(null);
      setSalaryPage(1);
    }
  };

  const handleCloseAttendanceDialog = () => {
    const userConfirmed = window.confirm("Are you sure you want to close the attendance dialog?");
    if (userConfirmed) {
      setOpenAttendanceDialog(false);
      setAttendanceLogs([]);
      setSelectedEmployee(null);
    }
  };

  const handlePageChange = (event, value) => {
    console.log('[FactoryEmployeeSalary] Page changed to:', value);
    setPage(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', value.toString());
    router.push(`?${newSearchParams.toString()}`);
  };

  const handleSalaryPageChange = (event, value) => {
    console.log('[FactoryEmployeeSalary] Salary page changed to:', value);
    setSalaryPage(value);
    if (selectedEmployee) {
      fetchSalaryRecords(selectedEmployee.id, value);
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    if (selectedEmployee) {
      fetchAttendanceLogs(selectedEmployee.id, newDate);
    }
  };

  const handleOpenPaymentDialog = (salary) => {
    setSelectedSalary({
      id: salary.id,
      user_id: salary.user_id,
      monthYear: salary.month_year ? new Date(salary.month_year).toISOString().slice(0, 7) : "N/A",
      totalHoursWorked: salary.total_hours_worked,
      paymentStatus: salary.payment_status,
      allowances: salary.allowances,
      totalLateDeduction: salary.total_late_deduction,
      totalOvertimeBonus: salary.total_overtime_bonus,
      totalSellBonus: salary.total_sell_bonus,
      netSalary: salary.net_salary,
      salaryPaid: salary.salary_paid,
      remainingSalaryOfMonth: salary.remaining_salary_of_month,
    });
    setOpenPaymentDialog(true);
  };

  const handleClosePaymentDialog = () => {
    setOpenPaymentDialog(false);
    setSelectedSalary(null);
    if (selectedEmployee) {
      fetchSalaryRecords(selectedEmployee.id, salaryPage);
    }
  };

  const getTimeColor = (time, isEntry) => {
    if (!time) return redAccent;
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    if (isEntry) {
      // Assume entry time should be before 9:00 AM (540 minutes)
      return totalMinutes <= 540 ? greenAccent : redAccent;
    } else {
      // Assume exit time should be after 5:00 PM (1020 minutes)
      return totalMinutes >= 1020 ? greenAccent : redAccent;
    }
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
        <ListItemText primary="Employee Salary Management Panel" />
        <TextField
          placeholder="Search by Name, Role, Department, or Factory"
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
          <Typography variant="body2" sx={{ flex: 1.5, fontWeight: "bold", color: "#fff" }}>Name & Role</Typography>
          <Typography variant="body2" sx={{ flex: 1.2, fontWeight: "bold", color: "#fff" }}>Department</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Entry Time</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Exit Time</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Salary/Day</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Salary/Month</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Bonus Salary</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Overtime Salary</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Salary System</Typography>
          <Typography variant="body2" sx={{ flex: 1.5, fontWeight: "bold", color: "#fff" }}>Action</Typography>
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
                    borderBottom: "2px solid #333",
                  }}
                >
                  <Typography variant="body2" sx={{ flex: 1.5, color: "#fff" }}>
                    {employee?.username ?? "Unknown"}<br />{employee?.role ?? "N/A"}<br />{employee?.factory?.factory_name ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1.2, color: "#fff" }}>
                    {employee?.department ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: getTimeColor(employee?.regular_entry_time, true) }}>
                    {employee?.regular_entry_time ? employee.regular_entry_time.slice(0, 5) : "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: getTimeColor(employee?.regular_leave_time, false) }}>
                    {employee?.regular_leave_time ? employee.regular_leave_time.slice(0, 5) : "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {employee?.per_day_salary ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {employee?.base_salary ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {employee?.per_day_bonus_salary ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {employee?.extra_per_half_hour_salary ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {employee?.salary_system ?? "N/A"}
                  </Typography>
                  <Box sx={{ flex: 1.5, display: 'flex', gap: 1 }}>
                    <Button variant="outlined" color="primary" onClick={() => handleOpenSalaryDialog(employee)}>
                      <MonetizationOn /> View Salary
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={() => handleOpenAttendanceDialog(employee)}>
                      <Schedule /> View Attendance
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

      <SalaryHistoryDialog
        open={openSalaryDialog}
        onClose={handleCloseSalaryDialog}
        employee={selectedEmployee}
        salaryRecords={salaryRecords}
        salaryPage={salaryPage}
        totalSalaryPages={totalSalaryPages}
        handleSalaryPageChange={handleSalaryPageChange}
        handleOpenPaymentDialog={handleOpenPaymentDialog}
      />

      <AttendanceLogsDialog
        open={openAttendanceDialog}
        onClose={handleCloseAttendanceDialog}
        employee={selectedEmployee}
        attendanceLogs={attendanceLogs}
        selectedDate={selectedDate}
        handleDateChange={handleDateChange}
      />

      {openPaymentDialog && (
        <PaymentProceedDialog
          openChild={openPaymentDialog}
          editFieldsChild={selectedSalary}
          setEditFieldsChild={setSelectedSalary}
          handleCloseModalChild={handleClosePaymentDialog}
        />
      )}
    </Box>
  );
};

export default FactoryEmployeeSalary;