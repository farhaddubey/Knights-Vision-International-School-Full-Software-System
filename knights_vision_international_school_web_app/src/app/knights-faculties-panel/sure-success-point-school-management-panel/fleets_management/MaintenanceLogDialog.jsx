import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { toast } from "react-toastify";

const MaintenanceLogDialog = ({
  open,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
}) => {
  const [errors, setErrors] = useState({});
  const [vehicles, setVehicles] = useState([]);

  // Fetch available vehicles for the vehicleId dropdown
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get("/api/fleet-vehicles");
        setVehicles(response.data);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        toast.error("Failed to fetch vehicles.");
      }
    };
    if (open) {
      fetchVehicles();
    }
  }, [open]);

  // Format date for datetime-local input
  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:mm
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditFields((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateFields = () => {
    const newErrors = {};
    if (!editFields.vehicleId) newErrors.vehicleId = "Vehicle ID is required";
    if (!editFields.serviceType) newErrors.serviceType = "Service type is required";
    if (!editFields.serviceDate) newErrors.serviceDate = "Service date is required";
    if (editFields.cost && isNaN(parseFloat(editFields.cost)))
      newErrors.cost = "Cost must be a valid number";
    if (editFields.odoAtService && !Number.isInteger(parseInt(editFields.odoAtService)))
      newErrors.odoAtService = "Odometer reading must be an integer";
    return newErrors;
  };

  const handleSave = async () => {
    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const payload = {
        ...editFields,
        cost: editFields.cost ? parseFloat(editFields.cost) : undefined,
        odoAtService: editFields.odoAtService ? parseInt(editFields.odoAtService) : undefined,
        serviceDate: editFields.serviceDate ? new Date(editFields.serviceDate).toISOString() : undefined,
        nextDueDate: editFields.nextDueDate ? new Date(editFields.nextDueDate).toISOString() : undefined,
      };

      if (editFields.id) {
        // Update existing log
        await axios.put(`/api/maintenance-logs/${editFields.id}`, payload);
        toast.success("Maintenance log updated successfully!");
      } else {
        // Create new log
        await axios.post("/api/maintenance-logs", payload);
        toast.success("Maintenance log created successfully!");
      }
      handleSaveAndCloseModal();
    } catch (err) {
      console.error("Error saving maintenance log:", err);
      const errorMessage =
        err.response?.data?.error || "Failed to save maintenance log.";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      PaperProps={{
        sx: {
          backgroundColor: "#181818",
          color: "#fff",
          borderRadius: 2,
          minWidth: "400px",
        },
      }}
    >
      <DialogTitle sx={{ bgcolor: "#333", color: "#fff" }}>
        {editFields.id ? "Edit Maintenance Log" : "Add Maintenance Log"}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControl
            fullWidth
            error={!!errors.vehicleId}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#555" },
                "&:hover fieldset": { borderColor: "#888" },
                "&.Mui-focused fieldset": { borderColor: "#b71c1c" },
              },
            }}
          >
            <InputLabel sx={{ color: "#fff" }}>Vehicle ID</InputLabel>
            <Select
              name="vehicleId"
              value={editFields.vehicleId || ""}
              onChange={handleChange}
              label="Vehicle ID"
              sx={{ color: "#fff" }}
            >
              {vehicles.map((vehicle) => (
                <MenuItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.id}
                </MenuItem>
              ))}
            </Select>
            {errors.vehicleId && (
              <Typography color="error" variant="caption">
                {errors.vehicleId}
              </Typography>
            )}
          </FormControl>
          <TextField
            label="Service Type"
            name="serviceType"
            value={editFields.serviceType || ""}
            onChange={handleChange}
            fullWidth
            error={!!errors.serviceType}
            helperText={errors.serviceType}
            InputLabelProps={{ style: { color: "#fff" } }}
            InputProps={{ style: { color: "#fff" } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#555" },
                "&:hover fieldset": { borderColor: "#888" },
                "&.Mui-focused fieldset": { borderColor: "#b71c1c" },
              },
            }}
          />
          <TextField
            label="Description (Optional)"
            name="description"
            value={editFields.description || ""}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            InputLabelProps={{ style: { color: "#fff" } }}
            InputProps={{ style: { color: "#fff" } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#555" },
                "&:hover fieldset": { borderColor: "#888" },
                "&.Mui-focused fieldset": { borderColor: "#b71c1c" },
              },
            }}
          />
          <TextField
            label="Service Date"
            name="serviceDate"
            type="datetime-local"
            value={formatDateForInput(editFields.serviceDate)}
            onChange={handleChange}
            fullWidth
            error={!!errors.serviceDate}
            helperText={errors.serviceDate}
            InputLabelProps={{ style: { color: "#fff" }, shrink: true }}
            InputProps={{ style: { color: "#fff" } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#555" },
                "&:hover fieldset": { borderColor: "#888" },
                "&.Mui-focused fieldset": { borderColor: "#b71c1c" },
              },
            }}
          />
          <TextField
            label="Service Center (Optional)"
            name="serviceCenter"
            value={editFields.serviceCenter || ""}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ style: { color: "#fff" } }}
            InputProps={{ style: { color: "#fff" } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#555" },
                "&:hover fieldset": { borderColor: "#888" },
                "&.Mui-focused fieldset": { borderColor: "#b71c1c" },
              },
            }}
          />
          <TextField
            label="Cost (Optional)"
            name="cost"
            type="number"
            value={editFields.cost || ""}
            onChange={handleChange}
            fullWidth
            error={!!errors.cost}
            helperText={errors.cost}
            InputLabelProps={{ style: { color: "#fff" } }}
            InputProps={{ style: { color: "#fff" } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#555" },
                "&:hover fieldset": { borderColor: "#888" },
                "&.Mui-focused fieldset": { borderColor: "#b71c1c" },
              },
            }}
          />
          <TextField
            label="Next Due Date (Optional)"
            name="nextDueDate"
            type="datetime-local"
            value={formatDateForInput(editFields.nextDueDate)}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ style: { color: "#fff" }, shrink: true }}
            InputProps={{ style: { color: "#fff" } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#555" },
                "&:hover fieldset": { borderColor: "#888" },
                "&.Mui-focused fieldset": { borderColor: "#b71c1c" },
              },
            }}
          />
          <TextField
            label="Odometer at Service (Optional)"
            name="odoAtService"
            type="number"
            value={editFields.odoAtService || ""}
            onChange={handleChange}
            fullWidth
            error={!!errors.odoAtService}
            helperText={errors.odoAtService}
            InputLabelProps={{ style: { color: "#fff" } }}
            InputProps={{ style: { color: "#fff" } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#555" },
                "&:hover fieldset": { borderColor: "#888" },
                "&.Mui-focused fieldset": { borderColor: "#b71c1c" },
              },
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ bgcolor: "#333", p: 2 }}>
        <Button
          onClick={handleCloseModal}
          sx={{ color: "#fff", "&:hover": { bgcolor: "#555" } }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            bgcolor: "#b71c1c",
            "&:hover": { bgcolor: "#d32f2f" },
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MaintenanceLogDialog;