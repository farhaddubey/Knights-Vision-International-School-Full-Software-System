"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { CloudUpload, VerifiedUser } from "@mui/icons-material";

const acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const maxBytes = 12 * 1024 * 1024;

export default function FileDialog({ open, onClose, options, onSubmitted }) {
  const inputRef = useRef(null);
  const [schoolId, setSchoolId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const schools = useMemo(() => {
    const byId = new Map();
    (options?.branches || []).forEach((branch) => byId.set(branch.school.id, branch.school));
    return [...byId.values()];
  }, [options]);
  const branches = useMemo(
    () => (options?.branches || []).filter((branch) => String(branch.school.id) === String(schoolId)),
    [options, schoolId],
  );

  const reset = () => {
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setSchoolId("");
    setBranchId("");
    setReason("");
    setDescription("");
    setFile(null);
    setPreview("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  useEffect(() => () => {
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
  }, [preview]);

  useEffect(() => {
    if (!open || schoolId || schools.length === 0) return;
    setSchoolId(String(schools[0].id));
  }, [open, schoolId, schools]);

  useEffect(() => {
    if (!branches.length) {
      setBranchId("");
      return;
    }
    if (!branches.some((branch) => String(branch.id) === String(branchId))) {
      setBranchId(String(branches[0].id));
    }
  }, [branches, branchId]);

  const selectFile = (selectedFile) => {
    if (!selectedFile) return;
    if (!acceptedTypes.includes(selectedFile.type)) {
      setError("Use a JPEG, PNG, WebP, or GIF image.");
      return;
    }
    if (selectedFile.size <= 0 || selectedFile.size > maxBytes) {
      setError("Choose an image smaller than 12 MB.");
      return;
    }
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError("");
  };

  const close = () => {
    if (uploading) return;
    reset();
    onClose();
  };

  const submit = async () => {
    if (!schoolId || !branchId || !reason || !file || description.trim().length < 12) {
      setError("Select school, branch, reason, image, and a description of at least 12 characters.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const data = new FormData();
      data.append("schoolId", schoolId);
      data.append("branchId", branchId);
      data.append("reason", reason);
      data.append("description", description.trim());
      data.append("file", file);
      const response = await fetch("/api/faculty-evidence", { method: "POST", body: data, credentials: "include" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Unable to submit the evidence.");
      reset();
      onSubmitted(payload);
    } catch (submitError) {
      setError(submitError.message || "Unable to submit the evidence.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm" PaperProps={{ sx: { bgcolor: "#181818", color: "#fff", border: "1px solid #3d3d3d" } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "#242424" }}>
        <VerifiedUser sx={{ color: "#00c853" }} /> Submit School Evidence
      </DialogTitle>
      <DialogContent sx={{ pt: "20px !important" }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          This is a direct, private submission to CEO/CTO Administration. It cannot be deleted or changed from the Faculty Panel after submission.
        </Alert>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          <FormControl size="small" fullWidth>
            <InputLabel id="evidence-school">School</InputLabel>
            <Select labelId="evidence-school" label="School" value={schoolId} onChange={(event) => setSchoolId(event.target.value)}>
              {schools.map((school) => <MenuItem key={school.id} value={String(school.id)}>{school.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth disabled={!schoolId}>
            <InputLabel id="evidence-branch">Branch</InputLabel>
            <Select labelId="evidence-branch" label="Branch" value={branchId} onChange={(event) => setBranchId(event.target.value)}>
              {branches.map((branch) => <MenuItem key={branch.id} value={String(branch.id)}>{branch.name}{branch.code ? ` (${branch.code})` : ""}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
        <FormControl size="small" fullWidth sx={{ mt: 2 }}>
          <InputLabel id="evidence-reason">Evidence reason</InputLabel>
          <Select labelId="evidence-reason" label="Evidence reason" value={reason} onChange={(event) => setReason(event.target.value)}>
            {(options?.reasons || []).map((item) => <MenuItem key={item.code} value={item.code}>{item.label}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField fullWidth multiline minRows={3} label="Evidence description" value={description} onChange={(event) => setDescription(event.target.value)} helperText={`${description.trim().length}/1000 · state what this image verifies`} sx={{ mt: 2 }} inputProps={{ maxLength: 1000 }} />
        <Box onClick={() => inputRef.current?.click()} sx={{ mt: 2, minHeight: 180, display: "grid", placeItems: "center", cursor: "pointer", border: "2px dashed #666", borderRadius: 2, overflow: "hidden", bgcolor: "#101010" }}>
          <input ref={inputRef} type="file" hidden accept={acceptedTypes.join(",")} onChange={(event) => selectFile(event.target.files?.[0])} />
          {preview ? <Box component="img" src={preview} alt="Selected evidence" sx={{ width: "100%", height: 240, objectFit: "contain", bgcolor: "#000" }} /> : <Box sx={{ textAlign: "center", px: 2 }}><CloudUpload sx={{ color: "#00c853", fontSize: 42 }} /><Typography fontWeight={700}>Choose evidence image</Typography><Typography variant="caption">JPEG, PNG, WebP, or GIF · 12 MB maximum</Typography></Box>}
        </Box>
        {file && <Typography variant="body2" sx={{ mt: 1 }}>{file.name} · {(file.size / 1024).toFixed(1)} KB</Typography>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={close} disabled={uploading} color="inherit">Cancel</Button>
        <Button onClick={() => inputRef.current?.click()} disabled={uploading} variant="outlined">Choose image</Button>
        <Button onClick={submit} disabled={uploading || !file} variant="contained" sx={{ bgcolor: "#00a844", "&:hover": { bgcolor: "#00c853" } }}>
          {uploading ? <><CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />Submitting…</> : "Submit to Administration"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
