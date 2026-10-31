"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AccountBalanceWallet,
  Call,
  Close,
  EmojiPeople,
  Notes,
  Person,
  Search as SearchIcon,
} from "@mui/icons-material";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MAX_FOLLOW_UP_CALLS = 5;
const STUDENT_PAGE_SIZE = 10;
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const darkInputSx = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    backgroundColor: "#242424",
    "& fieldset": { borderColor: "#666" },
    "&:hover fieldset": { borderColor: "#fff" },
    "&.Mui-focused fieldset": { borderColor: "#00c853" },
  },
  "& .MuiInputLabel-root": { color: "#c7c7c7" },
};

function balanceOf(fee) {
  return Math.max(0, (fee?.totalDue || 0) + (fee?.fineAmount || 0) - (fee?.paidAmount || 0) - (fee?.waivedAmount || 0));
}

function totalDueOf(fee) {
  return (fee?.totalDue || 0) + (fee?.fineAmount || 0);
}

function isPaid(fee) {
  return Boolean(fee) && balanceOf(fee) === 0 && totalDueOf(fee) > 0;
}

function dateText(value, includeTime = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", includeTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" });
}

function detailText(detail) {
  if (!detail) return null;
  if (typeof detail === "string") return detail;
  if (typeof detail !== "object") return String(detail);
  if (detail.note) return detail.note;
  const visible = Object.entries(detail)
    .filter(([key]) => !["source", "feeFollowUpAttempt", "feeFollowUpAcademicYear", "feeFollowUpKey"].includes(key))
    .map(([key, value]) => `${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`);
  return visible.join(" · ") || null;
}

function DetailTile({ label, value }) {
  return (
    <Box sx={{ p: 1.1, borderRadius: 1, minHeight: 62, bgcolor: "#242424", border: "1px solid #343434" }}>
      <Typography variant="caption" sx={{ display: "block", mb: 0.3, color: "#aaa" }}>{label}</Typography>
      <Typography variant="body2" sx={{ overflowWrap: "anywhere", color: "#fff" }}>{value || "—"}</Typography>
    </Box>
  );
}

function StatCard({ label, value, tone = "#fff" }) {
  return <Card sx={{ bgcolor: "#202020", color: "#fff", border: "1px solid #3d3d3d", boxShadow: "none" }}><CardContent sx={{ py: 1.4, "&:last-child": { pb: 1.4 } }}><Typography variant="caption" color="#bdbdbd">{label}</Typography><Typography variant="h6" sx={{ color: tone }}>{value}</Typography></CardContent></Card>;
}

function callButtonSx(done) {
  return {
    minWidth: 92,
    borderRadius: 1,
    fontWeight: 800,
    fontSize: 11,
    backgroundColor: done ? "#008f39" : "#fbc02d",
    color: done ? "#ecfff3" : "#251900",
    border: `1px solid ${done ? "#56d987" : "#ffdf66"}`,
    "&:hover": { backgroundColor: done ? "#008f39" : "#ffcf32" },
    "&.Mui-disabled": {
      opacity: 1,
      backgroundColor: done ? "#008f39" : "#4a4a4a",
      color: done ? "#ecfff3" : "#bdbdbd",
      borderColor: done ? "#56d987" : "#666",
    },
  };
}

function facultyHeaders(headers = {}) {
  const token = Cookies.get("faculties_token");
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "x-ssps-panel": "FACULTIES",
    ...headers,
  };
}

async function responsePayload(response) {
  const contentType = response.headers.get("content-type") || "";
  const raw = await response.text();
  if (!contentType.includes("application/json")) {
    throw new Error(`The server returned an unexpected response (HTTP ${response.status}). Please sign in again and retry.`);
  }
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(`The server returned invalid JSON (HTTP ${response.status}). Please retry.`);
  }
}

