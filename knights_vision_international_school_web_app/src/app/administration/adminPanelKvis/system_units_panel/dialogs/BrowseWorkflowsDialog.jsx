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
  LinearProgress,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  ListItemText,
} from "@mui/material";
import { Add, RotateRight, Close } from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";
import textFieldStyles from "../../../../mui_styles/TextFieldStyles";

const drawerWidth = 280;
const appBarHeight = 80;

const BrowseWorkflowsDialog = ({
  open,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchWorkflows,
}) => {
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);

  const isEditing = !!editFields.id;

  useEffect(() => {
    const fetchRelations = async () => {
      try {
        const [servicesRes, usersRes] = await Promise.all([
          axios.get("/api/legal-services"),
          axios.get("/api/users"),
        ]);
        setServices(servicesRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error("Error fetching relations:", err);
        setError("Failed to load services or users.");
        toast.error("Failed to load services or users.");
      }
    };
    fetchRelations();
  }, []);

  const handleSaveChanges = async () => {
    setApiLoading(true);
    try {
      const payload = {
        serviceId: parseInt(editFields.serviceId),
        stepNumber: parseInt(editFields.stepNumber),
        title: editFields.title,
        description: editFields.description || null,
        status: editFields.status,
        assignedToId: editFields.assignedToId ? parseInt(editFields.assignedToId) : null,
        deadline: editFields.deadline ? new Date(editFields.deadline).toISOString() : null,
        completedAt: editFields.completedAt ? new Date(editFields.completedAt).toISOString() : null,
        remarks: editFields.remarks || null,
        isMandatory: editFields.isMandatory,
      };

      if (isNaN(payload.serviceId) || isNaN(payload.stepNumber)) {
        throw new Error("Service ID and Step Number must be valid numbers.");
      }

      const apiUrl = isEditing ? `/api/workflows/${editFields.id}` : "/api/workflows";

      const response = isEditing
        ? await axios.put(apiUrl, payload)
        : await axios.post(apiUrl, payload);

      if (response.status === 200 || response.status === 201) {
        toast.success(isEditing ? "Workflow Updated!" : "New Workflow Added!");
        handleSaveAndCloseModal();
      }
    } catch (err) {
      console.error("Save Error:", err.response?.data || err.message);
      setError(isEditing ? "Error updating workflow." : "Error adding new workflow.");
      toast.error(err.response?.data?.error || err.message);
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
      open={open}
      onClose={handleCloseModal}
      fullScreen
    >
      {apiLoading && <LinearProgress sx={{ width: "100%", position: "absolute", top: 0 }} />}
      <ListItem sx={{ backgroundColor: "#2196f3", color: "#fff" }}>
        <ListItemIcon>
          <Add />
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography variant="h6">
              {isEditing ? "EDIT LEGAL WORKFLOW" : "ADD NEW LEGAL WORKFLOW"}
            </Typography>
          }
        />
        <Button
          onClick={fetchWorkflows}
          variant="outlined"
          sx={{ mr: 2, color: "#00c853", borderColor: "#00c853" }}
          startIcon={<RotateRight />}
        >
          Refresh
        </Button>
        <Button
          onClick={handleCloseModal}
          variant="outlined"
          sx={{ color: "#f44336", borderColor: "#f44336" }}
          startIcon={<Close />}
        >
          Close
        </Button>
      </ListItem>

      <DialogContent>
        <Box sx={{ p: 2, bgcolor: "#181818", borderRadius: 2 }}>
          <FormControl fullWidth margin="normal" sx={{ bgcolor: "#121212" }}>
            <InputLabel sx={{ color: "#fff" }}>Service</InputLabel>
            <Select
              value={editFields.serviceId || ""}
              onChange={(e) => setEditFields({ ...editFields, serviceId: e.target.value })}
              sx={{ color: "#fff", "& .MuiSvgIcon-root": { color: "#fff" } }}
            >
              {services.map((service) => (
                <MenuItem key={service.id} value={service.id}>
                  {service.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Step Number"
            name="stepNumber"
            type="number"
            fullWidth
            margin="normal"
            value={editFields.stepNumber || ""}
            onChange={(e) => setEditFields({ ...editFields, stepNumber: e.target.value })}
            sx={textFieldStyles}
          />
          <TextField
            label="Title"
            name="title"
            fullWidth
            margin="normal"
            value={editFields.title || ""}
            onChange={(e) => setEditFields({ ...editFields, title: e.target.value })}
            sx={textFieldStyles}
          />
          <TextField
            label="Description"
            name="description"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={editFields.description || ""}
            onChange={(e) => setEditFields({ ...editFields, description: e.target.value })}
            sx={textFieldStyles}
          />
          <FormControl fullWidth margin="normal" sx={{ bgcolor: "#121212" }}>
            <InputLabel sx={{ color: "#fff" }}>Status</InputLabel>
            <Select
              value={editFields.status || "PENDING"}
              onChange={(e) => setEditFields({ ...editFields, status: e.target.value })}
              sx={{ color: "#fff", "& .MuiSvgIcon-root": { color: "#fff" } }}
            >
              {["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" sx={{ bgcolor: "#121212" }}>
            <InputLabel sx={{ color: "#fff" }}>Assigned To</InputLabel>
            <Select
              value={editFields.assignedToId || ""}
              onChange={(e) => setEditFields({ ...editFields, assignedToId: e.target.value })}
              sx={{ color: "#fff", "& .MuiSvgIcon-root": { color: "#fff" } }}
            >
              <MenuItem value="">Unassigned</MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.username}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Deadline"
            name="deadline"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={editFields.deadline || ""}
            onChange={(e) => setEditFields({ ...editFields, deadline: e.target.value })}
            sx={textFieldStyles}
          />
          <TextField
            label="Completed At"
            name="completedAt"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={editFields.completedAt || ""}
            onChange={(e) => setEditFields({ ...editFields, completedAt: e.target.value })}
            sx={textFieldStyles}
          />
          <TextField
            label="Remarks"
            name="remarks"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={editFields.remarks || ""}
            onChange={(e) => setEditFields({ ...editFields, remarks: e.target.value })}
            sx={textFieldStyles}
          />
          <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
            <Typography sx={{ color: "#fff", mr: 2 }}>Mandatory</Typography>
            <Switch
              checked={editFields.isMandatory}
              onChange={(e) => setEditFields({ ...editFields, isMandatory: e.target.checked })}
              sx={{ "& .MuiSwitch-thumb": { bgcolor: "#fff" } }}
            />
          </Box>
          {error && (
            <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleCloseModal} variant="contained" color="error">
          Cancel
        </Button>
        <Button onClick={handleSaveChanges} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BrowseWorkflowsDialog;