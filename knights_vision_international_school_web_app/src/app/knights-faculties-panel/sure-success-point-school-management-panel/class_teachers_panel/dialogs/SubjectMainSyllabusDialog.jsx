"use client";

import React, { useState, useEffect } from "react";
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
import { toast, ToastContainer } from "react-toastify";
import { Bounce } from "react-toastify";
import Cookies from "js-cookie"; 
const drawerWidth = 280;
const appBarHeight = 64;

const SubjectMainSyllabusDialog = ({
  open,
  onClose,
  selectedClassSubject,
  syllabusTopics,
  syllabusLoading,
  className,
}) => {
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState(syllabusTopics);

  // Update topics when prop changes
  useEffect(() => {
    setTopics(syllabusTopics);
  }, [syllabusTopics]);

  const handleMarkAsCompleted = async (id) => {
  try {
    const token = Cookies.get("faculties_token");
    if (!token) throw new Error("User not authenticated");

    const response = await axios.post(
      `/api-schools-panel/class_teachers_panel/SubjectSyllabus/completed/${id}`,
      {}, // No body
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("API Response:", response.data);
    toast.success("Syllabus topic marked as completed", {
      position: "bottom-center",
      autoClose: 5000,
      theme: "dark",
      transition: Bounce,
    });

    setTopics((prevTopics) =>
      prevTopics.map((t) =>
        t.id === id ? { ...t, isCompleted: true, completionDate: new Date() } : t
      )
    );
  } catch (err) {
    console.error("Error marking as completed:", err.message);
    toast.error("Failed to mark as completed.", {
      position: "bottom-center",
      autoClose: 5000,
      theme: "dark",
      transition: Bounce,
    });
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
        <ListItemText sx={{ color: "#fff" }} primary={`Main Syllabus for ${selectedClassSubject?.subject.name || "Unknown"} - ${className}`} />
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
          {syllabusLoading || loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
              <CircularProgress size={120} />
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
              <Box sx={{ display: "flex", gap: 1, bgcolor: "#333", p: 1, fontWeight: "bold" }}>
                <Box sx={{ flex: 1, color: "#fff" }}>ID</Box>
                <Box sx={{ flex: 2, color: "#fff" }}>Topic</Box>
                <Box sx={{ flex: 2, color: "#fff" }}>Completed</Box>
                <Box sx={{ flex: 2, color: "#fff" }}>Completion Date</Box>
                <Box sx={{ flex: 5, color: "#fff" }}>Lecture Content</Box>
                <Box sx={{ flex: 1, color: "#fff" }}>Action</Box>
              </Box>
              {topics.length > 0 ? (
                topics.map((t) => (
                  <Box
                    key={t.id}
                    sx={{ display: "flex", gap: 1, bgcolor: "#181818", p: 1, "&:hover": { bgcolor: "#222" } }}
                  >
                    <Box sx={{ flex: 1, color: "#fff" }}>{t.id}</Box>
                    <Box sx={{ flex: 2, color: "#fff" }}>{t.topic}</Box>
                    <Box sx={{ flex: 2, color: "#fff" }}>{t.isCompleted ? "Yes" : "No"}</Box>
                    <Box sx={{ flex: 2, color: "#fff" }}>
                      {t.completionDate ? new Date(t.completionDate).toLocaleDateString() : "N/A"}
                    </Box>
                    <Box sx={{ flex: 5, color: "#fff" }}>
                      {t.lectureContent?.startsWith("https://") ? (
                        <iframe
                          width="100%"
                          height="100"
                          src={t.lectureContent.includes("youtube.com") || t.lectureContent.includes("youtu.be")
                            ? `https://www.youtube.com/embed/${t.lectureContent.split("v=")[1]?.split("&")[0] || t.lectureContent.split("/").pop()}`
                            : t.lectureContent}
                          title="Lecture Content"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        t.lectureContent?.split('\n').map((line, i) => (
                          <span key={i}>{line}<br /></span>
                        )) || "N/A"
                      )}
                    </Box>
                    <Box sx={{ flex: 1 }}>
              
                      <Button
  onClick={() => handleMarkAsCompleted(t.id)}
  disabled={t.isCompleted}
  variant="contained"
  sx={{
    bgcolor: t.isCompleted ? "#4caf50" : "#ffc107",
    color: t.isCompleted ? "#fff" : "#000",
    "&:hover": {
      bgcolor: t.isCompleted ? "#d32f2f" : "#ffca28", // RED on hover if already completed
    },
    // even when disabled — force apply green and red hover
    "&.Mui-disabled": {
      bgcolor: "#4caf50",
      color: "#fff",
      "&:hover": {
        bgcolor: "#d32f2f", // RED fake-hover if you want visual trick (works only with pointer events override)
      },
    },
    // Optional: make hover "feelable" even when disabled
    pointerEvents: t.isCompleted ? "auto" : "auto",
    cursor: t.isCompleted ? "not-allowed" : "pointer",
  }}
>
  Mark as Completed
</Button>

                    </Box>
                  </Box>
                ))
              ) : (
                <Box sx={{ color: "#fff", textAlign: "center" }}>
                  No syllabus topics found.
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

export default SubjectMainSyllabusDialog;