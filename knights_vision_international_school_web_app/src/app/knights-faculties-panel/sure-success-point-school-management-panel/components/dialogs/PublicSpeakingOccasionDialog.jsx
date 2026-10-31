"use client";

import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Switch,
  MenuItem,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { toast } from "react-toastify";

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

const PublicSpeakingOccasionDialog = ({ open, mode, occasion, classId, className, onClose }) => {
  const [formData, setFormData] = useState([
    {
      title: "",
      description: "",
      occasionDate: "",
      languageMedium: "ENGLISH",
      isActive: true,
    },
  ]);

  const handleInputChange = (index, field, value) => {
    const newFormData = [...formData];
    newFormData[index][field] = value;
    setFormData(newFormData);
  };

  const handleAddOccasion = () => {
    setFormData([
      ...formData,
      {
        title: "",
        description: "",
        occasionDate: "",
        languageMedium: "ENGLISH",
        isActive: true,
      },
    ]);
  };

  const handleRemoveOccasion = (index) => {
    if (formData.length > 1) {
      setFormData(formData.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    const token = Cookies.get("faculties_token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }
    try {
      const occasionsToSubmit = formData.map((occasion) => ({
        title: occasion.title,
        description: occasion.description || null,
        occasionDate: new Date(occasion.occasionDate),
        classId,
        schoolId: 1,
        branchId: 1,
        languageMedium: occasion.languageMedium,
        isActive: occasion.isActive,
      }));

      await axios.post(`/api/MonthlyPublicSpeakingOccasions/${className.toLowerCase()}/occasions`, { occasions: occasionsToSubmit }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Public speaking occasions added successfully!");
      onClose();
      setFormData([
        {
          title: "",
          description: "",
          occasionDate: "",
          languageMedium: "ENGLISH",
          isActive: true,
        },
      ]);
    } catch (err) {
      console.error("Error adding occasions:", err.message);
      toast.error("Failed to add public speaking occasions.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ bgcolor: "#333", color: "#fff" }}>
        {mode === "view" ? `Occasion Details` : `Add Public Speaking Occasions for Class ${className.toUpperCase()}`}
      </DialogTitle>
      <DialogContent sx={{ bgcolor: "#181818", color: "#fff" }}>
        {mode === "view" && occasion ? (
          <Box>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Title</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{occasion.title}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Description</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{occasion.description || "N/A"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Occasion Date</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{new Date(occasion.occasionDate).toLocaleDateString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Language Medium</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{occasion.languageMedium}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Active</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{occasion.isActive ? "Yes" : "No"}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        ) : (
          <Box>
            {formData.map((occasion, index) => (
              <Box key={index} sx={{ mb: 3, p: 2, bgcolor: "#222", borderRadius: 1 }}>
                <Typography sx={{ color: "#fff", mb: 2 }}>Occasion {index + 1}</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  <TextField
                    label="Title"
                    value={occasion.title}
                    onChange={(e) => handleInputChange(index, "title", e.target.value)}
                    sx={{ ...textFieldStyles, width: "300px" }}
                    required
                  />
                  <TextField
                    label="Description"
                    value={occasion.description}
                    onChange={(e) => handleInputChange(index, "description", e.target.value)}
                    sx={{ ...textFieldStyles, width: "400px" }}
                    multiline
                    rows={3}
                  />
                  <TextField
                    label="Occasion Date"
                    type="date"
                    value={occasion.occasionDate}
                    onChange={(e) => handleInputChange(index, "occasionDate", e.target.value)}
                    sx={{ ...textFieldStyles, width: "200px" }}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                  <TextField
                    select
                    label="Language Medium"
                    value={occasion.languageMedium}
                    onChange={(e) => handleInputChange(index, "languageMedium", e.target.value)}
                    sx={{ ...textFieldStyles, width: "200px" }}
                  >
                    {["BENGALI", "HINDI", "ENGLISH"].map((lang) => (
                      <MenuItem key={lang} value={lang}>
                        {lang}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography sx={{ color: "#fff" }}>Active</Typography>
                    <Switch
                      checked={occasion.isActive}
                      onChange={(e) => handleInputChange(index, "isActive", e.target.checked)}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#00c757",
                          "&:hover": { backgroundColor: "rgba(0, 199, 87, 0.08)" },
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                          backgroundColor: "#00c757",
                        },
                      }}
                    />
                  </Box>
                </Box>
                {formData.length > 1 && (
                  <IconButton onClick={() => handleRemoveOccasion(index)} sx={{ color: "#ff4444" }}>
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            ))}
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddOccasion}
              sx={{ color: "#00c757", borderColor: "#00c757", mb: 2 }}
            >
              Add Another Occasion
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ bgcolor: "#333" }}>
        <Button onClick={onClose} sx={{ color: "#fff" }}>
          Close
        </Button>
        {mode === "add" && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ bgcolor: "#00c757", "&:hover": { bgcolor: "#00a550" } }}
            disabled={formData.some((occasion) => !occasion.title || !occasion.occasionDate)}
          >
            Save Occasions
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PublicSpeakingOccasionDialog;