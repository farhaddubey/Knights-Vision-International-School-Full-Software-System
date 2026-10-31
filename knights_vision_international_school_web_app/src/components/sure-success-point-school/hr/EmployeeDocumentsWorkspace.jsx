"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  AccountBalanceWallet,
  Badge,
  Description,
  FileDownload,
  HistoryEdu,
  Payments,
  Refresh,
  WorkHistory,
} from "@mui/icons-material";
import { downloadEmployeeDocument } from "./employeeDocumentPdf";

const documentCards = [
  { type: "OFFER_LETTER", title: "Offer / Appointment Letter", description: "Professional offer terms for a new or confirmed appointment.", icon: Badge, color: "#dca928", border: "#6d5520" },
  { type: "EMPLOYMENT_CERTIFICATE", title: "Employment Certificate", description: "Active-service certificate without confidential pay details.", icon: Description, color: "#27a76a", border: "#246b4b" },
  { type: "EXPERIENCE_CERTIFICATE", title: "Experience Certificate", description: "Service-period certificate for career, study, or verification use.", icon: HistoryEdu, color: "#a77bd9", border: "#644d87" },
  { type: "WORK_HISTORY", title: "Work History Report", description: "Recorded roles, institutional assignments, and effective dates.", icon: WorkHistory, color: "#4d9df0", border: "#315d93" },
  { type: "SALARY_STATEMENT", title: "Salary Statement", description: "Confidential monthly payroll ledger, status, paid, and remaining amounts.", icon: AccountBalanceWallet, color: "#17a2a4", border: "#285f65", payroll: true },
  { type: "SALARY_PAYMENT_HISTORY", title: "Salary Payment History", description: "Confidential payment-by-payment disbursement report.", icon: Payments, color: "#e2814b", border: "#815033", payroll: true },
];

