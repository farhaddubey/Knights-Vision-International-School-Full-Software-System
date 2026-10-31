import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { Add } from "@mui/icons-material";
import textFieldStyles from "../../../mui_styles/TextDisableFieldStyles";
import { RotateRight } from "@mui/icons-material";

const drawerWidth = 280;
const appBarHeight = 64; // Example AppBar height

  const AttendanceLogDialog = ({ openInsertion, handleCloseModal, handleSaveAndCloseModal, editFields, setEditFields }) => {
  
    const handleSaveChanges = async () => {
      const currentDate = new Date().toISOString().split("T")[0]; // ✅ Format: YYYY-MM-DD
      const token = Cookies.get("administration_token");
  
      if (!token) {
          toast.error("User not authenticated.");
          return;
      }
      // ✅ Ensure numeric fields have 2 decimal places
      const formatNumber = (value) => parseFloat(value).toFixed(2);
       // ✅ Fix time format to strictly "HH:mm:ss"
    const formatTime = (time) => {
      if (!time) return "00:00:00"; // Default if empty
      const parts = time.split(":");
      if (parts.length === 2) return `${time}:00`; // Ensure seconds are added
      if (parts.length === 3) return parts.slice(0, 3).join(":"); // Remove milliseconds if present
      return "00:00:00"; // Fallback
  };

      // ✅ Construct payload with correct formats
      const payload = {
              entry_time: formatTime(editFields?.entry_time || "00:00:00"), // Fix time format
              exit_time: formatTime(editFields?.exit_time || "00:00:00"),   // Fix time format
              total_hours: formatNumber(editFields?.total_hours || 0), 
              user_id: Number(editFields?.user_id) || null, // ✅ Ensure correct user_id reference
              date: currentDate,
              late_minutes: formatNumber(editFields?.late_minutes || 0), 
              penalty: formatNumber(editFields?.penalty || 0), 
              overtime_minutes: formatNumber(editFields?.overtime_minutes || 0), 
              overtime_salary: formatNumber(editFields?.overtime_salary || 0), 
              bonus_salary_per_day: formatNumber(editFields?.bonus_salary_per_day || 0), 
              net_salary_of_the_day: formatNumber(editFields?.net_salary_of_the_day || 0), 
      };
  
      const apiUrl = `/api/factory-workers-attendance-logs?user=${Number(editFields?.user_id)}&date=${currentDate}`;
      console.log("Submitting Payload:", payload.data); // ✅ Debugging
  
      try {
          const response = await axios.post(apiUrl, payload, {
              headers: { Authorization: `Bearer ${token}` },
          });
  
          console.log("Server Response:", response.data); // ✅ Log full response
  
          if (response.status === 200 || response.status === 201) {
              toast.success("Log Updated Successfully.");
              handleSaveAndCloseModal();
          }
      } catch (err) {
          console.error("Save Error:", err.response?.data || err.message);
          toast.error("Failed to save. Check logs for details.");
      }
  };
  

  
    
  return (
    <Dialog
      sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        transform: "translate(0, 0)",
      }}
     open={openInsertion} onClose={handleCloseModal} fullScreen>
              <ListItemButton 
  sx={{ 
    backgroundColor: "#212121", 
    color: "#fff",
    "&:hover": { backgroundColor: "#212121" } // Prevents color change on hover
  }}
>
  <ListItemIcon>
    <Add/>
  </ListItemIcon>
  <ListItemText sx={{ color: "#fff" }} primary="Insert Attendance Entrance Log" />
      <Button variant="outlined" color="#00c853" sx={{ position: "absolute", right: 80, top: 8, color: "#00c853",  bgcolor:"#212121" }}>
        <RotateRight/>
    </Button>
  
    <Button onClick={handleCloseModal} variant="outlined" color="error" sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}>
        <CloseIcon />
    </Button>
</ListItemButton>
      
      <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#000", color: "#fff" }}>
         <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "auto",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
