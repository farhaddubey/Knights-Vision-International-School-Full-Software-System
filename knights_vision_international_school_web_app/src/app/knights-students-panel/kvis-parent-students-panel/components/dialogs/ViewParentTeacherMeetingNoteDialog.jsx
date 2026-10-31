"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { MeetingRoom as MeetingRoomIcon, Close } from "@mui/icons-material";

const drawerWidth = 280;
const appBarHeight = 64;
const greenAccent = "#00c853";

const ViewParentTeacherMeetingNoteDialog = ({ open, onClose, note, className }) => {
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
          backgroundColor: "#181818",
          color: "#fff",
          "&:hover": { backgroundColor: "#181818" },
        }}
      >
        <ListItemIcon sx={{ color: greenAccent }}>
          <MeetingRoomIcon />
        </ListItemIcon>
        <ListItemText primary={`Parent-Teacher Meeting Note - ${className}`} />
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
        >
          <Close />
        </Button>
      </ListItemButton>
      <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#181818", color: "#fff", p: 2 }}>
        <Box sx={{ flex: 1, overflowY: "auto", pr: 1, maxHeight: "80vh" }}>
          <DialogContent sx={{ bgcolor: "#181818", color: "#fff" }}>
            {note ? (
              <Box>
                <Table sx={{ bgcolor: "#181818" }}>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Student</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{note.student?.name || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Class</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{note.class?.name || className || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Meeting Date</TableCell>
                      <TableCell sx={{ color: "#fff" }}>
                        {new Date(note.meetingDate).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        })}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Guardian Instruction</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{note.guardianInstruction || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Guardian Feedback</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{note.guardianFeedback || "N/A"}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            ) : (
              <Typography sx={{ color: "#fff", p: 2 }}>No note data available.</Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ bgcolor: "#181818" }}>
            <Button onClick={onClose} variant="contained" sx={{ bgcolor: "#f44336", color: "#fff" }}>
              Close
            </Button>
          </DialogActions>
        </Box>
      </Box>
    </Dialog>
  );
};

export default ViewParentTeacherMeetingNoteDialog;