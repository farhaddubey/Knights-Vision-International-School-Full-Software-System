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
  MenuItem
} from "@mui/material";
import {Inventory, Edit, Close, EmojiPeople, Explore, PresentToAll, PersonSearch, PersonSearchOutlined } from "@mui/icons-material";
import { toast } from "react-toastify";
import CloseIcon from "@mui/icons-material/Close";
const drawerWidth = 280;
const appBarHeight = 64; // Example AppBar height
import { RotateRight } from "@mui/icons-material";


const EmployeeWiseAttendance = () => {
  const currentDate = new Date().toISOString();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [factoryDetails, setFactoryDetails] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [log, setLog]=useState([]);
  const [employees, setEmployees] = useState([]);
  const fetchEmployees = async () => {
    try {
        // 🔹 Retrieve the token from localStorage (or cookies if needed)
        const token = Cookies.get("administration_token");

        if (!token) {
            throw new Error("Authentication token is missing!");
        }

        // 🔹 Send request with Authorization header
        const response = await axios.get("/api/users", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        // 🔹 Update state with fetched employees
        setEmployees(response.data);
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

const handleOpenModal = async (userId) => {
  const token=Cookies.get("administration_token"); 
  if(!token){
    console.log("token not found");
    return;
  }
    try {
        const response = await axios.get(`/api/factory-workers-attendance-logs/get-attendance-all-by-userId?userId=${userId.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log(response);
        const userData = response.data;
        console.log("User Data Fetched:", userData);
        // Set user details
        setEditFields(userData);
        setAttendanceLogs(userData?.attendance_logs || []);
        setOpen(true);
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
};

  const handleCloseModal = () => {
    const userConfirmed=window.confirm("Are you sure you want to close the modal, unsaved?")
    if(userConfirmed){
      setOpen(false);
      setOpenInsertion(false);
      setSelectedMaterial(null);
      setEditFields({});
    }
  };
  const handleSaveAndCloseModal = () => {
      setOpen(false);
      setOpenInsertion(false);
      setSelectedMaterial(null);
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
        <CircularProgress size={120}/>
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
    <Box sx={{position:"fixed",minWidth:`82vw`, backgroundColor: "#212121", height: `100vh-${appBarHeight}`, color: "#fff" }}>
      <ListItemButton 
  sx={{ 
    backgroundColor: "#b71c1c", 
    color: "#fff",
    "&:hover": { backgroundColor: "#b71c1c" } // Prevents color change on hover
  }}
>
  <ListItemIcon>
    <Inventory />
  </ListItemIcon>
  <ListItemText sx={{ color: "#fff" }} primary="Global Employee Attendance Management Panel" />
  <Button variant="contained" color="primary" onClick={() => handleOpenModal({})}>
    <Edit /> Add New Raw Materials
  </Button>
      <Button onClick={fetchEmployees} variant="outlined" color="#00c853" sx={{ position: "absolute", right: 215, top: 8, color: "#00c853",  bgcolor:"#212121" }}>
        <RotateRight/>
    </Button>
  
</ListItemButton>

<Box sx={{ bgcolor: "#181818", borderRadius: 2 }}>  
  {/* Header Row */}
  <Box sx={{ display: "flex", justifyContent: "space-between", p: 1, bgcolor: "#333", borderRadius: 1, position:"sticky" }}>
    <Typography variant="body2" sx={{ flex: 1.2, fontWeight: "bold", color: "#fff" }}>Employee Name</Typography>
    <Typography variant="body2" sx={{ flex: 1.2, fontWeight: "bold", color: "#fff" }}>Job & Factory</Typography>
    <Typography variant="body2" sx={{ flex: 1.2, fontWeight: "bold", color: "#fff" }}>Department</Typography>
    <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>UID</Typography>
    <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Biometric ID</Typography>
    <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Machine Id</Typography>
    <Box sx={{ flex: .7 }}></Box> {/* Empty Box for Button Alignment */}
  </Box>

  {/* Data Rows */}
  <Box sx={{ maxHeight: "700px", overflowY: "auto", bgcolor: "#121212", borderRadius: 1, paddingBottom:10}}>
  <List>
    {employees.map((employee) => (
      <ListItem key={employee.id} sx={{ display: "flex", justifyContent: "space-between", p: 1, bgcolor: "#181818", mb: 1, borderRadius: 1 }}>
        
        <Typography variant="body2" sx={{ flex: 1.2, color: "#fff" }}>{employee?.username ?? "Unknown"}</Typography>
        <Typography variant="body2" sx={{ flex: 1.2, color: "#fff" }}>{employee?.jobRole ?? "N/A"}<br/>{employee?.factory_name ?? "N/A"}</Typography>
        <Typography variant="body2" sx={{ flex: 1.2, color: "#fff" }}>{employee?.department ?? "N/A"}</Typography>
        <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>{employee?.uid_aadhar ?? "N/A"}</Typography>
        <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>{employee?.biometric_id ?? "N/A"}</Typography>
        <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>{employee?.machine_name ?? "N/A"}</Typography>

        {/* Edit Button */}
    <Box sx={{ flex: .7 }}> {/* Empty Box for Button Alignment */}
        <Button variant="outlined" color="primary" onClick={() => handleOpenModal(employee)}>
          <PersonSearchOutlined/> Explore
        </Button>        
        </Box>
      </ListItem>
    ))}
  </List>
</Box>
</Box>


      {/* Edit Modal */}
      {/* Edit Modal */}
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
       <Box sx={{position:"fixed",minWidth:`82vw`, backgroundColor: "#4caf50", height: `100vh-${appBarHeight}`, color: "#fff" }}>
          <ListItemButton 
      sx={{ 
        backgroundColor: "#004d40", 
        color: "#fff",
        "&:hover": { backgroundColor: "#004d40" } // Prevents color change on hover
      }}
    >
      <ListItemIcon sx={{color:"#fff"}}>
        <EmojiPeople/>
      </ListItemIcon>
      <ListItemText sx={{ color: "#fff" }} primary="Detailed Attendance Log of of Employee" />
      <Button sx={{mr:10,}} variant="contained" color="primary" onClick={() => handleOpenModal({})}>
         EMPLOYEE ALL ATTENDANCE & SALARY PANEL
      </Button>
    </ListItemButton>
    <Button
    aria-label="close"
    onClick={handleCloseModal}
    variant="contained"
    color="error"
    sx={{ position: "absolute", right: 8, top: 8 }}
  >
    <CloseIcon />
  </Button>
    <Button onClick={fetchEmployees} variant="outlined" color="#00c853" sx={{ position: "absolute", right: 570, top: 8, color: "#00c853",  bgcolor:"#212121" }}>
      <RotateRight/>
  </Button>

  <Box sx={{ bgcolor: "#181818", borderRadius: 2 }}>
    {/* Header Row */}
    <Box sx={{ display: "flex", justifyContent: "space-between", p: 1, bgcolor: "#333", borderRadius: 1, position: "sticky" }}>
        <Typography variant="body2" sx={{ flex: 1.3, fontWeight: "bold", color: "#fff" }}>Name</Typography>
        <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Job Role</Typography>
        <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Date</Typography>
        <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Entry Time</Typography>
        <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Exit Time</Typography>
        <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Total Hours</Typography>
        <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Late Minutes</Typography>
        <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Penalty</Typography>
        <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Overtime Min</Typography>
        <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>& Salary</Typography>
        <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Bonus Salary</Typography>
        <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Net Salary</Typography>
    </Box>

    {/* Data Rows */}
    <Box sx={{ maxHeight: "700px", overflowY: "auto", bgcolor: "#121212", borderRadius: 1, paddingBottom: 10 }}>
        {attendanceLogs.length > 0 ? (
            attendanceLogs.map((log) => (
                <Box key={log.id} sx={{ display: "flex", justifyContent: "space-between", p: 1, bgcolor: "#181818", mb: 1, borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ flex: 1.3, color: "#fff" }}>{editFields?.username ?? "Unknown"}</Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>{editFields?.role ?? "N/A"}</Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>{new Date(log?.date).toLocaleDateString() ?? "N/A"}</Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
  {log?.entry_time ? new Date(log.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
</Typography>

<Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
  {log?.exit_time ? new Date(log.exit_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
</Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>{log?.late_minutes ?? "N/A"}</Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>{log?.penalty ?? "N/A"}</Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>{log?.overtime_minutes ?? "N/A"}</Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>{log?.log_id ?? "N/A"}</Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>{log?.log_id ?? "N/A"}</Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>{log?.log_id ?? "N/A"}</Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>{log?.log_id ?? "N/A"}</Typography>
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
          </Box>
</Dialog>
    </Box>
  );
};

export default EmployeeWiseAttendance;