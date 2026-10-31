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
import Cookies from "js-cookie";

const drawerWidth = 280;
const appBarHeight = 64;

const ViewBooksDialog = ({ open, onClose, classSubjectId, subjectName, classId }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && classSubjectId && classId) {
      fetchBooks();
    }
  }, [open, classSubjectId, classId]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("student_token");
      if (!token) throw new Error("User not authenticated");

      const response = await axios.get(`/api/a1-knights-students-panel/subject-books`, {
        params: { classSubjectId, classId },
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("DEBUG: Fetch books response:", response.data);

      if (!response.data || !Array.isArray(response.data.books)) {
        throw new Error("Invalid response format");
      }

      setBooks(response.data.books);
      if (response.data.books.length === 0) {
        toast.info(`No books found for subject ${subjectName}`);
      }
    } catch (err) {
      console.error("DEBUG: Error fetching books:", err.message, err.response?.data);
      toast.error(`Failed to fetch books: ${err.response?.data?.error || err.message}`);
      setBooks([]);
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
            <Typography sx={{ color: "#fff", p: 2, textAlign: "center" }}>
              No books found for {subjectName || "this subject"}.
            </Typography>
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