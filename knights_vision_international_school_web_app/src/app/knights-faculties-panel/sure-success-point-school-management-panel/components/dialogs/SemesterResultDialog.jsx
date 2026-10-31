import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Divider,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import textDisabledFieldStyles from "../../../../mui_styles/TextDisableFieldStyles";
import textFieldStyles from "../../../../mui_styles/TextFieldStyles";

const drawerWidth = 280;
const appBarHeight = 64;

const SemesterResultDialog = ({ open, handleCloseModal, classSubject, className }) => {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [semesterResults, setSemesterResults] = useState({
    SEMESTER_I: [],
    SEMESTER_II: [],
    SEMESTER_III: [],
  });

  useEffect(() => {
    if (open && classSubject) {
      fetchStudentsAndResults();
    }
  }, [open, classSubject]);

  const fetchStudentsAndResults = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('faculties_token');
      if (!token) throw new Error("No authentication token found");

      console.log(`DEBUG: Fetching students for classId=${classSubject?.classId}`);
      const studentResponse = await axios.get(
        `/api-schools-panel/class_teachers_panel/SemesterResults/${className.toLowerCase()}/students/${classSubject?.classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const students = studentResponse.data.students || [];
      console.log(`DEBUG: Fetched ${students.length} students`, students);
      setStudents(students);

      const semesters = ["SEMESTER_I", "SEMESTER_II", "SEMESTER_III"];
      console.log('DEBUG: Fetching results for semesters', semesters);
      const resultsBySemester = await Promise.all(
        semesters.map(async (semester) => {
          const response = await axios.get(
            `/api-schools-panel/class_teachers_panel/SemesterResults/${className.toLowerCase()}/semester-results`,
            {
              params: { classSubjectId: classSubject.id, semester },
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          console.log(`DEBUG: Fetched results for ${semester}`, response.data.results);
          return { semester, results: response.data.results || [] };
        })
      );

      const initializedResults = semesters.reduce((acc, semester) => {
        const semesterData = resultsBySemester.find((r) => r.semester === semester);
        const existingResults = semesterData.results;

        console.log(`DEBUG: Initializing results for ${semester}`);
        const results = students.map((student) => {
          const existingResult = existingResults.find(
            (r) => r.studentId === student.id && r.semester === semester
          );

          if (existingResult) {
            console.log(`DEBUG: Found existing result for student ${student.id} in ${semester}`);
            return {
              ...existingResult,
              totalMarks:
                (parseFloat(existingResult.semesterExamMarks) || 0) +
                (parseFloat(existingResult.vivaMarks) || 0) +
                (parseFloat(existingResult.internalMarks) || 0),
              student: {
                firstName: student.firstName,
                lastName: student.lastName,
              },
            };
          }

          console.log(`DEBUG: Fetching internal marks for student ${student.id} in ${semester}`);
          return axios
            .get(`/api-schools-panel/class_teachers_panel/SemesterResults/${className.toLowerCase()}/student-assignments/sum-of-internal-assigns`, {
              params: { studentId: student.id, classSubjectId: classSubject.id, semester },
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((avgResponse) => {
              const sumMarks = avgResponse.data.averageMarks || 0; // Capped sum (0–3)
              const internalMarks = (sumMarks / 3) * 24; // Scale 0–3 to 0–24
              console.log(`DEBUG: Calculated internalMarks=${internalMarks} for student ${student.id}`);
              return {
                studentId: student.id,
                student: { firstName: student.firstName, lastName: student.lastName },
                classSubjectId: classSubject.id,
                classId: classSubject.classId,
                branchId: student.branchId, // Use classSubject for consistency
                schoolId: student.schoolId, // Use classSubject for consistency
                subjectId: classSubject.subjectId,
                semester,
                semesterExamMarks: 0,
                vivaMarks: 0,
                internalMarks,
                totalMarks: internalMarks,
                remarks: "",
              };
            });
        });

        return { ...acc, [semester]: Promise.all(results) };
      }, {});

      console.log('DEBUG: Resolving initialized results');
      const resolvedResults = {
        SEMESTER_I: await initializedResults.SEMESTER_I,
        SEMESTER_II: await initializedResults.SEMESTER_II,
        SEMESTER_III: await initializedResults.SEMESTER_III,
      };
      console.log('DEBUG: Set semester results', resolvedResults);
      setSemesterResults(resolvedResults);
    } catch (err) {
      console.error("DEBUG: Initialize Results Error:", err.message, err.response?.data);
      const message = err.response?.status === 405
        ? "Server error: Method not allowed. Contact support."
        : err.response?.status === 401
        ? "Unauthorized: Please log in again."
        : `Failed to initialize results: ${err.response?.data?.error || err.message}`;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (semester, index, field, value) => {
    console.log(`DEBUG: Handling field change for ${semester}, index=${index}, field=${field}, value=${value}`);
    const updatedResults = { ...semesterResults };
    const result = updatedResults[semester][index];

    let clampedValue = value;
    if (field === "semesterExamMarks") {
      const numValue = parseFloat(value) || 0;
      clampedValue = Math.min(Math.max(numValue, 0), 70);
      if (numValue > 70) {
        toast.warn(`Semester Exam Marks capped at 70 for ${result.student.firstName} ${result.student.lastName}`);
      }
    } else if (field === "vivaMarks") {
      const numValue = parseFloat(value) || 0;
      clampedValue = Math.min(Math.max(numValue, 0), 6);
      if (numValue > 6) {
        toast.warn(`Viva Marks capped at 6 for ${result.student.firstName} ${result.student.lastName}`);
      }
    }

    result[field] = clampedValue;

    const semesterExamMarks = parseFloat(result.semesterExamMarks) || 0;
    const vivaMarks = parseFloat(result.vivaMarks) || 0;
    const internalMarks = parseFloat(result.internalMarks) || 0;
    result.totalMarks = Math.min(semesterExamMarks + vivaMarks + internalMarks, 100);

    console.log(`DEBUG: Updated result for ${semester}, index=${index}`, result);
    setSemesterResults(updatedResults);
  };

  const handleSaveChanges = async (semester) => {
    try {
      setLoading(true);
      console.log(`DEBUG: Saving results for ${semester}`);

      const token = Cookies.get('faculties_token');
      if (!token) throw new Error("No authentication token found");

      const payload = semesterResults[semester].map((field) => ({
        studentId: field.studentId,
        classSubjectId: field.classSubjectId,
        classId: field.classId,
        branchId: field.branchId,
        schoolId: field.schoolId,
        subjectId: field.subjectId,
        semester: field.semester,
        semesterExamMarks: parseFloat(field.semesterExamMarks) || 0,
        vivaMarks: parseFloat(field.vivaMarks) || 0,
        internalMarks: parseFloat(field.internalMarks) || 0,
        totalMarks: parseFloat(field.totalMarks) || 0,
        remarks: field.remarks || null,
      }));

      console.log('DEBUG: Prepared payload', JSON.stringify(payload, null, 2));

      const response = await axios.post(
        `/api-schools-panel/class_teachers_panel/SemesterResults/${className.toLowerCase()}/semester-results`,
        { results: payload },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(`DEBUG: Save response for ${semester}`, response.data);
      toast.success(`Semester ${semester.replace("SEMESTER_", "")} results saved successfully!`);
      await fetchStudentsAndResults();
    } catch (err) {
      console.error(`DEBUG: Save Semester ${semester} Results Error:`, err.message, err.response?.data);
      const message = err.response?.status === 401
        ? "Unauthorized: Please log in again."
        : `Failed to save semester ${semester.replace("SEMESTER_", "")} results: ${err.response?.data?.error || err.message}`;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        transform: "translate(0, 0)",
      }}
      fullScreen
    >
      <Box sx={{ bgcolor: "#333", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", p: 1 }}>
        <Typography variant="h6">
          Semester Results for {classSubject?.subject.name} - {className}
        </Typography>
        <IconButton onClick={handleCloseModal} sx={{ color: "#fff" }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent sx={{ bgcolor: "#181818", color: "#fff", maxHeight: "80vh", overflowY: "auto" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
            <CircularProgress size={120} sx={{ color: "#00c757" }} />
          </Box>
        ) : (
          <>
            {["SEMESTER_I", "SEMESTER_II", "SEMESTER_III"].map((semester, semIndex) => (
              <Box key={semester} sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>
                  {semester.replace("SEMESTER_", "Semester ")}
                </Typography>
                {semesterResults[semester].length > 0 ? (
                  semesterResults[semester].map((field, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        bgcolor: "#222",
                        p: 2,
                        mb: 1,
                        borderRadius: 1,
                      }}
                    >
                      <Typography sx={{ color: "#fff", minWidth: "200px" }}>
                        {`${field.student.firstName} ${field.student.lastName}`}
                      </Typography>
                      <TextField
                        label="Semester Exam (70)"
                        type="number"
                        value={field.semesterExamMarks || ""}
                        onChange={(e) => handleFieldChange(semester, index, "semesterExamMarks", e.target.value)}
                        inputProps={{ step: "0.1", min: 0, max: 70 }}
                        sx={{ ...textFieldStyles, width: "120px" }}
                      />
                      <TextField
                        label="Viva (6)"
                        type="number"
                        value={field.vivaMarks || ""}
                        onChange={(e) => handleFieldChange(semester, index, "vivaMarks", e.target.value)}
                        inputProps={{ step: "0.1", min: 0, max: 6 }}
                        sx={{ ...textFieldStyles, width: "120px" }}
                      />
                      <TextField
                        label="Internal (24)"
                        value={field.internalMarks.toFixed(2)}
                        disabled
                        sx={{ ...textDisabledFieldStyles, width: "120px" }}
                      />
                      <TextField
                        label="Total (100)"
                        value={field.totalMarks.toFixed(2)}
                        disabled
                        sx={{ ...textDisabledFieldStyles, width: "120px" }}
                      />
                      <TextField
                        label="Remarks"
                        value={field.remarks || ""}
                        onChange={(e) => handleFieldChange(semester, index, "remarks", e.target.value)}
                        multiline
                        rows={2}
                        sx={{ ...textFieldStyles, flex: 1 }}
                      />
                    </Box>
                  ))
                ) : (
                  <Typography sx={{ color: "#fff", textAlign: "center" }}>
                    No results found for {semester.replace("SEMESTER_", "Semester ")}.
                  </Typography>
                )}
                <Button
                  onClick={() => handleSaveChanges(semester)}
                  variant="contained"
                  sx={{ bgcolor: "#00c757", color: "#000", mt: 2, "&:hover": { bgcolor: "#00a548" } }}
                >
                  Save {semester.replace("SEMESTER_", "Semester ")} Results
                </Button>
                {semIndex < 2 && <Divider sx={{ bgcolor: "#333", my: 3 }} />}
              </Box>
            ))}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ bgcolor: "#181818" }}>
        <Button onClick={handleCloseModal} variant="contained" sx={{ bgcolor: "#f44336", color: "#fff" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SemesterResultDialog;