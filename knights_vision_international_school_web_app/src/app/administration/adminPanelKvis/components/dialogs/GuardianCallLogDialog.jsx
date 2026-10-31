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

const GuardianCallLogDialog = ({ open, mode, log, classId, className, onClose }) => {
  const [formData, setFormData] = useState([
    {
      studentId: "",
      reportWeekStart: "",
      reportWeekEnd: "",
      callDate: "",
      issuesDiscussed: [{ issue: "", action: "" }],
      guardianResponse: "",
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
      const response = await axios.get(`/api/GuardianCallLogs/${className.toLowerCase()}/students`, { params: { classId } });
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

  const handleIssueChange = (logIndex, issueIndex, field, value) => {
    const newFormData = [...formData];
    newFormData[logIndex].issuesDiscussed[issueIndex][field] = value;
    setFormData(newFormData);
  };

  const handleAddIssue = (logIndex) => {
    const newFormData = [...formData];
    newFormData[logIndex].issuesDiscussed.push({ issue: "", action: "" });
    setFormData(newFormData);
  };

  const handleRemoveIssue = (logIndex, issueIndex) => {
    const newFormData = [...formData];
    if (newFormData[logIndex].issuesDiscussed.length > 1) {
      newFormData[logIndex].issuesDiscussed = newFormData[logIndex].issuesDiscussed.filter(
        (_, i) => i !== issueIndex
      );
      setFormData(newFormData);
    }
  };

  const handleAddLog = () => {
    setFormData([
      ...formData,
      {
        studentId: "",
        reportWeekStart: "",
        reportWeekEnd: "",
        callDate: "",
        issuesDiscussed: [{ issue: "", action: "" }],
        guardianResponse: "",
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
        reportWeekStart: new Date(log.reportWeekStart),
        reportWeekEnd: new Date(log.reportWeekEnd),
        callDate: new Date(log.callDate),
        issuesDiscussed: log.issuesDiscussed.filter((issue) => issue.issue && issue.action),
        guardianResponse: log.guardianResponse || null,
        calledById: 1, // Assuming admin/teacher ID
      }));

      await axios.post(`/api/GuardianCallLogs/${className.toLowerCase()}/guardian-call-logs`, { logs: logsToSubmit });
      toast.success("Call logs added successfully!");
      onClose();
      setFormData([
        {
          studentId: "",
          reportWeekStart: "",
          reportWeekEnd: "",
          callDate: "",
          issuesDiscussed: [{ issue: "", action: "" }],
          guardianResponse: "",
        },
      ]);
    } catch (err) {
      console.error("Error adding call logs:", err.message);
      toast.error("Failed to add call logs.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ bgcolor: "#333", color: "#fff" }}>
        {mode === "view" ? `Call Log Details` : `Add Call Logs for ${classInfo.name}`}
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
                  <TableCell sx={{ color: "#fff" }}>Report Week</TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    {new Date(log.reportWeekStart).toLocaleDateString()} - {new Date(log.reportWeekEnd).toLocaleDateString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Call Date</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{new Date(log.callDate).toLocaleDateString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Guardian Response</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{log.guardianResponse || "N/A"}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Typography sx={{ color: "#fff", mt: 2, mb: 1 }}>Issues Discussed</Typography>
            {log.issuesDiscussed && log.issuesDiscussed.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#333" }}>
                    <TableCell sx={{ color: "#fff" }}>Issue</TableCell>
                    <TableCell sx={{ color: "#fff" }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {log.issuesDiscussed.map((issue, index) => (
                    <TableRow key={index} sx={{ bgcolor: "#222", "&:hover": { bgcolor: "#2a2a2a" } }}>
                      <TableCell sx={{ color: "#fff" }}>{issue.issue}</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{issue.action}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography sx={{ color: "#fff", p: 2 }}>No issues discussed.</Typography>
            )}
          </Box>
        ) : (
          <Box>
            {formData.map((log, logIndex) => (
              <Box key={logIndex} sx={{ mb: 3, p: 2, bgcolor: "#222", borderRadius: 1 }}>
                <Typography sx={{ color: "#fff", mb: 2 }}>Call Log {logIndex + 1}</Typography>
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
                    label="Report Week Start"
                    type="date"
                    value={log.reportWeekStart}
                    onChange={(e) => handleInputChange(logIndex, "reportWeekStart", e.target.value)}
                    sx={{ ...textFieldStyles, width: "200px" }}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                  <TextField
                    label="Report Week End"
                    type="date"
                    value={log.reportWeekEnd}
                    onChange={(e) => handleInputChange(logIndex, "reportWeekEnd", e.target.value)}
                    sx={{ ...textFieldStyles, width: "200px" }}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                  <TextField
                    label="Call Date"
                    type="date"
                    value={log.callDate}
                    onChange={(e) => handleInputChange(logIndex, "callDate", e.target.value)}
                    sx={{ ...textFieldStyles, width: "200px" }}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                  <TextField
                    label="Guardian Response"
                    value={log.guardianResponse}
                    onChange={(e) => handleInputChange(logIndex, "guardianResponse", e.target.value)}
                    sx={{ ...textFieldStyles, width: "400px" }}
                    multiline
                    rows={3}
                  />
                </Box>
                <Typography sx={{ color: "#fff", mt: 2, mb: 1 }}>Issues Discussed</Typography>
                {log.issuesDiscussed.map((issue, issueIndex) => (
                  <Box key={issueIndex} sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
                    <TextField
                      label="Issue"
                      value={issue.issue}
                      onChange={(e) => handleIssueChange(logIndex, issueIndex, "issue", e.target.value)}
                      sx={{ ...textFieldStyles, width: "300px" }}
                      required
                    />
                    <TextField
                      label="Action"
                      value={issue.action}
                      onChange={(e) => handleIssueChange(logIndex, issueIndex, "action", e.target.value)}
                      sx={{ ...textFieldStyles, width: "300px" }}
                      required
                    />
                    {log.issuesDiscussed.length > 1 && (
                      <IconButton
                        onClick={() => handleRemoveIssue(logIndex, issueIndex)}
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
                  onClick={() => handleAddIssue(logIndex)}
                  sx={{ color: "#00c757", borderColor: "#00c757", mb: 2 }}
                >
                  Add Issue
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
              Add Another Call Log
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
            disabled={formData.some(
              (log) =>
                !log.studentId ||
                !log.reportWeekStart ||
                !log.reportWeekEnd ||
                !log.callDate ||
                log.issuesDiscussed.some((issue) => !issue.issue || !issue.action)
            )}
          >
            Save Logs
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default GuardianCallLogDialog;