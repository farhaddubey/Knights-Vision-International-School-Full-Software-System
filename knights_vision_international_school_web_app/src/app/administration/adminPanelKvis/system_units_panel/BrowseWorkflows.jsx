import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  CircularProgress,
  LinearProgress,
  ListItemText,
} from "@mui/material";
import { Settings, Add, RotateRight, Delete } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import BrowseWorkflowsDialog from "./dialogs/BrowseWorkflowsDialog";

const drawerWidth = 280;
const appBarHeight = 80;

const BrowseWorkflows = () => {
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [openInsertion, setOpenInsertion] = useState(false);
  const [editFields, setEditFields] = useState({});

  const fetchWorkflows = async () => {
    setApiLoading(true);
    try {
      const response = await axios.get("/api/workflows");
      setWorkflows(response.data);
    } catch (err) {
      console.error("Error fetching workflows:", err);
      setError("Failed to fetch workflows.");
      toast.error("Failed to fetch workflows.");
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
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
    fetchWorkflows();
    setEditFields({});
  };

  const handleInsertionOpenModal = (workflow = {}) => {
    setEditFields({
      id: workflow.id || null,
      serviceId: workflow.serviceId || "",
      stepNumber: workflow.stepNumber || "",
      title: workflow.title || "",
      description: workflow.description || "",
      status: workflow.status || "PENDING",
      assignedToId: workflow.assignedToId || "",
      deadline: workflow.deadline ? new Date(workflow.deadline).toISOString().split("T")[0] : "",
      completedAt: workflow.completedAt ? new Date(workflow.completedAt).toISOString().split("T")[0] : "",
      remarks: workflow.remarks || "",
      isMandatory: workflow.isMandatory !== undefined ? workflow.isMandatory : true,
      serviceName: workflow.service?.name || "",
      assignedToUsername: workflow.assignedTo?.username || "",
    });
    setOpenInsertion(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this workflow?")) {
      setApiLoading(true);
      try {
        await axios.delete(`/api/workflows/${id}`);
        toast.success("Workflow deleted successfully!");
        fetchWorkflows();
      } catch (err) {
        console.error("Delete Error:", err.response?.data || err.message);
        toast.error("Failed to delete workflow.");
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
        <Settings sx={{ mr: 1 }} />
        <ListItemText primary={<Typography variant="h6">BROWSE LEGAL WORKFLOWS</Typography>} />
        <Button
          onClick={() => handleInsertionOpenModal()}
          variant="contained"
          color="success"
          startIcon={<Add />}
          sx={{ mr: 1 }}
        >
          Add Workflow
        </Button>
        <Button
          onClick={fetchWorkflows}
          variant="outlined"
          sx={{ color: "#00c853", borderColor: "#00c853" }}
          startIcon={<RotateRight />}
        >
          Refresh
        </Button>
      </ListItem>

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
          {["Service", "Step", "Title", "Description", "Status", "Assigned To", "Deadline", "Actions"].map(
            (label, idx) => (
              <Typography
                key={idx}
                variant="body2"
                sx={{ flex: label === "Title" || label === "Description" ? 2 : 1, fontWeight: "bold", color: "#fff" }}
              >
                {label}
              </Typography>
            )
          )}
        </Box>

        {/* Workflow Items */}
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
            {workflows.map((workflow) => (
              <ListItem
                key={workflow.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  p: 1,
                  bgcolor: "#181818",
                  mb: 1,
                  borderRadius: 1,
                }}
              >
                <Typography sx={{ flex: 1, color: "#fff" }}>
                  {workflow.service?.name || "N/A"}
                </Typography>
                <Typography sx={{ flex: 1, color: "#fff" }}>
                  {workflow.stepNumber}
                </Typography>
                <Typography sx={{ flex: 2, color: "#fff" }}>
                  {workflow.title}
                </Typography>
                <Typography sx={{ flex: 2, color: "#fff" }}>
                  {workflow.description || "N/A"}
                </Typography>
                <Typography sx={{ flex: 1, color: "#fff" }}>
                  {workflow.status}
                </Typography>
                <Typography sx={{ flex: 1, color: "#fff" }}>
                  {workflow.assignedTo?.username || "Unassigned"}
                </Typography>
                <Typography sx={{ flex: 1, color: "#fff" }}>
                  {workflow.deadline ? new Date(workflow.deadline).toLocaleDateString() : "N/A"}
                </Typography>
                <Box sx={{ flex: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleInsertionOpenModal(workflow)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDelete(workflow.id)}
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

      <BrowseWorkflowsDialog
        open={openInsertion}
        handleCloseModal={handleCloseModal}
        handleSaveAndCloseModal={handleSaveAndCloseModal}
        editFields={editFields}
        setEditFields={setEditFields}
        fetchWorkflows={fetchWorkflows}
      />
    </Box>
  );
};

export default BrowseWorkflows;
