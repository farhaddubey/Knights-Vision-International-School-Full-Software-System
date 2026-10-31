import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { Add } from "@mui/icons-material";
import { RotateRight } from "@mui/icons-material";
import textFieldStyles from "../../../mui_styles/TextFieldStyles";

const drawerWidth = 280;
const appBarHeight = 64; // Example AppBar height

  const AttendanceLogExitUpdateDialog = ({ openInsertion, handleCloseModal, handleSaveAndCloseModal, editFields, setEditFields}) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`; // e.g., 2025-05-05
  
  
    const handleSaveChanges = async () => {
      const token = Cookies.get("administration_token");
  
      if (!token) {
          toast.error("User not authenticated.");
          return;
      }
      
      if (!editFields.id) {
          toast.error("No attendance log found to update.");
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
      
      // ✅ Construct payload with correct formats and preserved financial calculations
      const payload = {
          date: editFields.date || formattedDate,
          exit_time: formatTime(editFields?.exit_time || "00:00:00"),
          total_hours: formatNumber(editFields?.total_hours || 0), 
          user: Number(editFields?.user) || null, // ✅ Ensure correct user reference
          late_minutes: formatNumber(editFields?.late_minutes || 0), 
          penalty: formatNumber(editFields?.penalty || 0), 
          overtime_minutes: formatNumber(editFields?.overtime_minutes || 0), 
          overtime_salary: formatNumber(editFields?.overtime_salary || 0), 
          bonus_salary_per_day: formatNumber(editFields?.bonus_salary_per_day || 0), 
          net_salary_of_the_day: formatNumber(editFields?.net_salary_of_the_day || 0), 
          base_salary: formatNumber(editFields?.base_salary || 0),
          deductions: formatNumber(editFields?.deductions || 0),
          final_salary: formatNumber(
              (Number(editFields?.base_salary) || 0) +
              (Number(editFields?.overtime_salary) || 0) +
              (Number(editFields?.bonus_salary_per_day) || 0) -
              (Number(editFields?.penalty) || 0) -
              (Number(editFields?.deductions) || 0)
          ),
      };
      
      const apiUrl = `/api/factory-workers-attendance-logs/${editFields.id}`;
      
      console.log("Submitting Payload:", payload); // ✅ Debugging
      
      try {
          const response = await axios.put(apiUrl, payload, {
              headers: { Authorization: `Bearer ${token}` },
          });
  
          console.log("Server Response:", response.data); // ✅ Log full response
  
          if (response.status === 200 || response.status === 201) {
              toast.success("Attendance log updated successfully.");
              console.log("Attendance Exit Updated");
              await updateParentSalaryRecord(editFields?.user, payload)
              handleSaveAndCloseModal();
          }
      } catch (err) {
          console.error("Save Error:", err.response?.data || err.message);
          toast.error("Failed to save. Check logs for details.");
      }
  };

const updateParentSalaryRecord = async (userId, attendanceData) => {
    const token = Cookies.get("administration_token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }
  
    const today = new Date();
    const currentMonthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  
    try {
      // Step 1: Fetch existing salary record
      const salaryResponse = await axios.get(
        `/api/employee_salaries/salary_by_id_month?userId=${userId}&monthYear=${currentMonthYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      let salaryRecord = salaryResponse.data[0];
  
      if (!salaryRecord) {
        console.log("🎯 No salary record found. Creating new one...");
  
        const newSalaryPayload = {
          user_id: userId,
          month_year: currentMonthYear,
          total_hours_worked: "0",
          payment_status: "Pending",
          allowances: "0",
          total_late_deduction: "0",
          total_overtime_bonus: "0",
          total_sell_bonus: "0",
          net_salary: "0",
          salary_paid: "0",
          remaining_salary_of_month: "0",
          // created_by_id: currentUserId,
          // updated_by_id: currentUserId,
          employee_salaries_attendance_logs_links: attendanceData.attendance_log_id
            ? [{
                employee_attendance_log_id: attendanceData.attendance_log_id,
                employee_attendance_log_order: attendanceData.attendance_log_order || 1
              }]
            : [],
        };
  
        const newSalaryResponse = await axios.post(
          `/api/employee_salaries`,
          newSalaryPayload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        salaryRecord = newSalaryResponse.data.data;
        console.log("✨ Created New Salary Record:", salaryRecord);
      }
  
      const {
        id: salaryId,
        total_hours_worked = 0,
        total_late_deduction = 0,
        total_overtime_bonus = 0,
        total_sell_bonus = 0,
        net_salary = 0,
        salary_to_pay = 0,
        remaining_salary_of_month = 0,
      } = salaryRecord;
  
      // Step 2: Calculate updated values
      const updatedTotalHoursWorked = parseFloat(total_hours_worked) + (attendanceData.total_hours || 0);
      const updatedLateDeduction = parseFloat(total_late_deduction) + (attendanceData.late_minutes || 0);
      const updatedOvertimeBonus = parseFloat(total_overtime_bonus) + (attendanceData.overtime_salary || 0);
      const updatedSellBonus = parseFloat(total_sell_bonus) + (attendanceData.sell_bonus || 0);
  
      const netSalaryToday = attendanceData.net_salary_of_the_day || 0;
      const updatedNetSalary = parseFloat(net_salary) + netSalaryToday - updatedLateDeduction;
      const updatedSalaryToPay = parseFloat(salary_to_pay) + netSalaryToday;
      const updatedRemainingSalary = parseFloat(remaining_salary_of_month) - netSalaryToday;
  
      // Step 3: Update payload
      const updatePayload = {
        total_hours_worked: updatedTotalHoursWorked.toString(),
        total_late_deduction: updatedLateDeduction.toString(),
        total_overtime_bonus: updatedOvertimeBonus.toString(),
        total_sell_bonus: updatedSellBonus.toString(),
        net_salary: updatedNetSalary.toString(),
        salary_paid: updatedSalaryToPay.toString(),
        remaining_salary_of_month: updatedRemainingSalary.toString(),
        // updated_by_id: currentUserId,
      };
  
      // Step 4: Update record
      const updateResponse = await axios.put(
        `/api/employee_salaries/${salaryId}`,
        updatePayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log("✅ Updated Salary Record:", updateResponse.data);
      toast.success("Salary record updated successfully.");
    } catch (error) {
      console.error("❌ Error updating salary record:", error.response?.data || error.message);
      toast.error("Failed to update salary. Check logs for details.");
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
    backgroundColor: "#1a237e", 
    color: "#fff",
    "&:hover": { backgroundColor: "#1a237e" } // Prevents color change on hover
  }}
>
  <ListItemIcon>
    <Add/>
  </ListItemIcon>
  <ListItemText sx={{ color: "#fff" }} primary="Insert Attendance Log"/>
      <Button variant="outlined" color="#00c853" sx={{ position: "absolute", right: 215, top: 8, color: "#00c853",  bgcolor:"#212121" }}>
        <RotateRight/>
    </Button>
  
    <Button onClick={handleCloseModal} variant="contained" color="error" sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}>
        <CloseIcon sx={{color:"#fff"}}/>
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
  <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#000", color: "#fff"}}>
    {/* Left Side */}
    <Box sx={{ flex: 1, overflowY: "auto", pr: 1, maxHeight: "80vh" }}>
      <TextField 
        sx={textFieldStyles} 
        label="Date" 
        type="date" 
        fullWidth 
        margin="normal" 
        value={editFields?.date || ""} 
        onChange={(e) => setEditFields({ ...editFields, date: e.target.value })} 
      />
