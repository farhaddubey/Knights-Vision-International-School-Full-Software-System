"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography,
} from "@mui/material";
import { Add, CheckCircle, EscalatorWarning, PlayArrow, Refresh } from "@mui/icons-material";

const categories = [
  "DISCIPLINE", "UNIFORM", "SYLLABUS", "HOMEWORK", "TEACHER_BEHAVIOR",
  "CLEANLINESS", "TRANSPORT", "EXTRACURRICULAR", "TIMETABLE", "OTHER",
];
const statusColor = { OPEN: "warning", IN_PROGRESS: "info", ESCALATED: "error", RESOLVED: "success", CLOSED: "default" };
const darkFieldSx = {
  minWidth: 150,
  "& .MuiInputBase-root": { color: "#f5f5f5", bgcolor: "#242424" },
  "& .MuiInputLabel-root": { color: "#c7c7c7" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#4b4b4b" },
};
const emptyConcern = { studentId: "", category: "OTHER", description: "", submittedBy: "GUARDIAN" };

async function requestJson(path, options) {
  const response = await fetch(path, { credentials: "same-origin", ...options });
  const raw = await response.text();
  let body = {};
  try { body = raw ? JSON.parse(raw) : {}; } catch { throw new Error("The server returned an unexpected response."); }
  if (!response.ok) throw new Error(body.error || body.message || "Unable to process the concern.");
  return body;
}

function studentName(student) {
  return [student?.firstName, student?.middleName, student?.lastName].filter(Boolean).join(" ") || "Student";
}

function staffName(user) {
  return user?.username || user?.email || "Not yet handled";
}

export default function SchoolConcernsWorkspace() {
  const [concerns, setConcerns] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyConcern);
  const [resolutionNotes, setResolutionNotes] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const [concernBody, studentBody] = await Promise.all([
        requestJson("/api/complaints?page=1&pageSize=100"),
        requestJson("/api/complaints?resource=students"),
      ]);
      setConcerns(Array.isArray(concernBody.data) ? concernBody.data : []);
      setStudents(Array.isArray(studentBody.data) ? studentBody.data : []);
    } catch (error) {
      setMessage({ severity: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const summary = useMemo(() => concerns.reduce((counts, concern) => {
    counts[concern.status] = (counts[concern.status] || 0) + 1;
    return counts;
  }, {}), [concerns]);

  const createConcern = async () => {
    setSubmitting(true);
    setMessage(null);
    try {
      await requestJson("/api/complaints", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, studentId: Number(form.studentId) }),
      });
      setCreateOpen(false);
      setForm(emptyConcern);
      setMessage({ severity: "success", text: "Concern recorded and linked to the selected student scope." });
      await load();
    } catch (error) {
      setMessage({ severity: "error", text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const updateConcern = async (concern, payload, successText) => {
    setSubmitting(true);
    setMessage(null);
    try {
      await requestJson(`/api/complaints/${concern.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      setMessage({ severity: "success", text: successText });
      await load();
    } catch (error) {
      setMessage({ severity: "error", text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, minHeight: "100%", color: "#f5f5f5" }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={1.5} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Complaints & Resolutions</Typography>
          <Typography sx={{ color: "#bdbdbd" }}>Student-linked concerns with branch/class isolation, resolution evidence, and an enterprise audit trail.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={load} disabled={loading || submitting} sx={{ color: "#74e39a", borderColor: "#3e8056", textTransform: "none" }}>Refresh</Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)} sx={{ bgcolor: "#208c4c", textTransform: "none" }}>Record concern</Button>
        </Stack>
      </Stack>

      {message && <Alert severity={message.severity} sx={{ mb: 2 }} onClose={() => setMessage(null)}>{message.text}</Alert>}
      <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mb: 2 }}>
        {[
          ["Open", summary.OPEN || 0, "warning"], ["In progress", summary.IN_PROGRESS || 0, "info"],
          ["Escalated", summary.ESCALATED || 0, "error"], ["Resolved / closed", (summary.RESOLVED || 0) + (summary.CLOSED || 0), "success"],
        ].map(([label, count, color]) => <Chip key={label} label={`${label}: ${count}`} color={color} variant="outlined" />)}
      </Stack>
      <Alert severity="info" sx={{ mb: 2 }}>Resolving or closing a concern requires a written resolution. The API validates scope and writes every change to the audit log.</Alert>

      <Paper variant="outlined" sx={{ bgcolor: "#151515", borderColor: "#383838", overflow: "auto" }}>
        <Table size="small" sx={{ minWidth: 1320 }}>
          <TableHead><TableRow>
            <TableCell>Student / scope</TableCell><TableCell>Concern</TableCell><TableCell>Owner</TableCell><TableCell>Status</TableCell><TableCell>Resolution & action</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {loading && <TableRow><TableCell colSpan={5}><Box sx={{ py: 5, display: "grid", placeItems: "center" }}><CircularProgress /></Box></TableCell></TableRow>}
            {!loading && !concerns.length && <TableRow><TableCell colSpan={5} sx={{ py: 5, textAlign: "center", color: "#bdbdbd" }}>No student concerns are available in your permitted scope.</TableCell></TableRow>}
            {concerns.map((concern) => {
              const terminal = ["RESOLVED", "CLOSED"].includes(concern.status);
              const resolution = resolutionNotes[concern.id] ?? concern.resolution ?? "";
              return <TableRow key={concern.id} hover>
                <TableCell sx={{ minWidth: 220 }}><Typography fontWeight={700}>{studentName(concern.student)}</Typography><Typography variant="caption" sx={{ color: "#bdbdbd" }}>{concern.student?.admissionNumber || "No admission number"}</Typography><Typography variant="body2" sx={{ color: "#c7c7c7", mt: 0.5 }}>{concern.school?.name || "School"} / {concern.branch?.name || "Branch"}<br />{concern.class?.name || "Class"}{concern.class?.section ? ` - ${concern.class.section}` : ""}</Typography></TableCell>
                <TableCell sx={{ minWidth: 230 }}><Typography fontWeight={700}>{String(concern.category || "OTHER").replaceAll("_", " ")}</Typography><Typography variant="body2" sx={{ color: "#c7c7c7", mt: 0.5 }}>{concern.description}</Typography><Typography variant="caption" sx={{ color: "#bdbdbd" }}>Reported by {String(concern.submittedBy || "GUARDIAN").toLowerCase()}</Typography></TableCell>
                <TableCell><Typography variant="body2">{staffName(concern.handledBy)}</Typography>{concern.handledAt && <Typography variant="caption" sx={{ color: "#bdbdbd" }}>{new Date(concern.handledAt).toLocaleString()}</Typography>}</TableCell>
                <TableCell><Chip size="small" label={String(concern.status || "OPEN").replaceAll("_", " ")} color={statusColor[concern.status] || "default"} /></TableCell>
                <TableCell sx={{ minWidth: 380 }}><Stack spacing={1}>
                  <TextField size="small" label="Resolution evidence" value={resolution} disabled={terminal} onChange={(event) => setResolutionNotes((notes) => ({ ...notes, [concern.id]: event.target.value }))} multiline minRows={2} inputProps={{ maxLength: 1000 }} sx={darkFieldSx} />
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button size="small" variant="outlined" startIcon={<PlayArrow />} disabled={submitting || terminal || concern.status === "IN_PROGRESS"} onClick={() => updateConcern(concern, { status: "IN_PROGRESS" }, "Concern marked as in progress.")}>Start</Button>
                    <Button size="small" variant="outlined" color="warning" startIcon={<EscalatorWarning />} disabled={submitting || terminal || concern.status === "ESCALATED"} onClick={() => updateConcern(concern, { status: "ESCALATED" }, "Concern escalated for review.")}>Escalate</Button>
                    <Button size="small" variant="contained" color="success" startIcon={<CheckCircle />} disabled={submitting || terminal || !resolution.trim()} onClick={() => updateConcern(concern, { status: "RESOLVED", resolution: resolution.trim() }, "Concern resolved with recorded evidence.")}>Resolve</Button>
                    <Button size="small" variant="outlined" disabled={submitting || concern.status !== "RESOLVED"} onClick={() => updateConcern(concern, { status: "CLOSED" }, "Resolved concern formally closed.")}>Close</Button>
                  </Stack>
                </Stack></TableCell>
              </TableRow>;
            })}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { bgcolor: "#171717", color: "#f5f5f5" } }}>
        <DialogTitle>Record guardian or student concern</DialogTitle>
        <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
          <Select displayEmpty value={form.studentId} onChange={(event) => setForm((current) => ({ ...current, studentId: event.target.value }))} sx={darkFieldSx}><MenuItem value=""><em>Select student</em></MenuItem>{students.map((student) => <MenuItem key={student.id} value={student.id}>{studentName(student)} {student.admissionNumber ? `(${student.admissionNumber})` : ""}</MenuItem>)}</Select>
          <Select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} sx={darkFieldSx}>{categories.map((category) => <MenuItem key={category} value={category}>{category.replaceAll("_", " ")}</MenuItem>)}</Select>
          <Select value={form.submittedBy} onChange={(event) => setForm((current) => ({ ...current, submittedBy: event.target.value }))} sx={darkFieldSx}><MenuItem value="GUARDIAN">Guardian</MenuItem><MenuItem value="STUDENT">Student</MenuItem></Select>
          <TextField required label="Concern description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} multiline minRows={4} inputProps={{ maxLength: 1000 }} sx={darkFieldSx} />
        </Stack></DialogContent>
        <DialogActions><Button onClick={() => setCreateOpen(false)} color="inherit">Cancel</Button><Button variant="contained" disabled={submitting || !form.studentId || !form.description.trim()} onClick={createConcern}>Record concern</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
