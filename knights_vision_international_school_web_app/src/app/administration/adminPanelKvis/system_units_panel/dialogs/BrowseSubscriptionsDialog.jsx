import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  ListItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Typography,
} from "@mui/material";
import { Add, RotateRight, Close } from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";
import textFieldStyles from "../../../../mui_styles/TextFieldStyles";

const drawerWidth = 280;
const appBarHeight = 80;

const BrowseSubscriptionsDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchSubscriptions,
}) => {
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);

  const isEditing = Boolean(editFields?.id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/customers");
        setCustomers(response.data);
      } catch (err) {
        console.error("Error fetching customers:", err);
        setError("Failed to fetch customers.");
        toast.error("Failed to fetch customers.");
      }
    };
    if (openInsertion) fetchData();
  }, [openInsertion]);

  const handleSaveChanges = async () => {
    setApiLoading(true);
    try {
      const payload = {
        customerId: parseInt(editFields.customerId),
        plan: editFields.plan,
        status: editFields.status,
      };

      const apiUrl = isEditing
        ? `/api/subscriptions/${editFields.id}`
        : "/api/subscriptions";

      const response = isEditing
        ? await axios.put(apiUrl, payload)
        : await axios.post(apiUrl, payload);

      if (response.status === 200 || response.status === 201) {
        toast.success(isEditing ? "Subscription Updated!" : "New Subscription Added!");
        handleSaveAndCloseModal();
      }
    } catch (err) {
      console.error("Save Error:", err.response?.data || err.message);
      setError(isEditing ? "Error updating subscription." : "Error adding new subscription.");
      toast.error(err.response?.data?.error || "Error saving subscription.");
    } finally {
      setApiLoading(false);
    }
  };

  return (
   <Dialog
      sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        transform: "translate(0, 0)",
      }}
      open={openInsertion}
      onClose={handleCloseModal}
      fullScreen
    >
      {apiLoading && (
        <LinearProgress sx={{ width: "100%", position: "absolute", top: 0 }} />
      )}

      <ListItem sx={{ backgroundColor: "#009688", color: "#fff" }}>
        <ListItemIcon>
          <Add sx={{ color: "#fff" }} />
        </ListItemIcon>
        <ListItemText primary={isEditing ? "Edit Subscription" : "Add New Subscription"} />
        <Button
          onClick={fetchSubscriptions}
          variant="outlined"
          sx={{
            position: "absolute",
            right: 80,
            top: 8,
            color: "#00c853",
            borderColor: "#00c853",
          }}
          startIcon={<RotateRight />}
        >
          Refresh
        </Button>
        <Button
          onClick={handleCloseModal}
          variant="outlined"
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "#f44336",
            borderColor: "#f44336",
          }}
          startIcon={<Close />}
        >
          Close
        </Button>
      </ListItem>

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          height: "100%",
          backgroundColor: "#000",
          color: "#fff",
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <DialogContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                height: "100%",
                backgroundColor: "#000",
                color: "#fff",
                p: 2,
              }}
            >
              <Box sx={{ flex: 1, overflowY: "auto", pr: 1, maxHeight: "80vh" }}>
                <FormControl fullWidth margin="normal" sx={textFieldStyles}>
                  <InputLabel>Customer</InputLabel>
                  <Select
                    value={editFields.customerId ?? ""}
                    onChange={(e) =>
                      setEditFields({ ...editFields, customerId: e.target.value })
                    }
                  >
                    <MenuItem value="">Select</MenuItem>
                    {customers.map((customer) => (
                      <MenuItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Plan"
                  name="plan"
                  fullWidth
                  margin="normal"
                  value={editFields.plan ?? ""}
                  onChange={(e) =>
                    setEditFields({ ...editFields, plan: e.target.value })
                  }
                  sx={textFieldStyles}
                />

                <FormControl fullWidth margin="normal" sx={textFieldStyles}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editFields.status ?? ""}
                    onChange={(e) =>
                      setEditFields({ ...editFields, status: e.target.value })
                    }
                  >
                    <MenuItem value="">Select</MenuItem>
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {error && (
              <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>
                {error}
              </Typography>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseModal} variant="contained" color="error">
              Cancel
            </Button>
            <Button onClick={handleSaveChanges} variant="contained" color="primary">
              Save Changes
            </Button>
          </DialogActions>
        </Box>
      </Box>
    </Dialog>
  );
};

export default BrowseSubscriptionsDialog;
