
"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";

import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  MenuItem,
  Typography,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Paper,
} from "@mui/material";

import {
  Close,
  Save,
  Person,
  School,
  Assignment,
  Gavel,
  CheckCircle,
  ReportProblem,
} from "@mui/icons-material";

import { toast } from "react-toastify";

// ============================================================
// CONFIGURATION
// ============================================================

const drawerWidth = 280;
const appBarHeight = 64;

const COLORS = {
  background: "#080D12",
  surface: "#121A22",
  surfaceLight: "#1B2632",
  border: "#30404D",
  primary: "#00BFA5",
  primaryHover: "#009E89",
  text: "#FFFFFF",
  secondary: "#A9BAC8",
};

const INITIAL_FORM = {
  studentId: "",
  classSubjectId: "",
  category: "ACADEMIC",
  type: "",
  description: "",
  severityLevel: 1,
  punishmentId: "",
  isResolved: false,
  resolvedBy: "",
  resolvedNote: "",
};

const CATEGORIES = [
  "ACADEMIC",
  "DISCIPLINE",
  "ATTENDANCE",
  "UNIFORM",
  "DEVICE_MISUSE",
  "EXAM_MISCONDUCT",
];

// ============================================================
// FIELD STYLES
// ============================================================

const fieldStyles = {
  width: "100%",

  "& .MuiInputBase-root": {
    color: COLORS.text,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: "8px",
  },

  "& .MuiInputBase-input": {
    color: COLORS.text,
  },

  "& .MuiInputLabel-root": {
    color: COLORS.secondary,
  },

  "& .MuiInputLabel-root.Mui-focused": {
    color: COLORS.primary,
  },

  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: COLORS.border,
  },

  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: COLORS.primary,
  },

  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: COLORS.primary,
  },

  "& .MuiSelect-icon": {
    color: COLORS.secondary,
  },

  "& .MuiFormHelperText-root": {
    color: COLORS.secondary,
  },
};

