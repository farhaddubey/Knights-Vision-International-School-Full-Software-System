"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  MenuItem,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { toast } from "react-toastify";

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

const PublicSpeechSubmissionDialog = ({ open, mode, submission, classId, className, onClose }) => {
  const [formData, setFormData] = useState([
    {
      studentId: "",
      occasionId: "",
      title: "",
      language: "ENGLISH",
      youtubeLink: "",
      facebookLink: "",
      instagramLink: "",
    },
  ]);
  const [students, setStudents] = useState([]);
  const [occasions, setOccasions] = useState([]);

  useEffect(() => {
    if (open) {
      fetchStudents();
      fetchOccasions();
    }
  }, [open, classId, className]);

  const fetchStudents = async () => {
    const token = Cookies.get("faculties_token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }
    try {
      const response = await axios.get(`/api/MonthlyPublicSpeechSubmissions/${className.toLowerCase()}/students`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { classId },
      });
      if (!response.data || !Array.isArray(response.data.students)) {
        throw new Error("Invalid response format");
      }
      setStudents(response.data.students);
    } catch (err) {
      console.error("Error fetching students:", err.message);
      toast.error("Failed to fetch students.");
    }
  };

  const fetchOccasions = async () => {
    const token = Cookies.get("faculties_token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }
    try {
      const response = await axios.get(`/api/MonthlyPublicSpeakingOccasions/${className.toLowerCase()}/occasions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { classId, page: 1, pageSize: 1000 },
      });
      if (!response.data || !Array.isArray(response.data.occasions)) {
        throw new Error("Invalid response format");
      }
      setOccasions(response.data.occasions);
    } catch (err) {
      console.error("Error fetching occasions:", err.message);
      toast.error("Failed to fetch occasions.");
    }
  };

  const handleInputChange = (index, field, value) => {
    const newFormData = [...formData];
    newFormData[index][field] = value;
    setFormData(newFormData);
  };

  const handleAddSubmission = () => {
    setFormData([
      ...formData,
      {
        studentId: "",
        occasionId: "",
        title: "",
        language: "ENGLISH",
        youtubeLink: "",
        facebookLink: "",
        instagramLink: "",
      },
    ]);
  };

  const handleRemoveSubmission = (index) => {
    if (formData.length > 1) {
      setFormData(formData.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    const token = Cookies.get("faculties_token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }
    try {
      const submissionsToSubmit = formData.map((submission) => ({
        studentId: parseInt(submission.studentId),
        occasionId: parseInt(submission.occasionId),
        title: submission.title,
        language: submission.language,
        youtubeLink: submission.youtubeLink || null,
        facebookLink: submission.facebookLink || null,
        instagramLink: submission.instagramLink || null,
        approvedByTeacherId: 1, // Assuming teacher ID
      }));

      await axios.post(`/api/MonthlyPublicSpeechSubmissions/${className.toLowerCase()}/submissions`, { submissions: submissionsToSubmit }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Public speech submissions added successfully!");
      onClose();
      setFormData([
        {
          studentId: "",
          occasionId: "",
          title: "",
          language: "ENGLISH",
          youtubeLink: "",
          facebookLink: "",
          instagramLink: "",
        },
      ]);
    } catch (err) {
      console.error("Error adding submissions:", err.message);
      toast.error("Failed to add public speech submissions.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ bgcolor: "#333", color: "#fff" }}>
        {mode === "view" ? `Submission Details` : `Add Public Speech Submissions for Class ${className.toUpperCase()}`}
      </DialogTitle>
      <DialogContent sx={{ bgcolor: "#181818", color: "#fff" }}>
        {mode === "view" && submission ? (
          <Box>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Student</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{submission.student.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Occasion</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{submission.occasion.title}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Title</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{submission.title}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Language</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{submission.language}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>YouTube Link</TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    {submission.youtubeLink ? (
                      <a href={submission.youtubeLink} target="_blank" style={{ color: "#00c757" }}>
                        {submission.youtubeLink}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>YouTube Views</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{submission.youtubeViews || 0}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>YouTube First Place</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{submission.isFirstPlaceYouTube ? "Yes" : "No"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Facebook Link</TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    {submission.facebookLink ? (
                      <a href={submission.facebookLink} target="_blank" style={{ color: "#00c757" }}>
                        {submission.facebookLink}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Facebook Views</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{submission.facebookViews || 0}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Facebook First Place</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{submission.isFirstPlaceFacebook ? "Yes" : "No"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Instagram Link</TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    {submission.instagramLink ? (
                      <a href={submission.instagramLink} target="_blank" style={{ color: "#00c757" }}>
                        {submission.instagramLink}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Instagram Views</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{submission.instagramViews || 0}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Instagram First Place</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{submission.isFirstPlaceInstagram ? "Yes" : "No"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Submitted At</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{new Date(submission.submittedAt).toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        ) : (
          <Box>
            {formData.map((submission, index) => (
              <Box key={index} sx={{ mb: 3, p: 2, bgcolor: "#222", borderRadius: 1 }}>
                <Typography sx={{ color: "#fff", mb: 2 }}>Submission {index + 1}</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  <TextField
                    select
                    label="Student"
                    value={submission.studentId}
                    onChange={(e) => handleInputChange(index, "studentId", e.target.value)}
                    sx={{ ...textFieldStyles, width: "300px" }}
                    required
                  >
                    {students.map((student) => (
                      <MenuItem key={student.id} value={student.id}>
                        {student.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Occasion"
                    value={submission.occasionId}
                    onChange={(e) => handleInputChange(index, "occasionId", e.target.value)}
                    sx={{ ...textFieldStyles, width: "300px" }}
                    required
                  >
                    {occasions.map((occasion) => (
                      <MenuItem key={occasion.id} value={occasion.id}>
                        {occasion.title}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Title"
                    value={submission.title}
                    onChange={(e) => handleInputChange(index, "title", e.target.value)}
                    sx={{ ...textFieldStyles, width: "300px" }}
                    required
                  />
                  <TextField
                    select
                    label="Language"
                    value={submission.language}
                    onChange={(e) => handleInputChange(index, "language", e.target.value)}
                    sx={{ ...textFieldStyles, width: "200px" }}
                  >
                    {["BENGALI", "HINDI", "ENGLISH"].map((lang) => (
                      <MenuItem key={lang} value={lang}>
                        {lang}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="YouTube Link"
                    value={submission.youtubeLink}
                    onChange={(e) => handleInputChange(index, "youtubeLink", e.target.value)}
                    sx={{ ...textFieldStyles, width: "400px" }}
                  />
                  <TextField
                    label="Facebook Link"
                    value={submission.facebookLink}
                    onChange={(e) => handleInputChange(index, "facebookLink", e.target.value)}
                    sx={{ ...textFieldStyles, width: "400px" }}
                  />
                  <TextField
                    label="Instagram Link"
                    value={submission.instagramLink}
                    onChange={(e) => handleInputChange(index, "instagramLink", e.target.value)}
                    sx={{ ...textFieldStyles, width: "400px" }}
                  />
                </Box>
                {formData.length > 1 && (
                  <IconButton onClick={() => handleRemoveSubmission(index)} sx={{ color: "#ff4444" }}>
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            ))}
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddSubmission}
              sx={{ color: "#00c757", borderColor: "#00c757", mb: 2 }}
            >
              Add Another Submission
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ bgcolor: "#333" }}>
        <Button onClick={onClose} sx={{ color: "#fff" }}>
          Close
        </Button>
        {mode === "add" && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ bgcolor: "#00c757", "&:hover": { bgcolor: "#00a550" } }}
            disabled={formData.some((submission) => !submission.studentId || !submission.occasionId || !submission.title)}
          >
            Save Submissions
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PublicSpeechSubmissionDialog;