<TextField 
  sx={textFieldStyles} 
  label="Entry Time" 
  type="time" 
  fullWidth 
  margin="normal" 
  disabled
  value={
    editFields?.entry_time 
      ? new Date(editFields.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) 
      : ''
  } 
/>

      <TextField 
        sx={textFieldStyles} 
        label="Late Minutes" 
        fullWidth 
        margin="normal" 
        disabled
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
        label="Exit Time" 
        type="time" 
        disabled
        fullWidth 
        margin="normal" 
        value={editFields?.exit_time || ""} 
        onChange={(e) => setEditFields({ ...editFields, exit_time: e.target.value })} 
      />
      <TextField 
        sx={textFieldStyles} 
        label="Total Hours" 
        fullWidth 
        disabled
        margin="normal" 
        value={editFields?.total_hours || ""} 
        onChange={(e) => setEditFields({ ...editFields, total_hours: e.target.value })} 
      />
    </Box>

    {/* Right Side */}
    <Box sx={{ flex: 1, overflowY: "auto", pl: 1, maxHeight: "80vh" }}>
      <TextField 
        sx={textFieldStyles} 
        label="Overtime Minutes" 
        disabled
        fullWidth 
        margin="normal" 
        value={editFields?.overtime_minutes || ""} 
        onChange={(e) => setEditFields({ ...editFields, overtime_minutes: e.target.value })} 
      />
      <TextField 
        sx={textFieldStyles} 
        label="Overtime Salary" 
        disabled
        fullWidth 
        margin="normal" 
        value={editFields?.overtime_salary || ""} 
        onChange={(e) => setEditFields({ ...editFields, overtime_salary: e.target.value })} 
      />
      <TextField 
        sx={textFieldStyles} 
        label="Bonus Salary" 
        disabled
        fullWidth 
        margin="normal" 
        value={editFields?.bonus || 0} 
        onChange={(e) => setEditFields({ ...editFields, bonus: e.target.value })} 
      />
      <TextField 
        sx={textFieldStyles} 
        label="Base Salary Per day"
        disabled 
        fullWidth 
        margin="normal" 
        value={editFields?.base_salary || ""} 
        onChange={(e) => setEditFields({ ...editFields, base_salary: e.target.value })} 
      />
      <TextField 
        sx={textFieldStyles} 
        label="Net Salary of the Day"
        disabled 
        fullWidth 
        margin="normal" 
        value={editFields?.net_salary_of_the_day || ""} 
        onChange={(e) => setEditFields({ ...editFields, net_salary_of_the_day: e.target.value })} 
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

export default AttendanceLogExitUpdateDialog;
