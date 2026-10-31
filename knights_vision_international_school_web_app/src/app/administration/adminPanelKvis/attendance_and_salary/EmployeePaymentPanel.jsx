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
} from "@mui/material";
import {
  Inventory,
  Edit,
  Close,
  EmojiPeople,
  Payment,
  DoubleArrow,
  KeyboardDoubleArrowDown,
  RotateRight,
  Settings,
} from "@mui/icons-material";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import ViewEmployeeSalaryDialog from './ViewEmployeeSalaryDialog';

const drawerWidth = 280;
const appBarHeight = 64;

const EmployeePaymentPanel = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [factoryDetails, setFactoryDetails] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // 🔹 New state for search query

  const fetchEmployees = async () => {
    try {
      const token = Cookies.get("administration_token");
      if (!token) throw new Error("Authentication token is missing!");

      const decoded = jwtDecode(token);
      const factoryId = decoded.factory_id;

      const response = await axios.get(`/api/hod_manager/employee_m_salary_panel?factory_id=${factoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEmployees(response.data);
      console.log("Response Data is", response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setError(error.response?.data?.error || "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenModal = (employee) => {
    console.log("Handle Open Modal Clicked");
    setEditFields(employee);
    setOpen(true);
    console.log("Open -> True");
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

  // 🔹 Filter employees based on search query
  const filteredEmployees = employees.filter((employee) =>
    employee?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        }}
      >
        <ListItemIcon>
          <Settings />
        </ListItemIcon>
        <TextField
          placeholder="Search by username"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          size="small"
          sx={{
            flex: 1,
            mr: 1,
            bgcolor: "#333",
            borderRadius: 1,
            input: { color: "#fff" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#555" },
              "&:hover fieldset": { borderColor: "#777" },
              "&.Mui-focused fieldset": { borderColor: "#00c853" },
            },
            "& .MuiInputBase-input::placeholder": {
              color: "#aaa",
              opacity: 1,
            },
          }}
        />
        <ListItemText sx={{ color: "#fff" }} primary="Global Employee Payment Management Panel" />
        <Button variant="contained" color="primary">
          <DoubleArrow /> EMPLOYEE PAYMENT PANEL
        </Button>
        <Button
          onClick={fetchEmployees}
          variant="outlined"
          sx={{ ml: 2, color: "#00c853", bgcolor: "#212121" }}
        >
          <RotateRight />
        </Button>
      </ListItemButton>

      <Box sx={{ bgcolor: "#181818", borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            p: 1,
            bgcolor: "#333",
            borderRadius: 1,
            position: "sticky",
          }}
        >
          <Typography variant="body2" sx={{ flex: 1.5, fontWeight: "bold", color: "#fff" }}>
            Name & Job Role
          </Typography>
          <Typography variant="body2" sx={{ flex: 1.2, fontWeight: "bold", color: "#fff" }}>
            Department
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Entry Time
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Exit Time
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Salary/Day
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Salary/M
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Bonus Salary
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Overtime Salary
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Salary System
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Total Salary
          </Typography>
          <Box sx={{ flex: 1 }}></Box>
        </Box>

        <Box sx={{ maxHeight: "700px", overflowY: "auto", bgcolor: "#121212", borderRadius: 1, paddingBottom: 10 }}>
          <List>
            {filteredEmployees.map((employee) => (
              <ListItem
                key={employee.id}
                sx={{ display: "flex", justifyContent: "space-between", p: 1, bgcolor: "#181818", mb: 1, borderRadius: 1, borderBottom: "2px solid #333" }}
              >
                <Typography variant="body2" sx={{ flex: 1.5, color: "#fff" }}>
                  {employee?.username}
                  <br />
                  {employee?.role}
                  <br />
                  {employee?.factory?.factory_name}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1.2, color: "#fff" }}>{employee?.department}</Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {employee?.regular_entry_time
                    ? new Date(employee.regular_entry_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--"}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {employee?.regular_leave_time
                    ? new Date(employee.regular_leave_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--"}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>{employee?.per_day_salary}</Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>{employee?.base_salary}</Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>{employee?.per_day_bonus_salary}</Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>{employee?.extra_per_half_hour_salary}</Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>{employee?.salary_system}</Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>{employee?.total_salary}</Typography>
                <Button variant="outlined" color="primary" onClick={() => handleOpenModal(employee)}>
                  Explore
                </Button>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      <ViewEmployeeSalaryDialog
        open={open}
        editFields={editFields}
        setEditFields={setEditFields}
        handleCloseModal={handleCloseModal}
      />
    </Box>
  );
};

export default EmployeePaymentPanel;