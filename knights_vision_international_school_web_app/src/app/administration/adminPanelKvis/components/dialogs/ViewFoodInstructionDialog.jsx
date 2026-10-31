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
import { CalendarToday, Close } from "@mui/icons-material";

const drawerWidth = 280;
const appBarHeight = 64;

const ViewFoodInstructionDialog = ({ open, onClose, instruction, className }) => {
  const classMap = {
    'v': { id: 4, name: 'Class V' },
    'vi': { id: 5, name: 'Class VI' },
    'vii': { id: 6, name: 'Class VII' },
    'viii': { id: 7, name: 'Class VIII' },
    'ix': { id: 8, name: 'Class IX' },
    'x': { id: 9, name: 'Class X' },
  };

  const classInfo = classMap[className.toLowerCase()] || { id: 4, name: 'Class V' };

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
          primary={`Food Instruction for ${classInfo.name}: ${instruction?.title || "Unknown"}`}
        />
        <Button
          onClick={onClose}
          variant="outlined"
          color="error"
          sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
        >
          <Close />
        </Button>
      </ListItemButton>
      <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#000", color: "#fff", p: 2 }}>
        <Box sx={{ flex: 1, overflowY: "auto", pr: 1, maxHeight: "80vh" }}>
          <DialogContent sx={{ bgcolor: "#000", color: "#fff" }}>
            {instruction ? (
              <Box>
                <Table sx={{ bgcolor: "#181818" }}>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Title</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{instruction.title}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Description</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{instruction.description || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Food Type</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{instruction.foodType}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Time of Day</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{instruction.timeOfDay || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Week Day</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{instruction.weekDay || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Frequency</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{instruction.frequency}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Media URL</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{instruction.mediaUrl || "N/A"}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <Typography sx={{ color: "#fff", mt: 2, mb: 1, fontWeight: "bold" }}>
                  Suggested Items
                </Typography>
                {instruction.suggestedItems && instruction.suggestedItems.length > 0 ? (
                  <Table sx={{ bgcolor: "#181818" }}>
                    <TableBody>
                      <TableRow sx={{ bgcolor: "#333" }}>
                        <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Name</TableCell>
                        <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Quantity</TableCell>
                        <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Benefit</TableCell>
                      </TableRow>
                      {instruction.suggestedItems.map((item, index) => (
                        <TableRow key={index} sx={{ "&:hover": { bgcolor: "#222" } }}>
                          <TableCell sx={{ color: "#fff" }}>{item.name}</TableCell>
                          <TableCell sx={{ color: "#fff" }}>{item.quantity || "N/A"}</TableCell>
                          <TableCell sx={{ color: "#fff" }}>{item.benefit || "N/A"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography sx={{ color: "#fff", p: 2 }}>No suggested items available.</Typography>
                )}
              </Box>
            ) : (
              <Typography sx={{ color: "#fff", p: 2 }}>No instruction data available.</Typography>
            )}
          </DialogContent>
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

export default ViewFoodInstructionDialog;