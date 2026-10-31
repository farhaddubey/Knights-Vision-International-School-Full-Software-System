"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { Payments, Refresh } from "@mui/icons-material";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const modes = ["CASH", "BANK_TRANSFER", "UPI", "CHEQUE", "OTHER"];

async function requestJson(path, options) {
  const response = await fetch(path, { credentials: "same-origin", ...options });
  const raw = await response.text();
  let body = {};
  try { body = raw ? JSON.parse(raw) : {}; } catch { throw new Error("The server returned an unexpected response."); }
  if (!response.ok) throw new Error(body.error || body.message || "Unable to process payroll.");
  return body;
}

function amount(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value || 0));
}

export default function FacultyPayrollWorkspace() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [records, setRecords] = useState([]);
  const [canPostPayment, setCanPostPayment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [payment, setPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ paid_amount: "", payment_mode: "BANK_TRANSFER", note: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const body = await requestJson(`/api/administration/payroll?year=${year}&month=${month}&page=1&pageSize=100`);
      setRecords(Array.isArray(body.data) ? body.data : []);
      setCanPostPayment(body.capabilities?.postPayment === true);
    } catch (error) {
      setMessage({ severity: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  const openPayment = (record) => {
    setPayment(record);
    setPaymentForm({ paid_amount: record.remainingSalary || "", payment_mode: "BANK_TRANSFER", note: "" });
  };

  const submitPayment = async () => {
    if (!payment) return;
    setSubmitting(true);
    setMessage(null);
    try {
      await requestJson("/api/employee-salaries/pay", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ salary_id: payment.id, user_id: payment.userId, ...paymentForm }),
      });
      setPayment(null);
      setMessage({ severity: "success", text: "Faculty salary payment posted to the controlled payroll ledger." });
      await load();
    } catch (error) {
      setMessage({ severity: "error", text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return <Box sx={{ p: { xs: 1.5, md: 3 }, minHeight: "100%", color: "#f5f5f5" }}>
    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={1.5} sx={{ mb: 2 }}><Box><Typography variant="h4" sx={{ fontWeight: 800 }}>Faculty Payroll</Typography><Typography sx={{ color: "#bdbdbd" }}>Month-based payroll ledger. Payment posting is permission-checked, scope-checked, balance-guarded, and never accepts a browser-supplied balance.</Typography></Box><Stack direction="row" spacing={1}><Select size="small" value={month} onChange={(event) => setMonth(Number(event.target.value))} sx={{ color: "#f5f5f5", bgcolor: "#242424", ".MuiOutlinedInput-notchedOutline": { borderColor: "#4b4b4b" } }}>{months.map((name, index) => <MenuItem key={name} value={index + 1}>{name}</MenuItem>)}</Select><TextField size="small" type="number" label="Year" value={year} onChange={(event) => setYear(Number(event.target.value))} inputProps={{ min: 2000, max: 2100 }} sx={{ width: 110, "& .MuiInputBase-root": { color: "#f5f5f5", bgcolor: "#242424" }, "& .MuiInputLabel-root": { color: "#c7c7c7" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#4b4b4b" } }} /><Button variant="outlined" startIcon={<Refresh />} onClick={load} disabled={loading} sx={{ color: "#74e39a", borderColor: "#3e8056", textTransform: "none" }}>Refresh</Button></Stack></Stack>
    {message && <Alert severity={message.severity} sx={{ mb: 2 }} onClose={() => setMessage(null)}>{message.text}</Alert>}
    <Paper variant="outlined" sx={{ bgcolor: "#151515", borderColor: "#383838", overflow: "auto" }}><Table size="small" sx={{ minWidth: 1120 }}><TableHead><TableRow><TableCell>Faculty member</TableCell><TableCell>Scope</TableCell><TableCell>Net / paid / remaining</TableCell><TableCell>Status</TableCell><TableCell>Action</TableCell></TableRow></TableHead><TableBody>
      {loading && <TableRow><TableCell colSpan={5}><Box sx={{ py: 5, display: "grid", placeItems: "center" }}><CircularProgress /></Box></TableCell></TableRow>}
      {!loading && !records.length && <TableRow><TableCell colSpan={5} sx={{ py: 5, textAlign: "center", color: "#bdbdbd" }}>No payroll records exist for this month in your permitted scope.</TableCell></TableRow>}
      {records.map((record) => <TableRow key={record.id} hover><TableCell><Typography fontWeight={700}>{record.employee?.username || "Staff member"}</Typography><Typography variant="body2" sx={{ color: "#bdbdbd" }}>{record.employee?.email}</Typography><Typography variant="caption" sx={{ color: "#777" }}>{record.employee?.role || "No legacy role"}</Typography></TableCell><TableCell>{record.employee?.school?.name || "School"}<br /><Typography variant="caption" sx={{ color: "#bdbdbd" }}>{record.employee?.branch?.name || "Branch"}</Typography></TableCell><TableCell><Typography variant="body2">Net: {amount(record.netSalary)}</Typography><Typography variant="body2" sx={{ color: "#74e39a" }}>Paid: {amount(record.salaryPaid)}</Typography><Typography variant="body2" sx={{ color: "#ffc857" }}>Remaining: {amount(record.remainingSalary)}</Typography></TableCell><TableCell><Chip size="small" label={record.paymentStatus} color={Number(record.remainingSalary) <= 0 ? "success" : Number(record.salaryPaid) > 0 ? "warning" : "default"} /></TableCell><TableCell><Button size="small" variant="contained" startIcon={<Payments />} disabled={!canPostPayment || Number(record.remainingSalary) <= 0} onClick={() => openPayment(record)}>{canPostPayment ? "Post payment" : "Read only"}</Button></TableCell></TableRow>)}
    </TableBody></Table></Paper>
    <Dialog open={Boolean(payment)} onClose={() => !submitting && setPayment(null)} fullWidth maxWidth="xs" PaperProps={{ sx: { bgcolor: "#171717", color: "#f5f5f5" } }}><DialogTitle>Post faculty salary payment</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}><Typography variant="body2" sx={{ color: "#bdbdbd" }}>{payment?.employee?.username} - remaining {amount(payment?.remainingSalary)}</Typography><TextField required type="number" label="Amount paid" value={paymentForm.paid_amount} onChange={(event) => setPaymentForm((current) => ({ ...current, paid_amount: event.target.value }))} inputProps={{ min: 0.01, max: Number(payment?.remainingSalary || 0), step: 0.01 }} sx={{ "& .MuiInputBase-root": { color: "#f5f5f5", bgcolor: "#242424" }, "& .MuiInputLabel-root": { color: "#c7c7c7" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#4b4b4b" } }} /><Select value={paymentForm.payment_mode} onChange={(event) => setPaymentForm((current) => ({ ...current, payment_mode: event.target.value }))} sx={{ color: "#f5f5f5", bgcolor: "#242424", ".MuiOutlinedInput-notchedOutline": { borderColor: "#4b4b4b" } }}>{modes.map((mode) => <MenuItem key={mode} value={mode}>{mode.replaceAll("_", " ")}</MenuItem>)}</Select><TextField label="Reference or note" value={paymentForm.note} onChange={(event) => setPaymentForm((current) => ({ ...current, note: event.target.value }))} inputProps={{ maxLength: 255 }} sx={{ "& .MuiInputBase-root": { color: "#f5f5f5", bgcolor: "#242424" }, "& .MuiInputLabel-root": { color: "#c7c7c7" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#4b4b4b" } }} /></Stack></DialogContent><DialogActions><Button color="inherit" onClick={() => setPayment(null)} disabled={submitting}>Cancel</Button><Button variant="contained" disabled={submitting || !Number(paymentForm.paid_amount) || Number(paymentForm.paid_amount) > Number(payment?.remainingSalary || 0)} onClick={submitPayment}>Post controlled payment</Button></DialogActions></Dialog>
  </Box>;
}