const menuProps = {
  PaperProps: {
    sx: {
      bgcolor: COLORS.surfaceLight,
      color: "#fff",
      maxHeight: 320,

      "& .MuiMenuItem-root": {
        fontSize: 14,

        "&:hover": {
          bgcolor: "#263D46",
        },

        "&.Mui-selected": {
          bgcolor: "#135B50",
        },
      },
    },
  },
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const normalizeArray = (data, keys = []) => {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

const getStudentName = (student) => {
  const fullName = [
    student.firstName,
    student.middleName,
    student.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    student.name ||
    student.fullName ||
    fullName ||
    student.studentName ||
    "Unnamed Student"
  );
};

const getSubjectName = (subject) => {
  return (
    subject.subject?.name ||
    subject.subjectName ||
    subject.name ||
    "Unnamed Subject"
  );
};

const logApiError = (label, error) => {
  console.error(`[Behaviour Log] ${label}`, {
    status: error.response?.status,
    url: error.config?.url,
    params: error.config?.params,
    response: error.response?.data,
    message: error.message,
  });
};

// ============================================================
// COMPONENT
// ============================================================

const AddBehaviourLogDialog = ({
  open,
  onClose,
  classId,
  className,
  schoolId,
  branchId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState(INITIAL_FORM);

  const [students, setStudents] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);
  const [punishments, setPunishments] = useState([]);

  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingPunishments, setLoadingPunishments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [studentError, setStudentError] = useState("");
  const [subjectError, setSubjectError] = useState("");
  const [punishmentError, setPunishmentError] = useState("");

  const normalizedClassName = String(className || "")
    .trim()
    .toLowerCase();

  // ============================================================
  // AUTHENTICATION
  // ============================================================

  const getAuthHeaders = useCallback(() => {
    const token = Cookies.get("faculties_token");

    if (!token) {
      throw new Error("Authentication token is missing.");
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  }, []);

  // ============================================================
  // STUDENTS API
  // ============================================================

  const fetchStudents = useCallback(
    async (signal) => {
      if (!normalizedClassName) {
        setStudents([]);
        setStudentError("Class name is missing.");
        return;
      }

      setLoadingStudents(true);
      setStudentError("");

      try {
        const headers = getAuthHeaders();

        const params = {};

        // Only send classId if supplied.
        if (classId !== undefined && classId !== null && classId !== "") {
          params.classId = classId;
        }

        if (schoolId) {
          params.schoolId = schoolId;
        }

        if (branchId && branchId !== "ALL") {
          params.branchId = branchId;
        }

        const url =
          `/api/MonthlyStudentBehaviourLogs/` +
          `${encodeURIComponent(normalizedClassName)}/students`;

        const response = await axios.get(url, {
          headers,
          params,
          signal,
        });

        const studentList = normalizeArray(response.data, [
          "students",
          "records",
          "items",
        ]);

        setStudents(studentList);

        console.log("[Behaviour Log] Students loaded:", {
          className: normalizedClassName,
          classId,
          count: studentList.length,
          response: response.data,
        });
      } catch (error) {
        if (
          error.code === "ERR_CANCELED" ||
          error.name === "CanceledError"
        ) {
          return;
        }

        logApiError("Failed to fetch students", error);

        setStudents([]);

        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to load students for the selected class.";

        setStudentError(
          typeof message === "string"
            ? message
            : "Student request failed. Check the console."
        );
      } finally {
        if (!signal?.aborted) {
          setLoadingStudents(false);
        }
      }
    },
    [
      normalizedClassName,
      classId,
      schoolId,
      branchId,
      getAuthHeaders,
    ]
  );

  // ============================================================
  // CLASS SUBJECTS API
  // ============================================================

  const fetchClassSubjects = useCallback(
    async (signal) => {
      setLoadingSubjects(true);
      setSubjectError("");

      try {
        const headers = getAuthHeaders();

        const params = {};

        if (classId) params.classId = classId;
        if (schoolId) params.schoolId = schoolId;

        if (branchId && branchId !== "ALL") {
          params.branchId = branchId;
        }

        const response = await axios.get(
          "/api/class-subjects",
          {
            headers,
            params,
            signal,
          }
        );

        const subjects = normalizeArray(response.data, [
          "classSubjects",
          "subjects",
          "items",
        ]);

        setClassSubjects(subjects);
      } catch (error) {
        if (
          error.code === "ERR_CANCELED" ||
          error.name === "CanceledError"
        ) {
          return;
        }

        logApiError("Failed to fetch subjects", error);

        setClassSubjects([]);
        setSubjectError("Class subjects could not be loaded.");
      } finally {
        if (!signal?.aborted) {
          setLoadingSubjects(false);
        }
      }
    },
    [classId, schoolId, branchId, getAuthHeaders]
  );

  // ============================================================
  // PUNISHMENTS API
  // ============================================================

  const fetchPunishments = useCallback(
    async (signal) => {
      setLoadingPunishments(true);
      setPunishmentError("");

      try {
        const headers = getAuthHeaders();

        // This is the endpoint from your original component.
        // If it returns 404, the backend route must be corrected.
        const response = await axios.get(
          "/api/punishments",
          {
            headers,
            signal,
          }
        );

        const punishmentList = normalizeArray(
          response.data,
          ["punishments", "items"]
        );

        setPunishments(punishmentList);
      } catch (error) {
        if (
          error.code === "ERR_CANCELED" ||
          error.name === "CanceledError"
        ) {
          return;
        }

        logApiError("Failed to fetch punishments", error);

        setPunishments([]);

        if (error.response?.status === 404) {
          setPunishmentError(
            "Punishment API is unavailable (404). " +
            "You can submit without selecting a punishment."
          );
        } else {
          setPunishmentError(
            "Unable to load punishment options."
          );
        }
      } finally {
        if (!signal?.aborted) {
          setLoadingPunishments(false);
        }
      }
    },
    [getAuthHeaders]
  );

  // ============================================================
  // LOAD OPTIONS WHEN DIALOG OPENS
  // ============================================================

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();

    setStudents([]);
    setClassSubjects([]);
    setPunishments([]);

    setFormData(INITIAL_FORM);

    fetchStudents(controller.signal);
    fetchClassSubjects(controller.signal);
    fetchPunishments(controller.signal);

    return () => {
      controller.abort();
    };
  }, [
    open,
    fetchStudents,
    fetchClassSubjects,
    fetchPunishments,
  ]);

  // ============================================================
  // FORM HANDLERS
  // ============================================================

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.studentId) {
      toast.error("Please select a student.");
      return;
    }

    if (!formData.type.trim()) {
      toast.error("Please enter a behaviour type.");
      return;
    }

    if (!normalizedClassName) {
      toast.error("Class name is missing.");
      return;
    }

    setSubmitting(true);

    try {
      const headers = getAuthHeaders();

      const payload = {
        ...formData,

        classSubjectId: formData.classSubjectId || null,
        punishmentId: formData.punishmentId || null,
        resolvedBy: formData.resolvedBy || null,
        resolvedNote: formData.resolvedNote || null,
      };

      // Preserve the existing POST endpoint.
      const url =
        `/api/MonthlyStudentBehaviourLogs/` +
        `${encodeURIComponent(normalizedClassName)}/logs`;

      const params = {};

      if (schoolId) params.schoolId = schoolId;

      if (branchId && branchId !== "ALL") {
        params.branchId = branchId;
      }

      await axios.post(url, payload, {
        headers,
        params,
      });

      toast.success("Behaviour log added successfully!");

      setFormData(INITIAL_FORM);

      if (typeof onSuccess === "function") {
        onSuccess();
      }

      onClose();
    } catch (error) {
      logApiError("Failed to save behaviour log", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to add behaviour log."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    Boolean(formData.studentId) &&
    Boolean(formData.type.trim()) &&
    !submitting;

  // ============================================================
  // REUSABLE SECTION HEADING
  // ============================================================

  const SectionHeading = ({ icon, title, subtitle }) => (
    <Box sx={{ mb: 2.5 }}>
      <Stack direction="row" spacing={1.2} alignItems="center">
        <Box sx={{ color: COLORS.primary, display: "flex" }}>
          {icon}
        </Box>

        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: "#fff" }}
        >
          {title}
        </Typography>
      </Stack>

      {subtitle && (
        <Typography
          variant="caption"
          sx={{
            color: COLORS.secondary,
            display: "block",
            mt: 0.5,
            ml: 4,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );

  // ============================================================
  // UI
  // ============================================================

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullScreen
      PaperProps={{
        sx: {
          bgcolor: COLORS.background,
          color: COLORS.text,
        },
      }}
      sx={{
        "& .MuiDialog-paper": {
          margin: 0,
          width: {
            xs: "100%",
            md: `calc(100% - ${drawerWidth}px)`,
          },
          height: {
            xs: "100%",
            md: `calc(100% - ${appBarHeight}px)`,
          },
          position: "absolute",
          right: 0,
          bottom: 0,
          maxWidth: "none",
          maxHeight: "none",
        },
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <Box
        sx={{
          px: { xs: 2, md: 4 },
          py: 2,
          bgcolor: COLORS.surface,
          borderBottom: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <ReportProblem sx={{ color: COLORS.primary }} />

            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: 17, md: 21 },
              }}
            >
              Add Student Behaviour Log
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            sx={{ color: COLORS.secondary, mt: 0.5 }}
          >
            Record academic, disciplinary, and student
            behaviour observations.
          </Typography>
        </Box>

        <Button
          onClick={onClose}
          disabled={submitting}
          startIcon={<Close />}
          variant="outlined"
          color="error"
          sx={{ flexShrink: 0 }}
        >
          Close
        </Button>
      </Box>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <DialogContent
        sx={{
          bgcolor: COLORS.background,
          px: { xs: 2, md: 4 },
          py: 3,
        }}
      >
        <Box sx={{ maxWidth: 1450, mx: "auto" }}>
          {/* CONTEXT */}

          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            sx={{ mb: 3 }}
          >
            <Chip
              label={`Class: ${className || "Not selected"}`}
              sx={{
                bgcolor: "#173B35",
                color: "#9BF0D2",
              }}
            />

            {classId && (
              <Chip
                label={`Class ID: ${classId}`}
                sx={{
                  bgcolor: COLORS.surfaceLight,
                  color: COLORS.secondary,
                }}
              />
            )}

            {branchId && (
              <Chip
                label={`Branch: ${branchId}`}
                sx={{
                  bgcolor: COLORS.surfaceLight,
                  color: COLORS.secondary,
                }}
              />
            )}
          </Stack>

          {/* API ERRORS */}

          {studentError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {studentError}
            </Alert>
          )}

          {subjectError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {subjectError}
            </Alert>
          )}

          {punishmentError && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {punishmentError}
            </Alert>
          )}

          {/* =====================================================
              TWO-COLUMN FORM
          ===================================================== */}

          <Grid container spacing={3}>
            {/* LEFT COLUMN */}

            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  bgcolor: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 2,
                  p: { xs: 2, md: 3 },
                  height: "100%",
                }}
              >
                <SectionHeading
                  icon={<Person />}
                  title="Student & Academic Details"
                  subtitle="Identify the student and classify the incident."
                />

                <Stack spacing={2.5}>
                  {/* STUDENT */}

                  <TextField
                    select
                    required
                    fullWidth
                    label="Select Student"
                    value={formData.studentId}
                    onChange={(e) =>
                      handleInputChange(
                        "studentId",
                        e.target.value
                      )
                    }
                    disabled={loadingStudents}
                    sx={fieldStyles}
                    SelectProps={{
                      displayEmpty: true,
                      MenuProps: menuProps,
                    }}
                    helperText={
                      loadingStudents
                        ? "Loading students..."
                        : `${students.length} student(s) available`
                    }
                  >
                    <MenuItem value="" disabled>
                      <em style={{ color: "#FFFFFF" }}>
                        Select a student
                      </em>
                    </MenuItem>

                    {students.map((student) => (
                      <MenuItem
                        key={student.id}
                        value={student.id}
                      >
                        {getStudentName(student)}
                        {student.rollNumber
                          ? ` — Roll ${student.rollNumber}`
                          : ""}
                      </MenuItem>
                    ))}
                  </TextField>

                  {/* SUBJECT */}

                  <TextField
                    select
                    fullWidth
                    label="Class Subject"
                    value={formData.classSubjectId}
                    onChange={(e) =>
                      handleInputChange(
                        "classSubjectId",
                        e.target.value
                      )
                    }
                    disabled={loadingSubjects}
                    sx={fieldStyles}
                    SelectProps={{
                      MenuProps: menuProps,
                    }}
                  >
                    <MenuItem value="">
                      None / General Behaviour
                    </MenuItem>

                    {classSubjects.map((subject) => (
                      <MenuItem
                        key={subject.id}
                        value={subject.id}
                      >
                        {getSubjectName(subject)}
                      </MenuItem>
                    ))}
                  </TextField>

                  {/* CATEGORY */}

                  <TextField
                    select
                    fullWidth
                    required
                    label="Behaviour Category"
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange(
                        "category",
                        e.target.value
                      )
                    }
                    sx={fieldStyles}
                    SelectProps={{
                      MenuProps: menuProps,
                    }}
                  >
                    {CATEGORIES.map((category) => (
                      <MenuItem
                        key={category}
                        value={category}
                      >
                        {category.replaceAll("_", " ")}
                      </MenuItem>
                    ))}
                  </TextField>

                  {/* TYPE */}

                  <TextField
                    required
                    fullWidth
                    label="Behaviour Type"
                    placeholder="e.g. Classroom Disruption"
                    value={formData.type}
                    onChange={(e) =>
                      handleInputChange(
                        "type",
                        e.target.value
                      )
                    }
                    sx={fieldStyles}
                  />

                  {/* SEVERITY */}

                  <TextField
                    select
                    fullWidth
                    label="Severity Level"
                    value={formData.severityLevel}
                    onChange={(e) =>
                      handleInputChange(
                        "severityLevel",
                        Number(e.target.value)
                      )
                    }
                    sx={fieldStyles}
                    SelectProps={{
                      MenuProps: menuProps,
                    }}
                  >
                    <MenuItem value={1}>
                      1 — Very Low
                    </MenuItem>

                    <MenuItem value={2}>
                      2 — Low
                    </MenuItem>

                    <MenuItem value={3}>
                      3 — Moderate
                    </MenuItem>

                    <MenuItem value={4}>
                      4 — High
                    </MenuItem>

                    <MenuItem value={5}>
                      5 — Critical
                    </MenuItem>
                  </TextField>
                </Stack>
              </Paper>
            </Grid>

            {/* RIGHT COLUMN */}

            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  bgcolor: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 2,
                  p: { xs: 2, md: 3 },
                  height: "100%",
                }}
              >
                <SectionHeading
                  icon={<Assignment />}
                  title="Incident & Resolution"
                  subtitle="Describe the incident and document any action taken."
                />

                <Stack spacing={2.5}>
                  {/* DESCRIPTION */}

                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Incident Description"
                    placeholder="Describe what happened, when it happened, and any relevant observations..."
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange(
                        "description",
                        e.target.value
                      )
                    }
                    sx={fieldStyles}
                  />

                  {/* PUNISHMENT */}

                  <TextField
                    select
                    fullWidth
                    label="Disciplinary Action / Punishment"
                    value={formData.punishmentId}
                    onChange={(e) =>
                      handleInputChange(
                        "punishmentId",
                        e.target.value
                      )
                    }
                    disabled={
                      loadingPunishments ||
                      punishments.length === 0
                    }
                    sx={fieldStyles}
                    SelectProps={{
                      MenuProps: menuProps,
                    }}
                    helperText={
                      punishments.length === 0
                        ? "No punishment options available."
                        : "Optional disciplinary action"
                    }
                  >
                    <MenuItem value="">None</MenuItem>

                    {punishments.map((punishment) => (
                      <MenuItem
                        key={punishment.id}
                        value={punishment.id}
                      >
                        {punishment.title ||
                          punishment.name ||
                          "Unnamed Action"}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Divider sx={{ borderColor: COLORS.border }} />

                  <SectionHeading
                    icon={<CheckCircle />}
                    title="Resolution Status"
                    subtitle="Record whether this incident has been resolved."
                  />

                  {/* RESOLVED */}

                  <TextField
                    select
                    fullWidth
                    label="Resolution Status"
                    value={String(formData.isResolved)}
                    onChange={(e) =>
                      handleInputChange(
                        "isResolved",
                        e.target.value === "true"
                      )
                    }
                    sx={fieldStyles}
                    SelectProps={{
                      MenuProps: menuProps,
                    }}
                  >
                    <MenuItem value="false">
                      Pending / Unresolved
                    </MenuItem>

                    <MenuItem value="true">
                      Resolved
                    </MenuItem>
                  </TextField>

                  {/* RESOLVED BY */}

                  <TextField
                    fullWidth
                    label="Resolved By"
                    placeholder="Authorized staff member"
                    value={formData.resolvedBy}
                    onChange={(e) =>
                      handleInputChange(
                        "resolvedBy",
                        e.target.value
                      )
                    }
                    disabled={!formData.isResolved}
                    sx={fieldStyles}
                  />

                  {/* RESOLUTION NOTES */}

                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Resolution Notes"
                    placeholder="Describe how the issue was resolved..."
                    value={formData.resolvedNote}
                    onChange={(e) =>
                      handleInputChange(
                        "resolvedNote",
                        e.target.value
                      )
                    }
                    disabled={!formData.isResolved}
                    sx={fieldStyles}
                  />
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      {/* =====================================================
          FOOTER ACTIONS
      ===================================================== */}

      <DialogActions
        sx={{
          bgcolor: COLORS.surface,
          borderTop: `1px solid ${COLORS.border}`,
          px: { xs: 2, md: 4 },
          py: 2,
          gap: 1.5,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: COLORS.secondary,
            mr: "auto",
            display: { xs: "none", sm: "block" },
          }}
        >
          Fields marked * are required.
        </Typography>

        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          disabled={submitting}
          sx={{
            borderColor: COLORS.border,
            minWidth: 110,
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          startIcon={
            submitting
              ? <CircularProgress size={17} color="inherit" />
              : <Save />
          }
          onClick={handleSubmit}
          disabled={!canSubmit}
          sx={{
            bgcolor: COLORS.primary,
            color: "#06120F",
            fontWeight: 700,
            minWidth: 160,

            "&:hover": {
              bgcolor: COLORS.primaryHover,
            },
          }}
        >
          {submitting ? "Saving..." : "Save Behaviour Log"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBehaviourLogDialog;
