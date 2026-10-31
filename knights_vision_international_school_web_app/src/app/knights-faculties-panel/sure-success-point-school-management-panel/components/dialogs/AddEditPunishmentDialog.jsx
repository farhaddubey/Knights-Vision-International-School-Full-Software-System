"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  MenuItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Add as AddIcon, Gavel as GavelIcon, Close } from "@mui/icons-material";
import { toast } from "react-toastify";

const drawerWidth = 280;
const appBarHeight = 64;

const textFieldStyles = {
  "& .MuiInputBase-input": { color: "#fff" },
  "& .MuiInputLabel-root": { color: "#aaa" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#555" },
    "&:hover fieldset": { borderColor: "#777" },
    "&.Mui-focused fieldset": { borderColor: "#00c757" },
  },
  mb: 2,
};

const AddEditPunishmentDialog = ({ open, onClose, classId, className, punishment }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: 1,
    type: "BEHAVIORAL",
  });

  const classMap = {
    'v': { id: 4, name: 'Class V' },
    'vi': { id: 5, name: 'Class VI' },
    'vii': { id: 6, name: 'Class VII' },
    'viii': { id: 7, name: 'Class VIII' },
    'ix': { id: 8, name: 'Class IX' },
    'x': { id: 9, name: 'Class X' },
  };

  const classInfo = classMap[className.toLowerCase()] || { id: 4, name: 'Class V' };

  useEffect(() => {
    if (punishment) {
      setFormData({
        title: punishment.title || "",
        description: punishment.description || "",
        severity: punishment.severity || 1,
        type: punishment.type || "BEHAVIORAL",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        severity: 1,
        type: "BEHAVIORAL",
      });
    }
  }, [punishment]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const data = { ...formData, classId };
      if (punishment) {
        await axios.put(`/api/Punishments/${className.toLowerCase()}/punishments`, { ...data, id: punishment.id });
        toast.success("Punishment updated successfully!");
      } else {
        await axios.post(`/api/Punishments/${className.toLowerCase()}/punishments`, data);
        toast.success("Punishment added successfully!");
      }
      onClose();
    } catch (err) {
      console.error(`Error ${punishment ? 'updating' : 'adding'} punishment:`, err.message);
      toast.error(`Failed to ${punishment ? 'update' : 'add'} punishment.`);
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
      onClose={onClose}
      fullScreen
    >
      <ListItemButton
        sx={{
          backgroundColor: "#009688",
          color: "#fff",
          "&:hover": { backgroundColor: "#009688" },
        }}
      >
        <ListItemIcon>
          <GavelIcon />
        </ListItemIcon>
        <ListItemText
          sx={{ color: "#fff" }}
          primary={`${punishment ? 'Edit' : 'Add'} Punishment for ${classInfo.name}`}
        />
        <Button
          onClick={onClose}
          variant="outlined"
          color="error"
          sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
        >
          <Close />
        </Button>
      </ListItemButton>
      <DialogContent sx={{ bgcolor: "#000", color: "#fff" }}>
        <Box sx={{ p: 2, bgcolor: "#222", borderRadius: 1 }}>
          <TextField
            label="Title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            sx={{ ...textFieldStyles, width: "300px" }}
            required
          />
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            sx={{ ...textFieldStyles, width: "400px" }}
            multiline
            rows={4}
            required
          />
          <TextField
            select
            label="Severity"
            value={formData.severity}
            onChange={(e) => handleInputChange("severity", parseInt(e.target.value))}
            sx={{ ...textFieldStyles, width: "150px" }}
          >
            {[1, 2, 3, 4, 5].map((level) => (
              <MenuItem key={level} value={level}>
                {level}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Type"
            value={formData.type}
            onChange={(e) => handleInputChange("type", e.target.value)}
            sx={{ ...textFieldStyles, width: "200px" }}
          >
            {["BEHAVIORAL", "ACADEMIC", "PHYSICAL_TASK", "PRIVILEGE_LOSS", "COUNSELING"].map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions sx={{ bgcolor: "#000" }}>
        <Button onClick={onClose} variant="contained" color="error">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{ bgcolor: "#00c757", "&:hover": { bgcolor: "#00a550" } }}
          disabled={!formData.title || !formData.description}
        >
          {punishment ? 'Update' : 'Save'} Punishment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEditPunishmentDialog;