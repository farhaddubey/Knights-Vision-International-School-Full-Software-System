"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { getActiveStaffPanelToken } from "@/src/lib/client/panelSession";

const categories = ["FINANCIAL", "ACADEMIC", "STAFF", "OPERATIONAL", "MARKETING", "COMMUNICATIONS", "EXECUTIVE"];

const emptyForm = {
  schoolId: "",
  branchId: "",
  classId: "",
  academicYear: String(new Date().getFullYear()),
  category: "ACADEMIC",
  title: "",
  reason: "",
  requestedChange: '{\n  "requestedAction": ""\n}',
  supportingInformation: "",
};

function titleCase(value) {
  return String(value || "").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function PolicyExceptionWorkspace({ panel }) {
  const [form, setForm] = useState(emptyForm);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [workflowNotes, setWorkflowNotes] = useState({});

  const headers = useMemo(() => {
    const token = getActiveStaffPanelToken();
    return {
      "x-ssps-panel": panel,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, [panel]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [recordsResponse, authorizationResponse] = await Promise.all([
        axios.get("/api/policy-exceptions?page=1&pageSize=50", { headers }),
        axios.get("/api-schools-panel/rbac/authorization", { headers }),
      ]);
      setRecords(recordsResponse.data?.data || []);
      const user = authorizationResponse.data?.data?.user;
      if (user?.schoolId) {
        setForm((current) => ({ ...current, schoolId: current.schoolId || String(user.schoolId), branchId: current.branchId || (user.branchId ? String(user.branchId) : "") }));
      }
    } catch (error) {
      setMessage({ severity: "error", text: error.response?.data?.message || "Unable to load the policy-exception workspace." });
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    load();
  }, [load]);

  const updateForm = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      let requestedChange;
      try {
        requestedChange = JSON.parse(form.requestedChange);
      } catch {
        throw new Error("Requested change must be valid JSON, for example {\"requestedAction\":\"...\"}.");
      }
      await axios.post("/api/policy-exceptions", {
        ...form,
        schoolId: Number(form.schoolId),
        branchId: form.branchId ? Number(form.branchId) : null,
        classId: form.classId ? Number(form.classId) : null,
        academicYear: form.academicYear ? Number(form.academicYear) : null,
        requestedChange,
      }, { headers });
      setForm((current) => ({ ...emptyForm, schoolId: current.schoolId, branchId: current.branchId }));
      setMessage({ severity: "success", text: "Policy exception submitted and routed to headquarters." });
      await load();
    } catch (error) {
      setMessage({ severity: "error", text: error.response?.data?.message || error.message || "Unable to submit the policy exception." });
    } finally {
      setSubmitting(false);
    }
  };

  const transition = async (record, action) => {
    const note = String(workflowNotes[record.id] || "").trim();
    if (note.length < 10) {
      setMessage({ severity: "error", text: "Add a workflow note of at least 10 characters before taking action." });
      return;
    }
    try {
      await axios.put(`/api/policy-exceptions/${record.id}`, { action, note }, { headers });
      setMessage({ severity: "success", text: `${titleCase(action)} recorded.` });
      await load();
    } catch (error) {
      setMessage({ severity: "error", text: error.response?.data?.message || "This action was not permitted." });
    }
  };

  const availableActions = (record) => {
    if (record.status === "SUBMITTED") return ["REVIEW", "APPROVE", "REJECT", "CANCEL"];
    if (record.status === "UNDER_REVIEW") return ["APPROVE", "REJECT"];
    if (record.status === "APPROVED") return ["VERIFY_EXECUTION"];
    if (record.status === "EXECUTION_VERIFIED") return ["CLOSE"];
    return [];
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, color: "#f5f5f5", minHeight: "100%" }}>
      <Typography variant="h4" gutterBottom>Policy Exceptions</Typography>
      <Typography sx={{ color: "#bdbdbd", mb: 3 }}>
        Submit a justified exception to headquarters. Financial, academic, staff, operational, marketing, communications, and executive matters are automatically routed to their responsible central officer.
      </Typography>
      {message && <Alert severity={message.severity} sx={{ mb: 2 }} onClose={() => setMessage(null)}>{message.text}</Alert>}

      <Card sx={{ mb: 3, bgcolor: "#151515", color: "inherit" }} component="form" onSubmit={submit}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Submit an exception</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><TextField required fullWidth label="Institution ID" value={form.schoolId} onChange={updateForm("schoolId")} helperText="Use the institution ID shown in Institutions & Branches." /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Branch ID (optional)" value={form.branchId} onChange={updateForm("branchId")} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Class ID (optional)" value={form.classId} onChange={updateForm("classId")} /></Grid>
            <Grid item xs={12} md={4}><TextField select required fullWidth label="Exception category" value={form.category} onChange={updateForm("category")}>{categories.map((item) => <MenuItem key={item} value={item}>{titleCase(item)}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Academic year (optional)" value={form.academicYear} onChange={updateForm("academicYear")} /></Grid>
            <Grid item xs={12} md={4}><TextField required fullWidth label="Short title" value={form.title} onChange={updateForm("title")} /></Grid>
            <Grid item xs={12}><TextField required fullWidth multiline minRows={3} label="Business reason and impact" value={form.reason} onChange={updateForm("reason")} /></Grid>
            <Grid item xs={12} md={6}><TextField required fullWidth multiline minRows={5} label="Requested change (JSON)" value={form.requestedChange} onChange={updateForm("requestedChange")} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth multiline minRows={5} label="Supporting information, evidence or links" value={form.supportingInformation} onChange={updateForm("supportingInformation")} /></Grid>
          </Grid>
          <Button type="submit" disabled={submitting} variant="contained" sx={{ mt: 2 }}>{submitting ? "Submitting…" : "Submit to headquarters"}</Button>
        </CardContent>
      </Card>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h6">Submitted exceptions</Typography>
        <Button onClick={load} disabled={loading}>Refresh</Button>
      </Stack>
      {loading ? <CircularProgress /> : records.length === 0 ? <Alert severity="info">No policy exceptions are visible in your assigned scope.</Alert> : (
        <Stack spacing={2}>
          {records.map((record) => (
            <Card key={record.id} sx={{ bgcolor: "#151515", color: "inherit" }}>
              <CardContent>
                <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
                  <Box><Typography variant="h6">{record.title}</Typography><Typography variant="body2" sx={{ color: "#bdbdbd" }}>{record.school?.name} · {record.branch?.name || "Institution-wide"}</Typography></Box>
                  <Stack direction="row" spacing={1}><Chip size="small" label={titleCase(record.category)} /><Chip size="small" color="primary" label={titleCase(record.status)} /></Stack>
                </Stack>
                <Typography sx={{ mt: 1 }}>{record.reason}</Typography>
                <Typography variant="body2" sx={{ color: "#bdbdbd", mt: 1 }}>Routed to: {record.routedRoleCode} · Submitted by: {record.requestedBy?.email}</Typography>
                {record.decisionNote && <Typography variant="body2" sx={{ mt: 1 }}>Decision note: {record.decisionNote}</Typography>}
                <Divider sx={{ my: 2, borderColor: "#333" }} />
                {availableActions(record).length > 0 && <>
                  <TextField fullWidth size="small" label="Workflow note (required for every action)" value={workflowNotes[record.id] || ""} onChange={(event) => setWorkflowNotes((notes) => ({ ...notes, [record.id]: event.target.value }))} />
                  <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
                    {availableActions(record).map((item) => <Button key={item} size="small" variant={item === "REJECT" || item === "CANCEL" ? "outlined" : "contained"} color={item === "REJECT" || item === "CANCEL" ? "error" : "primary"} onClick={() => transition(record, item)}>{titleCase(item)}</Button>)}
                  </Stack>
                </>}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}