export default function ClassMonthlyFeeFollowupWorkspace({ className, authorization }) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [feeFollowUpCalls, setFeeFollowUpCalls] = useState([]);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [busyFollowUp, setBusyFollowUp] = useState("");
  const [careOpen, setCareOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [careRecord, setCareRecord] = useState(null);
  const [careLoading, setCareLoading] = useState(false);
  const [careSaving, setCareSaving] = useState(false);
  const [careMessage, setCareMessage] = useState(null);
  const [careTab, setCareTab] = useState("overview");
  const [interaction, setInteraction] = useState({ communicationType: "GENERAL", method: "PHONE", summary: "", details: "" });
  const [specialNote, setSpecialNote] = useState({ note: "", priority: "NORMAL" });

  const classPath = useMemo(() => encodeURIComponent(String(className).toLowerCase()), [className]);
  const permissionSet = useMemo(() => new Set(authorization?.permissions || []), [authorization?.permissions]);
  const canReadGuardianCare = permissionSet.has("*") || permissionSet.has("guardian_communication.read") || permissionSet.has("guardian_communication.manage");
  const canManageGuardianCare = permissionSet.has("*") || permissionSet.has("guardian_communication.manage");

  const loadFees = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/monthly-fees/${classPath}`, { credentials: "same-origin", headers: facultyHeaders() });
      const payload = await responsePayload(response);
      if (!response.ok) throw new Error(payload.error || "Unable to load monthly fees.");
      const nextFees = payload.fees || [];
      const nextStudents = payload.students || [];
      const years = [...new Set(nextFees.map((fee) => Number(fee.year)).filter(Number.isInteger))].sort((left, right) => right - left);
      const preferredYear = years.includes(currentYear) ? currentYear : years[0] || currentYear;
      setFees(nextFees);
      setStudents(nextStudents);
      setFeeFollowUpCalls(payload.feeFollowUpCalls || []);
      setSelectedYear((year) => years.includes(year) || year === currentYear ? year : preferredYear);
    } catch (error) {
      setMessage({ severity: "error", text: error.message || "Unable to load monthly fees." });
    } finally {
      setLoading(false);
    }
  }, [classPath, currentYear]);

  useEffect(() => { loadFees(); }, [loadFees]);

  const academicYears = useMemo(() => {
    const years = new Set([currentYear]);
    fees.forEach((fee) => { if (Number.isInteger(Number(fee.year))) years.add(Number(fee.year)); });
    return [...years].sort((left, right) => right - left);
  }, [fees, currentYear]);

  const studentsWithFees = useMemo(() => {
    const known = new Map(students.map((student) => [student.id, student]));
    fees.forEach((fee) => {
      if (fee.student && !known.has(fee.student.id)) known.set(fee.student.id, fee.student);
    });
    return [...known.values()].sort((left, right) => String(left.name || "").localeCompare(String(right.name || "")));
  }, [fees, students]);

  const feesByStudent = useMemo(() => {
    const grouped = new Map();
    fees.filter((fee) => Number(fee.year) === selectedYear).forEach((fee) => {
      if (!fee.student?.id) return;
      const list = grouped.get(fee.student.id) || [];
      list.push(fee);
      grouped.set(fee.student.id, list);
    });
    return grouped;
  }, [fees, selectedYear]);

  const followUpsByStudent = useMemo(() => {
    const grouped = new Map();
    feeFollowUpCalls.filter((call) => Number(call.academicYear) === selectedYear).forEach((call) => {
      const attempts = grouped.get(call.studentId) || new Set();
      attempts.add(Number(call.attempt));
      grouped.set(call.studentId, attempts);
    });
    return grouped;
  }, [feeFollowUpCalls, selectedYear]);

  const visibleStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return studentsWithFees;
    return studentsWithFees.filter((student) => [student.name, student.admissionNumber, student.guardianName, student.guardianContact]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query)));
  }, [search, studentsWithFees]);

  const totalPages = Math.max(1, Math.ceil(visibleStudents.length / STUDENT_PAGE_SIZE));
  const pagedStudents = useMemo(() => {
    const start = (page - 1) * STUDENT_PAGE_SIZE;
    return visibleStudents.slice(start, start + STUDENT_PAGE_SIZE);
  }, [page, visibleStudents]);

  useEffect(() => { setPage(1); }, [className, search, selectedYear]);
  useEffect(() => { setPage((current) => Math.min(current, totalPages)); }, [totalPages]);

  const summary = useMemo(() => visibleStudents.reduce((totals, student) => {
    const studentFees = feesByStudent.get(student.id) || [];
    totals.totalDue += studentFees.reduce((sum, fee) => sum + totalDueOf(fee), 0);
    totals.paid += studentFees.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);
    totals.balance += studentFees.reduce((sum, fee) => sum + balanceOf(fee), 0);
    return totals;
  }, { totalDue: 0, paid: 0, balance: 0 }), [feesByStudent, visibleStudents]);

  const loadCareRecord = useCallback(async (studentId) => {
    if (!studentId || !canReadGuardianCare) return;
    setCareLoading(true);
    try {
      const response = await fetch(`/api/guardian-care/${classPath}?studentId=${encodeURIComponent(studentId)}`, { credentials: "same-origin", headers: facultyHeaders() });
      const payload = await responsePayload(response);
      if (!response.ok) throw new Error(payload.error || "Unable to load guardian-care information.");
      setCareRecord(payload);
    } catch (error) {
      setCareMessage({ severity: "error", text: error.message || "Unable to load guardian-care information." });
    } finally {
      setCareLoading(false);
    }
  }, [canReadGuardianCare, classPath]);

  const openCare = (student) => {
    setSelectedStudent(student);
    setCareRecord(null);
    setCareMessage(null);
    setCareTab("overview");
    setInteraction({ communicationType: "GENERAL", method: "PHONE", summary: "", details: "" });
    setSpecialNote({ note: "", priority: "NORMAL" });
    setCareOpen(true);
    loadCareRecord(student.id);
  };

  const recordFollowUp = async (studentId, attempt) => {
    if (!canManageGuardianCare) return;
    const key = `${studentId}:${attempt}`;
    setBusyFollowUp(key);
    setMessage(null);
    try {
      const response = await fetch(`/api/guardian-care/${classPath}`, {
        method: "POST",
        credentials: "same-origin",
        headers: facultyHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({ action: "FEE_FOLLOW_UP_CALL", studentId, attempt, academicYear: selectedYear }),
      });
      const payload = await responsePayload(response);
      if (!response.ok) throw new Error(payload.error || "Unable to record the fee follow-up call.");
      const recorded = payload.interaction;
      setFeeFollowUpCalls((current) => current.some((call) => call.id === recorded.id) ? current : [...current, {
        id: recorded.id,
        studentId,
        attempt,
        academicYear: selectedYear,
        recordedAt: recorded.recordedAt,
        recordedById: recorded.recordedById,
      }]);
      setMessage({ severity: "success", text: payload.alreadyRecorded ? `Call ${attempt} was already recorded and remains locked.` : `Fee follow-up call ${attempt} recorded and locked.` });
      // Re-read the class register so the green/locked state is confirmed by
      // the persisted API result rather than only by local browser state.
      await loadFees();
      if (careOpen && selectedStudent?.id === studentId) await loadCareRecord(studentId);
    } catch (error) {
      setMessage({ severity: "error", text: error.message || "Unable to record the fee follow-up call." });
    } finally {
      setBusyFollowUp("");
    }
  };

  const saveCareAction = async (body, success) => {
    if (!selectedStudent) return false;
    setCareSaving(true);
    setCareMessage(null);
    try {
      const response = await fetch(`/api/guardian-care/${classPath}`, {
        method: "POST",
        credentials: "same-origin",
        headers: facultyHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({ studentId: selectedStudent.id, ...body }),
      });
      const payload = await responsePayload(response);
      if (!response.ok) throw new Error(payload.error || "Unable to save guardian-care information.");
      setCareMessage({ severity: "success", text: success });
      await loadCareRecord(selectedStudent.id);
      return true;
    } catch (error) {
      setCareMessage({ severity: "error", text: error.message || "Unable to save guardian-care information." });
      return false;
    } finally {
      setCareSaving(false);
    }
  };

  const recordInteraction = async () => {
    if (!interaction.summary.trim()) {
      setCareMessage({ severity: "error", text: "Write an interaction summary before saving." });
      return;
    }
    const saved = await saveCareAction({ action: "INTERACTION", ...interaction }, "Guardian interaction added to the unified care timeline.");
    if (saved) setInteraction({ communicationType: "GENERAL", method: "PHONE", summary: "", details: "" });
  };

  const addSpecialNote = async () => {
    if (!specialNote.note.trim()) {
      setCareMessage({ severity: "error", text: "Write the special guardian note before saving it." });
      return;
    }
    const saved = await saveCareAction({ action: "SPECIAL_NOTE", ...specialNote }, "Special guardian note saved for this student.");
    if (saved) setSpecialNote({ note: "", priority: "NORMAL" });
  };

  const resolveSpecialNote = async (noteId) => {
    setCareSaving(true);
    setCareMessage(null);
    try {
      const response = await fetch(`/api/guardian-care/${classPath}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: facultyHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({ action: "RESOLVE_SPECIAL_NOTE", noteId }),
      });
      const payload = await responsePayload(response);
      if (!response.ok) throw new Error(payload.error || "Unable to resolve the special note.");
      setCareMessage({ severity: "success", text: "Special guardian note marked resolved." });
      await loadCareRecord(selectedStudent?.id);
    } catch (error) {
      setCareMessage({ severity: "error", text: error.message || "Unable to resolve the special note." });
    } finally {
      setCareSaving(false);
    }
  };

  return (
    <Box sx={{ width: "100%", minHeight: "calc(100vh - 64px)", maxHeight: "calc(100vh - 64px)", overflowY: "auto", overflowX: "hidden", bgcolor: "#212121", color: "#fff" }}>
      <Box sx={{ px: 2, py: 1.1, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", bgcolor: "#009688" }}>
        <AccountBalanceWallet />
        <Box sx={{ flex: 1, minWidth: 190 }}>
          <Typography variant="subtitle1" fontWeight={800}>Monthly Fees & Guardian Care — Class {className}</Typography>
          <Typography variant="caption" sx={{ color: "#e0ffff" }}>One student, one annual fee record, and an audited guardian-care workspace.</Typography>
        </Box>
        <TextField select size="small" label="Year" value={selectedYear} onChange={(event) => setSelectedYear(Number(event.target.value))} sx={{ width: 130, ...darkInputSx }}>
          {academicYears.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
        </TextField>
        <TextField
          variant="outlined"
          placeholder="Search student or guardian..."
          size="small"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ color: "#fff", mr: 1 }} /> }}
          sx={{ width: { xs: "100%", sm: 310 }, ...darkInputSx }}
        />
      </Box>

      <Box sx={{ p: 2, maxWidth: 1600, mx: "auto" }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Green month means settled. Yellow means the current month still needs attention; red means another unpaid or missing month. Guardian-care records are audited here, but money collection and settlement remain in the protected Payments Proceeded workflow.
        </Alert>
        {message && <Alert severity={message.severity} sx={{ mb: 2 }} onClose={() => setMessage(null)}>{message.text}</Alert>}

        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}><StatCard label="Students in filtered list" value={visibleStudents.length} /></Grid>
          <Grid item xs={12} sm={4}><StatCard label="Amount received" value={money.format(summary.paid)} tone="#69f0ae" /></Grid>
          <Grid item xs={12} sm={4}><StatCard label="Outstanding balance" value={money.format(summary.balance)} tone="#ffca28" /></Grid>
        </Grid>

        {loading && <Typography sx={{ p: 4, textAlign: "center", color: "#c7c7c7" }}>Loading annual fee records…</Typography>}
        {!loading && visibleStudents.length === 0 && <Typography sx={{ p: 4, textAlign: "center", color: "#c7c7c7" }}>No students match this class and search.</Typography>}

        <Stack spacing={1.35}>
          {pagedStudents.map((student) => {
            const studentFees = feesByStudent.get(student.id) || [];
            const feeByMonth = new Map();
            studentFees.forEach((fee) => {
              const existing = feeByMonth.get(Number(fee.month));
              if (!existing || balanceOf(fee) < balanceOf(existing)) feeByMonth.set(Number(fee.month), fee);
            });
            const paidMonths = MONTHS.filter((_, index) => isPaid(feeByMonth.get(index + 1))).length;
            const due = studentFees.reduce((total, fee) => total + balanceOf(fee), 0);
            const recordedCalls = followUpsByStudent.get(student.id) || new Set();
            return <Card key={student.id} sx={{ bgcolor: "#181818", color: "#fff", border: "1px solid #3b3b3b", boxShadow: "none", "&:hover": { borderColor: "#009688" } }}>
              <CardContent sx={{ p: { xs: 1.5, md: 2 }, "&:last-child": { pb: { xs: 1.5, md: 2 } } }}>
                <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", lg: "center" }} spacing={1.4}>
                  <Stack direction="row" spacing={1.25} alignItems="center" minWidth={0}>
                    <Box sx={{ display: "grid", placeItems: "center", flex: "0 0 auto", width: 42, height: 42, borderRadius: "50%", bgcolor: "#2d2d2d", color: "#69f0ae" }}><Person /></Box>
                    <Box minWidth={0}>
                      <Typography fontWeight={800} noWrap>{student.name || "Unknown student"}</Typography>
                      <Typography variant="caption" sx={{ color: "#bdbdbd", display: "block" }}>Admission no.: {student.admissionNumber || "—"} · Guardian: {student.guardianName || "—"}</Typography>
                      <Typography variant="body2" sx={{ color: "#69f0ae", fontWeight: 800, fontSize: 15, mt: 0.15 }}>Guardian Contact No.: {student.guardianContact || "Not recorded"}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" flexWrap="wrap" gap={0.8} alignItems="center" justifyContent={{ xs: "flex-start", lg: "flex-end" }}>
                    <Chip size="small" label={`${paidMonths}/12 paid`} sx={{ color: "#d9ffe6", bgcolor: "#1b5e20", fontWeight: 700 }} />
                    <Chip size="small" label={`Due ${money.format(due)}`} sx={{ color: due ? "#fff3cc" : "#d9ffe6", bgcolor: due ? "#835700" : "#1b5e20", fontWeight: 700 }} />
                    <Button variant="contained" size="small" startIcon={<EmojiPeople />} disabled={!canReadGuardianCare} onClick={() => openCare(student)} sx={{ bgcolor: "#00796b", color: "#edfffb", fontWeight: 800, "&:hover": { bgcolor: "#009688" }, "&.Mui-disabled": { bgcolor: "#444", color: "#aaa" } }}>
                      Guardian Care
                    </Button>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 1.5, borderColor: "#3b3b3b" }} />
                <Typography variant="caption" sx={{ color: "#aaa", fontWeight: 700 }}>Monthly status — {selectedYear}</Typography>
                <Box sx={{ mt: 0.85, display: "grid", gridTemplateColumns: "repeat(12, minmax(58px, 1fr))", gap: 0.7, overflowX: "auto", pb: 0.35 }}>
                  {MONTHS.map((month, index) => {
                    const monthNumber = index + 1;
                    const fee = feeByMonth.get(monthNumber);
                    const paid = isPaid(fee);
                    const currentUnpaid = selectedYear === currentYear && monthNumber === currentMonth && !paid;
                    const tone = paid ? { bg: "#1b5e20", border: "#43a047", text: "#e5ffec", state: "Paid" } : currentUnpaid ? { bg: "#7a5d00", border: "#fbc02d", text: "#fff4bf", state: "Current due" } : { bg: "#7f1d1d", border: "#ef5350", text: "#ffe4e4", state: "Unpaid" };
                    return <Tooltip key={month} title={`${month} ${selectedYear}: ${tone.state}${fee ? ` · Due ${money.format(balanceOf(fee))}` : " · No fee record"}`}><Box sx={{ minWidth: 58, textAlign: "center", px: 0.45, py: 0.85, borderRadius: 1, bgcolor: tone.bg, border: `1px solid ${tone.border}`, color: tone.text }}><Typography variant="caption" sx={{ display: "block", fontWeight: 900 }}>{month}</Typography><Typography variant="caption" sx={{ fontSize: 10 }}>{paid ? "PAID" : currentUnpaid ? "DUE" : "UNPAID"}</Typography></Box></Tooltip>;
                  })}
                </Box>

                <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ xs: "flex-start", md: "center" }} sx={{ mt: 1.65 }}>
                  <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 162 }}><Call fontSize="small" sx={{ color: "#ffca28" }} /><Typography variant="body2" fontWeight={800}>Fee follow-up calls</Typography></Stack>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    {Array.from({ length: MAX_FOLLOW_UP_CALLS }, (_, index) => {
                      const attempt = index + 1;
                      const done = recordedCalls.has(attempt);
                      const locked = done || busyFollowUp === `${student.id}:${attempt}` || !canManageGuardianCare;
                      const title = !canManageGuardianCare ? "Your role can view guardian care but cannot record a follow-up call." : done ? `Call ${attempt} is audit-recorded and locked.` : `Record fee follow-up call ${attempt}.`;
                      return <Tooltip key={attempt} title={title}><span><Button size="small" disabled={locked} onClick={() => recordFollowUp(student.id, attempt)} sx={callButtonSx(done)}>{done ? `Call ${attempt} ✓` : `Call ${attempt}`}</Button></span></Tooltip>;
                    })}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>;
          })}
        </Stack>
        {!loading && visibleStudents.length > STUDENT_PAGE_SIZE && <Box sx={{ display: "flex", justifyContent: "center", mt: 2.5, pb: 1 }}><Pagination count={totalPages} page={page} onChange={(_, nextPage) => setPage(nextPage)} color="primary" shape="rounded" sx={{ "& .MuiPaginationItem-root": { color: "#fff", borderColor: "#777" }, "& .Mui-selected": { bgcolor: "#009688 !important" } }} /></Box>}
      </Box>

      <Dialog open={careOpen} onClose={() => !careSaving && setCareOpen(false)} fullWidth maxWidth="xl" PaperProps={{ sx: { bgcolor: "#181818", color: "#fff", border: "1px solid #444", minHeight: "72vh" } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.25, pr: 1, bgcolor: "#00695c" }}>
          <Notes />
          <Box sx={{ flex: 1, minWidth: 0 }}><Typography fontWeight={800} noWrap>Guardian Care — {careRecord?.student?.name || selectedStudent?.name || "Loading student…"}</Typography><Typography variant="caption" sx={{ color: "#dcfffa" }}>Fee follow-up, guardian information, notes and full care history</Typography></Box>
          <IconButton aria-label="Close guardian care" onClick={() => setCareOpen(false)} disabled={careSaving} sx={{ color: "#fff" }}><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2, borderColor: "#444", bgcolor: "#181818" }}>
          {careMessage && <Alert severity={careMessage.severity} sx={{ mb: 2 }} onClose={() => setCareMessage(null)}>{careMessage.text}</Alert>}
          {careLoading && <Typography sx={{ py: 6, textAlign: "center", color: "#c7c7c7" }}>Loading guardian-care information…</Typography>}
          {!careLoading && careRecord && <>
            <Tabs value={careTab} onChange={(_, value) => setCareTab(value)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2, borderBottom: "1px solid #444", "& .MuiTab-root": { color: "#c7c7c7" }, "& .Mui-selected": { color: "#69f0ae !important" }, "& .MuiTabs-indicator": { bgcolor: "#69f0ae" } }}>
              <Tab value="overview" label="Student & Guardian" />
              <Tab value="timeline" label="Care Timeline" />
              <Tab value="notes" label="Special Notes" />
              <Tab value="wellbeing" label="Wellbeing & Fees" />
            </Tabs>

            {careTab === "overview" && <Grid container spacing={2}>
              <Grid item xs={12} md={6}><Paper sx={{ p: 2, color: "#fff", bgcolor: "#202020", border: "1px solid #3e3e3e" }}><Typography variant="h6" sx={{ mb: 1.5 }}>Student & Guardian</Typography><Grid container spacing={1}><Grid item xs={12} sm={6}><DetailTile label="Student" value={careRecord.student?.name} /></Grid><Grid item xs={12} sm={6}><DetailTile label="Admission no." value={careRecord.student?.admissionNumber} /></Grid><Grid item xs={12} sm={6}><DetailTile label="Guardian" value={careRecord.student?.guardianName} /></Grid><Grid item xs={12} sm={6}><DetailTile label="Relation" value={careRecord.student?.guardianRelation} /></Grid><Grid item xs={12}><DetailTile label="Guardian contact" value={careRecord.student?.guardianContact} /></Grid><Grid item xs={12}><DetailTile label="Guardian address" value={careRecord.student?.guardianAddress} /></Grid></Grid></Paper></Grid>
              <Grid item xs={12} md={6}><Paper sx={{ p: 2, color: "#fff", bgcolor: "#202020", border: "1px solid #3e3e3e" }}><Typography variant="h6" sx={{ mb: 1.5 }}>Family Contacts</Typography><Grid container spacing={1}><Grid item xs={12} sm={6}><DetailTile label="Father" value={careRecord.student?.fatherName} /></Grid><Grid item xs={12} sm={6}><DetailTile label="Father contact" value={careRecord.student?.fatherContact} /></Grid><Grid item xs={12} sm={6}><DetailTile label="Mother" value={careRecord.student?.motherName} /></Grid><Grid item xs={12} sm={6}><DetailTile label="Mother contact" value={careRecord.student?.motherContact} /></Grid><Grid item xs={12}><DetailTile label="Open special notes" value={(careRecord.specialNotes || []).filter((note) => !note.isResolved).length} /></Grid></Grid></Paper></Grid>
            </Grid>}

            {careTab === "timeline" && <Grid container spacing={2}>
              <Grid item xs={12} md={5}><Paper sx={{ p: 2, color: "#fff", bgcolor: "#202020", border: "1px solid #3e3e3e" }}><Typography variant="h6" sx={{ mb: 0.7 }}>Record Guardian Interaction</Typography><Typography variant="body2" sx={{ mb: 2, color: "#bdbdbd" }}>Every entry is recorded against this student and class.</Typography>{canManageGuardianCare ? <Stack spacing={1.5}><TextField select label="Interaction type" value={interaction.communicationType} onChange={(event) => setInteraction((current) => ({ ...current, communicationType: event.target.value }))} sx={darkInputSx}>{["GENERAL", "ALERT", "CALL", "SMS", "EMAIL", "MEETING"].map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}</TextField><TextField select label="Contact method" value={interaction.method} onChange={(event) => setInteraction((current) => ({ ...current, method: event.target.value }))} sx={darkInputSx}>{["PHONE", "SMS", "WHATSAPP", "EMAIL", "IN_PERSON"].map((method) => <MenuItem key={method} value={method}>{method.replace("_", " ")}</MenuItem>)}</TextField><TextField label="Summary" required value={interaction.summary} onChange={(event) => setInteraction((current) => ({ ...current, summary: event.target.value }))} inputProps={{ maxLength: 200 }} sx={darkInputSx} /><TextField label="Details / agreed follow-up" value={interaction.details} onChange={(event) => setInteraction((current) => ({ ...current, details: event.target.value }))} inputProps={{ maxLength: 2000 }} multiline minRows={4} sx={darkInputSx} /><Button variant="contained" disabled={careSaving} onClick={recordInteraction} sx={{ bgcolor: "#00a844", color: "#051c0e", fontWeight: 800, "&:hover": { bgcolor: "#00c853" } }}>Save Interaction</Button></Stack> : <Alert severity="info">Your role has read-only guardian-care access.</Alert>}</Paper></Grid>
              <Grid item xs={12} md={7}><Paper sx={{ p: 2, color: "#fff", bgcolor: "#202020", border: "1px solid #3e3e3e", height: "100%" }}><Typography variant="h6" sx={{ mb: 1.5 }}>Unified Timeline</Typography><Stack spacing={1.1}>{(careRecord.timeline || []).length === 0 && <Typography color="#bdbdbd">No guardian communication, call, or meeting history yet.</Typography>}{(careRecord.timeline || []).map((entry) => <Card key={entry.id} sx={{ bgcolor: "#272727", color: "#fff", border: "1px solid #3b3b3b", boxShadow: "none" }}><CardContent sx={{ py: 1.2, "&:last-child": { pb: 1.2 } }}><Stack direction="row" spacing={1} justifyContent="space-between"><Chip size="small" label={entry.category} sx={{ color: "#fff", bgcolor: "#454545" }} /><Typography variant="caption" color="#bdbdbd">{dateText(entry.at, true)}</Typography></Stack><Typography variant="body2" sx={{ mt: 0.8 }}>{entry.title}</Typography><Typography variant="caption" color="#bdbdbd">{entry.method}</Typography>{detailText(entry.detail) && <Typography variant="body2" sx={{ mt: 0.45, color: "#dedede", whiteSpace: "pre-wrap" }}>{detailText(entry.detail)}</Typography>}</CardContent></Card>)}</Stack></Paper></Grid>
            </Grid>}

            {careTab === "notes" && <Grid container spacing={2}>
              <Grid item xs={12} md={5}><Paper sx={{ p: 2, color: "#fff", bgcolor: "#202020", border: "1px solid #3e3e3e" }}><Typography variant="h6" sx={{ mb: 0.7 }}>Add Special Guardian Note</Typography><Typography variant="body2" sx={{ mb: 2, color: "#bdbdbd" }}>Use this for an instruction, risk, or follow-up that must not be lost in a normal call history.</Typography>{canManageGuardianCare ? <Stack spacing={1.5}><TextField select label="Priority" value={specialNote.priority} onChange={(event) => setSpecialNote((current) => ({ ...current, priority: event.target.value }))} sx={darkInputSx}>{["NORMAL", "HIGH", "URGENT"].map((priority) => <MenuItem key={priority} value={priority}>{priority}</MenuItem>)}</TextField><TextField label="Special guardian note" value={specialNote.note} onChange={(event) => setSpecialNote((current) => ({ ...current, note: event.target.value }))} inputProps={{ maxLength: 3000 }} multiline minRows={6} sx={darkInputSx} /><Button variant="contained" disabled={careSaving} onClick={addSpecialNote} sx={{ bgcolor: "#00a844", color: "#051c0e", fontWeight: 800, "&:hover": { bgcolor: "#00c853" } }}>Save Special Note</Button></Stack> : <Alert severity="info">Your role has read-only guardian-care access.</Alert>}</Paper></Grid>
              <Grid item xs={12} md={7}><Paper sx={{ p: 2, color: "#fff", bgcolor: "#202020", border: "1px solid #3e3e3e", height: "100%" }}><Typography variant="h6" sx={{ mb: 1.5 }}>Special Guardian Note History</Typography><Stack spacing={1.1}>{(careRecord.specialNotes || []).length === 0 && <Typography color="#bdbdbd">No special notes for this student.</Typography>}{(careRecord.specialNotes || []).map((note) => <Card key={note.id} sx={{ bgcolor: "#272727", color: "#fff", border: "1px solid #3b3b3b", boxShadow: "none" }}><CardContent sx={{ py: 1.2, "&:last-child": { pb: 1.2 } }}><Stack direction="row" justifyContent="space-between" spacing={1}><Chip size="small" label={note.isResolved ? "RESOLVED" : note.priority} color={note.isResolved ? "success" : note.priority === "URGENT" ? "error" : note.priority === "HIGH" ? "warning" : "info"} /><Typography variant="caption" color="#bdbdbd">{dateText(note.createdAt, true)}</Typography></Stack><Typography variant="body2" sx={{ mt: 0.9, whiteSpace: "pre-wrap" }}>{note.note}</Typography><Typography variant="caption" color="#bdbdbd">By {note.createdBy?.username || note.createdBy?.email || "System"}</Typography>{!note.isResolved && canManageGuardianCare && <Button size="small" disabled={careSaving} onClick={() => resolveSpecialNote(note.id)} sx={{ mt: 0.7, color: "#69f0ae" }}>Mark Resolved</Button>}</CardContent></Card>)}</Stack></Paper></Grid>
            </Grid>}

            {careTab === "wellbeing" && <Grid container spacing={2}>
              <Grid item xs={12} md={6}><Paper sx={{ p: 2, color: "#fff", bgcolor: "#202020", border: "1px solid #3e3e3e", height: "100%" }}><Typography variant="h6" sx={{ mb: 1.5 }}>Behaviour & Wellbeing</Typography><Stack spacing={1}>{(careRecord.behaviourLogs || []).length === 0 && <Typography color="#bdbdbd">No behaviour records for this student.</Typography>}{(careRecord.behaviourLogs || []).map((log) => <Card key={log.id} sx={{ bgcolor: "#272727", color: "#fff", border: "1px solid #3b3b3b", boxShadow: "none" }}><CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}><Typography variant="body2">{log.category} · {log.type}</Typography><Typography variant="caption" color="#bdbdbd">Severity {log.severityLevel} · {dateText(log.incidentDate)} · {log.isResolved ? "Resolved" : "Open"}</Typography>{log.description && <Typography variant="body2" sx={{ mt: 0.4, color: "#dedede" }}>{log.description}</Typography>}</CardContent></Card>)}</Stack></Paper></Grid>
              <Grid item xs={12} md={6}><Paper sx={{ p: 2, color: "#fff", bgcolor: "#202020", border: "1px solid #3e3e3e", height: "100%" }}><Typography variant="h6" sx={{ mb: 1.5 }}>Fee Follow-up Visibility</Typography><Stack spacing={1}>{(careRecord.monthlyFees || []).length === 0 && <Typography color="#bdbdbd">No fee records available.</Typography>}{(careRecord.monthlyFees || []).map((fee) => <Box key={fee.id} sx={{ p: 1.1, borderRadius: 1, bgcolor: "#272727", border: "1px solid #3b3b3b" }}><Stack direction="row" justifyContent="space-between" spacing={1}><Typography variant="body2">{MONTHS[Number(fee.month) - 1] || fee.month} {fee.year}</Typography><Chip size="small" label={fee.status} color={isPaid(fee) ? "success" : "warning"} /></Stack><Typography variant="caption" color="#bdbdbd">Due {money.format(totalDueOf(fee))} · Balance {money.format(balanceOf(fee))}</Typography></Box>)}</Stack></Paper></Grid>
            </Grid>}
          </>}
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.25, bgcolor: "#202020" }}><Button variant="outlined" onClick={() => setCareOpen(false)} disabled={careSaving} sx={{ color: "#fff", borderColor: "#777" }}>Close</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
