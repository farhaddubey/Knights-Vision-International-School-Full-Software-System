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
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { toast } from "react-toastify";
import { AddAlert, EmojiEmotions, RotateRight } from "@mui/icons-material";
const drawerWidth = 280;
const appBarHeight = 64; // Example AppBar height

interface Brand {
  id?: number;
  name?: string;
  slug?: string;
  logoUrl?: string;
  description?: string;
}

interface BrandsDialogProps {
  open: boolean;
  handleCloseModal: () => void;
  handleSaveAndCloseModal: () => void;
  editFields: Partial<Brand>;
  setEditFields: React.Dispatch<React.SetStateAction<Partial<Brand>>>;
}

const BrandsDialog: React.FC<BrandsDialogProps> = ({
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
    if (!editFields.slug) newErrors.slug = "Slug is required";
    if (editFields.logoUrl && !/^https?:\/\/.+\..+/.test(editFields.logoUrl))
      newErrors.logoUrl = "Invalid URL format";
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
        // Update existing brand
        await axios.put(`/api/brands/${editFields.id}`, editFields);
        toast.success("Brand updated successfully!");
      } else {
        // Create new brand
        await axios.post("/api/brands", editFields);
        toast.success("Brand created successfully!");
      }
      handleSaveAndCloseModal();
    } catch (err: any) {
      console.error("Error saving brand:", err);
      const errorMessage =
        err.response?.data?.error || "Failed to save brand.";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      fullScreen
        sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        transform: "translate(0, 0)",
        backgroundColor:"#000"
      }}
    >
            <ListItemButton sx={{ backgroundColor: "#1a237e", color: "#fff", "&:hover": { backgroundColor: "#1a237e" } }}>
              <ListItemIcon>
                <EmojiEmotions sx={{ color: "#fff" }} />
              </ListItemIcon>
              <ListItemText sx={{ color: "#fff" }} primary="Add Employee"/>
                <Button variant="contained" color="success">
                        <AddAlert/>         {editFields.id ? "Edit Brand" : "Add Brand"}

                      </Button>
                           <Button variant="outlined" sx={{ position: "absolute", right: 165, top: 8, color: "#00c853",  bgcolor:"#212121" }}>
                              <RotateRight/>
                          </Button>
            </ListItemButton>
        

    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#000", color: "#fff",  overflowY: "auto", gap:2, p:2 }}>
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
          <TextField
            label="Slug"
            name="slug"
            value={editFields.slug || ""}
            onChange={handleChange}
            fullWidth
            error={!!errors.slug}
            helperText={errors.slug}
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
            label="Logo URL (Optional)"
            name="logoUrl"
            value={editFields.logoUrl || ""}
            onChange={handleChange}
            fullWidth
            error={!!errors.logoUrl}
            helperText={errors.logoUrl}
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
            rows={4}
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

export default BrandsDialog;