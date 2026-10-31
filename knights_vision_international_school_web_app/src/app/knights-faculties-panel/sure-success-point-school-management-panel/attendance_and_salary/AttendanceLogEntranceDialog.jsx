import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogActions, TextField, Button, Box, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import { RotateRight } from "@mui/icons-material";
import textFieldStyles from "@/src/app/mui_styles/TextFieldStyles";

const drawerWidth = 280;
const appBarHeight = 64;

const AttendanceLogDialog = ({ openInsertion, handleCloseModal, handleSaveAndCloseModal, editFields, setEditFields }) => {
  const [rfid, setRfid] = useState("");
  const hiddenInputRef = useRef(null);

  const today = new Date();
  const isFriday = today.getDay() === 5; // 5 is Friday

  useEffect(() => {
    const focusInput = () => hiddenInputRef.current?.focus();
    focusInput();
    const interval = setInterval(focusInput, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let buffer = "";
    let lastScanTime = Date.now();

    const handleKeydown = (e) => {
      const key = e.key;
      if (key === "Enter") {
        let scannedRfid = buffer.trim();
        scannedRfid = scannedRfid.replace(/^0+/, '').padStart(10, "0");
        setRfid(scannedRfid);
        console.log("Received RFID:", scannedRfid);
        console.log("Expected RFID:", editFields.rfid_card_no);

        if (String(scannedRfid) === String(editFields.rfid_card_no)) {
          toast.success("RFID Verified ✅");
          handleSaveChanges();
        } else {
          toast.error("RFID Not Verified ❌");
        }
        buffer = "";
      } else if (key.length === 1 && /[\dA-Za-z]/.test(key)) {
        const now = Date.now();
        if (now - lastScanTime > 300) buffer = "";
        buffer += key;
        lastScanTime = now;
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [openInsertion, editFields]);

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

  const handleSaveChanges = async () => {
    const currentDate = new Date().toISOString().split("T")[0]; // e.g., 2025-08-05
    const token = Cookies.get("faculties_token");

    if (!token) {
      toast.error("User not authenticated.");
      setRfid("");
      return;
    }

    if (!editFields.user_id) {
      toast.error("Invalid user ID.");
      setRfid("");
      return;
    }

    // Recalculate late_minutes and penalty based on entry_time
    const { lateMinutes, penalty } = calculateLatePenalty(editFields.entry_time);

    const formatNumber = (value) => parseFloat(value || 0).toFixed(2);
    const formatTime = (time) => {
      if (!time) return "00:00:00";
      const parts = time.split(":");
      if (parts.length === 2) return `${time}:00`;
      if (parts.length === 3) return parts.slice(0, 3).join(":");
      return "00:00:00";
    };

    const payload = {
      entry_time: formatTime(editFields.entry_time),
      leave_time: null, // Entry panel does not set leave_time
      total_hours: "0.00", // Will be updated on exit
      user_id: Number(editFields.user_id),
      date: currentDate,
      late_minutes: formatNumber(lateMinutes),
      penalty: formatNumber(penalty),
      overtime_minutes: "0.00",
      overtime_salary: "0.00",
      bonus_salary_per_day: formatNumber(editFields.bonus_salary_per_day),
      base_salary_per_day: formatNumber(editFields.base_salary),
      net_salary_of_the_day: formatNumber(editFields.net_salary_of_the_day),
    };

    const apiUrl = `/api-schools-panel/employee-attendance-logs?user=${Number(editFields.user_id)}&date=${currentDate}`;
    console.log("Submitting Payload:", payload);
    console.log("API URL:", apiUrl);

    try {
      // Check if an attendance log already exists
      const checkResponse = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (checkResponse.data.length > 0) {
        toast.error("Attendance log already exists for this user and date.");
        setRfid("");
        return;
      }

      const response = await axios.post(apiUrl, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Server Response:", response.data);
      if (response.status === 200 || response.status === 201) {
        toast.success("Attendance Log Created Successfully.");
        setRfid("");
        handleSaveAndCloseModal();
      }
    } catch (err) {
      console.error("Save Error:", err.response?.data || err.message);
      toast.error("Failed to save attendance log. Check logs for details.");
      setRfid("");
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
      open={openInsertion}
      onClose={handleCloseModal}
      fullScreen
    >
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
          backgroundColor: "#212121",
          color: "#fff",
          "&:hover": { backgroundColor: "#212121" }
        }}
      >
        <ListItemIcon sx={{fontSize:"24px", color:"white"}}>🧑‍🏭🏭</ListItemIcon>
        <ListItemText
          primary={
            <Typography sx={{padding:0, margin:0, color:"#64dd17", fontWeight:"bold"}}>
              {editFields?.username}&nbsp;(
              {editFields?.role
                ? editFields.role
                    .split(" ")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(" ")
                : ""}
              )&nbsp;🔐Attendance Entrance Panel
            </Typography>
          }
        />
        <Button
          variant="outlined"
          color="success"
          sx={{ position: "absolute", right: 80, top: 8, color: "#00c853", bgcolor: "#212121" }}
        >
          <RotateRight />
        </Button>
        <Button
          onClick={handleCloseModal}
          variant="outlined"
          color="error"
          sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
        >
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
              <Box sx={{ flex: 1, overflowY: "auto", pr: 1, maxHeight: "80vh" }}>
                <TextField
                  sx={textFieldStyles}
                  label="Date"
                  type="date"
                  fullWidth
                  margin="normal"
                  disabled
                  value={editFields?.date || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setEditFields({ ...editFields, date: e.target.value })}
                />
                <Box sx={{display:"flex", flexDirection:"row"}}>
                  <TextField
                    sx={textFieldStyles}
                    label="Entry Time"
                    type="time"
                    fullWidth
                    margin="normal"
                    value={editFields?.entry_time || ""}
                    onChange={(e) => {
                      const newEntryTime = e.target.value;
                      const { lateMinutes, penalty } = calculateLatePenalty(newEntryTime);
                      setEditFields({ ...editFields, entry_time: newEntryTime, late_minutes: lateMinutes, penalty });
                    }}
                  />
                  <TextField
                    sx={textFieldStyles}
                    label="System Entry Time"
                    type="time"
                    fullWidth
                    disabled
                    margin="normal"
                    value={editFields?.regular_entry_time || (isFriday ? "06:45" : "07:00")}
                  />
                </Box>
                <TextField
                  sx={textFieldStyles}
                  label="Late Minutes"
                  disabled
                  fullWidth
                  margin="normal"
                  value={editFields?.late_minutes || 0}
                />
                <TextField
                  sx={textFieldStyles}
                  label="Penalty"
                  disabled
                  fullWidth
                  margin="normal"
                  value={editFields?.penalty || 0}
                />
                <Box sx={{display:'flex', flexDirection:"row"}}>
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
                    label="System Exit Time"
                    type="time"
                    fullWidth
                    disabled
                    margin="normal"
                    value={editFields?.regular_leave_time || (isFriday ? "10:45" : "17:00")}
                  />
                </Box>
                <TextField
                  sx={textFieldStyles}
                  label="Total Hours"
                  fullWidth
                  margin="normal"
                  disabled
                  value={editFields?.total_hours || "0.00"}
                />
              </Box>
              <Box sx={{ flex: 1, overflowY: "auto", pl: 1, maxHeight: "80vh" }}>
                <TextField
                  sx={textFieldStyles}
                  label="Overtime Minutes"
                  fullWidth
                  margin="normal"
                  disabled
                  value={editFields?.overtime_minutes || "0.00"}
                />
                <TextField
                  sx={textFieldStyles}
                  label="Overtime Salary"
                  fullWidth
                  margin="normal"
                  disabled
                  value={editFields?.overtime_salary || "0.00"}
                />
                <TextField
                  sx={textFieldStyles}
                  disabled
                  label="Bonus Salary"
                  fullWidth
                  margin="normal"
                  value={editFields?.bonus_salary_per_day || "0.00"}
                />
                <TextField
                  sx={textFieldStyles}
                  disabled
                  label="Base Salary Per Day"
                  fullWidth
                  margin="normal"
                  value={editFields?.base_salary || "0.00"}
                />
                <TextField
                  sx={textFieldStyles}
                  disabled
                  label="Net Salary of the Day"
                  fullWidth
                  margin="normal"
                  value={editFields?.net_salary_of_the_day || "0.00"}
                />
                <input
                  ref={hiddenInputRef}
                  style={{
                    position: "absolute",
                    opacity: 0,
                    pointerEvents: "none",
                    height: 0,
                    width: 0,
                  }}
                  autoFocus
                />
                <TextField
                  sx={textFieldStyles}
                  disabled
                  label="RFID Verification"
                  fullWidth
                  margin="normal"
                  value={rfid}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} variant="contained" color="error">Cancel</Button>
            <Button onClick={handleCloseModal} variant="contained" color="primary">Close</Button>
          </DialogActions>
        </Box>
      </Box>
    </Dialog>
  );
};

export default AttendanceLogDialog;