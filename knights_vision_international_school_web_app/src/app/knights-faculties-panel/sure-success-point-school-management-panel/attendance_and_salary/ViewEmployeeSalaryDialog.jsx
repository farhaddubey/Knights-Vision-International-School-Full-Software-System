import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogActions, Button, Box, ListItemButton, ListItemIcon, ListItemText, CircularProgress, Typography, List, ListItem, Pagination, PaginationItem, TextField } from "@mui/material";
import { SettingsAccessibility, RotateRight, Search, ChevronLeft, ChevronRight } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PaymentProceedDialog from './PaymentProceedDialog';

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 20;
const greenAccent = '#00c853';

const ViewEmployeeSalaryDialog = ({ open, editFields, setEditFields, handleCloseModal }) => {
  const [salaries, setSalaries] = useState([]);
  const [allSalaries, setAllSalaries] = useState([]); // Store unfiltered salaries
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openChild, setOpenChild] = useState(false);
  const [editFieldsChild, setEditFieldsChild] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCloseModalChild = () => {
    const userConfirmed = window.confirm("Are you sure you want to close the panel?");
    if (userConfirmed) {
      setOpenChild(false);
      setEditFieldsChild({});
    }
  };

  const handleOpenChildModal = (item = {}) => {
    setEditFieldsChild(item);
    setOpenChild(true);
    console.log("Opening Child Modal");
  };

  const fetchSalaries = async (pageNum = 1) => {
    const token = Cookies.get("faculties_token");
    if (!token) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }
    if (!editFields?.id) {
      setError("No employee selected.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`/api/employee_salaries/salaries/${editFields.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: pageNum, pageSize },
      });

      console.log("API Response:", response.data);

      const formattedSalaries = response.data.salaries.map((item, index) => ({
        id: item.id ?? index,
        totalHoursWorked: item.total_hours_worked ?? "0.00",
        paymentStatus: item.payment_status ?? "Unknown",
        allowances: item.allowances ?? "0.00",
        totalLateDeduction: item.total_late_deduction ?? "0.00",
        totalOvertimeBonus: item.total_overtime_bonus ?? "0.00",
        totalSellBonus: item.total_sell_bonus ?? "0.00",
        netSalary: item.net_salary ?? "0.00",
        monthYear: item.month_year ?? "N/A",
        salaryPaid: item.salary_paid ?? "0.00",
        remainingSalaryOfMonth: item.remaining_salary_of_month ?? "0.00",
        user_id: item.user_id ?? null,
      }));

      setSalaries(formattedSalaries);
      setAllSalaries(formattedSalaries); // Store unfiltered salaries
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching salary data:", err);
      setError("Failed to fetch salary data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && editFields?.id) {
      console.log('[ViewEmployeeSalaryDialog] Fetching salaries for page:', page);
      fetchSalaries(page);
    }
  }, [open, editFields?.id, page]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = allSalaries.filter((item) =>
      item.monthYear?.toLowerCase().includes(query) ||
      item.paymentStatus?.toLowerCase().includes(query)
    );
    setSalaries(filtered);
  };

  const handlePageChange = (event, value) => {
    console.log('[ViewEmployeeSalaryDialog] Page changed to:', value);
    setPage(value);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
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
    <Box>
      <Dialog
        sx={{
          position: "fixed",
          top: `${appBarHeight}px`,
          left: `calc(${drawerWidth}px)`,
          transform: "translate(0, 0)",
          zIndex: "100",
        }}
        open={open}
        onClose={handleCloseModal}
        fullScreen
      >
        <ListItemButton
          sx={{
            backgroundColor: "#b71c1c",
            color: "#fff",
            "&:hover": { backgroundColor: "#b71c1c" },
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            padding: '8px 16px',
            borderRadius: 1,
          }}
        >
          <ListItemIcon sx={{ color: "#fff" }}>
            <SettingsAccessibility />
          </ListItemIcon>
          <ListItemText primary={`Salary Records for ${editFields?.username || "Employee"}`} />
          <TextField
            placeholder="Search by Month/Year or Payment Status"
            value={searchQuery}
            onChange={handleSearch}
            size="small"
            sx={{
              width: '250px',
              backgroundColor: '#333',
              borderRadius: '4px',
              '& .MuiInputBase-input': { color: '#fff' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: greenAccent },
            }}
            InputProps={{
              startAdornment: <Search sx={{ color: '#fff', mr: 1 }} />,
            }}
          />
          <Button
            onClick={() => fetchSalaries(page)}
            variant="outlined"
            sx={{ color: greenAccent, borderColor: greenAccent }}
          >
            <RotateRight />
          </Button>
        </ListItemButton>
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#000", color: "#fff" }}>
          <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflow: "auto", "&::-webkit-scrollbar": { display: "none" } }}>
            <Box sx={{ bgcolor: "#181818", borderRadius: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  p: 0.5,
                  py: 1,
                  bgcolor: "#1f1f1f",
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  borderBottom: "1px solid #333",
                  position: "sticky",
                  top: 0,
                  zIndex: 5,
                }}
              >
                <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>Total Hours</Typography>
                <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>Payment Status</Typography>
                <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>Allowances</Typography>
                <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>Late Deduction</Typography>
                <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>Overtime Bonus</Typography>
                <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>Sell Bonus</Typography>
                <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>Net Salary</Typography>
                <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>Month</Typography>
                <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>Paid</Typography>
                <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>Remaining</Typography>
                <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>Action</Typography>
              </Box>
              <List disablePadding>
                {salaries.length > 0 ? (
                  salaries.map((item) => (
                    <ListItem
                      key={item.id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 2,
                        mb: 1,
                        borderRadius: 2,
                        bgcolor: "#1a1a1a",
                        transition: "0.3s",
                        "&:hover": {
                          bgcolor: "#2a2a2a",
                          transform: "scale(1.01)",
                          boxShadow: "0 0 10px rgba(100, 255, 218, 0.2)",
                        },
                      }}
                    >
                      <Typography variant="body2" sx={{ flex: 1, color: "#90caf9", textAlign: "center" }}>{item.totalHoursWorked}</Typography>
                      <Typography variant="body2" sx={{ flex: 1, color: "#ff9800", textAlign: "center" }}>{item.paymentStatus}</Typography>
                      <Typography variant="body2" sx={{ flex: 1, color: "#4caf50", textAlign: "center" }}>{item.allowances}</Typography>
                      <Typography variant="body2" sx={{ flex: 1, color: "#e57373", textAlign: "center" }}>{item.totalLateDeduction}</Typography>
                      <Typography variant="body2" sx={{ flex: 1, color: "#81c784", textAlign: "center" }}>{item.totalOvertimeBonus}</Typography>
                      <Typography variant="body2" sx={{ flex: 1, color: "#64b5f6", textAlign: "center" }}>{item.totalSellBonus}</Typography>
                      <Typography variant="body2" sx={{ flex: 1, color: "#ffd54f", textAlign: "center", fontWeight: "bold" }}>{item.netSalary}</Typography>
                      <Typography variant="body2" sx={{ flex: 1, color: "#ccc", textAlign: "center" }}>{item.monthYear}</Typography>
                      <Typography variant="body2" sx={{ flex: 1, color: "#4db6ac", textAlign: "center" }}>{item.salaryPaid}</Typography>
                      <Typography variant="body2" sx={{ flex: 1, color: "#f44336", textAlign: "center" }}>{item.remainingSalaryOfMonth}</Typography>
                      <Typography variant="body2" sx={{ flex: 1, color: "#b39ddb", textAlign: "center" }}>
                        <Button variant="outlined" color="success" size="small" onClick={() => handleOpenChildModal(item)}>Pay</Button>
                      </Typography>
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ textAlign: "center", color: "#fff", p: 2 }}>
                    No salary records found
                  </Typography>
                )}
              </List>
            </Box>
            <Box
              sx={{
                position: 'fixed',
                bottom: 16,
                left: `calc(${drawerWidth}px + 50%)`,
                transform: 'translateX(-50%)',
                bgcolor: '#181818',
                borderRadius: 2,
                p: 1,
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                zIndex: 1000,
              }}
            >
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color='primary'
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: '#fff',
                    '&:hover': { bgcolor: '#333' },
                    '&.Mui-selected': {
                      bgcolor: greenAccent,
                      color: '#000',
                      '&:hover': { bgcolor: greenAccent },
                    },
                  },
                }}
                renderItem={(item) => (
                  <PaginationItem
                    components={{ previous: ChevronLeft, next: ChevronRight }}
                    {...item}
                  />
                )}
              />
            </Box>
          </Box>
        </Box>
        <DialogActions sx={{ backgroundColor: "#181818" }}>
          <Button
            onClick={handleCloseModal}
            variant="outlined"
            color="error"
            sx={{ color: "#f44336" }}
          >
            <CloseIcon />
          </Button>
        </DialogActions>
      </Dialog>
      {openChild && (
        <PaymentProceedDialog
          openChild={openChild}
          editFieldsChild={editFieldsChild}
          setEditFieldsChild={setEditFieldsChild}
          handleCloseModalChild={handleCloseModalChild}
        />
      )}
      <ToastContainer />
    </Box>
  );
};

export default ViewEmployeeSalaryDialog;