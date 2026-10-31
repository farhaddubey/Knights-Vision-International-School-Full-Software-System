import React, { useState, useEffect } from 'react'; // Fixed quotes from double to single
import axios from "axios";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
} from "@mui/material";
import { toast } from "react-toastify";

const greenAccent = '#00c853';
const darkBackground = '#121212';
const darkSurface = '#1e1e1e';
const textPrimary = '#ffffff';
const textSecondary = '#b0b0b0';

const drawerWidth = 280;
const appBarHeight = 64;

const PaymentTransactionsDialog = ({ open, employee, handleClose }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]= useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("faculties_token");
      if (!token) throw new Error("Authentication token is missing!");
      const response = await axios.get(`/api-schools-panel/salary_paid_logs/by_user_year`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId: employee.id, year: selectedYear },
      });

      const formattedPayments = response.data.map((item) => ({
        id: item.id,
        paidAmount: parseFloat(item.paid_amount ?? 0),
        paymentMode: item.payment_mode ?? "Unknown",
        note: item.note ?? "N/A",
        paidOn: item.paid_on ? new Date(item.paid_on).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }) : "N/A",
        monthYear: item.salary?.month_year ? new Date(item.salary.month_year).toLocaleString('en-IN', { month: 'long', year: 'numeric' }) : "N/A",
      }));

      setPayments(formattedPayments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      setError(error.response?.data?.error || "Failed to fetch payment logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && employee) {
      fetchPayments();
    }
  }, [open, employee, selectedYear]);

  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value));
    setLoading(true);
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
        Payment Transactions for {employee?.username ?? "Unknown"}
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: darkBackground }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: textSecondary }}>Year</InputLabel>
            <Select
              value={selectedYear}
              onChange={handleYearChange}
              sx={{
                bgcolor: darkSurface,
                color: textPrimary,
                '& .MuiSvgIcon-root': { color: textPrimary },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: textSecondary },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: greenAccent },
              }}
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return <MenuItem key={year} value={year}>{year}</MenuItem>;
              })}
            </Select>
          </FormControl>
        </Box>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress sx={{ color: greenAccent }} />
          </Box>
        ) : error ? (
          <Typography sx={{ textAlign: "center", color: '#ff1744' }}>
            {error}
          </Typography>
        ) : (
          <Box>
            <Box sx={{ display: "flex", bgcolor: darkSurface, p: 1, mb: 1 }}>
              <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: textPrimary }}>Month</Typography>
              <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: textPrimary }}>Paid Amount</Typography>
              <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: textPrimary }}>Payment Mode</Typography>
              <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: textPrimary }}>Paid On</Typography>
              <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: textPrimary }}>Note</Typography>
            </Box>
            <List>
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <ListItem key={payment.id} sx={{ display: "flex", bgcolor: darkSurface, mb: 1 }}>
                    <Typography variant="body2" sx={{ flex: 1, color: textPrimary }}>
                      {payment.monthYear}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: textPrimary }}>
                      ₹{payment.paidAmount}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: textPrimary }}>
                      {payment.paymentMode}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: textPrimary }}>
                      {payment.paidOn}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: textPrimary }}>
                      {payment.note}
                    </Typography>
                  </ListItem>
                ))
              ) : (
                <Typography sx={{ textAlign: "center", p: 2, color: textPrimary }}>
                  No payment transactions found for {selectedYear}.
                </Typography>
              )}
            </List>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ backgroundColor: darkSurface }}>
        <Button onClick={handleClose} sx={{ color: greenAccent }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentTransactionsDialog;