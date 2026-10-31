"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { AddPhotoAlternate, Refresh, Send, Verified, WatchLater } from "@mui/icons-material";
import FileDialog from "./FileDialog";

const pageSize = 12;

const statusColor = {
  SUBMITTED: "warning",
  VERIFIED: "success",
  REJECTED: "error",
};

function formatDate(value) {
  return value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
}

export default function UploadImagesPanel() {
  const [options, setOptions] = useState({ branches: [], reasons: [] });
  const [evidence, setEvidence] = useState([]);
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const load = async (nextPage = page, nextStatus = status) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(nextPage), pageSize: String(pageSize) });
      if (nextStatus !== "ALL") params.set("status", nextStatus);
      const [optionsResponse, evidenceResponse] = await Promise.all([
        fetch("/api/faculty-evidence/options", { credentials: "include" }),
        fetch(`/api/faculty-evidence?${params.toString()}`, { credentials: "include" }),
      ]);
      const [optionsPayload, evidencePayload] = await Promise.all([
        optionsResponse.json().catch(() => ({})),
        evidenceResponse.json().catch(() => ({})),
      ]);
      if (!optionsResponse.ok) throw new Error(optionsPayload.error || "Unable to load your authorised school and branch.");
      if (!evidenceResponse.ok) throw new Error(evidencePayload.error || "Unable to load submitted evidence.");
      setOptions(optionsPayload);
      setEvidence(evidencePayload.evidence || []);
      setTotalPages(evidencePayload.totalPages || 1);
      setPage(evidencePayload.page || nextPage);
    } catch (loadError) {
      setError(loadError.message || "Unable to load the school evidence workspace.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1, "ALL"); }, []);

  const summary = useMemo(() => ({
    submitted: evidence.filter((item) => item.status === "SUBMITTED").length,
    verified: evidence.filter((item) => item.status === "VERIFIED").length,
  }), [evidence]);

  if (loading && evidence.length === 0) {
    return <Box sx={{ minHeight: "calc(100vh - 64px)", bgcolor: "#212121", display: "grid", placeItems: "center" }}><CircularProgress size={64} sx={{ color: "#00c853" }} /></Box>;
  }

  return (
    <Box sx={{ minHeight: "calc(100vh - 64px)", bgcolor: "#212121", color: "#fff", p: { xs: 1.5, md: 2.5 } }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.25, mb: 2, p: 1.5, bgcolor: "#181818", borderRadius: 2 }}>
        <Verified sx={{ color: "#00c853" }} />
        <Box sx={{ mr: "auto" }}>
          <Typography fontWeight={800}>School Evidence Submission</Typography>
          <Typography variant="caption" sx={{ color: "#aaa" }}>Private faculty-to-Administration record · reviewed directly by CEO/CTO</Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel sx={{ color: "#bbb" }}>Status</InputLabel>
          <Select label="Status" value={status} onChange={(event) => { setStatus(event.target.value); load(1, event.target.value); }} sx={{ color: "#fff", bgcolor: "#282828", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" }, "& .MuiSvgIcon-root": { color: "#fff" } }}>
            <MenuItem value="ALL">All submissions</MenuItem>
            <MenuItem value="SUBMITTED">Awaiting review</MenuItem>
            <MenuItem value="VERIFIED">Verification done</MenuItem>
            <MenuItem value="REJECTED">Returned / rejected</MenuItem>
          </Select>
        </FormControl>
        <Button onClick={() => load()} variant="outlined" startIcon={<Refresh />} sx={{ color: "#00c853", borderColor: "#00c853" }}>Refresh</Button>
        <Button onClick={() => setOpen(true)} variant="contained" startIcon={<AddPhotoAlternate />} sx={{ bgcolor: "#00a844", "&:hover": { bgcolor: "#00c853" } }}>Submit Evidence</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Alert icon={<Send />} severity="info" sx={{ mb: 2 }}>
        Each record is sent directly to CEO/CTO Administration. Faculty cannot delete, edit, or convert it into general website media after submission.
      </Alert>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
        <Chip icon={<WatchLater />} label={`${summary.submitted} awaiting Administration review on this page`} sx={{ bgcolor: "#3a2d00", color: "#ffd54f" }} />
        <Chip icon={<Verified />} label={`${summary.verified} verified on this page`} sx={{ bgcolor: "#073b1b", color: "#8ee7b2" }} />
      </Stack>

      {evidence.length === 0 ? (
        <Box sx={{ minHeight: 280, display: "grid", placeItems: "center", bgcolor: "#181818", borderRadius: 2, border: "1px solid #363636" }}>
          <Typography sx={{ color: "#aaa" }}>No evidence submission matches this filter.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 1.5 }}>
          {evidence.map((item) => (
            <Card key={item.id} sx={{ bgcolor: "#181818", color: "#fff", border: "1px solid #363636", overflow: "hidden" }}>
              <Box component="img" src={item.file?.url} alt={item.file?.name || "School evidence"} sx={{ height: 190, width: "100%", objectFit: "cover", bgcolor: "#0d0d0d" }} />
              <CardContent>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
                  <Typography fontWeight={750} sx={{ flex: 1 }}>{item.reasonLabel}</Typography>
                  <Chip size="small" label={item.status} color={statusColor[item.status] || "default"} />
                </Box>
                <Typography variant="body2" sx={{ color: "#ddd", minHeight: 40 }}>{item.description}</Typography>
                <Typography variant="caption" sx={{ display: "block", color: "#aaa", mt: 1.25 }}>{item.school?.name} · {item.branch?.name}</Typography>
                <Typography variant="caption" sx={{ display: "block", color: "#777" }}>Submitted {formatDate(item.submittedAt)}</Typography>
                {item.reviewedAt && <Box sx={{ mt: 1.25, p: 1, borderRadius: 1, bgcolor: item.status === "VERIFIED" ? "rgba(0, 200, 83, .10)" : "rgba(239, 83, 80, .12)" }}><Typography variant="caption" sx={{ color: "#ddd" }}>Administration note: {item.verificationNote}</Typography><Typography variant="caption" sx={{ display: "block", color: "#aaa", mt: .4 }}>Final decision {formatDate(item.reviewedAt)}</Typography></Box>}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2.5 }}><Pagination count={totalPages} page={page} onChange={(_, next) => load(next)} sx={{ "& .MuiPaginationItem-root": { color: "#fff" }, "& .Mui-selected": { bgcolor: "#00a844 !important" } }} /></Box>
      <FileDialog open={open} onClose={() => setOpen(false)} options={options} onSubmitted={() => { setOpen(false); load(1, "ALL"); }} />
    </Box>
  );
}
