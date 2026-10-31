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
  IconButton,
} from "@mui/material";
import { Book as BookIcon, Close, Download } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const drawerWidth = 280;
const appBarHeight = 64;

const ViewAllBooksDialog = ({ open, onClose, classId, className, academicYear }) => {
  const [books, setBooks] = useState([]); // Raw books from API
  const [loading, setLoading] = useState(false);
  const [schoolId, setSchoolId] = useState(null);
  const [branchId, setBranchId] = useState(null);

  useEffect(() => {
    const token = Cookies.get("student_token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setSchoolId(decoded.schoolId);
        setBranchId(decoded.branchId);
      } catch (err) {
        console.error("DEBUG: Error decoding token:", err.message);
        toast.error("Invalid authentication token.");
      }
    } else {
      console.error("DEBUG: No student token found");
      toast.error("User not authenticated.");
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchBooks();
    }
  }, [open]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("student_token");
      if (!token) throw new Error("User not authenticated");

      const response = await axios.get(`/api/a1-knights-students-panel/subject-books/all`, {
        params: { classId, schoolId, branchId, academicYear },
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("DEBUG: All books response:", response.data);

      if (!response.data || !Array.isArray(response.data.books)) {
        throw new Error("Invalid response format");
      }

      const fetchedBooks = response.data.books;
      setBooks(fetchedBooks);

      if (fetchedBooks.length === 0) {
        toast.info(`No books found for Class ${className}`);
      }
    } catch (err) {
      console.error("DEBUG: Error fetching all books:", err.message, err.response?.data);
      toast.error(`Failed to fetch books: ${err.response?.data?.error || err.message}`);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Group books exactly like the first (teacher) component
  const getGroupedBooks = () => {
    return books.reduce((acc, book) => {
      if (!acc[book.subjectName]) {
        acc[book.subjectName] = [];
      }
      acc[book.subjectName].push(book);
      return acc;
    }, {});
  };

  const handleDownloadPDF = async () => {
    if (books.length === 0) {
      toast.info("No books to include in the PDF.");
      return;
    }

    try {
      toast.info("Generating PDF, please wait...", { autoClose: false, toastId: "pdf-generating" });

      // Reconstruct the exact same structure the first component sends
      // The first component sends the raw `books` array (flat, with subjectName on each book)
      // But to be 100% safe, we'll send the same flat array — which we already have in `books`
      // However, just in case the backend relies on order or grouping awareness, we send the original flat list

      const response = await fetch("/api/generate-pdf-puppet-org", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          books,              // ← Exactly the same flat array as first component
          className,
          academicYear,
          schoolId,
          branchId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate PDF on server");
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error("Generated PDF is empty");
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `AllBooks_${className}_${academicYear}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.dismiss("pdf-generating");
      toast.success("📄 PDF downloaded successfully!");
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast.dismiss("pdf-generating");
      toast.error(`Failed to generate PDF: ${err.message}`);
    }
  };

  // For display: use grouped view like the first component
  const groupedBooks = getGroupedBooks();
  const sortedSubjects = Object.keys(groupedBooks).sort();

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
          primary={`All Books for ${className.toUpperCase()} - Academic Year ${academicYear}`}
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
                    ISBN
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold", fontFamily: "Nirmala UI, system-ui, -apple-system, sans-serif" }}>
                    Book Type
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedSubjects.map((subject, subjIndex) => {
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
                        {book.isbn || "N/A"}
                      </TableCell>
                      <TableCell sx={{ color: "#fff", fontFamily: "Nirmala UI, system-ui, -apple-system, sans-serif" }}>
                        {book.bookType}
                      </TableCell>
                    </TableRow>
                  ));
                })}
              </TableBody>
            </Table>
          ) : (
            <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>
              No books found for Class {className}.
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