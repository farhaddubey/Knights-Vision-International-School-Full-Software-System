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
  LinearProgress,
} from "@mui/material";
import { Schedule, Add, RotateRight, Delete } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import BrowseOperatingHoursDialog from "./dialogs/BrowseOperatingHoursDialog";

const drawerWidth = 280;
const appBarHeight = 80;

const BrowseOperatingHours = () => {
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [operatingHours, setOperatingHours] = useState([]);
  const [openInsertion, setOpenInsertion] = useState(false);
  const [editFields, setEditFields] = useState({});

  const fetchOperatingHours = async () => {
    setApiLoading(true);
    try {
      const response = await axios.get("/api/operating-hours");
      setOperatingHours(response.data);
    } catch (err) {
      console.error("Error fetching operating hours:", err);
      setError("Failed to fetch operating hours.");
      toast.error("Failed to fetch operating hours.");
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  };

  useEffect(() => {
    fetchOperatingHours();
  }, []);

  const handleCloseModal = () => {
    const userConfirmed = window.confirm(
      "Are you sure you want to close the modal? Unsaved changes will be lost."
    );
    if (userConfirmed) {
      setOpenInsertion(false);
      setEditFields({});
    }
  };

  const handleSaveAndCloseModal = () => {
    setOpenInsertion(false);
    fetchOperatingHours();
    setEditFields({});
  };

  const handleInsertionOpenModal = (hours = {}) => {
    setEditFields({
      id: hours.id ?? null,
      serviceCenterId: hours.serviceCenterId ?? "",
      dayOfWeek: hours.dayOfWeek ?? "",
      openingTime: hours.openingTime ?? "",
      closingTime: hours.closingTime ?? "",
    });
    setOpenInsertion(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this operating hour?")) {
      setApiLoading(true);
      try {
        await axios.delete(`/api/operating-hours/${id}`);
        toast.success("Operating hour deleted successfully!");
        fetchOperatingHours();
      } catch (err) {
        console.error("Delete Error:", err);
        toast.error("Failed to delete operating hour.");
      } finally {
        setApiLoading(false);
      }
    }
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
      {apiLoading && <LinearProgress sx={{ width: "100%", position: "absolute", top: 0 }} />}
      <ListItem sx={{ backgroundColor: "#b71c1c", color: "#fff" }}>
        <Schedule sx={{ mr: 1 }} />
        <ListItemText primary="Browse Operating Hours" />
        <Button
          onClick={() => handleInsertionOpenModal()}
          variant="contained"
          color="primary"
          startIcon={<Add />}
          sx={{ mr: 1 }}
        >
          Add Operating Hour
        </Button>
        <Button
          onClick={fetchOperatingHours}
          variant="outlined"
          sx={{ color: "#00c853", borderColor: "#00c853" }}
          startIcon={<RotateRight />}
        >
          Refresh
        </Button>
      </ListItem>

      <Box sx={{ bgcolor: "#181818", borderRadius: 2 }}>
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
            Service Center
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Day
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Opening Time
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Closing Time
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Actions
          </Typography>
        </Box>

        <Box
          sx={{
            maxHeight: "700px",
            overflowY: "auto",
            bgcolor: "#121212",
            borderRadius: 1,
            paddingBottom: 10,
          }}
        >
          <List>
            {operatingHours.map((hours) => (
              <ListItem
                key={hours.id}
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
                  {hours.serviceCenter?.name ?? "N/A"}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {hours.dayOfWeek}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {hours.openingTime}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {hours.closingTime}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleInsertionOpenModal(hours)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDelete(hours.id)}
                    startIcon={<Delete />}
                  >
                    Delete
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      <BrowseOperatingHoursDialog
        openInsertion={openInsertion}
        handleSaveAndCloseModal={handleSaveAndCloseModal}
        handleCloseModal={handleCloseModal}
        editFields={editFields}
        setEditFields={setEditFields}
        fetchOperatingHours={fetchOperatingHours}
      />
    </Box>
  );
};

export default BrowseOperatingHours;