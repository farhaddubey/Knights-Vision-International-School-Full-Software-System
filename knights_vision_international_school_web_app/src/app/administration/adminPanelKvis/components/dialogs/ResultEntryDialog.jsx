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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Box,
  Typography,
  Paper,
  CircularProgress
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import { Edit } from "@mui/icons-material";

const drawerWidth = 280;
const appBarHeight = 64;
const greenAccent = "#00c853";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const ResultEntryDialog = ({ open, onClose, subject, classId, academicYear, month }) => {
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (subject && open) {
      fetchStudentsAndResults();
    }
  }, [subject, open]);

  const fetchStudentsAndResults = async () => {
    const token = Cookies.get("administration_token");
    if (!token) {
      setError("User not authenticated.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const monthIndex = monthNames.indexOf(month) + 1;
      const response = await axios.get(`/api/classes/vi/board-exam-results`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { classId, subjectId: subject?.subjectId, academicYear, month: monthIndex },
      });
      const { students, results } = response.data;
      setStudents(students);
      const resultMap = results.reduce((acc, result) => ({
        ...acc,
        [result.studentId]: {
          writtenMarks: result.writtenMarks?.toString() || "",
          oralMarks: result.oralMarks?.toString() || "",
          totalMarks: result.totalMarks?.toString() || "",
          remarks: result.remarks || "",
        },
      }), {});
      setResults(resultMap);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch students and results.");
      toast.error("Failed to fetch students and results.");
    } finally {
      setLoading(false);
    }
  };

  const handleResultChange = (studentId, field, value) => {
    setResults((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId] || {},
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    const token = Cookies.get("administration_token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }
    try {
      setLoading(true);
      const monthIndex = monthNames.indexOf(month) + 1;
      const examDate = new Date(academicYear, monthIndex - 1, 1);
      const resultData = Object.entries(results).map(([studentId, data]) => ({
        studentId: parseInt(studentId),
        classSubjectId: subject.id,
        subjectId: subject.subjectId,
        classId,
        branchId: subject.branchId,
        schoolId: subject.schoolId,
        writtenMarks: parseFloat(data.writtenMarks) || 0,
        oralMarks: parseFloat(data.oralMarks) || 0,
        totalMarks: (parseFloat(data.writtenMarks) || 0) + (parseFloat(data.oralMarks) || 0),
        remarks: data.remarks || null,
        examDate,
        academicYear,
      }));

      await axios.post(`/api/classes/vi/board-exam-results`, resultData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Results saved successfully!");
      onClose();
    } catch (err) {
      toast.error(`Failed to save results: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        transform: "translate(0, 0)",
        "& .MuiDialog-paper": { backgroundColor: "#000", color: "#fff" },
      }}
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
      <DialogTitle
        sx={{
          backgroundColor: "#212121",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Edit sx={{ color: greenAccent }} />
        <Typography variant="h6">
          Manage Results: {subject?.subject.name} ({month} {academicYear})
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: "#000" }}>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress sx={{ color: greenAccent }} />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ backgroundColor: "#181818" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#333" }}>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Student Name</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Adm No.</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Written Marks (90)</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Oral Marks (10)</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Total Marks (100)</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id} sx={{ "&:hover": { backgroundColor: "#2a2a2a" } }}>
                    <TableCell sx={{ color: "#fff" }}>
                      {`${student.firstName} ${student.lastName}`}
                    </TableCell>
                    <TableCell sx={{ color: "#fff" }}>
                      {student.admissionNumber || "N/A"}
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={results[student.id]?.writtenMarks || ""}
                        onChange={(e) => handleResultChange(student.id, "writtenMarks", e.target.value)}
                        inputProps={{ min: 0, max: 90 }}
                        size="small"
                        sx={{
                          backgroundColor: "#333",
                          "& .MuiInputBase-input": { color: "#fff" },
                          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
                          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: greenAccent },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={results[student.id]?.oralMarks || ""}
                        onChange={(e) => handleResultChange(student.id, "oralMarks", e.target.value)}
                        inputProps={{ min: 0, max: 10 }}
                        size="small"
                        sx={{
                          backgroundColor: "#333",
                          "& .MuiInputBase-input": { color: "#fff" },
                          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
                          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: greenAccent },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "#fff" }}>
                      {(parseFloat(results[student.id]?.writtenMarks || 0) + parseFloat(results[student.id]?.oralMarks || 0)).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={results[student.id]?.remarks || ""}
                        onChange={(e) => handleResultChange(student.id, "remarks", e.target.value)}
                        size="small"
                        sx={{
                          backgroundColor: "#333",
                          "& .MuiInputBase-input": { color: "#fff" },
                          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
                          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: greenAccent },
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions sx={{ bgcolor: "#000" }}>
        <Button onClick={onClose} variant="contained" color="error" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || students.length === 0}
          sx={{ bgcolor: greenAccent, color: "#000", "&:hover": { bgcolor: "#00a548" } }}
        >
          Save Results
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResultEntryDialog;