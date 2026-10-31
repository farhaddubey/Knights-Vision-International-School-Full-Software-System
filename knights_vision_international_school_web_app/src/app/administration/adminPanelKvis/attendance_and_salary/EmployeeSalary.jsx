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
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  PaginationItem,
} from "@mui/material";
import { Inventory, Edit, Close, EmojiPeople, Search, ChevronLeft, ChevronRight, RotateRight } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from 'next/navigation';

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 20;
const greenAccent = '#00c853';

const FactoryEmployeeSalary = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    console.log('[FactoryEmployeeSalary] Current page from URL:', currentPage);
    setPage(currentPage);
  }, [currentPage]);

  const fetchEmployees = async (pageNum = 1) => {
    try {
      const token = Cookies.get("administration_token");
      console.log('[fetchEmployees] Token present:', !!token);
      if (!token) {
        throw new Error("Authentication token is missing!");
      }

      const response = await axios.get("/api/users/employee_m_salary_panel", {
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

  const handleOpenModal = async (employee) => {
    const token = Cookies.get("administration_token");
    if (!token) {
      toast.error("Authentication token is missing!");
      return;
    }

    try {
      const response = await axios.get(`/api/employee_salaries/${employee.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, pageSize: 20 },
      });

      console.log('[handleOpenModal] Salary Data:', response.data);

      setSalaryRecords(response.data.salaries || []);
      setSelectedEmployee(employee);
      setOpen(true);
    } catch (error) {
      console.error("Error fetching salary data:", error);
      toast.error("Failed to fetch salary details.");
    }
  };

  const handleCloseModal = () => {
    const userConfirmed = window.confirm("Are you sure you want to close the modal, unsaved?");
    if (userConfirmed) {
      setOpen(false);
      setSalaryRecords([]);
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
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Action</Typography>
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
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {employee?.regular_entry_time ? new Date(employee.regular_entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                    {employee?.regular_leave_time ? new Date(employee.regular_leave_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
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
                  <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
                    <Button variant="outlined" color="primary" onClick={() => handleOpenModal(employee)}>
                      <Edit /> Explore
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

      <Dialog
        open={open}
        onClose={handleCloseModal}
        fullScreen
        sx={{
          position: "fixed",
          top: `${appBarHeight}px`,
          left: `calc(${drawerWidth}px)`,
          transform: "translate(0, 0)",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#000", color: "#fff" }}>
          <Box sx={{ minWidth: `calc(100vw - ${drawerWidth}px)`, backgroundColor: "#4caf50", height: `calc(100vh - ${appBarHeight}px)`, color: "#fff" }}>
            <ListItemButton
              sx={{
                backgroundColor: "#004d40",
                color: "#fff",
                "&:hover": { backgroundColor: "#004d40" },
              }}
            >
              <ListItemIcon sx={{ color: "#fff" }}>
                <EmojiPeople />
              </ListItemIcon>
              <ListItemText sx={{ color: "#fff" }} primary={`Salary Records for ${selectedEmployee?.username || "Employee"}`} />
            </ListItemButton>
            <Button
              aria-label="close"
              onClick={handleCloseModal}
              variant="contained"
              color="error"
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <Close />
            </Button>

            <Box sx={{ bgcolor: "#181818", borderRadius: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", p: 1, bgcolor: "#333", borderRadius: 1, position: "sticky", top: 0, zIndex: 10 }}>
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
              </Box>

              <Box sx={{ maxHeight: `calc(100vh - ${appBarHeight + 150}px)`, overflowY: "auto", bgcolor: "#121212", borderRadius: 1, paddingBottom: 10 }}>
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
                        {salary?.month_year ?? "N/A"}
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
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ textAlign: "center", color: "#fff", p: 2 }}>
                    No salary records found
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default FactoryEmployeeSalary;