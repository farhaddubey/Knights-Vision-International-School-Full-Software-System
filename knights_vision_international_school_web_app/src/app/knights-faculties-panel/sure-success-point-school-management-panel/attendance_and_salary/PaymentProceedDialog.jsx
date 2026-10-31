import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { Payment, Close } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const drawerWidth = 280;
const appBarHeight = 64;

const textFieldStyles = {
  "& .MuiInputBase-input": { color: "#fff" },
  "& .MuiInputLabel-root": { color: "#fff" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#00c853" },
  backgroundColor: "#333",
  borderRadius: "4px",
};

const textDisabledFieldStyles = {
  "& .MuiInputBase-input": { color: "#ccc" },
  "& .MuiInputLabel-root": { color: "#ccc" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#444" },
  backgroundColor: "#222",
  borderRadius: "4px",
};

const PaymentProceedDialog = ({ openChild, editFieldsChild, setEditFieldsChild, handleCloseModalChild }) => {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!openChild) {
      setPaymentAmount("");
      setPaymentMode("");
      setNote("");
    }
  }, [openChild]);

  const handleSaveChanges = async () => {
    const token = Cookies.get("faculties_token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid payment amount.");
      return;
    }

    if (parseFloat(amount) > parseFloat(editFieldsChild.remainingSalaryOfMonth || 0)) {
      toast.error("Payment amount cannot exceed remaining salary.");
      return;
    }

    if (!paymentMode) {
      toast.error("Please select a payment mode.");
      return;
    }

    const payload = {
      salary_id: editFieldsChild.id,
      paid_amount: amount,
      payment_mode: paymentMode,
      note: note || null,
      user_id: editFieldsChild.user_id,
      paid_by_user_id: Cookies.get("user_id") || null,
    };

    try {
      setLoading(true);
      const response = await axios.post(
        `/api/employee_salaries/pay`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        toast.success("Payment recorded successfully 🚀");
        setEditFieldsChild({
          ...editFieldsChild,
          salaryPaid: (parseFloat(editFieldsChild.salaryPaid || 0) + amount).toFixed(2),
          remainingSalaryOfMonth: (parseFloat(editFieldsChild.remainingSalaryOfMonth || 0) - amount).toFixed(2),
          paymentStatus: parseFloat(editFieldsChild.remainingSalaryOfMonth || 0) - amount <= 0 ? "Paid" : "Partially Paid",
        });
        handleCloseModalChild();
      }
    } catch (err) {
      console.error("Payment Error:", err.response?.data || err.message);
      toast.error("Payment failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || (parseFloat(value) >= 0 && !isNaN(value))) {
      setPaymentAmount(value);
    }
  };

  return (
    <Box>
      <Dialog
        sx={{
          position: "fixed",
          top: `${appBarHeight}px`,
          left: `calc(${drawerWidth}px)`,
          transform: "translate(0, 0)",
          zIndex: 100,
        }}
        open={openChild}
        onClose={handleCloseModalChild}
        fullWidth
        maxWidth="md"
      >
        <ListItemButton
          sx={{
            backgroundColor: "#009688",
            color: "#fff",
            "&:hover": { backgroundColor: "#009688" },
          }}
        >
          <ListItemIcon>
            <Payment />
          </ListItemIcon>
          <ListItemText primary={`Process Payment for ${editFieldsChild.monthYear || "N/A"}`} />
          <Button
            onClick={handleCloseModalChild}
            variant="outlined"
            color="error"
            sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
          >
            <Close />
          </Button>
        </ListItemButton>  

        <DialogContent sx={{ backgroundColor: "#181818", color: "#fff" }}>
          <Box sx={{ display: "flex", flexDirection: "row", gap: 2, p: 2, maxHeight: "80vh" }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                sx={textDisabledFieldStyles}
                label="Month/Year"
                fullWidth
                disabled
                margin="normal"
                value={editFieldsChild.monthYear || "N/A"}
              />
              <TextField
                sx={textDisabledFieldStyles}
                label="Total Hours Worked"
                fullWidth
                disabled
                margin="normal"
                value={editFieldsChild.totalHoursWorked || "0.00"}
              />
              <TextField
                sx={textDisabledFieldStyles}
                label="Payment Status"
                fullWidth
                disabled
                margin="normal"
                value={editFieldsChild.paymentStatus || "Unknown"}
              />
              <TextField
                sx={textDisabledFieldStyles}
                label="Allowances"
                fullWidth
                disabled
                margin="normal"
                value={editFieldsChild.allowances || "0.00"}
              />
              <TextField
                sx={textDisabledFieldStyles}
                label="Late Deduction"
                fullWidth
                disabled
                margin="normal"
                value={editFieldsChild.totalLateDeduction || "0.00"}
              />
              <TextField
                sx={textDisabledFieldStyles}
                label="Overtime Bonus"
                fullWidth
                disabled
                margin="normal"
                value={editFieldsChild.totalOvertimeBonus || "0.00"}
              />
              <TextField
                sx={textDisabledFieldStyles}
                label="Sell Bonus"
                fullWidth
                disabled
                margin="normal"
                value={editFieldsChild.totalSellBonus || "0.00"}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                sx={textDisabledFieldStyles}
                label="Net Salary"
                fullWidth
                disabled
                margin="normal"
                value={editFieldsChild.netSalary || "0.00"}
              />
              <TextField
                sx={textDisabledFieldStyles}
                label="Salary Paid"
                fullWidth
                disabled
                margin="normal"
                value={editFieldsChild.salaryPaid || "0.00"}
              />
              <TextField
                sx={textDisabledFieldStyles}
                label="Remaining Salary"
                fullWidth
                disabled
                margin="normal"
                value={editFieldsChild.remainingSalaryOfMonth || "0.00"}
              />
              <TextField
                sx={textFieldStyles}
                label="Payment Amount"
                type="number"
                fullWidth
                margin="normal"
                value={paymentAmount}
                onChange={handlePaymentAmountChange}
                inputProps={{ min: 0, step: "0.01" }}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel sx={{ color: "#fff" }}>Payment Mode</InputLabel>
                <Select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  sx={{ color: "#fff", bgcolor: "#333", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" } }}
                >
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="UPI">UPI</MenuItem>
                  <MenuItem value="Bank">Bank</MenuItem>
                </Select>
              </FormControl>
              <TextField
                sx={textFieldStyles}
                label="Payment Note"
                fullWidth
                multiline
                minRows={3}
                margin="normal"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ backgroundColor: "#181818" }}>
          <Button
            onClick={handleCloseModalChild}
            variant="outlined"
            color="error"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveChanges}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? "Processing..." : "Save Payment"}
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer />
    </Box>
  );
};

export default PaymentProceedDialog;