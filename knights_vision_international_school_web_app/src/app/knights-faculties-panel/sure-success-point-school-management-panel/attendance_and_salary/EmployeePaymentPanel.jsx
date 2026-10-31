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
import {
  Inventory,
  RotateRight,
  Search,
  ChevronLeft,
  ChevronRight,
  MonetizationOn,
  Receipt,
  Event,
} from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from 'next/navigation';
import MonthlySalaryDialog from './MonthlySalaryDialog';
import PaymentTransactionsDialog from './PaymentTransactionsDialog';
import AttendanceDialog from './AttendanceDialog';

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 20;
const greenAccent = '#00c853';

const FacultyPaymentPanel = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openMonthlySalary, setOpenMonthlySalary] = useState(false);
  const [openPaymentTransactions, setOpenPaymentTransactions] = useState(false);
  const [openAttendance, setOpenAttendance] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    console.log('[FacultyPaymentPanel] Current page from URL:', currentPage);
    setPage(currentPage);
  }, [currentPage]);

  const fetchEmployees = async (pageNum = 1) => {
    try {
      const token = Cookies.get("faculties_token");
      if (!token) throw new Error("Authentication token is missing!");
      const response = await axios.get(`/api-schools-panel/users/employee_m_salary_panel`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: pageNum, pageSize },
      });

      const data = Array.isArray(response.data) ? response.data : response.data.users || [];
      console.log("Response Data is", data);

      setEmployees(data);
      setFilteredEmployees(data);
      setTotalPages(response.data.totalPages || Math.ceil(data.length / pageSize));
    } catch (error) {
      console.error("Error fetching employees:", error);
      setError(error.response?.data?.error || "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(page);
  }, [page]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = employees.filter((employee) =>
      (employee?.username?.toLowerCase() || "").includes(query)
    );
    setFilteredEmployees(filtered);
  };

  const handleOpenMonthlySalary = (employee) => {
    setSelectedEmployee(employee);
    setOpenMonthlySalary(true);
  };

  const handleOpenPaymentTransactions = (employee) => {
    setSelectedEmployee(employee);
    setOpenPaymentTransactions(true);
  };

  const handleOpenAttendance = (employee) => {
    setSelectedEmployee(employee);
    setOpenAttendance(true);
  };

  const handleCloseDialog = () => {
    setOpenMonthlySalary(false);
    setOpenPaymentTransactions(false);
    setOpenAttendance(false);
    setSelectedEmployee(null);
  };

  const handlePageChange = (event, value) => {
    console.log('[FacultyPaymentPanel] Page changed to:', value);
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
        <ListItemText primary="Faculty Payment Management Panel" />
        <TextField
          placeholder="Search by username"
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
          <Typography variant="body2" sx={{ flex: 1.5, fontWeight: "bold", color: "#fff" }}>Name & Job Role</Typography>
          <Typography variant="body2" sx={{ flex: 1.2, fontWeight: "bold", color: "#fff" }}>Department</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Entry Time</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Exit Time</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Salary/Day</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Salary/M</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Bonus Salary</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Overtime Salary</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Salary System</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Total Salary</Typography>
          <Typography variant="body2" sx={{ flex: 1.5, fontWeight: "bold", color: "#fff" }}>Actions</Typography>
        </Box>

        <Box
          sx={{
            maxHeight: `calc(100vh - ${appBarHeight + 150}px)`,
            overflowY: "auto",
            bgcolor: "#121212",
            borderRadius: 1,
            paddingBottom: 10,
          }}
        >
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
                    {employee?.username ?? "Unknown"}
                    <br />
                    {employee?.role ?? "N/A"}
                    <br />
                    {employee?.factory?.factory_name ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1.2, color: "#fff" }}>
                    {employee?.department ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {employee?.regular_entry_time ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {employee?.regular_leave_time ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    ₹{employee?.per_day_salary ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    ₹{employee?.base_salary ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    ₹{employee?.per_day_bonus_salary ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    ₹{employee?.extra_per_half_hour_salary ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {employee?.salary_system ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    ₹{employee?.total_salary ?? "N/A"}
                  </Typography>
                  <Box sx={{ flex: 1.5, display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleOpenMonthlySalary(employee)}
                      startIcon={<MonetizationOn />}
                    >
                      Salaries
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleOpenPaymentTransactions(employee)}
                      startIcon={<Receipt />}
                    >
                      Payments
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleOpenAttendance(employee)}
                      startIcon={<Event />}
                    >
                      Attendance
                    </Button>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
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

      {selectedEmployee && (
        <>
          <MonthlySalaryDialog
            open={openMonthlySalary}
            employee={selectedEmployee}
            handleClose={handleCloseDialog}
            fetchEmployees={() => fetchEmployees(page)}
          />
          <PaymentTransactionsDialog
            open={openPaymentTransactions}
            employee={selectedEmployee}
            handleClose={handleCloseDialog}
          />
          <AttendanceDialog
            open={openAttendance}
            employee={selectedEmployee}
            handleClose={handleCloseDialog}
          />
        </>
      )}
    </Box>
  );
};

export default FacultyPaymentPanel;