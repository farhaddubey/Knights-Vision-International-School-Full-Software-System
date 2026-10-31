"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
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
  CircularProgress,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { CalendarToday, Close } from "@mui/icons-material";
import { toast } from "react-toastify";

const drawerWidth = 280;
const appBarHeight = 64;

const ViewBooksDialog = ({ open, onClose, classSubjectId, subjectName, className }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && classSubjectId) {
      fetchBooks();
    }
  }, [open, classSubjectId]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api-schools-panel/class_teachers_panel/SubjectBooks/${className.toLowerCase()}/subject-books`, {
        params: { classSubjectId },
      });
      if (!response.data || !Array.isArray(response.data.books)) {
        throw new Error("Invalid response format");
      }
      setBooks(response.data.books);
    } catch (err) {
      console.error("Error fetching books:", err.message);
      toast.error("Failed to fetch books.");
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
          primary={`Books for ${subjectName || "Unknown"}`}
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
      <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#000", color: "#fff" }}>
        <Box sx={{ flex: 1, overflowY: "auto", maxHeight: "80vh" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
              <CircularProgress sx={{ color: "#00c757" }} />
            </Box>
          ) : books.length > 0 ? (
            <Table sx={{ bgcolor: "#181818" }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "#333" }}>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Title</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Author</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Publisher</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>ISBN</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Book Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {books.map((book) => (
                  <TableRow key={book.id} sx={{ bgcolor: "#181818", "&:hover": { bgcolor: "#222" } }}>
                    <TableCell sx={{ color: "#fff" }}>{book.title}</TableCell>
                    <TableCell sx={{ color: "#fff" }}>{book.author || "N/A"}</TableCell>
                    <TableCell sx={{ color: "#fff" }}>{book.publisher || "N/A"}</TableCell>
                    <TableCell sx={{ color: "#fff" }}>{book.isbn || "N/A"}</TableCell>
                    <TableCell sx={{ color: "#fff" }}>{book.bookType}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography sx={{ color: "#fff", p: 2 }}>No books found for this subject.</Typography>
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

export default ViewBooksDialog;