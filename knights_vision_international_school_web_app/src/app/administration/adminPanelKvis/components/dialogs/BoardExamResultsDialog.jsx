import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  CircularProgress,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box
} from "@mui/material";
import { CalendarToday, Close } from "@mui/icons-material";
import { toast } from "react-toastify";
import textFieldStyles from "../../../../mui_styles/TextFieldStyles";

const drawerWidth = 280;
const appBarHeight = 64;

const BoardExamResultsDialog = ({ open, onClose, boardExam, students, className, fetchBoardExams }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (boardExam && students.length) {
      fetchResults();
    }
  }, [boardExam, students]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/BoardExams/${className.toLowerCase()}/board-exam-results`, {
        params: { boardExamId: boardExam.id },
      });
      const existingResults = response.data.results || [];
      const initialResults = students.map((student) => {
        const existing = existingResults.find((r) => r.studentId === student.id) || {};
        return {
          studentId: student.id,
          writtenMarks: existing.writtenMarks || "",
          oralMarks: existing.oralMarks || "",
          remarks: existing.remarks || "",
        };
      });
      setResults(initialResults);
    } catch (err) {
      console.error("Error fetching board exam results:", err.message);
      toast.error("Failed to fetch board exam results.");
      setResults(students.map((student) => ({
        studentId: student.id,
        writtenMarks: "",
        oralMarks: "",
        remarks: "",
      })));
    } finally {
      setLoading(false);
    }
  };

  const handleResultChange = (index, field, value) => {
    const updatedResults = [...results];
    updatedResults[index][field] = value;
    setResults(updatedResults);
  };

  const handleSaveResults = async () => {
    const invalidResults = results.some(
      (result) =>
        result.writtenMarks === "" ||
        result.oralMarks === "" ||
        isNaN(result.writtenMarks) ||
        isNaN(result.oralMarks) ||
        parseFloat(result.writtenMarks) < 0 ||
        parseFloat(result.writtenMarks) > 90 ||
        parseFloat(result.oralMarks) < 0 ||
        parseFloat(result.oralMarks) > 10
    );
    if (invalidResults) {
      toast.error("All marks must be valid numbers (Written: 0-90, Oral: 0-10).");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        results: results.map((result) => ({
          boardExamId: boardExam.id,
          studentId: result.studentId,
          writtenMarks: parseFloat(result.writtenMarks),
          oralMarks: parseFloat(result.oralMarks),
          totalMarks: parseFloat(result.writtenMarks) + parseFloat(result.oralMarks),
          remarks: result.remarks || null,
        })),
      };

      console.log("Sending payload:", JSON.stringify(payload, null, 2));

      const response = await axios.post(`/api/BoardExams/${className.toLowerCase()}/board-exam-results/batch`, payload);
      if (response.status === 200) {
        toast.success("Board exam results saved successfully.");
        fetchBoardExams(boardExam.classSubjectId);
        onClose();
      } else {
        throw new Error("Unexpected response status: " + response.status);
      }
    } catch (err) {
      console.error("Save Board Exam Results Error:", err.message);
      toast.error("Failed to save board exam results: " + (err.response?.data?.error || err.message));
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
          <CalendarToday sx={{ color: "#fff" }} />
        </ListItemIcon>
        <ListItemText
          sx={{ color: "#fff" }}
          primary={`Board Exam Results for ${boardExam?.title || "Unknown"}`}
        />
        <IconButton onClick={onClose} sx={{ color: "#f44336" }}>
          <Close sx={{ color: "#fff" }} />
        </IconButton>
      </ListItemButton>
      <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#222", color: "#fff" }}>
        <Box sx={{ flex: 1, overflowY: "auto", maxHeight: "87vh" }}>
          <DialogContent sx={{ bgcolor: "#000", color: "#fff" }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                <CircularProgress size={120} sx={{ color: "#00c757" }} />
              </Box>
            ) : (
              <Table sx={{ bgcolor: "#181818" }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#333" }}>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Student Name</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Written Marks (90)</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Oral Marks (10)</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Total Marks</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.length > 0 ? (
                    students.map((student, index) => (
                      <TableRow key={student.id} sx={{ bgcolor: "#181818", "&:hover": { bgcolor: "#222" } }}>
                        <TableCell sx={{ color: "#fff" }}>{student.firstName}{student.middleName}{student.lastName}</TableCell>
                        <TableCell>
                          <TextField
                            value={results[index]?.writtenMarks || ""}
                            onChange={(e) => handleResultChange(index, "writtenMarks", e.target.value)}
                            type="number"
                            sx={{ ...textFieldStyles }}
                            placeholder="0-90"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={results[index]?.oralMarks || ""}
                            onChange={(e) => handleResultChange(index, "oralMarks", e.target.value)}
                            type="number"
                            sx={{ ...textFieldStyles }}
                            placeholder="0-10"
                          />
                        </TableCell>
                        <TableCell sx={{ color: "#fff" }}>
                          {(parseFloat(results[index]?.writtenMarks || 0) + parseFloat(results[index]?.oralMarks || 0)).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={results[index]?.remarks || ""}
                            onChange={(e) => handleResultChange(index, "remarks", e.target.value)}
                            sx={{ ...textFieldStyles }}
                            placeholder="Optional remarks"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ color: "#fff", textAlign: "center" }}>
                        No students found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </DialogContent>
          <DialogActions sx={{ bgcolor: "#000" }}>
            <Button onClick={onClose} variant="contained" color="error" sx={{ color: "#fff" }} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSaveResults} sx={{ color: "#00c757" }} disabled={loading}>
              Save All
            </Button>
          </DialogActions>
        </Box>
      </Box>
    </Dialog>
  );
};

export default BoardExamResultsDialog;