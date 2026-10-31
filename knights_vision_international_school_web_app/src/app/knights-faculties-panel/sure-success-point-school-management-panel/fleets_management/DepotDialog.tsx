import React, { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import SchoolBranchSelect from "@/components/sure-success-point-school/selectors/SchoolBranchSelect";

interface Depot {
  id?: number;
  name?: string;
  location?: string;
  address?: string;
  contactNumber?: string;
  branchId?: number | string;
}

interface DepotDialogProps {
  open: boolean;
  handleCloseModal: () => void;
  handleSaveAndCloseModal: () => void;
  editFields: Partial<Depot>;
  setEditFields: React.Dispatch<React.SetStateAction<Partial<Depot>>>;
}

const DepotDialog: React.FC<DepotDialogProps> = ({
  open,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFields((prev) => ({ ...prev, [name]: value }));
    // Clear error for the field being edited
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};
    if (!editFields.name) newErrors.name = "Name is required";
    if (!editFields.location) newErrors.location = "Location is required";
    if (editFields.contactNumber && !/^\+?\d{10,15}$/.test(editFields.contactNumber))
      newErrors.contactNumber = "Invalid phone number format";
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
        // Update existing depot
        await axios.put(`/api/depots/${editFields.id}`, editFields);
        toast.success("Depot updated successfully!");
      } else {
        // Create new depot
        await axios.post("/api/depots", editFields);
        toast.success("Depot created successfully!");
      }
      handleSaveAndCloseModal();
    } catch (err: any) {
      console.error("Error saving depot:", err);
      const errorMessage =
        err.response?.data?.error || "Failed to save depot.";
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
        {editFields.id ? "Edit Depot" : "Add Depot"}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Name"
            name="name"
            value={editFields.name || ""}
            onChange={handleChange}
            fullWidth
            error={!!errors.name}
            helperText={errors.name}
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
          {!editFields.id && <SchoolBranchSelect selectedBranch={editFields.branchId || ""} setSelectedBranch={(branchId: number) => setEditFields((prev) => ({ ...prev, branchId }))} />}
          <TextField
            label="Location"
            name="location"
            value={editFields.location || ""}
            onChange={handleChange}
            fullWidth
            error={!!errors.location}
            helperText={errors.location}
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
            label="Address (Optional)"
            name="address"
            value={editFields.address || ""}
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
            label="Contact Number (Optional)"
            name="contactNumber"
            value={editFields.contactNumber || ""}
            onChange={handleChange}
            fullWidth
            error={!!errors.contactNumber}
            helperText={errors.contactNumber}
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

export default DepotDialog;
