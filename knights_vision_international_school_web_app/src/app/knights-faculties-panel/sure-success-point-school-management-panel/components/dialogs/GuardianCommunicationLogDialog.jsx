"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
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

const GuardianCommunicationLogDialog = ({ open, mode, log, classId, className, onClose }) => {
  const [formData, setFormData] = useState([
    {
      studentId: "",
      communicationType: "GENERAL",
      method: "PHONE",
      summary: "",
      details: [{ key: "", value: "" }],
    },
  ]);
  const [students, setStudents] = useState([]);

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
    if (open) {
      fetchStudents();
    }
  }, [open, classId]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`/api/GuardianCommunicationLogs/${className.toLowerCase()}/students`, {
        params: { classId }
      });
      if (!response.data || !Array.isArray(response.data.students)) {
        throw new Error("Invalid response format");
      }
      setStudents(response.data.students);
    } catch (err) {
      console.error("Error fetching students:", err.message);
      toast.error("Failed to fetch students.");
    }
  };

  const handleInputChange = (index, field, value) => {
    const newFormData = [...formData];
    newFormData[index][field] = value;
    setFormData(newFormData);
  };

  const handleDetailChange = (logIndex, detailIndex, field, value) => {
    const newFormData = [...formData];
    newFormData[logIndex].details[detailIndex][field] = value;
    setFormData(newFormData);
  };

  const handleRemoveDetail = (logIndex, detailIndex) => {
    const newFormData = [...formData];
    if (newFormData[logIndex].details.length > 1) {
      newFormData[logIndex].details = newFormData[logIndex].details.filter((_, i) => i !== detailIndex);
      setFormData(newFormData);
    }
  };

  const handleAddLog = () => {
    setFormData([
      ...formData,
      {
        studentId: "",
        communicationType: "GENERAL",
        method: "PHONE",
        summary: "",
        details: [{ key: "", value: "" }],
      },
    ]);
  };

  const handleRemoveLog = (index) => {
    if (formData.length > 1) {
      setFormData(formData.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    try {
      const logsToSubmit = formData.map((log) => ({
        classId,
        studentId: parseInt(log.studentId),
        schoolId: 1,
        branchId: 1,
        communicationType: log.communicationType,
        method: log.method,
        summary: log.summary || null,
        details: log.details.filter((detail) => detail.key && detail.value),
        recordedById: 1, // Assuming admin/teacher ID
      }));

      await axios.post(`/api/GuardianCommunicationLogs/${className.toLowerCase()}/guardian-communication-logs`, { logs: logsToSubmit });
      toast.success("Communication logs added successfully!");
      onClose();
      setFormData([
        {
          studentId: "",
          communicationType: "GENERAL",
          method: "PHONE",
          summary: "",
          details: [{ key: "", value: "" }],
        },
      ]);
    } catch (err) {
      console.error("Error adding communication logs:", err.message);
      toast.error("Failed to add communication logs.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ bgcolor: "#333", color: "#fff" }}>
        {mode === "view" ? `Communication Log Details` : `Add Communication Logs for ${classInfo.name}`}
      </DialogTitle>
      <DialogContent sx={{ bgcolor: "#181818", color: "#fff" }}>
        {mode === "view" && log ? (
          <Box>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Student</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{log.student.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Communication Type</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{log.communicationType}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Method</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{log.method}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Summary</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{log.summary || "N/A"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Recorded At</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{new Date(log.recordedAt).toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Typography sx={{ color: "#fff", mt: 2, mb: 1 }}>Details</Typography>
            {log.details && log.details.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#333" }}>
                    <TableCell sx={{ color: "#fff" }}>Key</TableCell>
                    <TableCell sx={{ color: "#fff" }}>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {log.details.map((detail, index) => (
                    <TableRow key={index} sx={{ bgcolor: "#222", "&:hover": { bgcolor: "#2a2a2a" } }}>
                      <TableCell sx={{ color: "#fff" }}>{detail.key}</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{detail.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography sx={{ color: "#fff", p: 2 }}>No details available.</Typography>
            )}
          </Box>
        ) : (
          <Box>
            {formData.map((log, logIndex) => (
              <Box key={logIndex} sx={{ mb: 3, p: 2, bgcolor: "#222", borderRadius: 1 }}>
                <Typography sx={{ color: "#fff", mb: 2 }}>Log {logIndex + 1}</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  <TextField
                    select
                    label="Student"
                    value={log.studentId}
                    onChange={(e) => handleInputChange(logIndex, "studentId", e.target.value)}
                    sx={{ ...textFieldStyles, width: "300px" }}
                    required
                  >
                    {students.map((student) => (
                      <MenuItem key={student.id} value={student.id}>
                        {student.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Communication Type"
                    value={log.communicationType}
                    onChange={(e) => handleInputChange(logIndex, "communicationType", e.target.value)}
                    sx={{ ...textFieldStyles, width: "200px" }}
                  >
                    {["GENERAL", "ALERT", "CALL", "SMS", "EMAIL", "MEETING"].map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Method"
                    value={log.method}
                    onChange={(e) => handleInputChange(logIndex, "method", e.target.value)}
                    sx={{ ...textFieldStyles, width: "200px" }}
                  >
                    {["PHONE", "SMS", "WHATSAPP", "EMAIL", "IN_PERSON"].map((method) => (
                      <MenuItem key={method} value={method}>
                        {method}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Summary"
                    value={log.summary}
                    onChange={(e) => handleInputChange(logIndex, "summary", e.target.value)}
                    sx={{ ...textFieldStyles, width: "400px" }}
                    multiline
                    rows={2}
                  />
                </Box>
                <Typography sx={{ color: "#fff", mt: 2, mb: 1 }}>Details</Typography>
                {log.details.map((detail, detailIndex) => (
                  <Box key={detailIndex} sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
                    <TextField
                      label="Key"
                      value={detail.key}
                      onChange={(e) => handleDetailChange(logIndex, detailIndex, "key", e.target.value)}
                      sx={{ ...textFieldStyles, width: "200px" }}
                      required
                    />
                    <TextField
                      label="Value"
                      value={detail.value}
                      onChange={(e) => handleDetailChange(logIndex, detailIndex, "value", e.target.value)}
                      sx={{ ...textFieldStyles, width: "300px" }}
                      required
                    />
                    {log.details.length > 1 && (
                      <IconButton
                        onClick={() => handleRemoveDetail(logIndex, detailIndex)}
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
                  onClick={() => handleAddDetail(logIndex)}
                  sx={{ color: "#00c757", borderColor: "#00c757", mb: 2 }}
                >
                  Add Detail
                </Button>
                {formData.length > 1 && (
                  <IconButton onClick={() => handleRemoveLog(logIndex)} sx={{ color: "#ff4444", ml: 2 }}>
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            ))}
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddLog}
              sx={{ color: "#00c757", borderColor: "#00c757", mb: 2 }}
            >
              Add Another Log
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
            disabled={formData.some((log) => !log.studentId || log.details.some((d) => !d.key || !d.value))}
          >
            Save Logs
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default GuardianCommunicationLogDialog;