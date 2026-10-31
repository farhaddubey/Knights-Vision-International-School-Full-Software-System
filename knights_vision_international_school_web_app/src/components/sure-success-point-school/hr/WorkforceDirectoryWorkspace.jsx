"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Badge, ContentCopy, Download, LockReset, Refresh } from "@mui/icons-material";

const PAGE_SIZE = 100;
const NAVY = [10, 39, 82];
const GREEN = [0, 132, 94];
const RED = [185, 38, 52];
const INK = [25, 34, 48];
const PAPER = [249, 251, 250];
const MUTED = [101, 112, 124];

async function requestJson(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  const raw = await response.text();
  let body = {};
  try {
    body = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error("The server returned an unexpected response.");
  }
  if (!response.ok) throw new Error(body.error || body.message || "Unable to load the workforce directory.");
  return body;
}

function staffName(record) {
  return String(record.username || record.email?.split("@")?.[0] || "Staff Member").trim();
}

function primaryRole(record) {
  return record.roles?.[0]?.name || record.roles?.[0]?.code || record.role || "STAFF MEMBER";
}

function staffIdentifier(record, year) {
  return `SSPS-${year}-${String(record.id).padStart(5, "0")}`;
}

function shorten(value, maximum = 28) {
  const text = String(value || "N/A").trim() || "N/A";
  return text.length > maximum ? `${text.slice(0, maximum - 1)}…` : text;
}

function fitText(doc, value, maxWidth, startSize = 8, minSize = 5.2) {
  let text = String(value || "N/A").trim() || "N/A";
  let size = startSize;
  doc.setFontSize(size);
  while (doc.getTextWidth(text) > maxWidth && size > minSize) {
    size = Math.max(minSize, size - 0.2);
    doc.setFontSize(size);
  }
  while (doc.getTextWidth(text) > maxWidth && text.length > 1) {
    text = `${text.slice(0, -2)}…`;
  }
  return text;
}

