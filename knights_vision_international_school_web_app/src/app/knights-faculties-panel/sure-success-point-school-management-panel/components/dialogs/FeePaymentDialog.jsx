"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  Chip,
  Alert,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import { Payment } from "@mui/icons-material";

const drawerWidth = 280;
const appBarHeight = 64;
const greenAccent = "#00c853";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const FeePaymentDialog = ({ open, onClose, student, dueMonths, academicYear, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [remarks, setRemarks] = useState("Fee payment for TC");
  const [monthlyFee, setMonthlyFee] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (student && student.feeSchemeId) {
      fetchMonthlyFee();
    }
  }, [student]);

  const fetchMonthlyFee = async () => {
    const token = Cookies.get("faculties_token");
    try {
      setError(null);
      const response = await axios.get(`/api/fee-schemes/${student.feeSchemeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMonthlyFee(response.data.monthlyFee || 0);
    } catch (err) {
      setError("Failed to fetch fee scheme.");
      toast.error("Failed to fetch fee scheme.");
    }
  };

  const handlePayFees = async () => {
    const token = Cookies.get("faculties_token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }
    if (!paymentMethod) {
      toast.error("Please select a payment method.");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        "/api/monthly-fees/pay",
        {
          studentId: student.id,
          admissionId: student.finalAdmissionId,
          schoolId: student.schoolId,
          branchId: student.branchId,
          classId: student.classId,
          academicYear,
          months: dueMonths,
          monthlyFee,
          paymentMethod,
          transactionId,
          remarks,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Fees paid successfully!");
      onSuccess();
    } catch (err) {
      toast.error(`Failed to process payment: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

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
        "& .MuiDialog-paper": { backgroundColor: "#000", color: "#fff" },
      }}
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
      <DialogTitle
        sx={{
          backgroundColor: "#212121",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Payment sx={{ color: greenAccent }} />
        <Typography variant="h6">
          Pay Outstanding Fees: {student?.firstName} {student?.lastName}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: "#000" }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography sx={{ color: "#fff", mb: 2 }}>
          Admission No.: {student?.admissionNumber || "N/A"} | Class: {student?.class?.name || "N/A"} {student?.class?.section || ""}
        </Typography>

        <Typography variant="h6" sx={{ mt: 4, color: "#fff" }}>
          Outstanding Fees (Academic Year: April {academicYear} - March {academicYear + 1})
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
          {dueMonths.length > 0 ? (
            dueMonths.map((month) => (
              <Chip
                key={month.month}
                label={`${monthNames[month.month - 1]} (${month.status})`}
                sx={{
                  backgroundColor: "#f44336",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#d32f2f" },
                }}
              />
            ))
          ) : (
            <Typography sx={{ color: "#fff" }}>No dues pending.</Typography>
          )}
        </Box>

        {dueMonths.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {dueMonths.map((month) => (
              <Box
                key={month.month}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#fff",
                  py: 0.5,
                }}
              >
                <Typography sx={{ textAlign: "left" }}>{monthNames[month.month - 1]}</Typography>
                <Typography sx={{ textAlign: "right" }}>₹{month.totalDue - month.paidAmount}</Typography>
              </Box>
            ))}
            <Box sx={{ display: "flex", justifyContent: "space-between", color: "#fff", fontWeight: "bold", mt: 1 }}>
              <Typography>Total Payable:</Typography>
              <Typography>
                ₹{dueMonths.reduce((sum, month) => sum + (month.totalDue - month.paidAmount), 0)}
              </Typography>
            </Box>
          </Box>
        )}

        <Typography variant="h6" sx={{ mt: 4, color: "#fff" }}>
          Payment Details
        </Typography>
        <FormControl fullWidth sx={{ mt: 2, backgroundColor: "#333", borderRadius: "4px" }}>
          <InputLabel sx={{ color: "#aaa" }}>Payment Method</InputLabel>
          <Select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            sx={{
              color: "#fff",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: greenAccent },
            }}
          >
            {["CASH", "UPI", "NET_BANKING", "ONLINE_GATEWAY"].map((method) => (
              <MenuItem key={method} value={method}>
                {method}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {["UPI", "NET_BANKING", "ONLINE_GATEWAY"].includes(paymentMethod) && (
          <>
            <TextField
              label="Transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              fullWidth
              margin="normal"
              sx={{
                backgroundColor: "#333",
                borderRadius: "4px",
                "& .MuiInputBase-input": { color: "#fff" },
                "& .MuiInputLabel-root": { color: "#aaa" },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: greenAccent },
              }}
            />
            <TextField
              label="Remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              fullWidth
              margin="normal"
              placeholder="Fee payment for TC"
              sx={{
                backgroundColor: "#333",
                borderRadius: "4px",
                "& .MuiInputBase-input": { color: "#fff" },
                "& .MuiInputLabel-root": { color: "#aaa" },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: greenAccent },
              }}
            />
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ bgcolor: "#000" }}>
        <Button onClick={onClose} variant="contained" color="error" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handlePayFees}
          variant="contained"
          color="primary"
          disabled={dueMonths.length === 0 || loading}
          sx={{ bgcolor: greenAccent, color: "#000", "&:hover": { bgcolor: "#00a548" } }}
        >
          Pay Fees
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeePaymentDialog;