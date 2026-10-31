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
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";

const documentTypes = [
  "RC",
  "INSURANCE",
  "FITNESS",
  "PUC",
  "PERMIT",
  "INVOICE",
  "LEASE_AGREEMENT",
  "WARRANTY",
  "SERVICE_HISTORY",
  "OTHER",
];

const VehicleDocumentDialog= ({
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

  // Updated handleChange to support both SelectChangeEvent and ChangeEvent
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name) {
      setEditFields((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateFields = () => {
    const newErrors = {};
    if (!editFields.vehicleId) newErrors.vehicleId = "Vehicle ID is required";
    if (!editFields.type) newErrors.type = "Document type is required";
    if (!editFields.documentUrl) {
      newErrors.documentUrl = "Document URL is required";
    } else if (!/^https?:\/\/.+\..+/.test(editFields.documentUrl)) {
      newErrors.documentUrl = "Invalid URL format";
    }
    return newErrors;
  };

  const handleSave = async () => {
    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (editFields.id) {
        // Update existing document
        await axios.put(`/api/vehicle-documents/${editFields.id}`, editFields);
        toast.success("Document updated successfully!");
      } else {
        // Create new document
        await axios.post("/api/vehicle-documents", editFields);
        toast.success("Document created successfully!");
      }
      handleSaveAndCloseModal();
    } catch (err) {
      console.error("Error saving document:", err);
      const errorMessage =
        err.response?.data?.error || "Failed to save document.";
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
        {editFields.id ? "Edit Vehicle Document" : "Add Vehicle Document"}
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
          <FormControl
            fullWidth
            error={!!errors.type}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#555" },
                "&:hover fieldset": { borderColor: "#888" },
                "&.Mui-focused fieldset": { borderColor: "#b71c1c" },
              },
            }}
          >
            <InputLabel sx={{ color: "#fff" }}>Document Type</InputLabel>
            <Select
              name="type"
              value={editFields.type || ""}
              onChange={handleChange}
              label="Document Type"
              sx={{ color: "#fff" }}
            >
              {documentTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
            {errors.type && (
              <Typography color="error" variant="caption">
                {errors.type}
              </Typography>
            )}
          </FormControl>
          <TextField
            label="Document URL"
            name="documentUrl"
            value={editFields.documentUrl || ""}
            onChange={handleChange}
            fullWidth
            error={!!errors.documentUrl}
            helperText={errors.documentUrl}
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
            label="File Name (Optional)"
            name="fileName"
            value={editFields.fileName || ""}
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
            label="Uploaded By (Optional)"
            name="uploadedBy"
            value={editFields.uploadedBy || ""}
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

export default VehicleDocumentDialog;