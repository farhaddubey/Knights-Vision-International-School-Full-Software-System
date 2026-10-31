import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogContent,
  DialogActions,
  CircularProgress,
  ListItemButton,
  ListItemIcon,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Inventory, Close, RotateRight, Payment, Search as SearchIcon } from "@mui/icons-material";
import textDisabledFieldStyles from "../../../mui_styles/TextDisableFieldStyles";

const appBarHeight = 64;
const MyReceivedSalaryHistory = () => {
  const [paymentLogs, setPaymentLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editFields, setEditFields] = useState({});

  const fetchPaymentLogs = async () => {
    const token = Cookies.get("faculties_token");
    if (!token) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }

    try {
      // Decode userId from token
      const decoded = jwtDecode(token);
      const userId = decoded.userId || decoded.id;
      if (!userId) {
        setError("Invalid token: user ID not found.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`/api/employee_salaries/salary_paid_logs/by_user?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Format payment log data
      const formattedLogs = response.data.map((item, index) => ({
        id: item.id ?? index,
        salaryId: item.salary_id ?? null,
        paidAmount: parseFloat(item.paid_amount ?? 0).toFixed(2),
        paidOn: item.paid_on ? new Date(item.paid_on).toLocaleString() : "N/A",
        paymentMode: item.payment_mode ?? "Unknown",
        note: item.note ?? "No remarks",
        paidByUserId: item.paid_by_user_id ?? null,
        createdAt: item.created_at ? new Date(item.created_at).toLocaleString() : "Not recorded",
        updatedAt: item.updated_at ? new Date(item.updated_at).toLocaleString() : "Not updated",
        userId: item.user_id ?? null,
      }));

      setPaymentLogs(formattedLogs);
      setFilteredLogs(formattedLogs); // Initialize filtered data
      console.log("Updated State:", formattedLogs);
    } catch (err) {
      console.error("Error fetching payment logs:", err);
      setError("Failed to fetch payment logs.");
    } finally {
      setLoading(false);
    }
  };

  // Handle search input changes
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = paymentLogs.filter((log) =>
      [
        log.paidAmount,
        log.paidOn,
        log.paymentMode,
        log.note,
        log.paidByUserId?.toString(),
      ].some((field) => field?.toLowerCase().includes(query))
    );

    setFilteredLogs(filtered);
  };

  useEffect(() => {
    fetchPaymentLogs();
  }, []);

  const handleOpenModal = (item = {}) => {
    console.log("Opening Modal with Item:", item);
    setEditFields(item);
    setOpen(true);
  };

  const handleCloseModal = () => {
    const userConfirmed = window.confirm("Are you sure you want to close the modal, unsaved?");
    if (userConfirmed) {
      setOpen(false);
      setEditFields({});
    }
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
    <Box sx={{ position: "fixed", minWidth: `82vw`, backgroundColor: "#212121", height: `calc(100vh - ${appBarHeight}px)`, color: "#fff" }}>
      <ListItemButton
        sx={{
          backgroundColor: "#b71c1c",
          color: "#fff",
          "&:hover": { backgroundColor: "#b71c1c" },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingRight: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <ListItemIcon sx={{ color: "#fff", minWidth: 40 }}>
            <Inventory />
          </ListItemIcon>
          <ListItemText sx={{ color: "#fff" }} primary="Salary Payment Logs" />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button variant="contained" color="primary">
            <Payment /> View Payment Logs
          </Button>
          <TextField
            size="small"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#fff" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              bgcolor: "#333",
              borderRadius: 1,
              "& .MuiInputBase-input": { color: "#fff", padding: "6px" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#555" },
                "&:hover fieldset": { borderColor: "#777" },
                "&.Mui-focused fieldset": { borderColor: "#00c853" },
              },
              width: 200,
            }}
          />
          <Button
            onClick={fetchPaymentLogs}
            variant="outlined"
            sx={{ color: "#00c853", bgcolor: "#212121", minWidth: 40, padding: "6px" }}
          >
            <RotateRight />
          </Button>
        </Box>
      </ListItemButton>

      <Box sx={{ bgcolor: "#0d0d0d", borderRadius: 2, boxShadow: 3 }}>
        {/* Header Row */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            p: 2,
            bgcolor: "#1f1f1f",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            borderBottom: "1px solid #333",
            position: "sticky",
            top: 0,
            zIndex: 5,
          }}
        >
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>
            Log ID
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>
            Paid Amount
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>
            Paid On
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>
            Payment Mode
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>
            Paid By
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#e0e0e0", textAlign: "center" }}>
            Actions
          </Typography>
        </Box>

        {/* Data Rows */}
        <Box
          sx={{
            maxHeight: "700px",
            overflowY: "auto",
            bgcolor: "#121212",
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          <List disablePadding>
            {filteredLogs.map((item) => (
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
                <Typography variant="body2" sx={{ flex: 1, color: "#ccc", textAlign: "center" }}>
                  {item.id}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#4caf50", textAlign: "center" }}>
                  ₹{item.paidAmount}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#90caf9", textAlign: "center" }}>
                  {item.paidOn}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#ffd54f", textAlign: "center" }}>
                  {item.paymentMode}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#ccc", textAlign: "center" }}>
                  {item.paidByUserId || "N/A"}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#b39ddb", textAlign: "center" }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => handleOpenModal(item)}
                  >
                    View Details
                  </Button>
                </Typography>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      {/* Details Dialog */}
      <Dialog
        sx={{
          position: "fixed",
          top: `${appBarHeight}px`,
          transform: "translate(0, 0)",
          zIndex: 100,
        }}
        open={open}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="sm"
      >
        <ListItemButton
          sx={{
            backgroundColor: "#b71c1c",
            color: "#fff",
            "&:hover": { backgroundColor: "#b71c1c" },
          }}
        >
          <ListItemIcon>
            <Payment />
          </ListItemIcon>
          <ListItemText primary="Payment Log Details" />
          <Button
            onClick={handleCloseModal}
            variant="outlined"
            color="error"
            sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
          >
            <Close/>
          </Button>
        </ListItemButton>
        <DialogContent sx={{ bgcolor: "#181818", color: "#fff" }}>
          <TextField
            sx={textDisabledFieldStyles}
            label="Log ID"
            fullWidth
            disabled
            margin="normal"
            value={editFields.id || "N/A"}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="Paid Amount"
            fullWidth
            disabled
            margin="normal"
            value={`₹${editFields.paidAmount || "0.00"}`}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="Paid On"
            fullWidth
            disabled
            margin="normal"
            value={editFields.paidOn || "N/A"}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="Payment Mode"
            fullWidth
            disabled
            margin="normal"
            value={editFields.paymentMode || "Unknown"}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="Note"
            fullWidth
            disabled
            margin="normal"
            multiline
            minRows={2}
            value={editFields.note || "No remarks"}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="Paid By User ID"
            fullWidth
            disabled
            margin="normal"
            value={editFields.paidByUserId || "N/A"}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="Created At"
            fullWidth
            disabled
            margin="normal"
            value={editFields.createdAt || "Not recorded"}
          />
          <TextField
            sx={textDisabledFieldStyles}
            label="Updated At"
            fullWidth
            disabled
            margin="normal"
            value={editFields.updatedAt || "Not updated"}
          />
        </DialogContent>
        <DialogActions sx={{ bgcolor: "#181818" }}>
          <Button onClick={handleCloseModal} color="primary" variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyReceivedSalaryHistory;