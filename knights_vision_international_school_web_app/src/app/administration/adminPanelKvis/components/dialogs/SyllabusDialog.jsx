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
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { CalendarToday, Close } from "@mui/icons-material";

const drawerWidth = 280;
const appBarHeight = 64;

const SyllabusDialog = ({
  open,
  onClose,
  selectedClassSubject,
  syllabusSchedules,
  syllabusLoading,
  handleOpenCreateSyllabusDialog,
  className,
}) => {
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
        <ListItemText sx={{ color: "#fff" }} primary={`Syllabus for ${selectedClassSubject?.subject.name || "Unknown"} - ${className}`} />
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenCreateSyllabusDialog}
            sx={{ mr: 1, right: 60, bgcolor: "#00c757" }}
          >
            Create Syllabus
          </Button>
          <Button
            onClick={onClose}
            variant="contained"
            color="error"
            sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
          >
            <Close />
          </Button>
        </Box>
      </ListItemButton>
      <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#000", color: "#fff" }}>
        <Box sx={{ flex: 1, overflowY: "auto", maxHeight: "80vh" }}>
          {syllabusLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
              <CircularProgress size={120} />
            </Box>
          ) : (
            <Table sx={{ bgcolor: "#181818" }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "#333" }}>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Date</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Topic</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Syllabus Topic</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Completed</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Holiday</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Article Links</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Video Links</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Student Instructions</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Teacher Instructions</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Notes</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Homework</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Due Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {syllabusSchedules.length > 0 ? (
                  syllabusSchedules.map((s) => (
                    <TableRow key={s.id} sx={{ bgcolor: "#181818", "&:hover": { bgcolor: "#222" } }}>
                      <TableCell sx={{ color: "#fff" }}>{new Date(s.date).toLocaleDateString()}</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{s.topicTitle}</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{s.subjectSyllabus?.topic || "N/A"}</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{s.isCompleted ? "Yes" : "No"}</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{s.isHoliday ? "Yes" : "No"}</TableCell>
                      <TableCell sx={{ color: "#fff" }}>
                        {s.articleLinks1 && (
                          <div>
                            <a href={s.articleLinks1} target="_blank" rel="noopener noreferrer" style={{ color: "#00c757" }}>
                              Link 1
                            </a>
                          </div>
                        )}
                        {s.articleLinks2 && (
                          <div>
                            <a href={s.articleLinks2} target="_blank" rel="noopener noreferrer" style={{ color: "#00c757" }}>
                              Link 2
                            </a>
                          </div>
                        )}
                      </TableCell>
                      <TableCell sx={{ color: "#fff" }}>
                        {s.videoLinks && (
                          <div>
                            <a href={s.videoLinks} target="_blank" rel="noopener noreferrer" style={{ color: "#00c757" }}>
                              Video 1
                            </a>
                          </div>
                        )}
                        {s.videoLinks2 && (
                          <div>
                            <a href={s.videoLinks2} target="_blank" rel="noopener noreferrer" style={{ color: "#00c757" }}>
                              Video 2
                            </a>
                          </div>
                        )}
                      </TableCell>
                      <TableCell sx={{ color: "#fff" }}>{s.instructions_for_students || "N/A"}</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{s.instructions_for_teachers || "N/A"}</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{s.notes || "N/A"}</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{s.homeworkDescription || "N/A"}</TableCell>
                      <TableCell sx={{ color: "#fff" }}>
                        {s.homeworkDueDate ? new Date(s.homeworkDueDate).toLocaleDateString() : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} sx={{ color: "#fff", textAlign: "center" }}>
                      No syllabus schedules found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
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

export default SyllabusDialog;