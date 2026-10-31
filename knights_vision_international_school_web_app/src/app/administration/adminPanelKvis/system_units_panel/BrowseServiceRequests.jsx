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
import { Assignment, Add, RotateRight } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import BrowseServiceRequestsDialog from "./dialogs/BrowseServiceRequestsDialog";

const drawerWidth = 280;
const appBarHeight = 64;

const BrowseServiceRequests = () => {
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [openInsertion, setOpenInsertion] = useState(false);
  const [editFields, setEditFields] = useState({});

  const fetchRequests = async () => {
    setApiLoading(true);
    try {
      const response = await axios.get("/api/requests");
      setRequests(response.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to fetch requests.");
      toast.error("Failed to fetch requests.");
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
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
    fetchRequests();
    setEditFields({});
  };

  const handleInsertionOpenModal = (request = {}) => {
    setEditFields({
      id: request.id ?? null,
      branchId: request.branchId ?? "",
      title: request.title ?? "",
      description: request.description ?? "",
      category: request.category ?? "",
      priority: request.priority ?? "NORMAL",
      status: request.status ?? "PENDING",
      decisionNote: request.decisionNote ?? "",
    });
    setOpenInsertion(true);
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
        <Assignment sx={{ mr: 1 }} />
        <ListItemText primary="Browse Service Requests" />
        <Button
          onClick={() => handleInsertionOpenModal()}
          variant="contained"
          color="primary"
          startIcon={<Add />}
          sx={{ mr: 1 }}
        >
          Add Request
        </Button>
        <Button
          onClick={fetchRequests}
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
            Request
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Category
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Status
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Branch
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
            {requests.map((request) => (
              <ListItem
                key={request.id}
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
                  {request.title ?? "N/A"}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {request.category ?? "N/A"}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {request.status}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {request.branch?.name ?? "School-wide"}
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleInsertionOpenModal(request)}
                >
                  Edit
                </Button>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      <BrowseServiceRequestsDialog
        openInsertion={openInsertion}
        handleSaveAndCloseModal={handleSaveAndCloseModal}
        handleCloseModal={handleCloseModal}
        editFields={editFields}
        setEditFields={setEditFields}
        fetchRequests={fetchRequests}
      />
    </Box>
  );
};

export default BrowseServiceRequests;
