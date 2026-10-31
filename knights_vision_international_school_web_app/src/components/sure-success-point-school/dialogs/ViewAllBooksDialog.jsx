"use client";

// Shared book viewer for authorized school panels.

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
  IconButton,
} from "@mui/material";
import { Book as BookIcon, Close, Download } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const drawerWidth = 280;
const appBarHeight = 64;

const ViewAllBooksDialog = ({ open, onClose, className, academicYear }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [schoolId, setSchoolId] = useState(null);
  const [branchId, setBranchId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setSchoolId(decoded.schoolId);
        setBranchId(decoded.branchId);
        console.log("Decoded JWT:", { schoolId: decoded.schoolId, branchId: decoded.branchId });
      } catch (err) {
        console.error("Error decoding token:", err.message);
        toast.error("Invalid authentication token.");
        setError("Invalid authentication token.");
      }
    } else {
      toast.error("User not authenticated. Please log in.");
      setError("User not authenticated.");
    }
  }, []);

  useEffect(() => {
    if (open && className && academicYear) {
      fetchBooks();
    } else if (open) {
      console.warn("Cannot fetch books: Missing parameters", { className, schoolId, branchId, academicYear });
      setError("Missing required parameters to fetch books.");
      setLoading(false);
    }
  }, [open, className, schoolId, branchId, academicYear]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = Cookies.get("token");
      if (!token) throw new Error("User not authenticated");

      console.log("Fetching books with params:", { className, schoolId, branchId, academicYear });

      const response = await axios.get(`/api-schools-panel/class_teachers_panel/subject-books/all`, {
        params: { className, schoolId, branchId, academicYear },
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("API Response:", response.data);

      if (!response.data || !Array.isArray(response.data.books)) {
        throw new Error("Invalid response format: Expected an array of books");
      }

      const fetchedBooks = response.data.books;
      if (fetchedBooks.length === 0) {
        console.warn("No books returned from API for:", { className, academicYear });
        toast.warn(`No books found for class ${className} in academic year ${academicYear}.`);
      }

      setBooks(fetchedBooks);
    } catch (err) {
      console.error("Error fetching all books:", err.message, err.response?.data);
      setError(`Failed to fetch books: ${err.message}`);
      toast.error(`Failed to fetch books: ${err.message}`);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ books, className, academicYear }),
      });
      if (!response.ok) throw new Error("Failed to generate PDF");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `AllBooks_${className}_${academicYear}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("📄 PDF downloaded successfully.");
    } catch (err) {
      console.error("Error generating PDF:", err.message);
      toast.error("Failed to generate PDF.");
    }
  };

  return (
    <Dialog
      sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        transform: "translate(0, 0)",
        zIndex: 1300,
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
      />
      <ListItemButton
        sx={{
          backgroundColor: "#009688",
          color: "#fff",
          "&:hover": { backgroundColor: "#009688" },
        }}
      >
        <ListItemIcon>
          <BookIcon sx={{ color: "#fff" }} />
        </ListItemIcon>
        <ListItemText
          sx={{ color: "#fff" }}
          primary={`All Books for ${className ? className.toUpperCase() : "Unknown"} - Academic Year ${academicYear}`}
        />
        <Box>
          <IconButton
            onClick={handleDownloadPDF}
            sx={{ color: "#fff" }}
            disabled={books.length === 0}
          >
            <Download sx={{ color: "#fff" }} />
          </IconButton>
          <IconButton onClick={onClose} sx={{ color: "#f44336" }}>
            <Close sx={{ color: "#fff" }} />
          </IconButton>
        </Box>
      </ListItemButton>
      <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#222", color: "#fff" }}>
        <Box sx={{ flex: 1, overflowY: "auto", maxHeight: "87vh" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
              <CircularProgress size={120} sx={{ color: "#00c757" }} />
            </Box>
          ) : error ? (
            <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
              {error}
            </Typography>
          ) : books.length > 0 ? (
            <Table sx={{ bgcolor: "#181818" }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "#333" }}>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold", fontFamily: "Nirmala UI, system-ui, -apple-system, sans-serif" }}>
                    Subject
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold", fontFamily: "Nirmala UI, system-ui, -apple-system, sans-serif" }}>
                    Title
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold", fontFamily: "Nirmala UI, system-ui, -apple-system, sans-serif" }}>
                    Author
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold", fontFamily: "Nirmala UI, system-ui, -apple-system, sans-serif" }}>
                    Publisher
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold", fontFamily: "Nirmala UI, system-ui, -apple-system, sans-serif" }}>
                    Book Type
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(() => {
                  const groupedBooks = books.reduce((acc, book) => {
                    if (!acc[book.subjectName]) {
                      acc[book.subjectName] = [];
                    }
                    acc[book.subjectName].push(book);
                    return acc;
                  }, {});
                  const sortedSubjects = Object.keys(groupedBooks).sort();
                  return sortedSubjects.map((subject, subjIndex) => {
                    const group = groupedBooks[subject];
                    return group.map((book, bookIndex) => (
                      <TableRow key={book.id || `${subject}-${bookIndex}`} sx={{ bgcolor: "#181818", "&:hover": { bgcolor: "#222" } }}>
                        {bookIndex === 0 && (
                          <TableCell
                            rowSpan={group.length}
                            sx={{
                              color: "#fff",
                              fontWeight: "bold",
                              verticalAlign: "top",
                              fontFamily: "Nirmala UI, system-ui, -apple-system, sans-serif",
                            }}
                          >
                            {`${subjIndex + 1}. ${subject}`}
                          </TableCell>
                        )}
                        <TableCell sx={{ color: "#fff", fontFamily: "Nirmala UI, system-ui, -apple-system, sans-serif" }}>
                          {book.title}
                        </TableCell>
                        <TableCell sx={{ color: "#fff", fontFamily: "Nirmala UI, system-ui, -apple-system, sans-serif" }}>
                          {book.author || "N/A"}
                        </TableCell>
                        <TableCell sx={{ color: "#fff", fontFamily: "Nirmala UI, system-ui, -apple-system, sans-serif" }}>
                          {book.publisher || "N/A"}
                        </TableCell>
                        <TableCell sx={{ color: "#fff", fontFamily: "Nirmala UI, system-ui, -apple-system, sans-serif" }}>
                          {book.bookType}
                        </TableCell>
                      </TableRow>
                    ));
                  });
                })()}
              </TableBody>
            </Table>
          ) : (
            <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
              No books found for this class.
            </Typography>
          )}
          <DialogActions sx={{ bgcolor: "#000" }}>
            <Button onClick={onClose} variant="contained" color="error" sx={{ color: "#fff" }}>
              Close
            </Button>
          </DialogActions>
        </Box>
      </Box>
    </Dialog>
  );
};

export default ViewAllBooksDialog;
