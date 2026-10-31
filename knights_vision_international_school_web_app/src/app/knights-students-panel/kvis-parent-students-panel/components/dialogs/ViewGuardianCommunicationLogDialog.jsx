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
  TableHead,
  TableRow,
  Typography,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Chat as ChatIcon, Close } from "@mui/icons-material";

const drawerWidth = 280;
const appBarHeight = 64;
const greenAccent = "#00c853";

const ViewGuardianCommunicationLogDialog = ({ open, onClose, log, className }) => {
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
          <ChatIcon />
        </ListItemIcon>
        <ListItemText primary={`Guardian Communication Log - ${className}`} />
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
            {log ? (
              <Box>
                <Table sx={{ bgcolor: "#181818" }}>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Student</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{log.student?.name || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Communication Type</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{log.communicationType}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Method</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{log.method}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Summary</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{log.summary || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Recorded At</TableCell>
                      <TableCell sx={{ color: "#fff" }}>
                        {new Date(log.recordedAt).toLocaleString("en-IN", {
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
                <Typography sx={{ color: "#fff", mt: 2, mb: 1, fontWeight: "bold" }}>
                  Details
                </Typography>
                {log.details && log.details.length > 0 ? (
                  <Table sx={{ bgcolor: "#181818" }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#333" }}>
                        <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Key</TableCell>
                        <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {log.details.map((detail, index) => (
                        <TableRow key={index} sx={{ "&:hover": { bgcolor: "#222" } }}>
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
              <Typography sx={{ color: "#fff", p: 2 }}>No log data available.</Typography>
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

export default ViewGuardianCommunicationLogDialog;