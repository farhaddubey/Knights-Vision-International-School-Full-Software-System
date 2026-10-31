"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { CalendarToday, Close } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";

const drawerWidth = 280;
const appBarHeight = 64;

const AssignmentsDialog = ({
  open,
  onClose,
  selectedClassSubject,
  assignments,
  assignmentsLoading,
  handleOpenCreateAssignmentDialog,
  handleOpenStudentAssignmentsDialog,
  className,
  students, // Add students prop
  fetchAssignments, // Add fetchAssignments prop
}) => {
  const handleOpenUpdateStudentAssignmentsDialog = (assignment) => {
    toast.warn("Admission Denied...")
    toast.error("Not authorized.....")
  };



  return (
    <>
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
              <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
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
            primary={`Assignments for ${selectedClassSubject?.subject.name || "Unknown"} - ${className}`}
          />
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenCreateAssignmentDialog}
              sx={{ mr: 1, bgcolor: "#00c757", right: 60, color: "#000" }}
            >
              Create Assignment
            </Button>
            <Button
              onClick={onClose}
              variant="outlined"
              color="error"
              sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
            >
              <Close />
            </Button>
          </Box>
        </ListItemButton>
        <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#000", color: "#fff" }}>
          <Box sx={{ flex: 1, overflowY: "auto", maxHeight: "86vh" }}>
            <Box sx={{ bgcolor: "#000", color: "#fff" }}>
              {assignmentsLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                  <CircularProgress size={120} sx={{ color: "#00c757" }} />
                </Box>
              ) : (
                <>
                  <Table sx={{ bgcolor: "#181818" }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#333" }}>
                        <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Title</TableCell>
                        <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Description</TableCell>
                        <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Due Date</TableCell>
                        <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Bi-Weekly Slot</TableCell>
                        <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Submissions</TableCell>
                        <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {assignments.length > 0 ? (
                        assignments.map((a) => (
                          <TableRow key={a.id} sx={{ bgcolor: "#181818", "&:hover": { bgcolor: "#222" } }}>
                            <TableCell sx={{ color: "#fff" }}>{a.title}</TableCell>
                            <TableCell sx={{ color: "#fff" }}>{a.description}</TableCell>
                            <TableCell sx={{ color: "#fff" }}>{new Date(a.dueDate).toLocaleDateString()}</TableCell>
                            <TableCell sx={{ color: "#fff" }}>
                              {new Date(a.biWeeklySlotStart).toLocaleDateString()} -{" "}
                              {new Date(a.biWeeklySlotEnd).toLocaleDateString()}
                            </TableCell>
                            <TableCell sx={{ color: "#fff" }}>
                              {a.StudentAssignment.filter((sa) => sa.isSubmitted).length}/{a.StudentAssignment.length}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => handleOpenUpdateStudentAssignmentsDialog(a)}
                                sx={{ color: "#00c757", borderColor: "#00c757", mr: 1 }}
                              >
                                Update Submissions Marks
                              </Button>
                              <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => handleOpenStudentAssignmentsDialog(a)}
                                sx={{ color: "#00c757", borderColor: "#00c757" }}
                              >
                                View Submissions Records
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ color: "#fff", textAlign: "center" }}>
                            No assignments found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </>
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

    </>
  );
};

export default AssignmentsDialog;