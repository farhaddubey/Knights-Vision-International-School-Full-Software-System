"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  IconButton,
  Box,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { CalendarToday, Close, Download } from "@mui/icons-material";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import "jspdf-autotable";
import TestMarksDialog from "./TestMarksDialog";
import TestMarksViewDialog from './TestMarksViewDialog'; 
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
  "& .MuiInputBase-input.Mui-disabled": {
    color: "#fff !important",
    WebkitTextFillColor: "#fff !important",
  },
};



const TestsDialog = ({ open, onClose, classSubject, className }) => {
  const [tests, setTests] = useState([]);
  const [testsLoading, setTestsLoading] = useState(false);
  const [createTestDialogOpen, setCreateTestDialogOpen] = useState(false);
  const [testMarksDialogOpen, setTestMarksDialogOpen] = useState(false);
  const [testMarksViewDialogOpen, setTestMarksViewDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (classSubject) {
      fetchTests(classSubject.id);
      fetchStudents(classSubject.classId);
    }
  }, [classSubject]);

  const fetchTests = async (classSubjectId) => {
    try {
      setTestsLoading(true);
      const response = await axios.get(`/api-schools-panel/class_teachers_panel/Tests/${className.toLowerCase()}/tests`, {
        params: { classSubjectId },
      });
      setTests(response.data.tests || []);
    } catch (err) {
      console.error("Error fetching tests:", err.message);
      toast.error("Failed to fetch tests.");
      setTests([]);
    } finally {
      setTestsLoading(false);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      const response = await axios.get(`/api-schools-panel/class_teachers_panel/Tests/${className.toLowerCase()}/students/${classId}`);
      setStudents(response.data.students || []);
    } catch (err) {
      console.error("Error fetching students:", err.message);
      toast.error("Failed to fetch students.");
      setStudents([]);
    }
  };

  const handleOpenCreateTestDialog = () => {
    setCreateTestDialogOpen(true);
  };

  const handleCloseCreateTestDialog = () => {
    setCreateTestDialogOpen(false);
    fetchTests(classSubject.id);
  };

  const handleOpenTestMarksDialog = (test) => {
    setSelectedTest(test);
    setTestMarksDialogOpen(true);
  };

  const handleCloseTestMarksDialog = () => {
    setTestMarksDialogOpen(false);
    setSelectedTest(null);
    fetchTests(classSubject.id);
  };

  const handleOpenTestMarksViewDialog = (test) => {
    setSelectedTest(test);
    setTestMarksViewDialogOpen(true);
  };

  const handleCloseTestMarksViewDialog = () => {
    setTestMarksViewDialogOpen(false);
    setSelectedTest(null);
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
        <ListItemText
          sx={{ color: "#fff" }}
          primary={`Tests for ${classSubject?.subject.name || "Unknown"} - ${className}`}
        />
        <Box>
          <IconButton onClick={onClose} sx={{ color: "#f44336" }}>
            <Close />
          </IconButton>
        </Box>
      </ListItemButton>
      <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#000", color: "#fff" }}>
        <Box sx={{ flex: 1, overflowY: "auto", maxHeight: "86vh" }}>
          <Box sx={{ bgcolor: "#000", color: "#fff" }}>
            {testsLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                <CircularProgress size={120} sx={{ color: "#00c757" }} />
              </Box>
            ) : (
              <Table sx={{ bgcolor: "#181818" }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#333" }}>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Title</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Syllabus</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Bi-Weekly Slot</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Average Marks</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tests.length > 0 ? (
                    tests.map((t) => (
                      <TableRow key={t.id} sx={{ bgcolor: "#181818", "&:hover": { bgcolor: "#222" } }}>
                        <TableCell sx={{ color: "#fff" }}>{t.title || `Test ${t.id}`}</TableCell>
                        <TableCell sx={{ color: "#fff" }}>{JSON.stringify(t.syllabus)}</TableCell>
                        <TableCell sx={{ color: "#fff" }}>
                          {new Date(t.biWeeklySlotStart).toLocaleDateString()} - {new Date(t.biWeeklySlotEnd).toLocaleDateString()}
                        </TableCell>
                        <TableCell sx={{ color: "#fff" }}>
                          {t.TestMark.length ? (t.TestMark.reduce((sum, tm) => sum + (tm.marks || 0), 0) / t.TestMark.length).toFixed(2) : 0}/30
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={() => handleOpenTestMarksDialog(t)}
                              sx={{ color: "#00c757", borderColor: "#00c757" }}
                            >
                              Update Marks
                            </Button>
                            <Button
                              variant="outlined"
                              color="secondary"
                              onClick={() => handleOpenTestMarksViewDialog(t)}
                              sx={{ color: "#fff", borderColor: "#fff" }}
                            >
                              View Marks
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ color: "#fff", textAlign: "center" }}>
                        No tests found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </Box>
          <DialogActions sx={{ bgcolor: "#000" }}>
            <Button onClick={onClose} variant="contained" color="error">
              Close
            </Button>
          </DialogActions>
        </Box>
      </Box>
      {/* <CreateTestDialog
        open={createTestDialogOpen}
        onClose={handleCloseCreateTestDialog}
        classSubject={classSubject}
        className={className}
      /> */}
      <TestMarksDialog
        open={testMarksDialogOpen}
        onClose={handleCloseTestMarksDialog}
        test={selectedTest}
        students={students}
        className={className}
        fetchTests={fetchTests}
      />
      <TestMarksViewDialog
        open={testMarksViewDialogOpen}
        onClose={handleCloseTestMarksViewDialog}
        test={selectedTest}
        students={students}
        className={className}
      />
    </Dialog>
  );
};

export default TestsDialog;