const fieldSx = {
  "& .MuiInputBase-root": { color: "#f5f5f5", bgcolor: "#252525" },
  "& .MuiInputLabel-root": { color: "#c7c7c7" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#4a4a4a" },
  "& .MuiInputBase-input": { colorScheme: "dark" },
};

function asDateInput(value) {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

function requestJson(path, options) {
  return fetch(path, { credentials: "same-origin", ...options }).then(async (response) => {
    const raw = await response.text();
    let body = {};
    try { body = raw ? JSON.parse(raw) : {}; } catch { throw new Error("The server returned an unexpected response."); }
    if (!response.ok) throw new Error(body.error || body.message || "Unable to process employee documents.");
    return body;
  });
}

function employeeLabel(record) {
  const roles = (record.roles || []).map((role) => role.name || role.code).filter(Boolean);
  return `${record.username || "Unnamed staff member"}${roles.length ? ` — ${roles[0]}` : record.role ? ` — ${record.role}` : ""}`;
}

export default function EmployeeDocumentsWorkspace() {
  const [records, setRecords] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [documentData, setDocumentData] = useState(null);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [loadingDocument, setLoadingDocument] = useState(false);
  const [message, setMessage] = useState(null);
  const [dialogType, setDialogType] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({ reference: "", designation: "", joiningDate: "", effectiveDate: "", monthlyCompensation: "", signatory: "Authorised Signatory" });

  const selectedRecord = useMemo(() => records.find((record) => record.id === selectedId) || null, [records, selectedId]);
  const employee = documentData?.employee || null;
  const canGeneratePayroll = documentData?.capabilities?.payrollDocuments === true;
  const activeCard = documentCards.find((item) => item.type === dialogType) || null;

  const loadRecords = useCallback(async () => {
    setLoadingRecords(true);
    setMessage(null);
    try {
      const body = await requestJson("/api/administration/workforce?page=1&pageSize=100");
      const next = Array.isArray(body.data) ? body.data : [];
      setRecords(next);
      setSelectedId((current) => current || next[0]?.id || null);
    } catch (error) {
      setMessage({ severity: "error", text: error.message });
    } finally {
      setLoadingRecords(false);
    }
  }, []);

  const loadDocumentData = useCallback(async () => {
    if (!selectedId) {
      setDocumentData(null);
      return;
    }
    setLoadingDocument(true);
    setMessage(null);
    try {
      const body = await requestJson(`/api/administration/workforce/${selectedId}/documents`);
      setDocumentData(body);
    } catch (error) {
      setDocumentData(null);
      setMessage({ severity: "error", text: error.message });
    } finally {
      setLoadingDocument(false);
    }
  }, [selectedId]);

  useEffect(() => { loadRecords(); }, [loadRecords]);
  useEffect(() => { loadDocumentData(); }, [loadDocumentData]);

  const openDocumentDialog = (type) => {
    if (!employee) return;
    const defaultDesignation = employee.roleHistory?.[0]?.role?.name || employee.role || "";
    setForm({
      reference: "",
      designation: defaultDesignation,
      joiningDate: asDateInput(employee.createdAt),
      effectiveDate: asDateInput(new Date()),
      monthlyCompensation: employee.baseSalary || "",
      signatory: "Authorised Signatory",
    });
    setDialogType(type);
  };

  const generate = async () => {
    if (!employee || !dialogType) return;
    setGenerating(true);
    setMessage(null);
    try {
      await requestJson(`/api/administration/workforce/${employee.id}/documents`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ documentType: dialogType, reference: form.reference }),
      });
      downloadEmployeeDocument({ type: dialogType, employee, payroll: documentData?.payroll, options: form });
      setDialogType(null);
      setMessage({ severity: "success", text: "The A4 employee document was downloaded and its generation was added to the access audit trail." });
    } catch (error) {
      setMessage({ severity: "error", text: error.message });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, minHeight: "100%", color: "#f5f5f5" }}>
      <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", lg: "center" }} spacing={1.5} sx={{ mb: 2.5 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Employee Documents</Typography>
          <Typography sx={{ color: "#bdbdbd", mt: 0.5 }}>Generate professional, branded A4 HR documents from scoped employee and payroll records. Every document download is audit logged.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} disabled={loadingRecords || loadingDocument} onClick={() => { loadRecords(); loadDocumentData(); }} sx={{ color: "#74e39a", borderColor: "#3e8056", textTransform: "none" }}>Refresh records</Button>
      </Stack>

      {message && <Alert severity={message.severity} sx={{ mb: 2 }} onClose={() => setMessage(null)}>{message.text}</Alert>}

      <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, mb: 2.5, bgcolor: "#151515", borderColor: "#393939" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }}>
          <Autocomplete
            fullWidth
            options={records}
            value={selectedRecord}
            loading={loadingRecords}
            getOptionLabel={employeeLabel}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(_, value) => setSelectedId(value?.id || null)}
            renderInput={(params) => <TextField {...params} label="Select employee or faculty member" placeholder="Search available staff" sx={fieldSx} />}
            renderOption={(props, option) => <li {...props} key={option.id}><Box><Typography fontWeight={700}>{option.username || "Unnamed staff member"}</Typography><Typography variant="caption" sx={{ color: "#9d9d9d" }}>{option.email} • {option.school?.name || "No school"}{option.branch?.name ? ` / ${option.branch.name}` : ""}</Typography></Box></li>}
          />
          {employee && <Stack direction="row" gap={0.75} flexWrap="wrap"><Chip label={employee.isActive ? "Active" : "Inactive"} color={employee.isActive ? "success" : "default"} size="small" /><Chip label={employee.department || "No department"} variant="outlined" size="small" /></Stack>}
        </Stack>
      </Paper>

      {loadingDocument && <Box sx={{ py: 8, display: "grid", placeItems: "center" }}><CircularProgress /></Box>}
      {!loadingDocument && !employee && !message && <Paper variant="outlined" sx={{ p: 5, textAlign: "center", bgcolor: "#151515", borderColor: "#393939", color: "#bdbdbd" }}>Select an employee to load the document workspace.</Paper>}
      {!loadingDocument && employee && <>
        <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, mb: 2.5, bgcolor: "#161616", borderColor: "#3b3b3b" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5}>
            <Box><Typography variant="h6" fontWeight={800}>{employee.username}</Typography><Typography variant="body2" sx={{ color: "#bdbdbd" }}>{employee.email}</Typography><Typography variant="body2" sx={{ color: "#bdbdbd", mt: 0.5 }}>{employee.school?.name || "Sure Success Point School"}{employee.branch?.name ? ` • ${employee.branch.name}` : ""}</Typography></Box>
            <Box sx={{ textAlign: { xs: "left", md: "right" } }}><Typography variant="caption" sx={{ color: "#8f8f8f" }}>Employee ID</Typography><Typography fontWeight={800}>SSPS-EMP-{employee.id}</Typography><Typography variant="caption" sx={{ color: canGeneratePayroll ? "#68d391" : "#d1a440" }}>{canGeneratePayroll ? "Payroll document access granted" : "Payroll documents require finance permission"}</Typography></Box>
          </Stack>
        </Paper>

        <Grid container spacing={2}>
          {documentCards.map((card) => {
            const Icon = card.icon;
            const blocked = card.payroll && !canGeneratePayroll;
            return <Grid size={{ xs: 12, md: 6, lg: 4 }} key={card.type}><Paper variant="outlined" sx={{ height: "100%", p: 2, bgcolor: "#171717", borderColor: card.border, display: "flex", flexDirection: "column" }}>
              <Stack direction="row" spacing={1.2} alignItems="flex-start"><Box sx={{ width: 42, height: 42, display: "grid", placeItems: "center", borderRadius: 2, bgcolor: `${card.color}22`, color: card.color }}><Icon /></Box><Box><Typography fontWeight={800}>{card.title}</Typography><Typography variant="body2" sx={{ color: "#b8b8b8", mt: 0.35 }}>{card.description}</Typography></Box></Stack>
              <Box sx={{ flexGrow: 1 }} />
              <Button fullWidth variant="contained" startIcon={<FileDownload />} disabled={blocked} onClick={() => openDocumentDialog(card.type)} sx={{ mt: 2, bgcolor: card.color, color: "#101010", fontWeight: 800, textTransform: "none", "&:hover": { bgcolor: card.color, filter: "brightness(1.12)" }, "&.Mui-disabled": { bgcolor: "#313131", color: "#888" } }}>{blocked ? "Finance permission required" : "Prepare A4 PDF"}</Button>
            </Paper></Grid>;
          })}
        </Grid>
      </>}

      <Dialog open={Boolean(activeCard)} onClose={() => !generating && setDialogType(null)} fullWidth maxWidth="sm" PaperProps={{ sx: { bgcolor: "#181818", color: "#f5f5f5", border: "1px solid #454545" } }}>
        <DialogTitle sx={{ pb: 1 }}><Typography variant="h6" fontWeight={800}>{activeCard?.title}</Typography><Typography variant="body2" sx={{ color: "#bdbdbd", mt: 0.5 }}>Confirm the HR details below, then download the branded A4 PDF.</Typography></DialogTitle>
        <DialogContent><Divider sx={{ borderColor: "#3f3f3f", mb: 2 }} /><Grid container spacing={1.5}>
          <Grid size={12}><TextField fullWidth label="Document reference (optional)" placeholder="Auto-generated if empty" value={form.reference} onChange={(event) => setForm((current) => ({ ...current, reference: event.target.value }))} inputProps={{ maxLength: 80 }} sx={fieldSx} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Designation" value={form.designation} onChange={(event) => setForm((current) => ({ ...current, designation: event.target.value }))} sx={fieldSx} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth type="date" label="Joining / engagement date" InputLabelProps={{ shrink: true }} value={form.joiningDate} onChange={(event) => setForm((current) => ({ ...current, joiningDate: event.target.value }))} sx={fieldSx} /></Grid>
          {dialogType !== "OFFER_LETTER" && <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth type="date" label="Certificate effective date" InputLabelProps={{ shrink: true }} value={form.effectiveDate} onChange={(event) => setForm((current) => ({ ...current, effectiveDate: event.target.value }))} sx={fieldSx} /></Grid>}
          {dialogType === "OFFER_LETTER" && <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth type="number" label="Proposed monthly compensation (optional)" value={form.monthlyCompensation} onChange={(event) => setForm((current) => ({ ...current, monthlyCompensation: event.target.value }))} inputProps={{ min: 0, step: 0.01 }} sx={fieldSx} /></Grid>}
          <Grid size={12}><TextField fullWidth label="Signing authority" value={form.signatory} onChange={(event) => setForm((current) => ({ ...current, signatory: event.target.value }))} inputProps={{ maxLength: 100 }} sx={fieldSx} /></Grid>
          {(dialogType === "SALARY_STATEMENT" || dialogType === "SALARY_PAYMENT_HISTORY") && <Grid size={12}><Alert severity="warning">This document contains payroll information. It will remain marked confidential and is available only because your current Administration session has finance permission.</Alert></Grid>}
        </Grid></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}><Button color="inherit" disabled={generating} onClick={() => setDialogType(null)}>Cancel</Button><Button variant="contained" startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <FileDownload />} disabled={generating} onClick={generate} sx={{ bgcolor: activeCard?.color, color: "#101010", fontWeight: 800, textTransform: "none" }}>{generating ? "Preparing…" : "Download A4 PDF"}</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
