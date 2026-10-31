"use client";

import React, { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  MenuItem,
  IconButton,
  Typography,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon, CalendarToday, Close } from "@mui/icons-material";
import { toast } from "react-toastify";

const drawerWidth = 280;
const appBarHeight = 64;

const textFieldStyles = {
  "& .MuiInputBase-input": { color: "#fff" },
  "& .MuiInputLabel-root": { color: "#aaa" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#555" },
    "&:hover fieldset": { borderColor: "#777" },
    "&.Mui-focused fieldset": { borderColor: "#00c757" },
  },
  mb: 2,
};

const AddBooksDialog = ({ open, onClose, classSubjectId, subjectName, className }) => {
  const [formData, setFormData] = useState([
    {
      title: "",
      author: "",
      publisher: "",
      isbn: "",
      edition: "",
      language: "",
      bookType: "TEXTBOOK",
      downloadUrl: "",
      purchaseUrl: "",
      studyUrl: "",
    },
  ]);

  const handleInputChange = (index, field, value) => {
    const newFormData = [...formData];
    newFormData[index][field] = value;
    setFormData(newFormData);
  };

  const handleAddBook = () => {
    setFormData([
      ...formData,
      {
        title: "",
        author: "",
        publisher: "",
        isbn: "",
        edition: "",
        language: "",
        bookType: "TEXTBOOK",
        downloadUrl: "",
        purchaseUrl: "",
        studyUrl: "",
      },
    ]);
  };

  const handleRemoveBook = (index) => {
    if (formData.length > 1) {
      setFormData(formData.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    try {
      const booksToSubmit = formData.map((book) => ({
        classSubjectId,
        title: book.title,
        author: book.author || null,
        publisher: book.publisher || null,
        isbn: book.isbn || null,
        edition: book.edition || null,
        language: book.language || null,
        bookType: book.bookType,
        downloadUrl: book.downloadUrl || null,
        purchaseUrl: book.purchaseUrl || null,
        studyUrl: book.studyUrl || null,
      }));

      await axios.post(`/api/SubjectBooks/${className.toLowerCase()}/subject-books`, { books: booksToSubmit });
      toast.success("Books added successfully!");
      onClose();
      setFormData([
        {
          title: "",
          author: "",
          publisher: "",
          isbn: "",
          edition: "",
          language: "",
          bookType: "TEXTBOOK",
          downloadUrl: "",
          purchaseUrl: "",
          studyUrl: "",
        },
      ]);
    } catch (err) {
      console.error("Error adding books:", err.message);
      toast.error("Failed to add books.");
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
          primary={`Add Books for ${subjectName || "Unknown"}`}
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
        <Box sx={{ flex: 1, overflowY: "auto", pr: 1, maxHeight: "80vh" }}>
          <Box>
            {formData.map((book, index) => (
              <Box key={index} sx={{ mb: 3, p: 2, bgcolor: "#222", borderRadius: 1 }}>
                <Typography sx={{ color: "#fff", mb: 2 }}>Book {index + 1}</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  <TextField
                    label="Title"
                    value={book.title}
                    onChange={(e) => handleInputChange(index, "title", e.target.value)}
                    sx={{ ...textFieldStyles, width: "300px" }}
                    required
                  />
                  <TextField
                    label="Author"
                    value={book.author}
                    onChange={(e) => handleInputChange(index, "author", e.target.value)}
                    sx={{ ...textFieldStyles, width: "200px" }}
                  />
                  <TextField
                    label="Publisher"
                    value={book.publisher}
                    onChange={(e) => handleInputChange(index, "publisher", e.target.value)}
                    sx={{ ...textFieldStyles, width: "200px" }}
                  />
                  <TextField
                    label="ISBN"
                    value={book.isbn}
                    onChange={(e) => handleInputChange(index, "isbn", e.target.value)}
                    sx={{ ...textFieldStyles, width: "150px" }}
                  />
                  <TextField
                    label="Edition"
                    value={book.edition}
                    onChange={(e) => handleInputChange(index, "edition", e.target.value)}
                    sx={{ ...textFieldStyles, width: "100px" }}
                  />
                  <TextField
                    label="Language"
                    value={book.language}
                    onChange={(e) => handleInputChange(index, "language", e.target.value)}
                    sx={{ ...textFieldStyles, width: "100px" }}
                  />
                  <TextField
                    select
                    label="Book Type"
                    value={book.bookType}
                    onChange={(e) => handleInputChange(index, "bookType", e.target.value)}
                    sx={{ ...textFieldStyles, width: "150px" }}
                  >
                    {["TEXTBOOK", "CAREERBOOK", "WORKBOOK", "REFERENCE", "GUIDE", "NOVEL", "SUPPLEMENT"].map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Download URL"
                    value={book.downloadUrl}
                    onChange={(e) => handleInputChange(index, "downloadUrl", e.target.value)}
                    sx={{ ...textFieldStyles, width: "300px" }}
                  />
                  <TextField
                    label="Purchase URL"
                    value={book.purchaseUrl}
                    onChange={(e) => handleInputChange(index, "purchaseUrl", e.target.value)}
                    sx={{ ...textFieldStyles, width: "300px" }}
                  />
                  <TextField
                    label="Study URL"
                    value={book.studyUrl}
                    onChange={(e) => handleInputChange(index, "studyUrl", e.target.value)}
                    sx={{ ...textFieldStyles, width: "300px" }}
                  />
                  {formData.length > 1 && (
                    <IconButton onClick={() => handleRemoveBook(index)} sx={{ color: "#ff4444" }}>
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              </Box>
            ))}
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddBook}
              sx={{ color: "#00c757", borderColor: "#00c757", mb: 2 }}
            >
              Add Another Book
            </Button>
          </Box>
          <DialogActions sx={{ bgcolor: "#000" }}>
            <Button onClick={onClose} variant="contained" color="error">
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{ bgcolor: "#00c757", "&:hover": { bgcolor: "#00a550" } }}
              disabled={formData.some((book) => !book.title)}
            >
              Save Books
            </Button>
          </DialogActions>
        </Box>
      </Box>
    </Dialog>
  );
};

export default AddBooksDialog;