function imageAsDataUrl(url) {
  return new Promise((resolve) => {
    if (!url || typeof window === "undefined") return resolve(null);
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        canvas.getContext("2d").drawImage(image, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

export default function WorkforceDirectoryWorkspace() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloadingIds, setDownloadingIds] = useState(false);
  const [message, setMessage] = useState(null);
  const [activationDialog, setActivationDialog] = useState(null);
  const [activationResult, setActivationResult] = useState(null);
  const [activationBusy, setActivationBusy] = useState(false);
  const cardYear = new Date().getFullYear();

  const load = useCallback(async (query = "") => {
    setLoading(true);
    setMessage(null);
    try {
      const body = await requestJson(`/api/administration/workforce?page=1&pageSize=${PAGE_SIZE}${query ? `&search=${encodeURIComponent(query)}` : ""}`);
      setRecords(Array.isArray(body.data) ? body.data : []);
    } catch (error) {
      setMessage({ severity: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openActivationDialog = useCallback(async (record) => {
    setActivationResult(null);
    setActivationDialog({ record, loading: true, account: null });
    try {
      const body = await requestJson(`/api/administration/workforce/${record.id}/activation`);
      setActivationDialog({ record, loading: false, account: body.account || null });
    } catch (error) {
      setActivationDialog(null);
      setMessage({ severity: "error", text: error.message });
    }
  }, []);

  const issueActivationCode = useCallback(async () => {
    if (!activationDialog?.record || !activationDialog?.account) return;
    setActivationBusy(true);
    try {
      const body = await requestJson(`/api/administration/workforce/${activationDialog.record.id}/activation`, {
        method: "POST",
        body: JSON.stringify({ mode: activationDialog.account.recommendedMode }),
      });
      setActivationDialog(null);
      setActivationResult({ record: activationDialog.record, ...body });
    } catch (error) {
      setMessage({ severity: "error", text: error.message });
    } finally {
      setActivationBusy(false);
    }
  }, [activationDialog]);

  const copyActivationCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(activationResult?.activationCode || "");
      setMessage({ severity: "success", text: "The one-time staff access code was copied. Deliver it privately." });
    } catch {
      setMessage({ severity: "warning", text: "Copy was unavailable. Record the displayed code privately before closing this dialog." });
    }
  }, [activationResult]);

  const activeRecords = useMemo(
    () => records.filter((record) => record.is_active !== false && !record.blocked),
    [records],
  );

  const generateFacultyIdCards = useCallback(async (selectedRecords) => {
    const printable = selectedRecords.filter((record) => record.is_active !== false && !record.blocked);
    if (!printable.length) {
      setMessage({ severity: "info", text: "No active staff records are available for ID-card generation." });
      return;
    }

    setDownloadingIds(true);
    setMessage(null);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const cardWidth = 54;
      const cardHeight = 86;
      const columns = 3;
      const rows = 3;
      const gapX = 7;
      const gapY = 8;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const startX = (pageWidth - (columns * cardWidth + (columns - 1) * gapX)) / 2;
      const startY = (pageHeight - (rows * cardHeight + (rows - 1) * gapY)) / 2;
      const logo = await imageAsDataUrl("/knights.png");

      const portraitEntries = await Promise.all(
        printable.map(async (record) => [String(record.id), await imageAsDataUrl(record.img_url)]),
      );
      const portraits = new Map(portraitEntries);

      const detail = (label, value, x, baselineY) => {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...NAVY);
        doc.setFontSize(5.7);
        doc.text(label, x + 4.5, baselineY);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...INK);
        const text = fitText(doc, value, cardWidth - 24, 5.7, 4.5);
        doc.text(text, x + 18.8, baselineY);
      };

      const drawPortraitPlaceholder = (x, y, width, height) => {
        doc.setFillColor(220, 229, 235);
        doc.setDrawColor(...NAVY);
        doc.setLineWidth(0.35);
        doc.rect(x, y, width, height, "FD");
        doc.setFillColor(151, 170, 182);
        doc.circle(x + width / 2, y + 8, 3.4, "F");
        doc.ellipse(x + width / 2, y + 18, 6.8, 4.2, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(4.3);
        doc.setTextColor(...MUTED);
        doc.text("STAFF PHOTO", x + width / 2, y + height - 2.4, { align: "center" });
      };

      const drawCard = (record, x, y) => {
        const name = staffName(record).toUpperCase();
        const role = primaryRole(record).toUpperCase();
        const school = record.school?.name || "SURE SUCCESS POINT SCHOOL";
        const branch = record.branch?.name || "CENTRAL ADMINISTRATION";
        const department = record.department || "SCHOOL OPERATIONS";
        const portrait = portraits.get(String(record.id));

        doc.setFillColor(...PAPER);
        doc.setDrawColor(202, 211, 218);
        doc.setLineWidth(0.25);
        doc.roundedRect(x, y, cardWidth, cardHeight, 2.5, 2.5, "FD");

        // Distinct faculty identity: navy header, green authority stripe, red security mark.
        doc.setFillColor(...NAVY);
        doc.roundedRect(x + 0.35, y + 0.35, cardWidth - 0.7, 20.5, 2.1, 2.1, "F");
        doc.setFillColor(...GREEN);
        doc.rect(x + 0.35, y + 18.2, cardWidth - 0.7, 2.65, "F");
        doc.setFillColor(...RED);
        doc.triangle(x + cardWidth - 10.5, y + 0.35, x + cardWidth - 0.35, y + 0.35, x + cardWidth - 0.35, y + 10.5, "F");

        if (logo) {
          try {
            doc.addImage(logo, "PNG", x + 4, y + 3.2, 9, 9);
          } catch {
            // A logo issue should never block staff ID generation.
          }
        }

        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6.4);
        doc.text("SURE SUCCESS POINT SCHOOL", x + 15, y + 7.5, { maxWidth: 32 });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(4.8);
        doc.text("FACULTY & STAFF IDENTITY CARD", x + 15, y + 12.5, { maxWidth: 31 });
        doc.setFont("helvetica", "bold");
        doc.setFontSize(4.5);
        doc.text("VERIFIED PERSONNEL", x + 4, y + 19.7);

        const photoX = x + 16.5;
        const photoY = y + 24;
        const photoW = 21;
        const photoH = 25;
        let portraitDrawn = false;
        if (portrait) {
          try {
            doc.setDrawColor(...NAVY);
            doc.setLineWidth(0.45);
            doc.rect(photoX, photoY, photoW, photoH, "S");
            doc.addImage(portrait, undefined, photoX + 0.45, photoY + 0.45, photoW - 0.9, photoH - 0.9);
            portraitDrawn = true;
          } catch {
            portraitDrawn = false;
          }
        }
        if (!portraitDrawn) drawPortraitPlaceholder(photoX, photoY, photoW, photoH);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(...INK);
        doc.setFontSize(8.4);
        doc.text(fitText(doc, name, cardWidth - 7, 8.4, 5.4), x + cardWidth / 2, y + 54.3, { align: "center" });
        doc.setFillColor(...RED);
        doc.rect(x + 18, y + 56, 18, 0.7, "F");
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...GREEN);
        doc.setFontSize(6.2);
        doc.text(fitText(doc, role, cardWidth - 8, 6.2, 4.6), x + cardWidth / 2, y + 60.1, { align: "center" });

        detail("EMP ID", staffIdentifier(record, cardYear), x, y + 65.3);
        detail("DEPT", shorten(department, 22), x, y + 69.5);
        detail("BRANCH", shorten(branch, 22), x, y + 73.7);
        detail("SCHOOL", shorten(school, 22), x, y + 77.9);

        doc.setFillColor(...NAVY);
        doc.roundedRect(x + 0.35, y + 80.1, cardWidth - 0.7, 5.55, 1.4, 1.4, "F");
        doc.setFillColor(...GREEN);
        doc.rect(x + 0.35, y + 80.1, cardWidth - 0.7, 0.95, "F");
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(5.2);
        doc.text(`VALID FOR ${cardYear} • OFFICIAL STAFF USE`, x + cardWidth / 2, y + 84.1, { align: "center" });
      };

      printable.forEach((record, index) => {
        if (index > 0 && index % (columns * rows) === 0) doc.addPage();
        const position = index % (columns * rows);
        const row = Math.floor(position / columns);
        const column = position % columns;
        drawCard(record, startX + column * (cardWidth + gapX), startY + row * (cardHeight + gapY));
      });

      doc.save(`SSPS_Faculty_Staff_ID_Cards_${cardYear}.pdf`);
      setMessage({ severity: "success", text: `${printable.length} active faculty/staff ID card${printable.length === 1 ? "" : "s"} downloaded.` });
    } catch (error) {
      console.error("Faculty ID generation failed:", error);
      setMessage({ severity: "error", text: "Unable to generate faculty ID cards. Please try again." });
    } finally {
      setDownloadingIds(false);
    }
  }, [cardYear]);

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, minHeight: "100%", color: "#f5f5f5" }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={1.5} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Workforce Directory</Typography>
          <Typography sx={{ color: "#bdbdbd" }}>Scoped staff records only. Identity documents, salary figures, and credentials are intentionally excluded.</Typography>
        </Box>
        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
          <TextField size="small" label="Search name, email, or legacy role" value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") load(search); }} sx={{ minWidth: 260, "& .MuiInputBase-root": { color: "#f5f5f5", bgcolor: "#242424" }, "& .MuiInputLabel-root": { color: "#c7c7c7" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#4b4b4b" } }} />
          <Button variant="outlined" startIcon={<Refresh />} onClick={() => load(search)} disabled={loading || downloadingIds} sx={{ color: "#74e39a", borderColor: "#3e8056", textTransform: "none" }}>Refresh</Button>
          <Button variant="contained" startIcon={downloadingIds ? <CircularProgress size={17} color="inherit" /> : <Badge />} onClick={() => generateFacultyIdCards(activeRecords)} disabled={loading || downloadingIds || !activeRecords.length} sx={{ bgcolor: "#0a2752", color: "#fff", textTransform: "none", "&:hover": { bgcolor: "#07316c" } }}>Download Faculty IDs</Button>
        </Stack>
      </Stack>

      {message && <Alert severity={message.severity} sx={{ mb: 2 }} onClose={() => setMessage(null)}>{message.text}</Alert>}

      <Paper variant="outlined" sx={{ bgcolor: "#151515", borderColor: "#383838", overflow: "auto" }}>
        <Table size="small" sx={{ minWidth: 1240 }}>
          <TableHead>
            <TableRow>
              <TableCell>Staff member</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>School / branch</TableCell>
              <TableCell>Account state</TableCell>
              <TableCell align="right">Account access</TableCell>
              <TableCell align="right">Identity card</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && <TableRow><TableCell colSpan={6}><Box sx={{ py: 5, display: "grid", placeItems: "center" }}><CircularProgress /></Box></TableCell></TableRow>}
            {!loading && !records.length && <TableRow><TableCell colSpan={6} sx={{ py: 5, textAlign: "center", color: "#bdbdbd" }}>No staff records are available in your scope.</TableCell></TableRow>}
            {records.map((record) => {
              const active = record.is_active !== false && !record.blocked;
              return (
                <TableRow key={record.id} hover>
                  <TableCell><Typography fontWeight={700}>{staffName(record)}</Typography><Typography variant="body2" sx={{ color: "#bdbdbd" }}>{record.email}</Typography><Typography variant="caption" sx={{ color: "#777" }}>Employee ID {staffIdentifier(record, cardYear)}</Typography></TableCell>
                  <TableCell><Stack direction="row" flexWrap="wrap" gap={0.5}>{(record.roles || []).map((role) => <Chip key={role.code} size="small" label={role.code} color="primary" variant="outlined" />)}{!(record.roles || []).length && <Chip size="small" label={record.role || "Legacy staff"} variant="outlined" />}</Stack><Typography variant="caption" sx={{ color: "#bdbdbd" }}>{record.department || "No department assigned"}</Typography></TableCell>
                  <TableCell>{record.school?.name || "No school"}<br /><Typography variant="caption" sx={{ color: "#bdbdbd" }}>{record.branch?.name || "No branch"}{record.branch?.code ? ` (${record.branch.code})` : ""}</Typography></TableCell>
                  <TableCell><Chip size="small" label={record.blocked ? "Blocked" : record.is_active ? "Active" : "Inactive"} color={record.blocked ? "error" : record.is_active ? "success" : "default"} /></TableCell>
                  <TableCell align="right"><Button size="small" variant="outlined" startIcon={<LockReset />} onClick={() => openActivationDialog(record)} disabled={!active || activationBusy} sx={{ color: "#c8afff", borderColor: "#7056ad", "&:hover": { borderColor: "#a88bed", bgcolor: "rgba(112,86,173,.14)" } }}>Access code</Button></TableCell>
                  <TableCell align="right"><Button size="small" variant="contained" startIcon={<Download />} onClick={() => generateFacultyIdCards([record])} disabled={downloadingIds || !active} sx={{ bgcolor: "#0a2752", color: "#fff", "&:hover": { bgcolor: "#07316c" } }}>ID card</Button></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={Boolean(activationDialog)} onClose={() => !activationBusy && setActivationDialog(null)} fullWidth maxWidth="sm" PaperProps={{ sx: { bgcolor: "#161616", color: "#f5f5f5", border: "1px solid #514370" } }}>
        <DialogTitle>Faculty Account Access Code</DialogTitle>
        <DialogContent>
          {activationDialog?.loading && <Box sx={{ py: 4, display: "grid", placeItems: "center" }}><CircularProgress /></Box>}
          {!activationDialog?.loading && activationDialog?.account && <Stack spacing={1.25} sx={{ pt: 1 }}>
            <Alert severity="info">{activationDialog.account.isActivated ? "This faculty member already has a password. A recovery code lets them choose a replacement; it never exposes their current password." : "This faculty member has no password yet. The code lets them set their first password."}</Alert>
            <Typography><strong>Faculty:</strong> {staffName(activationDialog.record)}</Typography>
            <Typography><strong>Login ID:</strong> {activationDialog.record.email}</Typography>
            {activationDialog.account.pendingCodeExpiresAt && <Typography variant="body2" sx={{ color: "#c6c6c6" }}>An unused code remains valid until {new Date(activationDialog.account.pendingCodeExpiresAt).toLocaleString("en-IN")}. Issuing another code invalidates it.</Typography>}
            <Typography variant="body2" sx={{ color: "#c6c6c6" }}>The Faculty App and Faculty Portal use the login ID, this one-time code, and a new password of at least 12 characters. The code expires after seven days.</Typography>
          </Stack>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}><Button onClick={() => setActivationDialog(null)} disabled={activationBusy} sx={{ color: "#ddd" }}>Cancel</Button><Button variant="contained" startIcon={activationBusy ? <CircularProgress size={16} color="inherit" /> : <LockReset />} disabled={activationBusy || activationDialog?.loading || !activationDialog?.account} onClick={issueActivationCode} sx={{ bgcolor: "#68439a", "&:hover": { bgcolor: "#513277" } }}>{activationDialog?.account?.recommendedMode === "PASSWORD_RESET" ? "Generate recovery code" : "Generate activation code"}</Button></DialogActions>
      </Dialog>

      <Dialog open={Boolean(activationResult)} onClose={() => setActivationResult(null)} fullWidth maxWidth="sm" PaperProps={{ sx: { bgcolor: "#161616", color: "#f5f5f5", border: "1px solid #7056ad" } }}>
        <DialogTitle>{activationResult?.mode === "PASSWORD_RESET" ? "One-time Faculty Password-Recovery Code" : "One-time Faculty Activation Code"}</DialogTitle>
        <DialogContent>{activationResult && <Stack spacing={1.25} sx={{ pt: 1 }}><Alert severity="warning">Show this code only to the intended faculty member. It is displayed once and expires after seven days.</Alert><Typography><strong>Faculty:</strong> {staffName(activationResult.record)}</Typography><Typography><strong>Login ID:</strong> {activationResult.record.email}</Typography><Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#211a2b", borderColor: "#866bc3" }}><Typography variant="caption" sx={{ color: "#ddcffd" }}>One-time account code</Typography><Typography sx={{ mt: .5, color: "#fff", fontFamily: "monospace", fontWeight: 800, fontSize: 18, letterSpacing: 1, wordBreak: "break-all" }}>{activationResult.activationCode}</Typography></Paper><Typography variant="caption" sx={{ color: "#c6c6c6" }}>Expires: {new Date(activationResult.expiresAt).toLocaleString("en-IN")}</Typography><Typography variant="body2" sx={{ color: "#c6c6c6" }}>The existing password remains unchanged unless this code is completed on the Faculty App or Faculty Portal.</Typography></Stack>}</DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}><Button startIcon={<ContentCopy />} onClick={copyActivationCode} sx={{ color: "#d1bcff" }}>Copy code</Button><Button variant="contained" onClick={() => setActivationResult(null)} sx={{ bgcolor: "#68439a", "&:hover": { bgcolor: "#513277" } }}>I have delivered it securely</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
