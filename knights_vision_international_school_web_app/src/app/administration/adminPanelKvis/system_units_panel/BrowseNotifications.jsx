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
import { Notifications, Add, RotateRight, Delete } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import BrowseNotificationsDialog from "./dialogs/BrowseNotificationsDialog";

const drawerWidth = 280;
const appBarHeight = 80;

const BrowseNotifications = () => {
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [openInsertion, setOpenInsertion] = useState(false);
  const [editFields, setEditFields] = useState({});

  const fetchNotifications = async () => {
    setApiLoading(true);
    try {
      const response = await axios.get("/api/notifications");
      setNotifications(response.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to fetch notifications.");
      toast.error("Failed to fetch notifications.");
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
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
    fetchNotifications();
    setEditFields({});
  };

  const handleInsertionOpenModal = (notification = {}) => {
    setEditFields({
      id: notification.id || null,
      userId: notification.userId || "",
      message: notification.message || "",
      type: notification.type || "",
      status: notification.status || "",
    });
    setOpenInsertion(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      setApiLoading(true);
      try {
        await axios.delete(`/api/notifications/${id}`);
        toast.success("Notification deleted successfully!");
        fetchNotifications();
      } catch (err) {
        console.error("Delete Error:", err.response?.data || err.message);
        toast.error("Failed to delete notification.");
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
        <Notifications sx={{ mr: 1 }} />
        <ListItemText primary={<Typography variant="h6">Browse Notifications</Typography>} />
        <Button
          onClick={() => handleInsertionOpenModal()}
          variant="contained"
          color="success"
          startIcon={<Add />}
          sx={{ mr: 1 }}
        >
          Add Notification
        </Button>
        <Button
          onClick={fetchNotifications}
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
          <Typography variant="body2" sx={{ flex: 2, fontWeight: "bold", color: "#fff" }}>
            Message
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Type
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
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  p: 1,
                  bgcolor: "#181818",
                  mb: 1,
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" sx={{ flex: 2, color: "#fff" }}>
                  {notification.message}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {notification.type}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {notification.status}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleInsertionOpenModal(notification)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDelete(notification.id)}
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

      <BrowseNotificationsDialog
        openInsertion={openInsertion}
        handleCloseModal={handleCloseModal}
        handleSaveAndCloseModal={handleSaveAndCloseModal}
        editFields={editFields}
        setEditFields={setEditFields}
        fetchNotifications={fetchNotifications}
      />
    </Box>
  );
};

export default BrowseNotifications;