import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  ListItemButton,
  ListItemIcon,
  TextField,
} from "@mui/material";
import { Inventory, RotateRight, AddBusiness } from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MaintenanceLogDialog from "./MaintenanceLogDialog";

const appBarHeight = 64; // Example AppBar height

const MaintenanceLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editFields, setEditFields] = useState({});

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/maintenance-logs");
      setLogs(response.data);
      setFilteredLogs(response.data); // Initialize filteredLogs with all logs
    } catch (err) {
      console.error("Error fetching maintenance logs:", err);
      setError("Failed to fetch maintenance logs.");
      toast.error("Failed to fetch maintenance logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Handle search filtering
  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = logs.filter(
      (log) =>
        log.vehicleId?.toLowerCase().includes(lowerCaseQuery) ||
        log.serviceType?.toLowerCase().includes(lowerCaseQuery) ||
        log.serviceCenter?.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredLogs(filtered);
  }, [searchQuery, logs]);

  const handleOpenModal = (item = {}) => {
    setEditFields(item);
    setOpen(true);
  };

  const handleCloseModal = () => {
    const userConfirmed = window.confirm(
      "Are you sure you want to close the modal? Unsaved changes will be lost."
    );
    if (userConfirmed) {
      setOpen(false);
      setEditFields({});
    }
  };

  const handleSaveAndCloseModal = () => {
    setOpen(false);
    setEditFields({});
    fetchLogs(); // Refresh logs after save
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: `calc(100vh - ${appBarHeight}px)`,
          bgcolor: "#212121",
        }}
      >
        <CircularProgress size={120} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ textAlign: "center", mt: 4, color: "#fff" }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        minWidth: `82vw`,
        backgroundColor: "#212121",
        height: `calc(100vh - ${appBarHeight}px)`,
        color: "#fff",
      }}
    >
      <ToastContainer
        position="top-right"
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
          backgroundColor: "#b71c1c",
          color: "#fff",
          "&:hover": { backgroundColor: "#b71c1c" },
          mb: 2,
          borderRadius: 1,
        }}
      >
        <ListItemIcon>
          <Inventory sx={{ color: "#fff" }} />
        </ListItemIcon>
             {/* Search Bar */}
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          label="Search Logs"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            bgcolor: "#333",
            borderRadius: 1,
            maxWidth:400,
            minWidth:200,
            mr:1,
            "& .MuiOutlinedInput-root": {
              color: "#fff",
              "& fieldset": { borderColor: "#555" },
              "&:hover fieldset": { borderColor: "#777" },
              "&.Mui-focused fieldset": { borderColor: "#00c853" },
            },
            "& .MuiInputLabel-root": { color: "#aaa" },
            "& .MuiInputLabel-root.Mui-focused": { color: "#00c853" },
          }}
        />
        <ListItemText primary="MAINTENANCE LOGS MANAGEMENT PANEL" />
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenModal()}
          startIcon={<AddBusiness />}
        >
          ADD LOG
        </Button>
        <Button
          onClick={fetchLogs}
          variant="outlined"
          sx={{
            position: "absolute",
            right: 146,
            color: "#00c853",
            borderColor: "#00c853",
            bgcolor: "#212121",
          }}
        >
          <RotateRight />
        </Button>
      </ListItemButton>

 

      <Box sx={{ bgcolor: "#181818", borderRadius: 2 }}>
        {/* Header Row */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            p: 1,
            bgcolor: "#333",
            borderRadius: 1,
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Vehicle ID
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Service Type
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Service Date
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Service Center
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Cost
          </Typography>
          <Box sx={{ flex: 1 }} />
        </Box>

        {/* Data Rows */}
        <Box sx={{ maxHeight: "700px", overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
          <List>
            {filteredLogs.map((log) => (
              <ListItem
                key={log.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  p: 1,
                  bgcolor: "#181818",
                  mb: 1,
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {log.vehicleId}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {log.serviceType}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {new Date(log.serviceDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {log.serviceCenter || "N/A"}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {log.cost ? `$${log.cost.toFixed(2)}` : "N/A"}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleOpenModal(log)}
                  >
                    EDIT
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      <MaintenanceLogDialog
        open={open}
        handleCloseModal={handleCloseModal}
        handleSaveAndCloseModal={handleSaveAndCloseModal}
        editFields={editFields}
        setEditFields={setEditFields}
      />
    </Box>
  );
};

export default MaintenanceLogs;