<DialogContent>
  <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#000", color: "#fff", p: 2 }}>
    {/* Left Side */}
    <Box sx={{ flex: 1, overflowY: "auto", pr: 1, maxHeight: "80vh" }}>
      <TextField 
        sx={textFieldStyles} 
        label="Date" 
        type="date" 
        fullWidth 
        margin="normal" 
        disabled
        value={editFields?.date || ""} 
        onChange={(e) => setEditFields({ ...editFields, date: e.target.value })} 
      />
      <TextField 
        sx={textFieldStyles} 
        label="Entry Time" 
        type="time" 
        fullWidth 
        disabled
        margin="normal" 
        value={editFields?.entry_time || ""} 
        onChange={(e) => setEditFields({ ...editFields, entry_time: e.target.value })} 
      />
      <TextField 
        sx={textFieldStyles} 
        label="Late Minutes" 
        disabled
        fullWidth 
        margin="normal" 
        value={editFields?.late_minutes || ""} 
        onChange={(e) => setEditFields({ ...editFields, late_minutes: e.target.value })} 
      />
      <TextField 
        sx={textFieldStyles} 
        label="Penalty"
        disabled 
        fullWidth 
        margin="normal" 
        value={editFields?.penalty || ""} 
        onChange={(e) => setEditFields({ ...editFields, penalty: e.target.value })} 
      />
      <TextField 
        sx={textFieldStyles}
        disabled 
        label="Exit Time" 
        type="time" 
        fullWidth 
        margin="normal" 
        value={editFields?.exit_time || ""} 
        onChange={(e) => setEditFields({ ...editFields, exit_time: e.target.value })} 
      />
      <TextField 
        sx={textFieldStyles} 
        label="Total Hours" 
        fullWidth 
        margin="normal" 
        disabled
        value={editFields?.total_hours || ""} 
        onChange={(e) => setEditFields({ ...editFields, total_hours: e.target.value })} 
      />
    </Box>

    {/* Right Side */}
    <Box sx={{ flex: 1, overflowY: "auto", pl: 1, maxHeight: "80vh" }}>
      <TextField 
        sx={textFieldStyles} 
        label="Overtime Minutes" 
        fullWidth 
        margin="normal" 
        disabled
        value={editFields?.overtime_minutes || ""} 
        onChange={(e) => setEditFields({ ...editFields, overtime_minutes: e.target.value })} 
      />
      <TextField 
        sx={textFieldStyles} 
        label="Overtime Salary" 
        fullWidth 
        margin="normal"
        disabled 
        value={editFields?.overtime_salary || ""} 
        onChange={(e) => setEditFields({ ...editFields, overtime_salary: e.target.value })} 
      />
      <TextField 
        sx={textFieldStyles}
        disabled 
        label="Bonus Salary" 
        fullWidth 
        margin="normal" 
        value={editFields?.bonus || 0} 
        onChange={(e) => setEditFields({ ...editFields, bonus: e.target.value })} 
      />
      <TextField 
        sx={textFieldStyles} 
        disabled
        label="Base Salary Per day" 
        fullWidth 
        margin="normal" 
        value={editFields?.base_salary || ""} 
        onChange={(e) => setEditFields({ ...editFields, base_salary: e.target.value })} 
      />
      <TextField 
        sx={textFieldStyles} 
        disabled
        label="Net Salary of the Day" 
        fullWidth 
        margin="normal" 
        value={editFields?.net_salary_of_the_day || ""} 
        onChange={(e) => setEditFields({ ...editFields, net_salary_of_the_day: e.target.value })} 
      />
      <TextField 
        sx={textFieldStyles}
        disabled 
        label="User ID" 
        fullWidth 
        margin="normal" 
        value={editFields?.user || "N/A"} 
        onChange={(e) => setEditFields({ ...editFields, id: e.target.value })} 
      />
    </Box>
  </Box>
</DialogContent>

      <DialogActions>
        <Button onClick={handleCloseModal} variant="contained" color="error">Cancel</Button>
        <Button onClick={handleSaveChanges} variant="contained" color="primary">Save Changes</Button>
      </DialogActions>
      </Box>
      </Box>
    </Dialog>
  );
};

export default AttendanceLogDialog;
