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
import DepotDialog from "./DepotDialog";

const appBarHeight = 64; // Example AppBar height

interface Depot {
  id: number;
  name: string;
  location: string;
  address?: string;
  contactNumber?: string;
}

const Depots = () => {
  const [depots, setDepots] = useState<Depot[]>([]);
  const [filteredDepots, setFilteredDepots] = useState<Depot[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editFields, setEditFields] = useState<Partial<Depot>>({});

  const fetchDepots = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/depots");
      setDepots(response.data);
      setFilteredDepots(response.data); // Initialize filteredDepots with all depots
    } catch (err) {
      console.error("Error fetching depots:", err);
      setError("Failed to fetch depots.");
      toast.error("Failed to fetch depots.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepots();
  }, []);

  // Handle search filtering
  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = depots.filter(
      (depot) =>
        depot.name?.toLowerCase().includes(lowerCaseQuery) ||
        depot.location?.toLowerCase().includes(lowerCaseQuery) ||
        depot.address?.toLowerCase().includes(lowerCaseQuery) ||
        depot.contactNumber?.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredDepots(filtered);
  }, [searchQuery, depots]);

  const handleOpenModal = (item: Partial<Depot> = {}) => {
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
    fetchDepots(); // Refresh depots after save
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
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <ListItemIcon>
          <Inventory sx={{ color: "#fff" }} />
        </ListItemIcon>
        <TextField
          size="small"
          variant="outlined"
          placeholder="Search Depots"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            width: "200px",
            bgcolor: "#333",
            borderRadius: 1,
            "& .MuiOutlinedInput-root": {
              color: "#fff",
              "& fieldset": { borderColor: "#555" },
              "&:hover fieldset": { borderColor: "#777" },
              "&.Mui-focused fieldset": { borderColor: "#00c853" },
            },
            "& .MuiInputBase-input": { padding: "6px 12px" },
          }}
        />
        <ListItemText primary="DEPOTS MANAGEMENT PANEL" />
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenModal()}
          startIcon={<AddBusiness />}
        >
          ADD DEPOT
        </Button>
        <Button
          onClick={fetchDepots}
          variant="outlined"
          sx={{
            position: "absolute",
            right: 160,
            color: "#00c853",
            borderColor: "#00c853",
            bgcolor: "#212121",
          }}
        >
          <RotateRight />
        </Button>
      </ListItemButton>

      <Box sx={{ bgcolor: "#181818", borderRadius: 1 }}>
        {/* Header Row */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
            p: 1,
            bgcolor: "#333",
            borderRadius: 1,
            position: "sticky",
            top: 0,
            zIndex: 1,
            gap: 1,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: "bold", color: "#fff" }}>
            Name
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: "bold", color: "#fff" }}>
            Location
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: "bold", color: "#fff" }}>
            Address
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: "bold", color: "#fff" }}>
            Contact Number
          </Typography>
          <Box />
        </Box>

        {/* Data Rows */}
        <Box sx={{ maxHeight: "700px", overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
          <List>
            {filteredDepots.map((depot) => (
              <ListItem
                key={depot.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
                  p: 1,
                  bgcolor: "#181818",
                  mb: 1,
                  borderRadius: 1,
                  gap: 1,
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" sx={{ color: "#fff" }}>
                  {depot.name}
                </Typography>
                <Typography variant="body2" sx={{ color: "#fff" }}>
                  {depot.location}
                </Typography>
                <Typography variant="body2" sx={{ color: "#fff" }}>
                  {depot.address || "N/A"}
                </Typography>
                <Typography variant="body2" sx={{ color: "#fff" }}>
                  {depot.contactNumber || "N/A"}
                </Typography>
                <Box>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleOpenModal(depot)}
                  >
                    EDIT
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      <DepotDialog
        open={open}
        handleCloseModal={handleCloseModal}
        handleSaveAndCloseModal={handleSaveAndCloseModal}
        editFields={editFields}
        setEditFields={setEditFields}
      />
    </Box>
  );
};

export default Depots;