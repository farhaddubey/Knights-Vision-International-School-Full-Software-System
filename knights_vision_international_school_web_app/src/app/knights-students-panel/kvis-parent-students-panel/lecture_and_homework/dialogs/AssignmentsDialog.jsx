"use client";

import React from "react";
import {
  Dialog,
  DialogActions,
  Button,
  Box,
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

const drawerWidth = 280;
const appBarHeight = 64;

// Student-only view: no teacher controls and no classmates' submissions.
const AssignmentsDialog = ({ open, onClose, selectedClassSubject, assignments, assignmentsLoading, className }) => (
  <Dialog
    sx={{ position: "fixed", top: `${appBarHeight}px`, left: `calc(${drawerWidth}px)`, transform: "translate(0, 0)" }}
    open={open}
    onClose={onClose}
    fullScreen
  >
    <ListItemButton sx={{ backgroundColor: "#009688", color: "#fff", "&:hover": { backgroundColor: "#009688" } }}>
      <ListItemIcon><CalendarToday /></ListItemIcon>
      <ListItemText primary={`My Assignments: ${selectedClassSubject?.subject.name || "Unknown"} - ${className}`} />
      <Button onClick={onClose} variant="outlined" color="error" sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}>
        <Close />
      </Button>
    </ListItemButton>
    <Box sx={{ flex: 1, overflowY: "auto", backgroundColor: "#000", color: "#fff" }}>
      {assignmentsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}><CircularProgress size={100} sx={{ color: "#00c757" }} /></Box>
      ) : (
        <Table sx={{ backgroundColor: "#181818" }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#333" }}>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Title</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Description</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Due Date</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>My Submission</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>My Marks</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Teacher Remarks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.length ? assignments.map((assignment) => {
              const ownRecord = assignment.StudentAssignment?.[0];
              return (
                <TableRow key={assignment.id} sx={{ "&:hover": { backgroundColor: "#222" } }}>
                  <TableCell sx={{ color: "#fff" }}>{assignment.title || "Untitled"}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{assignment.description || ""}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{new Date(assignment.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{ownRecord?.isSubmitted ? "Submitted" : "Pending"}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{ownRecord?.marksObtained ?? "—"}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{ownRecord?.remarks || "—"}</TableCell>
                </TableRow>
              );
            }) : (
              <TableRow><TableCell colSpan={6} sx={{ color: "#fff", textAlign: "center" }}>No assignments found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </Box>
    <DialogActions sx={{ backgroundColor: "#000" }}><Button onClick={onClose} variant="contained" color="error">Close</Button></DialogActions>
  </Dialog>
);

export default AssignmentsDialog;
