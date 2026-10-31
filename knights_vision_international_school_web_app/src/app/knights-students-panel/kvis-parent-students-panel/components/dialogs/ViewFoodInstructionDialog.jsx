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
  Avatar,
} from "@mui/material";
import { Restaurant as RestaurantIcon, Close } from "@mui/icons-material";

const drawerWidth = 280;
const appBarHeight = 64;
const greenAccent = "#00c853";

const ViewFoodInstructionDialog = ({ open, onClose, instruction, className }) => {
  const handleUrlClick = (url) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
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
          backgroundColor: "#181818",
          color: "#fff",
          "&:hover": { backgroundColor: "#181818" },
        }}
      >
        <ListItemIcon sx={{ color: greenAccent }}>
          <RestaurantIcon />
        </ListItemIcon>
        <ListItemText primary={`Food Instruction for ${className}: ${instruction?.title || "Unknown"}`} />
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
                      <TableCell sx={{ color: "#fff" }}>
                        {instruction.mediaUrl && /\.(png|jpg|jpeg)$/i.test(instruction.mediaUrl) ? (
                          <Avatar
                            src={instruction.mediaUrl}
                            alt={instruction.title}
                            variant="square"
                            sx={{ width: 200, height: 200, objectFit: "cover", cursor: "pointer" }}
                            onClick={() => handleUrlClick(instruction.mediaUrl)}
                          />
                        ) : instruction.mediaUrl ? (
                          <Button
                            variant="text"
                            sx={{ color: greenAccent }}
                            onClick={() => handleUrlClick(instruction.mediaUrl)}
                          >
                            View Media
                          </Button>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
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

export default ViewFoodInstructionDialog;