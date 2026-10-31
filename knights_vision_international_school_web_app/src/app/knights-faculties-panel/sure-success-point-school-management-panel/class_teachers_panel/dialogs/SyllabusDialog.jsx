"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  Button,
  Box,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import { CalendarToday, Close } from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";
import { Bounce, ToastContainer } from "react-toastify";
const drawerWidth = 280;
const appBarHeight = 64;

const SyllabusDialog = ({
  open,
  onClose,
  selectedClassSubject,
  syllabusSchedules,
  syllabusLoading,
  className,
}) => {
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState(syllabusSchedules);

  // Update schedules when prop changes
  React.useEffect(() => {
    setSchedules(syllabusSchedules);
  }, [syllabusSchedules]);

  const handleMarkAsCompleted = async (id) => {
    try {
      setLoading(true);
      const response = await axios.post(`/api-schools-panel/class_teachers_panel/SyllabusScheduleDailyPlan/completed/${id}`);
      console.log("API Response:", response.data);
      toast.success("Syllabus schedule marked as completed");
      // Update local state to reflect completion
      setSchedules((prevSchedules) =>
        prevSchedules.map((s) =>
          s.id === id ? { ...s, isCompleted: true, completionDate: new Date() } : s
        )
      );
    } catch (err) {
      console.error("Error marking as completed:", err.message);
      if (err.response?.status === 409) {
        setSchedules((prevSchedules) =>
          prevSchedules.map((s) =>
            s.id === id ? { ...s, isCompleted: true, completionDate: new Date() } : s
          )
        );
        toast.info("Already marked as completed for this branch.");
      } else {
        toast.error(err.response?.data?.error || "Failed to mark as completed.");
      }
    } finally {
      setLoading(false);
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
      <ToastContainer
position="bottom-center"
autoClose={5000}
hideProgressBar={false}
newestOnTop={false}
closeOnClick={false}
rtl={false}
pauseOnFocusLoss
draggable
pauseOnHover
theme="dark"
transition={Bounce}
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
        <ListItemText sx={{ color: "#fff" }} primary={`Syllabus for ${selectedClassSubject?.subject.name || "Unknown"} - ${className}`} />
        <Box>
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
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#000", color: "#fff" }}>
        <Box sx={{ flex: 1, overflowY: "auto", maxHeight: "80vh" }}>
          {syllabusLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
              <CircularProgress size={120} />
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
              <Box sx={{ display: "flex", gap: 1, bgcolor: "#333", p: 1, fontWeight: "bold" }}>
                <Box sx={{ flex: 2, color: "#fff" }}>Date Topic<br/>Syllabus Topic</Box>
                <Box sx={{ flex: 4, color: "#fff" }}>Instructions <br/>If Completed</Box>
                <Box sx={{ flex: 5, color: "#fff" }}>Homework<br/>Article & Video Links</Box>
                <Box sx={{ flex: 1, color: "#fff" }}>Action</Box>
              </Box>
              {schedules.length > 0 ? (
                schedules.map((s) => (
                  <Box
                    key={s.id}
                    sx={{ display: "flex", gap: 1, bgcolor: "#181818", p: 1, "&:hover": { bgcolor: "#222" } }}
                  >
                    <Box sx={{ flex: 2, color: "#fff" }}>{new Date(s.date).toLocaleDateString()}<br/>{s.topicTitle}<br/>{s.subjectSyllabus?.topic || "N/A"}</Box>
          
                    <Box sx={{ flex: 4, color: "#fff" }}>
                      Students-{s.instructions_for_students?.split('\n').map((line, i) => (
                        <span key={i}>{line}<br /></span>
                      )) || "N/A"}
                      Teachers-{s.instructions_for_teachers?.split('\n').map((line, i) => (
                        <span key={i}>{line}<br /></span>
                      )) || "N/A"}
                                          <Box sx={{ flex: 1, color: "#fff" }}>{s.isCompleted ? "Yes" : "No"}<br/>Holiday: {s.isHoliday ? "Yes" : "No"}</Box>

                    </Box>
                    <Box sx={{ flex: 5, color: "#fff" }}>
                      <Box>
                     Spcl Notes: {s.notes?.split('\n').map((line, i) => (
                        <span key={i}>{line}<br /></span>
                      )) || "N/A"}
                      HomeWork:    {s.homeworkDescription?.split('\n').map((line, i) => (
                        <span key={i}>{line}<br /></span>
                      )) || "N/A"}<br/>
                      {s.homeworkDueDate ? new Date(s.homeworkDueDate).toLocaleDateString() : "N/A"}
                                <Box sx={{ flex: 1, color: "#fff" }}>
                                  </Box>
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
                    </Box>
                    <Box sx={{ flex: 1, color: "#fff" }}>
                      {s.videoLinks && (
                        <iframe
                          width="100%"
                          height="100"
                          src={`https://www.youtube.com/embed/${s.videoLinks.split("v=")[1]?.split("&")[0]}`}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )}
                      {s.videoLinks2 && (
                        <iframe
                          width="100%"
                          height="100"
                          src={`https://www.youtube.com/embed/${s.videoLinks2.split("v=")[1]?.split("&")[0]}`}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )}
                    </Box>
                    </Box>
                    <Box sx={{ flex: 1 }}>
<Button
  onClick={() => handleMarkAsCompleted(s.id)}
  disabled={s.isCompleted}
  variant="contained"
  sx={{
    bgcolor: s.isCompleted ? "#065e09ff" : "#ffc107",
    color: s.isCompleted ? "#fff" : "#000",
    "&:hover": {
      bgcolor: s.isCompleted ? "#d32f2f" : "#ffca28", // RED on hover if already completed
    },
    // even when disabled — force apply green and red hover
    "&.Mui-disabled": {
      bgcolor: "#4caf50",
      color: "#fff",
      "&:hover": {
        bgcolor: "#d32f2f", // RED fake-hover if you want visual trick (works only with pointer events override)
        color:"red"
      },
    },
    // Optional: make hover "feelable" even when disabled
    pointerEvents: s.isCompleted ? "auto" : "auto",
    cursor: s.isCompleted ? "not-allowed" : "pointer",
  }}
>
  Mark as Completed
</Button>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box sx={{ color: "#fff", textAlign: "center" }}>
                  No syllabus schedules found.
                </Box>
              )}
            </Box>
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
