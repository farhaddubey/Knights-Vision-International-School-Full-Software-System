"use client";

import React, { useState } from "react";
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
  Switch,
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

const KnightsCdtpSessionDialog = ({ open, mode, session, classId, className, onClose }) => {
  const [formData, setFormData] = useState([
    {
      sessionType: "MOTIVATIONAL_STORY",
      title: "",
      content: "",
      sessionDate: "",
      videoLink: "",
      articleLink: "",
      imageUrl: "",
      isUnlocked: false,
      unlockReason: "",
    },
  ]);

  const handleInputChange = (index, field, value) => {
    const newFormData = [...formData];
    newFormData[index][field] = value;
    setFormData(newFormData);
  };

  const handleAddSession = () => {
    setFormData([
      ...formData,
      {
        sessionType: "MOTIVATIONAL_STORY",
        title: "",
        content: "",
        sessionDate: "",
        videoLink: "",
        articleLink: "",
        imageUrl: "",
        isUnlocked: false,
        unlockReason: "",
      },
    ]);
  };

  const handleRemoveSession = (index) => {
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
      const sessionsToSubmit = formData.map((session) => ({
        classId,
        schoolId: 1,
        branchId: 1,
        sessionType: session.sessionType,
        title: session.title,
        content: session.content || null,
        sessionDate: new Date(session.sessionDate),
        videoLink: session.videoLink || null,
        articleLink: session.articleLink || null,
        imageUrl: session.imageUrl || null,
        isUnlocked: session.isUnlocked,
        unlockReason: session.isUnlocked ? session.unlockReason || null : null,
      }));

      await axios.post(`/api/MonthlyKnightsCdtpSessions/${className.toLowerCase()}/sessions`, { sessions: sessionsToSubmit }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Knights CDTP sessions added successfully!");
      onClose();
      setFormData([
        {
          sessionType: "MOTIVATIONAL_STORY",
          title: "",
          content: "",
          sessionDate: "",
          videoLink: "",
          articleLink: "",
          imageUrl: "",
          isUnlocked: false,
          unlockReason: "",
        },
      ]);
    } catch (err) {
      console.error("Error adding sessions:", err.message);
      toast.error("Failed to add Knights CDTP sessions.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ bgcolor: "#333", color: "#fff" }}>
        {mode === "view" ? `Session Details` : `Add Knights CDTP Sessions for Class ${className.toUpperCase()}`}
      </DialogTitle>
      <DialogContent sx={{ bgcolor: "#181818", color: "#fff" }}>
        {mode === "view" && session ? (
          <Box>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Session Type</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{session.sessionType.replace(/_/g, " ")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Title</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{session.title}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Content</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{session.content || "N/A"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Session Date</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{new Date(session.sessionDate).toLocaleDateString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Video Link</TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    {session.videoLink ? (
                      <a href={session.videoLink} target="_blank" style={{ color: "#00c757" }}>
                        {session.videoLink}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Article Link</TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    {session.articleLink ? (
                      <a href={session.articleLink} target="_blank" style={{ color: "#00c757" }}>
                        {session.articleLink}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Image URL</TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    {session.imageUrl ? (
                      <a href={session.imageUrl} target="_blank" style={{ color: "#00c757" }}>
                        {session.imageUrl}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Unlocked</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{session.isUnlocked ? "Yes" : "No"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Unlock Reason</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{session.unlockReason || "N/A"}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        ) : (
          <Box>
            {formData.map((session, index) => (
              <Box key={index} sx={{ mb: 3, p: 2, bgcolor: "#222", borderRadius: 1 }}>
                <Typography sx={{ color: "#fff", mb: 2 }}>Session {index + 1}</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  <TextField
                    select
                    label="Session Type"
                    value={session.sessionType}
                    onChange={(e) => handleInputChange(index, "sessionType", e.target.value)}
                    sx={{ ...textFieldStyles, width: "300px" }}
                    required
                  >
                    {["MOTIVATIONAL_STORY", "TALENT_ZONE_UNLOCK", "CAREER_FLASHCARD", "SUPER_HABIT", "CHARACTER_LESSON"].map((type) => (
                      <MenuItem key={type} value={type}>
                        {type.replace(/_/g, " ")}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Title"
                    value={session.title}
                    onChange={(e) => handleInputChange(index, "title", e.target.value)}
                    sx={{ ...textFieldStyles, width: "300px" }}
                    required
                  />
                  <TextField
                    label="Content"
                    value={session.content}
                    onChange={(e) => handleInputChange(index, "content", e.target.value)}
                    sx={{ ...textFieldStyles, width: "400px" }}
                    multiline
                    rows={3}
                  />
                  <TextField
                    label="Session Date"
                    type="date"
                    value={session.sessionDate}
                    onChange={(e) => handleInputChange(index, "sessionDate", e.target.value)}
                    sx={{ ...textFieldStyles, width: "200px" }}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                  <TextField
                    label="Video Link"
                    value={session.videoLink}
                    onChange={(e) => handleInputChange(index, "videoLink", e.target.value)}
                    sx={{ ...textFieldStyles, width: "400px" }}
                  />
                  <TextField
                    label="Article Link"
                    value={session.articleLink}
                    onChange={(e) => handleInputChange(index, "articleLink", e.target.value)}
                    sx={{ ...textFieldStyles, width: "400px" }}
                  />
                  <TextField
                    label="Image URL"
                    value={session.imageUrl}
                    onChange={(e) => handleInputChange(index, "imageUrl", e.target.value)}
                    sx={{ ...textFieldStyles, width: "400px" }}
                  />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography sx={{ color: "#fff" }}>Unlocked</Typography>
                    <Switch
                      checked={session.isUnlocked}
                      onChange={(e) => handleInputChange(index, "isUnlocked", e.target.checked)}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#00c757",
                          "&:hover": { backgroundColor: "rgba(0, 199, 87, 0.08)" },
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                          backgroundColor: "#00c757",
                        },
                      }}
                    />
                  </Box>
                  {session.isUnlocked && (
                    <TextField
                      label="Unlock Reason"
                      value={session.unlockReason}
                      onChange={(e) => handleInputChange(index, "unlockReason", e.target.value)}
                      sx={{ ...textFieldStyles, width: "300px" }}
                    />
                  )}
                </Box>
                {formData.length > 1 && (
                  <IconButton onClick={() => handleRemoveSession(index)} sx={{ color: "#ff4444" }}>
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            ))}
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddSession}
              sx={{ color: "#00c757", borderColor: "#00c757", mb: 2 }}
            >
              Add Another Session
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
            disabled={formData.some((session) => !session.sessionType || !session.title || !session.sessionDate)}
          >
            Save Sessions
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default KnightsCdtpSessionDialog;