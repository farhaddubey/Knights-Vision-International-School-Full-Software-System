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
import { Lightbulb as LightbulbIcon, Close } from "@mui/icons-material";

const drawerWidth = 280;
const appBarHeight = 64;
const greenAccent = "#00c853";

const ViewImprovementSuggestionDialog = ({ open, onClose, suggestion, className }) => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

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
          <LightbulbIcon />
        </ListItemIcon>
        <ListItemText primary={`Improvement Suggestion - ${className}`} />
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
            {suggestion ? (
              <Box>
                <Table sx={{ bgcolor: "#181818" }}>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Student</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{suggestion.student?.name || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Class</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{suggestion.class?.name || className || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Month</TableCell>
                      <TableCell sx={{ color: "#fff" }}>
                        {monthNames[suggestion.month - 1] || "N/A"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Year</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{suggestion.year || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Category</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{suggestion.category}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Suggestion</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{suggestion.message || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>School Response</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{suggestion.responseMessage || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Submitted At</TableCell>
                      <TableCell sx={{ color: "#fff" }}>
                        {new Date(suggestion.createdAt).toLocaleString("en-IN", {
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
                  </TableBody>
                </Table>
              </Box>
            ) : (
              <Typography sx={{ color: "#fff", p: 2 }}>No suggestion data available.</Typography>
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

export default ViewImprovementSuggestionDialog;