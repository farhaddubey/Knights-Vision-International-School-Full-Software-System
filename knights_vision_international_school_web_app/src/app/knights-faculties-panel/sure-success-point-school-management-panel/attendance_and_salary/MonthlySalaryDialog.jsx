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
import MakePaymentDialog from './MakePaymentDialog';

const greenAccent = '#00c853';
const darkBackground = '#121212';
const darkSurface = '#1e1e1e';
const textPrimary = '#ffffff';
const textSecondary = '#b0b0b0';

const drawerWidth = 280;
const appBarHeight = 64;

const MonthlySalaryDialog = ({ open, employee, handleClose, fetchEmployees }) => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);

  const fetchSalaries = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("faculties_token");
      if (!token) throw new Error("Authentication token is missing!");
      const response = await axios.get(`/api-schools-panel/employee_salaries/salaries_by_id_year`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId: employee.id, year: selectedYear },
      });

      const formattedSalaries = response.data.map((item) => ({
        id: item.id,
        totalHoursWorked: parseFloat(item.total_hours_worked ?? 0),
        paymentStatus: item.payment_status ?? "Unknown",
        allowances: parseFloat(item.allowances ?? 0),
        totalLateDeduction: parseFloat(item.total_late_deduction ?? 0),
        totalOvertimeBonus: parseFloat(item.total_overtime_bonus ?? 0),
        totalSellBonus: parseFloat(item.total_sell_bonus ?? 0),
        netSalary: parseFloat(item.net_salary ?? 0),
        salaryPaid: parseFloat(item.salary_paid ?? 0),
        remainingSalaryOfMonth: parseFloat(item.remaining_salary_of_month ?? 0),
        monthYear: item.month_year ? new Date(item.month_year).toISOString().split("T")[0] : "N/A",
        updatedAt: item.updated_at ? new Date(item.updated_at).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }) : "Not updated",
      }));

      setSalaries(formattedSalaries);
    } catch (error) {
      console.error("Error fetching salaries:", error);
      setError(error.response?.data?.error || "Failed to fetch salaries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && employee) {
      fetchSalaries();
    }
  }, [open, employee, selectedYear]);

  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value));
    setLoading(true);
  };

  const handleOpenPaymentDialog = (salary) => {
    setSelectedSalary(salary);
    setOpenPaymentDialog(true);
  };

  const handleClosePaymentDialog = () => {
    setOpenPaymentDialog(false);
    setSelectedSalary(null);
    fetchSalaries(); // Refresh salaries after payment
    fetchEmployees(); // Refresh parent employee list
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
        Monthly Salaries for {employee?.username ?? "Unknown"}
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: darkBackground }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end'}}>
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
              <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: textPrimary }}>Total Hours</Typography>
              <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: textPrimary }}>Payment Status</Typography>
              <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: textPrimary }}>Net Salary</Typography>
              <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: textPrimary }}>Salary Paid</Typography>
              <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: textPrimary }}>Remaining Salary</Typography>
              <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: textPrimary }}>Action</Typography>
            </Box>
            <List>
              {salaries.length > 0 ? (
                salaries.map((salary) => (
                  <ListItem key={salary.id} sx={{ display: "flex", bgcolor: darkSurface, mb: 1 }}>
                    <Typography variant="body2" sx={{ flex: 1, color: textPrimary }}>
                      {new Date(salary.monthYear).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: textPrimary }}>
                      {salary.totalHoursWorked}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: textPrimary }}>
                      {salary.paymentStatus}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: textPrimary }}>
                      ₹{salary.netSalary}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: textPrimary }}>
                      ₹{salary.salaryPaid}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1, color: textPrimary }}>
                      ₹{salary.remainingSalaryOfMonth}
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                      {salary.remainingSalaryOfMonth > 0 && (
                        <Button
                          variant="contained"
                          sx={{ bgcolor: greenAccent, color: textPrimary, '&:hover': { bgcolor: '#00a843' } }}
                          onClick={() => handleOpenPaymentDialog(salary)}
                        >
                          Make Payment
                        </Button>
                      )}
                    </Box>
                  </ListItem>
                ))
              ) : (
                <Typography sx={{ textAlign: "center", p: 2, color: textPrimary }}>
                  No salaries found for {selectedYear}.
                </Typography>
              )}
            </List>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ backgroundColor: darkSurface }}>
        <Button onClick={handleClose} sx={{ color: greenAccent }}>Close</Button>
      </DialogActions>
      {selectedSalary && (
        <MakePaymentDialog
          open={openPaymentDialog}
          salary={selectedSalary}
          employee={employee}
          handleClose={handleClosePaymentDialog}
        />
      )}
    </Dialog>
  );
};

export default MonthlySalaryDialog;