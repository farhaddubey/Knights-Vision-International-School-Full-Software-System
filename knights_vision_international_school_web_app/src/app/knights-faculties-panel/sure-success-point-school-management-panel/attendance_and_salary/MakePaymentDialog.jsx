import React, { useState } from 'react'; // Fixed quotes from double to single
import axios from "axios";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";

const drawerWidth = 280;
const appBarHeight = 64;
const greenAccent = '#00c853';
const darkBackground = '#121212';
const darkSurface = '#1e1e1e';
const textPrimary = '#ffffff';
const textSecondary = '#b0b0b0';

const MakePaymentDialog = ({ open, salary, employee, handleClose }) => {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = async () => {
    try {
      const token = Cookies.get("faculties_token");
      if (!token) throw new Error("Authentication token is missing!");

      const amount = parseFloat(paymentAmount);
      if (isNaN(amount) || amount <= 0 || amount > salary.remainingSalaryOfMonth) {
        throw new Error("Invalid payment amount");
      }

      await axios.post(
        `/api-schools-panel/salary_paid_logs`,
        {
          user_id: employee.id,
          salary_id: salary.id,
          paid_amount: amount,
          payment_mode: paymentMode,
          note: note || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Payment recorded successfully");
      handleClose();
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error(error.response?.data?.error || "Failed to record payment");
    }
  };

  return (
    <Dialog
      sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        transform: "translate(0, 0)",
        '& .MuiDialog-paper': {
          backgroundColor: darkBackground,
          color: textPrimary,
        },
      }}
      open={open}
      onClose={handleClose}
      fullScreen
    >
      <DialogTitle sx={{ backgroundColor: darkSurface, color: textPrimary }}>
        Make Payment for {employee?.username ?? "Unknown"}
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: darkBackground }}>
        <Typography sx={{ mb: 2, color: textPrimary }}>
          Remaining Salary: ₹{salary?.remainingSalaryOfMonth ?? 0}
        </Typography>
        <TextField
          label="Payment Amount"
          type="number"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          fullWidth
          margin="normal"
          sx={{
            bgcolor: darkSurface,
            '& .MuiInputBase-input': { color: textPrimary },
            '& .MuiInputLabel-root': { color: textSecondary },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: textSecondary },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: greenAccent },
          }}
        />
        <FormControl fullWidth margin="normal" sx={{ bgcolor: darkSurface }}>
          <InputLabel sx={{ color: textSecondary }}>Payment Mode</InputLabel>
          <Select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            sx={{
              color: textPrimary,
              '& .MuiSvgIcon-root': { color: textPrimary },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: textSecondary },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: greenAccent },
            }}
          >
            <MenuItem value="Cash">Cash</MenuItem>
            <MenuItem value="UPI">UPI</MenuItem>
            <MenuItem value="Bank">Bank</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Note (Optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          fullWidth
          margin="normal"
          sx={{
            bgcolor: darkSurface,
            '& .MuiInputBase-input': { color: textPrimary },
            '& .MuiInputLabel-root': { color: textSecondary },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: textSecondary },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: greenAccent },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ backgroundColor: darkSurface }}>
        <Button onClick={handleClose} sx={{ color: greenAccent }}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{ bgcolor: greenAccent, color: textPrimary, '&:hover': { bgcolor: '#00a843' } }}
        >
          Submit Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MakePaymentDialog;