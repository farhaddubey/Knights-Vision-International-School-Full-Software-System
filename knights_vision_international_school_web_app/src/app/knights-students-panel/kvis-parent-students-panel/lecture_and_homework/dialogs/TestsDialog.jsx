"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
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
import { CalendarToday, Close } from "@mui/icons-material";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
const drawerWidth = 280;
const appBarHeight = 64;

const TestsDialog = ({ open, onClose, classSubject, className }) => {
  const [tests, setTests] = useState([]);
  const [testsLoading, setTestsLoading] = useState(false);

  useEffect(() => {
    if (classSubject) {
      fetchTests(classSubject.id);
    }
  }, [classSubject]);

  const fetchTests = async (classSubjectId) => {
    try {
      setTestsLoading(true);
      const token = Cookies.get("student_token");
      if (!token) throw new Error("Student session expired");

      const response = await axios.get("/api/a1-knights-students-panel/students/mytests", {
        params: { classSubjectId },
        headers: { Authorization: `Bearer ${token}` },
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
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>My Marks</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>My Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tests.length > 0 ? (
                    tests.map((t) => {
                      const ownMark = t.TestMark?.[0];

                      return (
                      <TableRow key={t.id} sx={{ bgcolor: "#181818", "&:hover": { bgcolor: "#222" } }}>
                        <TableCell sx={{ color: "#fff" }}>{t.title || `Test ${t.id}`}</TableCell>
                        <TableCell sx={{ color: "#fff" }}>{JSON.stringify(t.syllabus)}</TableCell>
                        <TableCell sx={{ color: "#fff" }}>
                          {new Date(t.biWeeklySlotStart).toLocaleDateString()} - {new Date(t.biWeeklySlotEnd).toLocaleDateString()}
                        </TableCell>
                        <TableCell sx={{ color: "#fff" }}>{ownMark?.marks ?? "Not published"}</TableCell>
                        <TableCell sx={{ color: "#fff" }}>{ownMark?.remarks || "-"}</TableCell>
                      </TableRow>
                      );
                    })
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
    </Dialog>
  );
};

export default TestsDialog;
