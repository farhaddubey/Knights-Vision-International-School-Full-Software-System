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
import { LocalShipping, Add, RotateRight, Delete } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import BrowseDoorToDoorOperationsDialog from "./dialogs/BrowseDoorToDoorOperationsDialog";

const drawerWidth = 280;
const appBarHeight = 80;

const BrowseDoorToDoorOperations = () => {
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [operations, setOperations] = useState([]);
  const [openInsertion, setOpenInsertion] = useState(false);
  const [editFields, setEditFields] = useState({});

  const fetchOperations = async () => {
    setApiLoading(true);
    try {
      const response = await axios.get("/api/door-to-door-operations");
      setOperations(response.data);
    } catch (err) {
      console.error("Error fetching operations:", err);
      setError("Failed to fetch operations.");
      toast.error("Failed to fetch operations.");
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  };

  useEffect(() => {
    fetchOperations();
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
    fetchOperations();
    setEditFields({});
  };

  const handleInsertionOpenModal = (operation = {}) => {
    setEditFields({
      id: operation.id ?? null,
      customerId: operation.customerId ?? "",
      requestId: operation.requestId ?? "",
      pickupAddress: operation.pickupAddress ?? "",
      status: operation.status ?? "",
    });
    setOpenInsertion(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this operation?")) {
      setApiLoading(true);
      try {
        await axios.delete(`/api/door-to-door-operations/${id}`);
        toast.success("Operation deleted successfully!");
        fetchOperations();
      } catch (err) {
        console.error("Delete Error:", err);
        toast.error("Failed to delete operation.");
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
        <LocalShipping sx={{ mr: 1 }} />
        <ListItemText primary="Browse Door-to-Door Operations" />
        <Button
          onClick={() => handleInsertionOpenModal()}
          variant="contained"
          color="primary"
          startIcon={<Add />}
          sx={{ mr: 1 }}
        >
          Add Operation
        </Button>
        <Button
          onClick={fetchOperations}
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
            Customer
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Request
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Pickup Address
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Status
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
            {operations.map((operation) => (
              <ListItem
                key={operation.id}
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
                  {operation.customer?.name ?? "N/A"}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {operation.request?.id ?? "N/A"}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {operation.pickupAddress}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {operation.status}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleInsertionOpenModal(operation)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDelete(operation.id)}
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

      <BrowseDoorToDoorOperationsDialog
        openInsertion={openInsertion}
        handleSaveAndCloseModal={handleSaveAndCloseModal}
        handleCloseModal={handleCloseModal}
        editFields={editFields}
        setEditFields={setEditFields}
        fetchOperations={fetchOperations}
      />
    </Box>
  );
};

export default BrowseDoorToDoorOperations;