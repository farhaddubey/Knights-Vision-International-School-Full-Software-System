"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";

const HolidayDialog = ({ open, onClose, holiday }) => {
  const [formData, setFormData] = useState({
    date: holiday ? new Date(holiday.date) : null,
    title: holiday ? holiday.title : "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.title) newErrors.title = "Title is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (holiday) {
        await axios.put(`/api/holidays/${holiday.id}`, formData);
        toast.success("Holiday updated successfully.");
      } else {
        await axios.post(`/api/holidays`, formData);
        toast.success("Holiday added successfully.");
      }
      onClose();
    } catch (err) {
      console.error("Error saving holiday:", err.message);
      toast.error("Failed to save holiday.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDialog-paper": {
          bgcolor: "#181818",
          color: "#fff",
          minWidth: "400px",
        },
      }}
    >
      <DialogContent>
        <Typography variant="h6" sx={{ mb: 2, color: "#fff" }}>
          {holiday ? "Edit Holiday" : "Add Holiday"}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date"
              value={formData.date}
              onChange={(newValue) =>
                setFormData({ ...formData, date: newValue })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={!!errors.date}
                  helperText={errors.date}
                  sx={{
                    "& .MuiInputBase-input": { color: "#fff" },
                    "& .MuiInputLabel-root": { color: "#aaa" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#555" },
                      "&:hover fieldset": { borderColor: "#777" },
                      "&.Mui-focused fieldset": { borderColor: "#00c757" },
                    },
                  }}
                />
              )}
            />
          </LocalizationProvider>
          <TextField
            label="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            error={!!errors.title}
            helperText={errors.title}
            sx={{
              "& .MuiInputBase-input": { color: "#fff" },
              "& .MuiInputLabel-root": { color: "#aaa" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#555" },
                "&:hover fieldset": { borderColor: "#777" },
                "&.Mui-focused fieldset": { borderColor: "#00c757" },
              },
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ bgcolor: "#181818" }}>
        <Button onClick={onClose} variant="contained" color="error">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{ bgcolor: "#00c757", color: "#000" }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HolidayDialog;
