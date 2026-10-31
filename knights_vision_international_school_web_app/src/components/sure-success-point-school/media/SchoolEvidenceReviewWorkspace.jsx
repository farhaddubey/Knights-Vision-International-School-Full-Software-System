"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { CheckCircle, DeleteOutline, FactCheck, Refresh, ThumbDown } from "@mui/icons-material";

const pageSize = 18;
const statusColor = { SUBMITTED: "warning", VERIFIED: "success", REJECTED: "error" };

function formatDate(value) {
  return value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
}

export default function SchoolEvidenceReviewWorkspace() {
  const [evidence, setEvidence] = useState([]);
  const [status, setStatus] = useState("SUBMITTED");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [decision, setDecision] = useState(null);
  const [note, setNote] = useState("");
  const [acting, setActing] = useState(false);

  const load = async (nextPage = page, nextStatus = status) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(nextPage), pageSize: String(pageSize) });
      if (nextStatus !== "ALL") params.set("status", nextStatus);
      const response = await fetch(`/api/administration/school-media-evidence?${params.toString()}`, { credentials: "include" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Unable to load school evidence.");
      setEvidence(payload.evidence || []);
      setPage(payload.page || nextPage);
      setTotalPages(payload.totalPages || 1);
    } catch (loadError) {
      setError(loadError.message || "Unable to load school evidence.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1, "SUBMITTED"); }, []);

  const decide = async (outcome) => {
    if (!decision || note.trim().length < 5) {
      setError("A final Administration note of at least 5 characters is required.");
      return;
    }
    setActing(true);
    setError("");
    try {
      const response = await fetch(`/api/administration/school-media-evidence/${decision.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: outcome, verificationNote: note.trim() }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Unable to record the Administration decision.");
      setDecision(null);
      setNote("");
      load(1, status);
    } catch (decisionError) {
      setError(decisionError.message || "Unable to record the Administration decision.");
    } finally {
      setActing(false);
    }
  };

  const remove = async (item) => {
    if (!item.canDelete || !window.confirm(`Delete retained evidence “${item.file?.name || item.id}”? This permanently removes the secured file.`)) return;
    setActing(true);
    setError("");
    try {
      const response = await fetch(`/api/administration/school-media-evidence/${item.id}`, { method: "DELETE", credentials: "include" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Unable to delete retained evidence.");
      load(evidence.length === 1 && page > 1 ? page - 1 : page, status);
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete retained evidence.");
    } finally {
      setActing(false);
    }
  };

  return (
    <Box sx={{ minHeight: "calc(100vh - 64px)", bgcolor: "#212121", color: "#fff", p: { xs: 1.5, md: 2.5 } }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.25, mb: 2, p: 1.5, bgcolor: "#181818", borderRadius: 2 }}>
        <FactCheck sx={{ color: "#00c853" }} />
        <Box sx={{ mr: "auto" }}><Typography fontWeight={800}>School Evidence Review</Typography><Typography variant="caption" sx={{ color: "#aaa" }}>Direct Principal submissions · CEO/CTO final decision only</Typography></Box>
        <FormControl size="small" sx={{ minWidth: 165 }}><InputLabel sx={{ color: "#bbb" }}>Status</InputLabel><Select label="Status" value={status} onChange={(event) => { setStatus(event.target.value); load(1, event.target.value); }} sx={{ color: "#fff", bgcolor: "#282828", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" }, "& .MuiSvgIcon-root": { color: "#fff" } }}><MenuItem value="SUBMITTED">Awaiting decision</MenuItem><MenuItem value="VERIFIED">Verification done</MenuItem><MenuItem value="REJECTED">Rejected</MenuItem><MenuItem value="ALL">All evidence</MenuItem></Select></FormControl>
        <Button onClick={() => load()} startIcon={<Refresh />} variant="outlined" sx={{ color: "#00c853", borderColor: "#00c853" }}>Refresh</Button>
      </Box>
      <Alert severity="info" sx={{ mb: 2 }}>Verification is a final Administration decision. Evidence remains immutable and deletion is server-locked until 90 days after that decision.</Alert>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && evidence.length === 0 ? <Box sx={{ minHeight: 280, display: "grid", placeItems: "center" }}><CircularProgress size={56} sx={{ color: "#00c853" }} /></Box> : evidence.length === 0 ? <Box sx={{ minHeight: 280, display: "grid", placeItems: "center", bgcolor: "#181818", borderRadius: 2 }}><Typography sx={{ color: "#aaa" }}>No school evidence matches this filter.</Typography></Box> : <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(315px, 1fr))", gap: 1.5 }}>{evidence.map((item) => <Card key={item.id} sx={{ bgcolor: "#181818", color: "#fff", border: "1px solid #363636", overflow: "hidden" }}><Box component="img" src={item.file?.url} alt={item.file?.name || "School evidence"} sx={{ height: 205, width: "100%", objectFit: "cover", bgcolor: "#0d0d0d" }} /><CardContent><Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}><Typography fontWeight={750} sx={{ flex: 1 }}>{item.reasonLabel}</Typography><Chip size="small" label={item.status} color={statusColor[item.status] || "default"} /></Box><Typography variant="body2" sx={{ minHeight: 40, color: "#ddd" }}>{item.description}</Typography><Typography variant="caption" sx={{ display: "block", mt: 1.2, color: "#bbb" }}>{item.school?.name} · {item.branch?.name}</Typography><Typography variant="caption" sx={{ display: "block", color: "#888" }}>Submitted by {item.submittedBy?.username || item.submittedBy?.email || "Unknown"} · {formatDate(item.submittedAt)}</Typography>{item.reviewedAt && <Box sx={{ mt: 1.2, p: 1, borderRadius: 1, bgcolor: item.status === "VERIFIED" ? "rgba(0,200,83,.1)" : "rgba(239,83,80,.12)" }}><Typography variant="caption">Final note: {item.verificationNote}</Typography><Typography variant="caption" sx={{ display: "block", color: "#aaa", mt: .4 }}>Decided by {item.reviewedBy?.username || item.reviewedBy?.email || "Administration"} · {formatDate(item.reviewedAt)}</Typography></Box>}</CardContent><CardActions sx={{ px: 2, pb: 2, justifyContent: "space-between" }}>{item.status === "SUBMITTED" ? <Button onClick={() => { setDecision(item); setNote(""); }} variant="contained" startIcon={<CheckCircle />} sx={{ bgcolor: "#008c3a", "&:hover": { bgcolor: "#00a844" } }}>Review</Button> : <Typography variant="caption" sx={{ color: item.canDelete ? "#ffcc80" : "#888" }}>{item.canDelete ? "Retention complete" : `Delete enabled ${formatDate(item.deleteEligibleAt)}`}</Typography>}{item.canDelete && <Button disabled={acting} onClick={() => remove(item)} color="error" startIcon={<DeleteOutline />}>Delete</Button>}</CardActions></Card>)}</Box>}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2.5 }}><Pagination count={totalPages} page={page} onChange={(_, next) => load(next)} sx={{ "& .MuiPaginationItem-root": { color: "#fff" }, "& .Mui-selected": { bgcolor: "#00a844 !important" } }} /></Box>
      <Dialog open={Boolean(decision)} onClose={() => !acting && setDecision(null)} fullWidth maxWidth="sm" PaperProps={{ sx: { bgcolor: "#181818", color: "#fff" } }}><DialogTitle>Final Administration Review</DialogTitle><DialogContent><Typography variant="body2" sx={{ color: "#bbb", mb: 2 }}>{decision?.reasonLabel} · {decision?.school?.name} / {decision?.branch?.name}</Typography><TextField autoFocus multiline minRows={4} fullWidth label="Final verification note" value={note} onChange={(event) => setNote(event.target.value)} helperText="This is stored in the permanent audit trail." inputProps={{ maxLength: 1000 }} /></DialogContent><DialogActions sx={{ px: 3, pb: 2.5 }}><Button disabled={acting} onClick={() => setDecision(null)} color="inherit">Cancel</Button><Button disabled={acting} onClick={() => decide("REJECT")} color="error" startIcon={<ThumbDown />}>Reject</Button><Button disabled={acting} onClick={() => decide("VERIFY")} variant="contained" startIcon={<CheckCircle />} sx={{ bgcolor: "#008c3a", "&:hover": { bgcolor: "#00a844" } }}>{acting ? "Saving…" : "Verification Done"}</Button></DialogActions></Dialog>
    </Box>
  );
}
