"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography,
} from "@mui/material";
import { Add, CheckCircle, PlayArrow, Refresh } from "@mui/icons-material";

const darkFieldSx = {
  minWidth: 150,
  "& .MuiInputBase-root": { color: "#f5f5f5", bgcolor: "#242424" },
  "& .MuiInputLabel-root": { color: "#c7c7c7" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#4b4b4b" },
};

const blankRequest = { branchId: "", title: "", category: "", description: "", priority: "NORMAL" };
const statusColor = { PENDING: "warning", IN_PROGRESS: "info", ON_HOLD: "default", APPROVED: "success", REJECTED: "error", COMPLETED: "success", CANCELLED: "default" };

async function requestJson(path, options) {
  const response = await fetch(path, { credentials: "same-origin", ...options });
  const raw = await response.text();
  let body = {};
  try { body = raw ? JSON.parse(raw) : {}; } catch { throw new Error("The server returned an unexpected response."); }
  if (!response.ok) throw new Error(body.error || body.message || "Unable to process the operational request.");
  return body;
}

function staffName(user) {
  return user?.username || user?.email || "Unassigned";
}

export default function OperationalRequestsWorkspace() {
  const [requests, setRequests] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(blankRequest);
  const [decisionNotes, setDecisionNotes] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const [requestBody, branchBody] = await Promise.all([
        requestJson("/api/requests?page=1&pageSize=100"),
        requestJson("/api/requests?resource=branches"),
      ]);
      setRequests(Array.isArray(requestBody.data) ? requestBody.data : []);
      setBranches(Array.isArray(branchBody.data) ? branchBody.data : []);
    } catch (error) {
      setMessage({ severity: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createRequest = async () => {
    setSubmitting(true);
    setMessage(null);
    try {
      await requestJson("/api/requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, branchId: Number(form.branchId) }),
      });
      setCreateOpen(false);
      setForm(blankRequest);
      setMessage({ severity: "success", text: "Operational request recorded with an auditable pending status." });
      await load();
    } catch (error) {
      setMessage({ severity: "error", text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const setStatus = async (request, status) => {
    setSubmitting(true);
    setMessage(null);
    try {
      await requestJson(`/api/requests/${request.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status, decisionNote: decisionNotes[request.id] || undefined }),
      });
      setMessage({ severity: "success", text: `Request ${request.publicId || request.id} updated to ${status.replaceAll("_", " ")}.` });
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
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Operational Requests</Typography>
          <Typography sx={{ color: "#bdbdbd" }}>Branch-scoped operational work with controlled approval and audit history.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={load} disabled={loading || submitting} sx={{ color: "#74e39a", borderColor: "#3e8056", textTransform: "none" }}>Refresh</Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)} sx={{ bgcolor: "#208c4c", textTransform: "none" }}>New request</Button>
        </Stack>
      </Stack>

      {message && <Alert severity={message.severity} sx={{ mb: 2 }} onClose={() => setMessage(null)}>{message.text}</Alert>}
      <Alert severity="info" sx={{ mb: 2 }}>Approval and rejection remain permission-controlled at the API. Every status mutation is retained as an enterprise audit event.</Alert>

      <Paper variant="outlined" sx={{ bgcolor: "#151515", borderColor: "#383838", overflow: "auto" }}>
        <Table size="small" sx={{ minWidth: 1250 }}>
          <TableHead><TableRow>
            <TableCell>Request</TableCell><TableCell>Scope</TableCell><TableCell>Owner</TableCell><TableCell>Priority / status</TableCell><TableCell>Controlled action</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {loading && <TableRow><TableCell colSpan={5}><Box sx={{ py: 5, display: "grid", placeItems: "center" }}><CircularProgress /></Box></TableCell></TableRow>}
            {!loading && !requests.length && <TableRow><TableCell colSpan={5} sx={{ py: 5, textAlign: "center", color: "#bdbdbd" }}>No operational requests are available in your assigned scope.</TableCell></TableRow>}
            {requests.map((request) => <TableRow key={request.id} hover>
              <TableCell sx={{ minWidth: 240 }}><Typography fontWeight={700}>{request.title}</Typography><Typography variant="caption" sx={{ color: "#bdbdbd" }}>{request.category} · {request.publicId || `#${request.id}`}</Typography><Typography variant="body2" sx={{ color: "#c7c7c7", mt: 0.5 }}>{request.description || "No further description."}</Typography></TableCell>
              <TableCell>{request.school?.name || "School"}<br /><Typography variant="caption" sx={{ color: "#bdbdbd" }}>{request.branch?.name || "Branch"}</Typography></TableCell>
              <TableCell><Typography variant="body2">Requested: {staffName(request.requestedBy)}</Typography><Typography variant="body2" sx={{ color: "#bdbdbd" }}>Assigned: {staffName(request.assignedTo)}</Typography></TableCell>
              <TableCell><Stack spacing={0.75}><Chip size="small" label={request.priority} color={request.priority === "URGENT" ? "error" : request.priority === "HIGH" ? "warning" : "default"} /><Chip size="small" label={request.status.replaceAll("_", " ")} color={statusColor[request.status] || "default"} /></Stack></TableCell>
              <TableCell sx={{ minWidth: 330 }}><Stack spacing={1}><TextField size="small" label="Decision note when approving/rejecting" value={decisionNotes[request.id] || ""} onChange={(event) => setDecisionNotes((notes) => ({ ...notes, [request.id]: event.target.value }))} inputProps={{ maxLength: 1000 }} sx={darkFieldSx} /><Stack direction="row" spacing={1} flexWrap="wrap"><Button size="small" variant="outlined" startIcon={<PlayArrow />} disabled={submitting || request.status !== "PENDING"} onClick={() => setStatus(request, "IN_PROGRESS")}>Start</Button><Button size="small" variant="outlined" color="success" startIcon={<CheckCircle />} disabled={submitting || !["PENDING", "IN_PROGRESS", "ON_HOLD"].includes(request.status)} onClick={() => setStatus(request, "APPROVED")}>Approve</Button><Button size="small" variant="outlined" color="error" disabled={submitting || !["PENDING", "IN_PROGRESS", "ON_HOLD"].includes(request.status)} onClick={() => setStatus(request, "REJECTED")}>Reject</Button><Button size="small" variant="contained" disabled={submitting || request.status !== "APPROVED"} onClick={() => setStatus(request, "COMPLETED")}>Complete</Button></Stack></Stack></TableCell>
            </TableRow>)}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { bgcolor: "#171717", color: "#f5f5f5" } }}>
        <DialogTitle>New operational request</DialogTitle>
        <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
          <Select displayEmpty value={form.branchId} onChange={(event) => setForm((current) => ({ ...current, branchId: event.target.value }))} sx={darkFieldSx}><MenuItem value=""><em>Select branch</em></MenuItem>{branches.map((branch) => <MenuItem key={branch.id} value={branch.id}>{branch.name} ({branch.code})</MenuItem>)}</Select>
          <TextField required label="Request title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} inputProps={{ maxLength: 160 }} sx={darkFieldSx} />
          <TextField required label="Category" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} inputProps={{ maxLength: 100 }} sx={darkFieldSx} />
          <Select value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))} sx={darkFieldSx}>{["LOW", "NORMAL", "HIGH", "URGENT"].map((priority) => <MenuItem key={priority} value={priority}>{priority}</MenuItem>)}</Select>
          <TextField label="Description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} multiline minRows={4} inputProps={{ maxLength: 5000 }} sx={darkFieldSx} />
        </Stack></DialogContent>
        <DialogActions><Button onClick={() => setCreateOpen(false)} color="inherit">Cancel</Button><Button variant="contained" disabled={submitting || !form.branchId || !form.title.trim() || !form.category.trim()} onClick={createRequest}>Record request</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
