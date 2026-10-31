"use client";

import React, { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  MenuItem,
  IconButton,
  Typography,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon, CalendarToday, Close } from "@mui/icons-material";
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

const AddFoodInstructionDialog = ({ open, onClose, classId, className }) => {
  const [formData, setFormData] = useState([
    {
      title: "",
      description: "",
      foodType: "BRAIN_POWER",
      suggestedItems: [{ name: "", quantity: "", benefit: "" }],
      mediaUrl: "",
      timeOfDay: "",
      weekDay: "",
      frequency: "DAILY",
    },
  ]);

  const classMap = {
    'v': { id: 4, name: 'Class V' },
    'vi': { id: 5, name: 'Class VI' },
    'vii': { id: 6, name: 'Class VII' },
    'viii': { id: 7, name: 'Class VIII' },
    'ix': { id: 8, name: 'Class IX' },
    'x': { id: 9, name: 'Class X' },
  };

  const classInfo = classMap[className.toLowerCase()] || { id: 4, name: 'Class V' };

  const handleInputChange = (index, field, value) => {
    const newFormData = [...formData];
    newFormData[index][field] = value;
    setFormData(newFormData);
  };

  const handleSuggestedItemChange = (instrIndex, itemIndex, field, value) => {
    const newFormData = [...formData];
    newFormData[instrIndex].suggestedItems[itemIndex][field] = value;
    setFormData(newFormData);
  };

  const handleAddSuggestedItem = (instrIndex) => {
    const newFormData = [...formData];
    newFormData[instrIndex].suggestedItems.push({ name: "", quantity: "", benefit: "" });
    setFormData(newFormData);
  };

  const handleRemoveSuggestedItem = (instrIndex, itemIndex) => {
    const newFormData = [...formData];
    if (newFormData[instrIndex].suggestedItems.length > 1) {
      newFormData[instrIndex].suggestedItems = newFormData[instrIndex].suggestedItems.filter(
        (_, i) => i !== itemIndex
      );
      setFormData(newFormData);
    }
  };

  const handleAddInstruction = () => {
    setFormData([
      ...formData,
      {
        title: "",
        description: "",
        foodType: "BRAIN_POWER",
        suggestedItems: [{ name: "", quantity: "", benefit: "" }],
        mediaUrl: "",
        timeOfDay: "",
        weekDay: "",
        frequency: "DAILY",
      },
    ]);
  };

  const handleRemoveInstruction = (index) => {
    if (formData.length > 1) {
      setFormData(formData.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    try {
      const instructionsToSubmit = formData.map((instr) => ({
        classId,
        title: instr.title,
        description: instr.description || null,
        foodType: instr.foodType,
        suggestedItems: instr.suggestedItems.filter((item) => item.name),
        mediaUrl: instr.mediaUrl || null,
        timeOfDay: instr.timeOfDay || null,
        weekDay: instr.weekDay || null,
        frequency: instr.frequency,
      }));

      await axios.post(`/api/FoodInstructions/${className.toLowerCase()}/food-instructions`, { instructions: instructionsToSubmit });
      toast.success("Food instructions added successfully!");
      onClose();
      setFormData([
        {
          title: "",
          description: "",
          foodType: "BRAIN_POWER",
          suggestedItems: [{ name: "", quantity: "", benefit: "" }],
          mediaUrl: "",
          timeOfDay: "",
          weekDay: "",
          frequency: "DAILY",
        },
      ]);
    } catch (err) {
      console.error("Error adding food instructions:", err.message);
      toast.error("Failed to add food instructions.");
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
          <CalendarToday />
        </ListItemIcon>
        <ListItemText sx={{ color: "#fff" }} primary={`Add Food Instructions for ${classInfo.name}`} />
        <Button
          onClick={onClose}
          variant="outlined"
          color="error"
          sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
        >
          <Close />
        </Button>
      </ListItemButton>
      <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#000", color: "#fff" }}>
        <Box sx={{ flex: 1, overflowY: "auto", maxHeight: "80vh" }}>
          <Box>
            {formData.map((instr, instrIndex) => (
              <Box key={instrIndex} sx={{ mb: 3, p: 2, bgcolor: "#222", borderRadius: 1 }}>
                <Typography sx={{ color: "#fff", mb: 2 }}>Instruction {instrIndex + 1}</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  <TextField
                    label="Title"
                    value={instr.title}
                    onChange={(e) => handleInputChange(instrIndex, "title", e.target.value)}
                    sx={{ ...textFieldStyles, width: "300px" }}
                    required
                  />
                  <TextField
                    label="Description"
                    value={instr.description}
                    onChange={(e) => handleInputChange(instrIndex, "description", e.target.value)}
                    sx={{ ...textFieldStyles, width: "400px" }}
                    multiline
                    rows={3}
                  />
                  <TextField
                    select
                    label="Food Type"
                    value={instr.foodType}
                    onChange={(e) => handleInputChange(instrIndex, "foodType", e.target.value)}
                    sx={{ ...textFieldStyles, width: "200px" }}
                  >
                    {["IMMUNITY", "BRAIN_POWER", "ENERGY_BOOST", "DIGESTION", "GROWTH", "BALANCED", "VITAMIN_RICH"].map(
                      (type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      )
                    )}
                  </TextField>
                  <TextField
                    label="Time of Day"
                    value={instr.timeOfDay}
                    onChange={(e) => handleInputChange(instrIndex, "timeOfDay", e.target.value)}
                    sx={{ ...textFieldStyles, width: "150px" }}
                  />
                  <TextField
                    select
                    label="Week Day"
                    value={instr.weekDay}
                    onChange={(e) => handleInputChange(instrIndex, "weekDay", e.target.value)}
                    sx={{ ...textFieldStyles, width: "150px" }}
                  >
                    <MenuItem value="">None</MenuItem>
                    {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map((day) => (
                      <MenuItem key={day} value={day}>
                        {day}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Frequency"
                    value={instr.frequency}
                    onChange={(e) => handleInputChange(instrIndex, "frequency", e.target.value)}
                    sx={{ ...textFieldStyles, width: "150px" }}
                  >
                    {["DAILY", "WEEKLY", "MONTHLY", "ONCE"].map((freq) => (
                      <MenuItem key={freq} value={freq}>
                        {freq}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Media URL"
                    value={instr.mediaUrl}
                    onChange={(e) => handleInputChange(instrIndex, "mediaUrl", e.target.value)}
                    sx={{ ...textFieldStyles, width: "300px" }}
                  />
                </Box>
                <Typography sx={{ color: "#fff", mt: 2, mb: 1 }}>Suggested Items</Typography>
                {instr.suggestedItems.map((item, itemIndex) => (
                  <Box key={itemIndex} sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
                    <TextField
                      label="Item Name"
                      value={item.name}
                      onChange={(e) => handleSuggestedItemChange(instrIndex, itemIndex, "name", e.target.value)}
                      sx={{ ...textFieldStyles, width: "200px" }}
                      required
                    />
                    <TextField
                      label="Quantity"
                      value={item.quantity}
                      onChange={(e) => handleSuggestedItemChange(instrIndex, itemIndex, "quantity", e.target.value)}
                      sx={{ ...textFieldStyles, width: "150px" }}
                    />
                    <TextField
                      label="Benefit"
                      value={item.benefit}
                      onChange={(e) => handleSuggestedItemChange(instrIndex, itemIndex, "benefit", e.target.value)}
                      sx={{ ...textFieldStyles, width: "300px" }}
                    />
                    {instr.suggestedItems.length > 1 && (
                      <IconButton
                        onClick={() => handleRemoveSuggestedItem(instrIndex, itemIndex)}
                        sx={{ color: "#ff4444" }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddSuggestedItem(instrIndex)}
                  sx={{ color: "#00c757", borderColor: "#00c757", mb: 2 }}
                >
                  Add Suggested Item
                </Button>
                {formData.length > 1 && (
                  <IconButton onClick={() => handleRemoveInstruction(instrIndex)} sx={{ color: "#ff4444", ml: 2 }}>
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            ))}
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddInstruction}
              sx={{ color: "#00c757", borderColor: "#00c757", mb: 2 }}
            >
              Add Another Instruction
            </Button>
          </Box>
          <DialogActions sx={{ bgcolor: "#000" }}>
            <Button onClick={onClose} variant="contained" color="error">
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{ bgcolor: "#00c757", "&:hover": { bgcolor: "#00a550" } }}
              disabled={formData.some((instr) => !instr.title || instr.suggestedItems.some((item) => !item.name))}
            >
              Save Instructions
            </Button>
          </DialogActions>
        </Box>
      </Box>
    </Dialog>
  );
};

export default AddFoodInstructionDialog;