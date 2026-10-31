"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add,
  ArrowForward,
  Edit,
  History,
  LockReset,
  PersonAdd,
  PictureAsPdf,
  ReceiptLong,
  School,
  SwapHoriz,
  Visibility,
} from "@mui/icons-material";
import StudentProfileEditDialog from "@/src/components/sure-success-point-school/students/StudentProfileEditDialog";
import { downloadStudentAccountCodePdf } from "@/src/components/sure-success-point-school/students/admissionOnboardingPdf";

const darkFieldSx = {
  "& .MuiInputLabel-root": { color: "#c7c7c7" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#66e895" },
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    backgroundColor: "#151515",
    "& fieldset": { borderColor: "#424242" },
    "&:hover fieldset": { borderColor: "#777" },
    "&.Mui-focused fieldset": { borderColor: "#49d17b" },
  },
  "& .MuiSelect-icon": { color: "#fff" },
};

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

function fullName(student) {
  return [student?.firstName, student?.middleName, student?.lastName].filter(Boolean).join(" ") || "Unnamed student";
}

function classLabel(schoolClass) {
  return schoolClass ? `${schoolClass.name}${schoolClass.section ? ` – ${schoolClass.section}` : ""}` : "Not assigned";
}

function responseError(payload, fallback) {
  return payload?.error || payload?.message || fallback;
}

async function requestJson(path, options = {}) {
  const response = await fetch(path, { credentials: "same-origin", ...options });
  const body = await response.text();
  let payload = {};
  try { payload = body ? JSON.parse(body) : {}; } catch { throw new Error(response.ok ? "The server returned an unexpected response." : "The request could not be completed."); }
  if (!response.ok) throw new Error(responseError(payload, "The request could not be completed."));
  return payload;
}

function Field({ label, value, onChange, type = "text", required = false, multiline = false, ...props }) {
  return <TextField label={label} value={value ?? ""} onChange={(event) => onChange(event.target.value)} type={type} required={required} multiline={multiline} minRows={multiline ? 2 : undefined} fullWidth sx={darkFieldSx} {...props} />;
}

function Section({ title, children }) {
  return <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#121212", borderColor: "#343434", color: "#fff" }}>
    <Typography variant="subtitle2" sx={{ color: "#77e7a2", fontWeight: 800, mb: 1.25 }}>{title}</Typography>
    <Stack spacing={1.25}>{children}</Stack>
  </Paper>;
}

function FinanceMetric({ label, value, color = "#fff" }) {
  return <Box sx={{ minWidth: 108 }}>
    <Typography variant="caption" sx={{ color: "#a7a7a7", display: "block" }}>{label}</Typography>
    <Typography sx={{ color, fontWeight: 800 }}>{money.format(Number(value || 0))}</Typography>
  </Box>;
}

function TcFinanceReview({ snapshot }) {
  if (!snapshot) return <Alert severity="info" sx={{ mt: 1.5 }}>Loading the current fee position for COEF review…</Alert>;
  const monthName = new Date(snapshot.currentMonth?.year || new Date().getFullYear(), Math.max(0, Number(snapshot.currentMonth?.month || 1) - 1), 1)
    .toLocaleString("en-IN", { month: "long", year: "numeric" });
  const monthly = snapshot.currentMonth || {};
  return <Paper variant="outlined" sx={{ mt: 1.5, p: 1.25, bgcolor: "#101a12", borderColor: "#3f7751", color: "#fff" }}>
    <Typography variant="subtitle2" sx={{ color: "#79e5a1", fontWeight: 800, mb: 1 }}>COEF finance review — session {snapshot.academicYear}</Typography>
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} flexWrap="wrap">
      <FinanceMetric label="Yearly total due" value={snapshot.totalApplicable} />
      <FinanceMetric label="Paid total" value={snapshot.verifiedPayments} color="#75e59d" />
      <FinanceMetric label="Waived / adjusted" value={snapshot.waived} color="#8cc8ff" />
      <FinanceMetric label="Remaining" value={snapshot.outstandingBalance} color={snapshot.outstandingBalance > 0 ? "#ffd36b" : "#75e59d"} />
    </Stack>
    <Divider sx={{ borderColor: "#345440", my: 1.1 }} />
    <Typography variant="caption" sx={{ color: "#a7a7a7", display: "block", mb: .5 }}>Current month — {monthName}</Typography>
    {monthly.hasFeeRecord ? <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} flexWrap="wrap">
      <FinanceMetric label="Month due" value={monthly.totalApplicable} />
      <FinanceMetric label="Month paid" value={monthly.verifiedPayments} color="#75e59d" />
      <FinanceMetric label="Month remaining" value={monthly.outstandingBalance} color={monthly.outstandingBalance > 0 ? "#ffd36b" : "#75e59d"} />
    </Stack> : <Typography variant="body2" sx={{ color: "#bdbdbd" }}>No fee row exists for this calendar month.</Typography>}
    {Number(snapshot.pendingCollections || 0) > 0 && <Typography variant="caption" sx={{ display: "block", mt: 1, color: "#ffd36b" }}>Provisional collections still in custody: {money.format(Number(snapshot.pendingCollections))}</Typography>}
  </Paper>;
}

const blankAdmission = {
  firstName: "", middleName: "", lastName: "", dateOfBirth: "", gender: "", guardianName: "", guardianContact: "", guardianRelation: "",
  fatherName: "", fatherContact: "", motherName: "", motherContact: "", emergencyContact: "", residentialAddress: "", city: "", state: "", pinCode: "",
  previousSchoolName: "", studentCategory: "DIRECT_GENERAL", enrollmentMode: "DIRECT", collectedAmount: "", paymentMethod: "CASH", transactionId: "", paymentRemarks: "",
};

export default function StudentLifecycleWorkspace({ className, authorization, initialView = "directory" }) {
  const permissions = authorization?.permissions || [];
  const has = (permission) => permissions.includes("*") || permissions.includes(permission);
  const canAdmission = has("STUDENT_ADMISSION_CREATE");
  const canReadmission = has("STUDENT_READMISSION_CREATE");
  const canTcRequest = has("TC_REQUEST_CREATE");
  const canPrincipal = has("TC_PRINCIPAL_APPROVE");
  const canFinance = has("TC_FINANCE_VERIFY");
  // Issuance is a COEF-stage action, not a Principal-stage action. System
  // administrators retain it only because they also hold finance authority.
  const canIssue = has("TC_ISSUE") && canFinance;
  // Editing starts by loading the existing scoped record, so an account needs
  // both visibility and mutation authority.
  const canManage = has("student.manage") && has("student.read");
  const canManageStudentAccount = has("student_account.manage");
  const [tab, setTab] = useState(initialView === "tc" ? 2 : initialView === "readmission" ? 1 : 0);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [tcRequests, setTcRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [admissionOpen, setAdmissionOpen] = useState(false);
  const [readmissionOpen, setReadmissionOpen] = useState(false);
  const [tcOpen, setTcOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editStudentId, setEditStudentId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [admission, setAdmission] = useState(blankAdmission);
  const [admissionClassId, setAdmissionClassId] = useState("");
  const [admissionFeeSchemeId, setAdmissionFeeSchemeId] = useState("");
  const [readmission, setReadmission] = useState({ targetClassId: "", feeSchemeId: "", academicYear: new Date().getFullYear(), decision: "PROMOTED", collectedAmount: "", paymentMethod: "CASH", transactionId: "", paymentRemarks: "" });
  const [tcForm, setTcForm] = useState({ requestedTransferDate: new Date().toISOString().slice(0, 10), destinationSchoolName: "", destinationLocation: "", reason: "PERSONAL_REASONS", guardianRemarks: "", staffRemarks: "", sensitiveDetails: "" });
  const [acknowledgement, setAcknowledgement] = useState(null);
  const [tcDecision, setTcDecision] = useState(null);
  const [tcDecisionNote, setTcDecisionNote] = useState("");
  const [governmentTcId, setGovernmentTcId] = useState("");
  const [activationDialog, setActivationDialog] = useState(null);
  const [activationResult, setActivationResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedAdmissionClass = useMemo(() => classes.find((entry) => String(entry.id) === String(admissionClassId)) || null, [classes, admissionClassId]);
  const selectedReadmissionClass = useMemo(() => classes.find((entry) => String(entry.id) === String(readmission.targetClassId)) || null, [classes, readmission.targetClassId]);
  const defaultClass = useMemo(() => classes.find((entry) => entry.name === className) || classes[0] || null, [classes, className]);

  const loadDirectory = useCallback(async () => {
    const params = new URLSearchParams({ className, pageSize: "200" });
    if (search.trim()) params.set("search", search.trim());
    const payload = await requestJson(`/api/student-lifecycle/students?${params.toString()}`);
    setStudents(payload.students || []);
  }, [className, search]);

  const loadCatalog = useCallback(async () => {
    const payload = await requestJson("/api/student-lifecycle/catalog");
    setClasses(payload.classes || []);
  }, []);

  const loadTc = useCallback(async () => {
    const payload = await requestJson("/api/student-lifecycle/tc-requests");
    setTcRequests(payload.requests || []);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadDirectory(), loadCatalog(), loadTc()]);
    } catch (error) {
      setMessage({ severity: "error", text: error.message || "Unable to load student lifecycle data." });
    } finally {
      setLoading(false);
    }
  }, [loadCatalog, loadDirectory, loadTc]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    if (!admissionClassId && defaultClass) setAdmissionClassId(String(defaultClass.id));
  }, [admissionClassId, defaultClass]);
  useEffect(() => {
    if (selectedAdmissionClass && !selectedAdmissionClass.FeeScheme.some((scheme) => String(scheme.id) === String(admissionFeeSchemeId))) {
      setAdmissionFeeSchemeId(String(selectedAdmissionClass.FeeScheme[0]?.id || ""));
    }
  }, [admissionFeeSchemeId, selectedAdmissionClass]);

  const openDetail = async (student) => {
    setSelectedStudent(student);
    setDetailOpen(true);
    setStudentDetail(null);
    try {
      const payload = await requestJson(`/api/student-lifecycle/students/${student.id}`);
      setStudentDetail(payload.student);
    } catch (error) {
      setMessage({ severity: "error", text: error.message });
    }
  };

  const openEdit = (student) => {
    setEditStudentId(student.id);
  };

  const onStudentProfileSaved = async (updatedStudent) => {
    setStudents((current) => current.map((student) => (
      student.id === updatedStudent.id ? { ...student, ...updatedStudent } : student
    )));
    setStudentDetail((current) => (current?.id === updatedStudent.id ? { ...current, ...updatedStudent } : current));
    setMessage({ severity: "success", text: "Student profile updated. The photo is now available to result, admit-card, and ID-card workflows." });
    await refresh();
  };

  const submitAdmission = async () => {
    if (!admissionClassId || !admissionFeeSchemeId || !admission.firstName.trim() || !admission.lastName.trim()) {
      setMessage({ severity: "error", text: "Student name, class, and fee scheme are required." });
      return;
    }
    setSubmitting(true);
    try {
      const payload = await requestJson("/api/student-lifecycle/admissions", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          classId: Number(admissionClassId), feeSchemeId: Number(admissionFeeSchemeId), academicYear: selectedAdmissionClass?.academicYear || new Date().getFullYear(),
          admissionDate: new Date().toISOString(), collectedAmount: admission.collectedAmount || null, paymentMethod: admission.paymentMethod,
          transactionId: admission.transactionId || null, paymentRemarks: admission.paymentRemarks || null, student: admission,
        }),
      });
      setAdmissionOpen(false);
      setAdmission(blankAdmission);
      setAcknowledgement({ kind: "New admission", student: payload.student, admission: payload.admission, collection: payload.collection, configuredFee: payload.configuredFee });
      setMessage({ severity: "success", text: `Admission ${payload.student.admissionNumber} was created. The enrolment remains preserved while fee verification is pending.` });
      await refresh();
    } catch (error) {
      setMessage({ severity: "error", text: error.message });
    } finally { setSubmitting(false); }
  };

  const openReadmission = (student) => {
    setSelectedStudent(student);
    const preferred = classes.find((entry) => entry.name === className) || defaultClass;
    setReadmission((current) => ({ ...current, targetClassId: String(preferred?.id || ""), feeSchemeId: String(preferred?.FeeScheme[0]?.id || "") }));
    setReadmissionOpen(true);
  };

  const submitReadmission = async () => {
    if (!selectedStudent || !readmission.targetClassId || !readmission.feeSchemeId) return;
    setSubmitting(true);
    try {
      const payload = await requestJson("/api/student-lifecycle/readmissions", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent.id, classId: Number(readmission.targetClassId), feeSchemeId: Number(readmission.feeSchemeId), academicYear: Number(readmission.academicYear),
          decision: readmission.decision, collectedAmount: readmission.collectedAmount || null, paymentMethod: readmission.paymentMethod,
          transactionId: readmission.transactionId || null, paymentRemarks: readmission.paymentRemarks || null,
        }),
      });
      setReadmissionOpen(false);
      setAcknowledgement({ kind: "Annual readmission", student: payload.student, admission: payload.admission, collection: payload.collection, configuredFee: payload.configuredFee });
      setMessage({ severity: "success", text: `Readmission prepared for ${fullName(payload.student)}. Historical records and the original admission number are unchanged.` });
      await refresh();
    } catch (error) { setMessage({ severity: "error", text: error.message }); } finally { setSubmitting(false); }
  };

  const openTc = (student) => {
    setSelectedStudent(student);
    setTcForm((current) => ({ ...current, requestedTransferDate: new Date().toISOString().slice(0, 10) }));
    setTcOpen(true);
  };

  const submitTcRequest = async () => {
    if (!selectedStudent) return;
    setSubmitting(true);
    try {
      const payload = await requestJson("/api/student-lifecycle/tc-requests", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ studentId: selectedStudent.id, academicYear: selectedStudent.academicYear, ...tcForm }),
      });
      setTcOpen(false);
      setMessage({ severity: "success", text: `TC request ${payload.request.publicId} is awaiting Principal review.` });
      await refresh();
    } catch (error) { setMessage({ severity: "error", text: error.message }); } finally { setSubmitting(false); }
  };

  const openTcDecision = (request, action) => {
    setTcDecision({ request, action });
    setTcDecisionNote("");
    setGovernmentTcId("");
  };

  const submitTcDecision = async () => {
    if (!tcDecision) return;
    const { request, action } = tcDecision;
    if (action !== "ISSUE" && !tcDecisionNote.trim()) {
      setMessage({ severity: "error", text: "A decision note is required." });
      return;
    }
    if (action === "ISSUE" && !governmentTcId.trim()) {
      setMessage({ severity: "error", text: "Government TC ID is required before issuing the certificate." });
      return;
    }
    setSubmitting(true);
    try {
      const payload = await requestJson(`/api/student-lifecycle/tc-requests/${request.id}`, {
        method: "PATCH", headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, note: tcDecisionNote || null, governmentTcId: governmentTcId || null }),
      });
      setMessage({ severity: "success", text: `TC workflow updated to ${payload.request.status.replaceAll("_", " ")}.` });
      setTcDecision(null);
      await refresh();
    } catch (error) { setMessage({ severity: "error", text: error.message }); } finally { setSubmitting(false); }
  };

  const markLeft = async (student) => {
    const note = window.prompt("Reason for marking this student left:");
    if (!note?.trim()) return;
    setSubmitting(true);
    try {
      await requestJson(`/api/student-lifecycle/students/${student.id}`, {
        method: "PATCH", headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "MARK_LEFT", leavingDate: new Date().toISOString(), note }),
      });
      setMessage({ severity: "success", text: "The student was marked left; historical records were preserved." });
      setDetailOpen(false);
      await refresh();
    } catch (error) { setMessage({ severity: "error", text: error.message }); } finally { setSubmitting(false); }
  };

  const openActivationCodeDialog = async (student) => {
    setActivationDialog({ student, loading: true, account: null, mode: null });
    try {
      const payload = await requestJson(`/api-schools-panel/students/${student.id}/activation`);
      setActivationDialog({
        student,
        loading: false,
        account: payload.account,
        mode: payload.account?.recommendedMode || "ACTIVATION",
      });
    } catch (error) {
      setActivationDialog(null);
      setMessage({ severity: "error", text: error.message });
    }
  };

  const issueActivationCode = async () => {
    if (!activationDialog?.student || !activationDialog.mode) return;
    setSubmitting(true);
    try {
      const payload = await requestJson(`/api-schools-panel/students/${activationDialog.student.id}/activation`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: activationDialog.mode }),
      });
      setActivationResult({ student: activationDialog.student, activationCode: payload.activationCode, expiresAt: payload.expiresAt, mode: payload.mode });
      setActivationDialog(null);
      setMessage({
        severity: "success",
        text: payload.mode === "PASSWORD_RESET"
          ? `A one-time password-recovery code was issued for ${fullName(activationDialog.student)}. Deliver it privately; it cannot be displayed again.`
          : `A one-time activation code was issued for ${fullName(activationDialog.student)}. Deliver it privately; it cannot be displayed again.`,
      });
    } catch (error) {
      setMessage({ severity: "error", text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100%", p: { xs: 1.5, md: 2.5 }, bgcolor: "#0b0b0b", color: "#fff" }}>
      <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" alignItems={{ lg: "center" }} spacing={1.5} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Student Lifecycle — Class {className}</Typography>
          <Typography variant="body2" sx={{ color: "#bdbdbd", mt: 0.5 }}>One permanent student profile · yearly enrolments · controlled fee custody · Principal → COEF → TC issue.</Typography>
        </Box>
        {canAdmission && <Button variant="contained" startIcon={<PersonAdd />} onClick={() => setAdmissionOpen(true)} sx={{ bgcolor: "#218c4c", "&:hover": { bgcolor: "#176f3d" } }}>Add student / admission</Button>}
      </Stack>

      <Alert severity="info" sx={{ mb: 2 }}>
        Student records are never deleted here. Use <strong>Mark as Left</strong> or a controlled <strong>Transfer Certificate</strong>; login activation is separately issued and never based on Aadhaar or UID.
      </Alert>
      {message && <Alert severity={message.severity} sx={{ mb: 2 }} onClose={() => setMessage(null)}>{message.text}</Alert>}

      <Paper sx={{ bgcolor: "#121212", color: "#fff", border: "1px solid #333", mb: 2 }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto" sx={{ "& .MuiTab-root": { color: "#bdbdbd" }, "& .Mui-selected": { color: "#72e99e !important" }, "& .MuiTabs-indicator": { bgcolor: "#48cf77" } }}>
          <Tab icon={<School />} iconPosition="start" label="Student Directory" />
           <Tab icon={<SwapHoriz />} iconPosition="start" label="Annual Re-admission" />
          <Tab icon={<ReceiptLong />} iconPosition="start" label="Transfer Certificates" />
        </Tabs>
      </Paper>

      {tab === 0 && <>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.25} sx={{ mb: 2 }}>
          <TextField size="small" label="Search name, admission no., guardian contact" value={search} onChange={(event) => setSearch(event.target.value)} sx={{ minWidth: { md: 360 }, ...darkFieldSx }} />
          <Button variant="outlined" onClick={refresh} sx={{ color: "#73e7a0", borderColor: "#487f5c" }}>Refresh</Button>
          <Box sx={{ flex: 1 }} />
          <Chip label={`${students.length} student${students.length === 1 ? "" : "s"}`} sx={{ bgcolor: "#1d6338", color: "#fff" }} />
        </Stack>
        <Stack spacing={1.1}>
          {loading && <Typography sx={{ color: "#bdbdbd", p: 2 }}>Loading student records…</Typography>}
          {!loading && students.length === 0 && <Paper sx={{ bgcolor: "#121212", color: "#bdbdbd", p: 3, textAlign: "center" }}>No students match this class and search.</Paper>}
          {students.map((student) => (
            <Paper key={student.id} variant="outlined" sx={{ p: 1.5, bgcolor: "#121212", borderColor: "#333", color: "#fff", display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.6fr 1fr 1fr auto" }, gap: 1.5, alignItems: "center" }}>
              <Box><Typography sx={{ fontWeight: 800 }}>{fullName(student)}</Typography><Typography variant="caption" sx={{ color: "#75e59d" }}>{student.admissionNumber || "Admission number pending"}</Typography></Box>
              <Box><Typography variant="caption" sx={{ color: "#999" }}>Guardian</Typography><Typography>{student.guardianName || "Not recorded"}</Typography><Typography sx={{ color: "#71e89c", fontWeight: 700 }}>{student.guardianContact || "No contact"}</Typography></Box>
              <Box><Chip size="small" label={student.status || "ACTIVE"} color={student.status === "TRANSFERRED" ? "default" : student.status === "ACTIVE" ? "success" : "warning"} /><Typography variant="caption" display="block" sx={{ color: "#aaa", mt: .5 }}>{classLabel(student.class)} · {student.academicYear || "Session not set"}</Typography></Box>
               <Stack direction="row" spacing={.75} flexWrap="wrap"><Button size="small" startIcon={<Visibility />} onClick={() => openDetail(student)} sx={{ color: "#7ae8a3" }}>Profile</Button>{canManage && <Button size="small" startIcon={<Edit />} onClick={() => openEdit(student)} sx={{ color: "#ffd36b" }}>Edit</Button>}{canManageStudentAccount && <Button size="small" disabled={submitting} startIcon={<LockReset />} onClick={() => openActivationCodeDialog(student)} sx={{ color: "#bda8ff" }}>Generate activation code</Button>}{canReadmission && <Button size="small" onClick={() => openReadmission(student)} sx={{ color: "#8cc8ff" }}>Re-admit</Button>}{canTcRequest && <Button size="small" color="warning" onClick={() => openTc(student)}>Request TC</Button>}</Stack>
            </Paper>
          ))}
        </Stack>
      </>}

      {tab === 1 && <Paper sx={{ p: 2, bgcolor: "#121212", color: "#fff", border: "1px solid #333" }}>
        <Typography variant="h6" sx={{ mb: .5 }}>Annual Re-admission</Typography>
        <Typography variant="body2" sx={{ color: "#bdbdbd", mb: 2 }}>Open a student profile, then select <strong>Re-admit</strong>. The original admission number and full financial/academic history stay unchanged.</Typography>
        {canReadmission ? <Button variant="contained" onClick={() => setTab(0)} startIcon={<ArrowForward />} sx={{ bgcolor: "#218c4c" }}>Choose a student from directory</Button> : <Alert severity="warning">Your role can view history but cannot prepare annual re-admissions.</Alert>}
      </Paper>}

      {tab === 2 && <Stack spacing={1.1}>
        {loading && <Typography sx={{ color: "#bdbdbd" }}>Loading TC workflow…</Typography>}
        {!loading && tcRequests.length === 0 && <Paper sx={{ p: 3, bgcolor: "#121212", color: "#bdbdbd", textAlign: "center" }}>No TC requests are visible in your scope.</Paper>}
        {tcRequests.map((request) => <Paper key={request.id} variant="outlined" sx={{ p: 1.5, bgcolor: "#121212", borderColor: "#333", color: "#fff" }}>
          <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" spacing={1.5}>
            <Box><Typography sx={{ fontWeight: 800 }}>{fullName(request.student)}</Typography><Typography variant="caption" sx={{ color: "#75e59d" }}>{request.student?.admissionNumber} · {request.publicId}</Typography><Typography variant="body2" sx={{ color: "#c9c9c9", mt: .5 }}>{request.reason.replaceAll("_", " ")} · requested transfer {new Date(request.requestedTransferDate).toLocaleDateString("en-IN")}</Typography></Box>
            <Box><Chip label={request.status.replaceAll("_", " ")} color={request.status === "ISSUED" ? "success" : request.status === "PRINCIPAL_REJECTED" ? "error" : "warning"} />{request.tcNumber && <Typography variant="caption" display="block" sx={{ color: "#73e7a0", mt: .5 }}>School TC: {request.tcNumber}</Typography>}{request.governmentTcId && <Typography variant="caption" display="block" sx={{ color: "#8cc8ff", mt: .35 }}>Government TC ID: {request.governmentTcId}</Typography>}</Box>
            <Stack direction="row" spacing={.75} flexWrap="wrap" alignItems="center">
              {canPrincipal && ["REQUESTED", "RETURNED_FOR_CLARIFICATION"].includes(request.status) && <><Button size="small" onClick={() => openTcDecision(request, "APPROVE")} sx={{ color: "#7ae8a3" }}>Principal approve</Button><Button size="small" onClick={() => openTcDecision(request, "RETURN")} color="warning">Return</Button><Button size="small" onClick={() => openTcDecision(request, "REJECT")} color="error">Reject</Button></>}
              {canFinance && request.status === "PRINCIPAL_APPROVED" && <><Button size="small" disabled={!request.financeReview || Number(request.financeReview.outstandingBalance) > 0} onClick={() => openTcDecision(request, "FINANCE_CLEAR")} sx={{ color: "#7ae8a3" }}>COEF clear (₹0 due)</Button><Button size="small" onClick={() => openTcDecision(request, "FINANCE_PENDING")} color="warning">Reconciliation</Button></>}
              {canIssue && request.status === "FINANCE_CLEARED" && <Button size="small" variant="contained" onClick={() => openTcDecision(request, "ISSUE")} sx={{ bgcolor: "#218c4c" }}>COEF issue TC</Button>}
              {request.status === "ISSUED" && <Button size="small" component="a" href={`/api/student-lifecycle/tc-requests/${request.id}/document`} target="_blank" sx={{ color: "#8cc8ff" }}>Open PDF</Button>}
            </Stack>
          </Stack>
          {canFinance && request.status === "PRINCIPAL_APPROVED" && <TcFinanceReview snapshot={request.financeReview} />}
        </Paper>)}
      </Stack>}

      <Dialog open={admissionOpen} onClose={() => !submitting && setAdmissionOpen(false)} fullWidth maxWidth="lg" PaperProps={{ sx: { bgcolor: "#0d0d0d", color: "#fff", border: "1px solid #3a3a3a" } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Add Student — Controlled Admission</DialogTitle>
        <DialogContent><Alert severity="info" sx={{ my: 1.5 }}>This creates a permanent student profile and first session enrolment. Any collected amount becomes a provisional acknowledgement only; COEF custody verification remains required.</Alert><Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5, pt: .5 }}>
          <Section title="Student & placement"><FormControl fullWidth sx={darkFieldSx}><InputLabel>Class</InputLabel><Select label="Class" value={admissionClassId} onChange={(event) => setAdmissionClassId(event.target.value)}>{classes.map((entry) => <MenuItem key={entry.id} value={String(entry.id)}>{classLabel(entry)}</MenuItem>)}</Select></FormControl><FormControl fullWidth sx={darkFieldSx}><InputLabel>Fee scheme</InputLabel><Select label="Fee scheme" value={admissionFeeSchemeId} onChange={(event) => setAdmissionFeeSchemeId(event.target.value)}>{(selectedAdmissionClass?.FeeScheme || []).map((scheme) => <MenuItem key={scheme.id} value={String(scheme.id)}>{scheme.category} · Admission {money.format(scheme.admissionFee)}</MenuItem>)}</Select></FormControl><Stack direction="row" spacing={1.25}><Field label="First name" value={admission.firstName} required onChange={(value) => setAdmission({ ...admission, firstName: value })} /><Field label="Last name" value={admission.lastName} required onChange={(value) => setAdmission({ ...admission, lastName: value })} /></Stack><Field label="Middle name" value={admission.middleName} onChange={(value) => setAdmission({ ...admission, middleName: value })} /><Stack direction="row" spacing={1.25}><Field label="Date of birth" type="date" value={admission.dateOfBirth} InputLabelProps={{ shrink: true }} onChange={(value) => setAdmission({ ...admission, dateOfBirth: value })} /><Field label="Gender" value={admission.gender} onChange={(value) => setAdmission({ ...admission, gender: value })} /></Stack><Field label="Previous school (optional)" value={admission.previousSchoolName} onChange={(value) => setAdmission({ ...admission, previousSchoolName: value })} /></Section>
          <Section title="Guardian, address & fee acknowledgement"><Stack direction="row" spacing={1.25}><Field label="Guardian name" value={admission.guardianName} onChange={(value) => setAdmission({ ...admission, guardianName: value })} /><Field label="Guardian contact" value={admission.guardianContact} onChange={(value) => setAdmission({ ...admission, guardianContact: value })} /></Stack><Stack direction="row" spacing={1.25}><Field label="Father name" value={admission.fatherName} onChange={(value) => setAdmission({ ...admission, fatherName: value })} /><Field label="Mother name" value={admission.motherName} onChange={(value) => setAdmission({ ...admission, motherName: value })} /></Stack><Field label="Residential address" value={admission.residentialAddress} multiline onChange={(value) => setAdmission({ ...admission, residentialAddress: value })} /><Stack direction="row" spacing={1.25}><Field label="City" value={admission.city} onChange={(value) => setAdmission({ ...admission, city: value })} /><Field label="Emergency contact" value={admission.emergencyContact} onChange={(value) => setAdmission({ ...admission, emergencyContact: value })} /></Stack><Divider sx={{ borderColor: "#333" }} /><Field label="Amount collected now (blank = pending)" type="number" value={admission.collectedAmount} onChange={(value) => setAdmission({ ...admission, collectedAmount: value })} /><FormControl fullWidth sx={darkFieldSx}><InputLabel>Collection method</InputLabel><Select label="Collection method" value={admission.paymentMethod} onChange={(event) => setAdmission({ ...admission, paymentMethod: event.target.value })}><MenuItem value="CASH">Cash</MenuItem><MenuItem value="UPI">UPI</MenuItem><MenuItem value="NET_BANKING">Bank transfer</MenuItem><MenuItem value="ONLINE_GATEWAY">Online gateway</MenuItem></Select></FormControl>{admission.paymentMethod !== "CASH" && <Field label="Transaction reference" value={admission.transactionId} required onChange={(value) => setAdmission({ ...admission, transactionId: value })} />}<Field label="Collection note" value={admission.paymentRemarks} multiline onChange={(value) => setAdmission({ ...admission, paymentRemarks: value })} /></Section>
        </Box></DialogContent><DialogActions sx={{ p: 2 }}><Button disabled={submitting} onClick={() => setAdmissionOpen(false)} sx={{ color: "#ddd" }}>Cancel</Button><Button disabled={submitting} variant="contained" onClick={submitAdmission} startIcon={<Add />} sx={{ bgcolor: "#218c4c" }}>Create admission</Button></DialogActions>
      </Dialog>

      <Dialog open={readmissionOpen} onClose={() => !submitting && setReadmissionOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { bgcolor: "#0d0d0d", color: "#fff", border: "1px solid #3a3a3a" } }}><DialogTitle>Annual Readmission — {fullName(selectedStudent)}</DialogTitle><DialogContent><Stack spacing={1.5} sx={{ pt: 1.5 }}><Alert severity="info">Original admission number: {selectedStudent?.admissionNumber || "Not recorded"}. This creates a new session enrolment without overwriting prior academic or financial records.</Alert><FormControl fullWidth sx={darkFieldSx}><InputLabel>Target class</InputLabel><Select label="Target class" value={readmission.targetClassId} onChange={(event) => { const id = event.target.value; const target = classes.find((entry) => String(entry.id) === String(id)); setReadmission({ ...readmission, targetClassId: id, feeSchemeId: String(target?.FeeScheme[0]?.id || "") }); }}>{classes.map((entry) => <MenuItem key={entry.id} value={String(entry.id)}>{classLabel(entry)}</MenuItem>)}</Select></FormControl><FormControl fullWidth sx={darkFieldSx}><InputLabel>Fee scheme</InputLabel><Select label="Fee scheme" value={readmission.feeSchemeId} onChange={(event) => setReadmission({ ...readmission, feeSchemeId: event.target.value })}>{(selectedReadmissionClass?.FeeScheme || []).map((scheme) => <MenuItem key={scheme.id} value={String(scheme.id)}>{scheme.category} · Readmission {money.format(scheme.readmissionFee)}</MenuItem>)}</Select></FormControl><Stack direction="row" spacing={1.25}><Field label="Academic year" type="number" value={readmission.academicYear} onChange={(value) => setReadmission({ ...readmission, academicYear: value })} /><FormControl fullWidth sx={darkFieldSx}><InputLabel>Decision</InputLabel><Select label="Decision" value={readmission.decision} onChange={(event) => setReadmission({ ...readmission, decision: event.target.value })}><MenuItem value="PROMOTED">Promoted</MenuItem><MenuItem value="REPEATED">Repeated</MenuItem><MenuItem value="RETURNING">Returning</MenuItem></Select></FormControl></Stack><Field label="Amount collected now (blank = pending)" type="number" value={readmission.collectedAmount} onChange={(value) => setReadmission({ ...readmission, collectedAmount: value })} /><FormControl fullWidth sx={darkFieldSx}><InputLabel>Collection method</InputLabel><Select label="Collection method" value={readmission.paymentMethod} onChange={(event) => setReadmission({ ...readmission, paymentMethod: event.target.value })}><MenuItem value="CASH">Cash</MenuItem><MenuItem value="UPI">UPI</MenuItem><MenuItem value="NET_BANKING">Bank transfer</MenuItem><MenuItem value="ONLINE_GATEWAY">Online gateway</MenuItem></Select></FormControl>{readmission.paymentMethod !== "CASH" && <Field label="Transaction reference" value={readmission.transactionId} required onChange={(value) => setReadmission({ ...readmission, transactionId: value })} />}</Stack></DialogContent><DialogActions sx={{ p: 2 }}><Button onClick={() => setReadmissionOpen(false)} sx={{ color: "#ddd" }}>Cancel</Button><Button disabled={submitting} onClick={submitReadmission} variant="contained" sx={{ bgcolor: "#218c4c" }}>Prepare readmission</Button></DialogActions></Dialog>

      <Dialog open={tcOpen} onClose={() => !submitting && setTcOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: { bgcolor: "#0d0d0d", color: "#fff", border: "1px solid #3a3a3a" } }}><DialogTitle>Transfer Certificate Request — {fullName(selectedStudent)}</DialogTitle><DialogContent><Stack spacing={1.5} sx={{ pt: 1.5 }}><Alert severity="info">The request is first reviewed by the Principal, then receives COEF financial verification. Sensitive complaints are kept out of the printed certificate.</Alert><Stack direction={{ xs: "column", md: "row" }} spacing={1.25}><Field label="Requested transfer date" type="date" value={tcForm.requestedTransferDate} InputLabelProps={{ shrink: true }} required onChange={(value) => setTcForm({ ...tcForm, requestedTransferDate: value })} /><FormControl fullWidth sx={darkFieldSx}><InputLabel>Transfer reason</InputLabel><Select label="Transfer reason" value={tcForm.reason} onChange={(event) => setTcForm({ ...tcForm, reason: event.target.value })}>{["FAMILY_RELOCATION", "FINANCIAL_DIFFICULTIES", "ACADEMIC_CONCERNS", "STUDENT_BEHAVIOUR", "BULLYING_OR_SAFETY", "TEACHER_OR_STAFF_COMPLAINT", "SCHOOL_MANAGEMENT_CONCERN", "PERSONAL_REASONS", "OTHER"].map((reason) => <MenuItem key={reason} value={reason}>{reason.replaceAll("_", " ")}</MenuItem>)}</Select></FormControl></Stack><Stack direction={{ xs: "column", md: "row" }} spacing={1.25}><Field label="Destination school (if known)" value={tcForm.destinationSchoolName} onChange={(value) => setTcForm({ ...tcForm, destinationSchoolName: value })} /><Field label="Destination location (if known)" value={tcForm.destinationLocation} onChange={(value) => setTcForm({ ...tcForm, destinationLocation: value })} /></Stack><Field label="Guardian remarks" value={tcForm.guardianRemarks} multiline onChange={(value) => setTcForm({ ...tcForm, guardianRemarks: value })} /><Field label="Staff remarks" value={tcForm.staffRemarks} multiline onChange={(value) => setTcForm({ ...tcForm, staffRemarks: value })} />{(canPrincipal || canFinance) && <Field label="Restricted concern details — not printed on TC" value={tcForm.sensitiveDetails} multiline onChange={(value) => setTcForm({ ...tcForm, sensitiveDetails: value })} />}</Stack></DialogContent><DialogActions sx={{ p: 2 }}><Button onClick={() => setTcOpen(false)} sx={{ color: "#ddd" }}>Cancel</Button><Button disabled={submitting} onClick={submitTcRequest} variant="contained" color="warning">Submit TC request</Button></DialogActions></Dialog>

      <Dialog open={Boolean(tcDecision)} onClose={() => !submitting && setTcDecision(null)} fullWidth maxWidth="sm" PaperProps={{ sx: { bgcolor: "#0d0d0d", color: "#fff", border: "1px solid #3a3a3a" } }}>
        <DialogTitle>{tcDecision?.action === "ISSUE" ? "Issue Transfer Certificate" : "Record Transfer Certificate Decision"}</DialogTitle>
        <DialogContent><Stack spacing={1.5} sx={{ pt: 1.5 }}>
          {tcDecision?.action === "ISSUE" ? <Alert severity="success">The ledger was cleared at finance review. The server will verify it is still ₹0, then permanently link the Government TC ID with the generated Sure Success Point School TC.</Alert> : <Alert severity="info">This decision is recorded against the TC workflow and cannot bypass the financial clearance stage.</Alert>}
          {tcDecision?.action === "ISSUE" && <Field label="Government TC ID" value={governmentTcId} required helperText="The school TC number is generated automatically and paired with this Government TC ID on the PDF." onChange={setGovernmentTcId} />}
          <Field label={tcDecision?.action === "ISSUE" ? "Issuance note (optional)" : "Decision note"} value={tcDecisionNote} required={tcDecision?.action !== "ISSUE"} multiline onChange={setTcDecisionNote} />
        </Stack></DialogContent>
        <DialogActions sx={{ p: 2 }}><Button disabled={submitting} onClick={() => setTcDecision(null)} sx={{ color: "#ddd" }}>Cancel</Button><Button disabled={submitting} onClick={submitTcDecision} variant="contained" sx={{ bgcolor: tcDecision?.action === "ISSUE" ? "#218c4c" : undefined }}>{tcDecision?.action === "ISSUE" ? "Issue TC" : "Save decision"}</Button></DialogActions>
      </Dialog>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: { bgcolor: "#0d0d0d", color: "#fff", border: "1px solid #3a3a3a" } }}><DialogTitle>Student 360° Profile</DialogTitle><DialogContent>{!studentDetail ? <Typography sx={{ color: "#bdbdbd", p: 2 }}>Loading profile…</Typography> : <Stack spacing={1.5} sx={{ pt: 1 }}><Section title="Identity & guardian"><Typography sx={{ fontWeight: 800 }}>{fullName(studentDetail)}</Typography><Typography sx={{ color: "#75e59d" }}>{studentDetail.admissionNumber}</Typography><Typography>Guardian: {studentDetail.guardianName || "Not recorded"} · <span style={{ color: "#75e59d", fontWeight: 700 }}>{studentDetail.guardianContact || "No contact"}</span></Typography><Typography>Current class: {classLabel(studentDetail.class)} · Status: {studentDetail.status}</Typography></Section><Section title="Academic and financial history"><Typography>Enrolments: {studentDetail.enrollments.map((entry) => `${entry.academicYear} ${entry.decision} (${entry.status})`).join(" · ") || "None"}</Typography><Typography>Admissions: {studentDetail.admissions.length} · Monthly fee rows shown: {studentDetail.MonthlyFee.length}</Typography><Typography>TC requests: {studentDetail.transferCertificateRequests.length}</Typography></Section>{canManage && <Stack direction={{ xs: "column", sm: "row" }} spacing={1}><Button variant="outlined" onClick={() => { setDetailOpen(false); openEdit(studentDetail); }} startIcon={<Edit />} sx={{ color: "#ffd36b", borderColor: "#8d6d25" }}>Edit student profile</Button><Button color="warning" variant="outlined" onClick={() => markLeft(studentDetail)} startIcon={<History />}>Mark as Left (preserve history)</Button></Stack>}</Stack>}</DialogContent><DialogActions><Button onClick={() => setDetailOpen(false)} sx={{ color: "#ddd" }}>Close</Button></DialogActions></Dialog>

      <StudentProfileEditDialog open={Boolean(editStudentId)} studentId={editStudentId} onClose={() => setEditStudentId(null)} onSaved={onStudentProfileSaved} />

      <Dialog open={Boolean(activationDialog)} onClose={() => !submitting && setActivationDialog(null)} fullWidth maxWidth="sm" PaperProps={{ sx: { bgcolor: "#101010", color: "#fff", border: "1px solid #6956a6" } }}>
        <DialogTitle>Generate Student Account Code</DialogTitle>
        <DialogContent>
          {activationDialog?.loading ? <Typography sx={{ color: "#bdbdbd", py: 2 }}>Checking the student account status...</Typography> : activationDialog && <Stack spacing={1.5} sx={{ pt: 1 }}>
            <Alert severity={activationDialog.mode === "PASSWORD_RESET" ? "warning" : "info"}>
              {activationDialog.mode === "PASSWORD_RESET"
                ? "This student already has an active account. The generated one-time code can reset the password, but it does not reveal or store the existing password."
                : "This student does not have an active account. The generated one-time code allows the student or verified guardian to choose the first password."}
            </Alert>
            <Section title="Student and guardian verification">
              <Typography><strong>Student:</strong> {fullName(activationDialog.student)}</Typography>
              <Typography><strong>Admission no.:</strong> {activationDialog.student.admissionNumber || "Not recorded"}</Typography>
              <Typography><strong>Guardian:</strong> {activationDialog.student.guardianName || "Not recorded"} <span style={{ color: "#75e59d", fontWeight: 700 }}>{activationDialog.student.guardianContact || ""}</span></Typography>
            </Section>
            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#16121f", borderColor: "#6956a6" }}>
              <Typography variant="caption" sx={{ color: "#cdbfff" }}>Account status</Typography>
              <Typography sx={{ fontWeight: 800, color: activationDialog.account?.isActivated ? "#ffd36b" : "#75e59d" }}>
                {activationDialog.account?.isActivated ? "Active account - password recovery code" : "Not active - first activation code"}
              </Typography>
              {activationDialog.account?.pendingCodeExpiresAt && <Typography variant="caption" sx={{ color: "#bdbdbd" }}>An unused activation code exists until {new Date(activationDialog.account.pendingCodeExpiresAt).toLocaleString("en-IN")}. Generating a new code invalidates it.</Typography>}
            </Paper>
            <Typography variant="body2" sx={{ color: "#bdbdbd" }}>The new code expires in seven days, works once, and is shown only in the next confirmation screen. Deliver it privately to the verified guardian or student.</Typography>
          </Stack>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button disabled={submitting} onClick={() => setActivationDialog(null)} sx={{ color: "#ddd" }}>Cancel</Button>
          <Button disabled={submitting || activationDialog?.loading || !activationDialog?.mode} variant="contained" startIcon={<LockReset />} onClick={issueActivationCode} sx={{ bgcolor: "#5b3b9a", "&:hover": { bgcolor: "#462b78" } }}>
            {activationDialog?.mode === "PASSWORD_RESET" ? "Generate recovery code" : "Generate activation code"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(activationResult)} onClose={() => setActivationResult(null)} fullWidth maxWidth="xs" PaperProps={{ sx: { bgcolor: "#101010", color: "#fff", border: "1px solid #6956a6" } }}>
        <DialogTitle>{activationResult?.mode === "PASSWORD_RESET" ? "One-time Student Password-Recovery Code" : "One-time Student Activation Code"}</DialogTitle>
        <DialogContent>{activationResult?.mode === "PASSWORD_RESET" && <Alert severity="info" sx={{ mt: 1 }}>This is a password-recovery code. On the Student App or Portal, use the same account-code screen to choose a new password; the previous password is never shown or stored in readable form.</Alert>}{activationResult && <Stack spacing={1.25} sx={{ pt: 1 }}><Alert severity="warning">Show this code only to the student's verified guardian or student. It is intentionally shown once and expires after seven days.</Alert><Typography><strong>Student:</strong> {fullName(activationResult.student)}</Typography><Typography><strong>Admission no.:</strong> {activationResult.student.admissionNumber}</Typography><Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#16121f", borderColor: "#6956a6" }}><Typography variant="caption" sx={{ color: "#cdbfff" }}>{activationResult.mode === "PASSWORD_RESET" ? "Password-recovery code" : "Activation code"}</Typography><Typography sx={{ mt: .5, color: "#fff", fontFamily: "monospace", fontWeight: 800, fontSize: 18, letterSpacing: 1, wordBreak: "break-all" }}>{activationResult.activationCode}</Typography></Paper><Typography variant="caption" sx={{ color: "#bdbdbd" }}>Expires: {new Date(activationResult.expiresAt).toLocaleString("en-IN")}</Typography><Typography variant="body2" sx={{ color: "#bdbdbd" }}>The Student App and Portal account-code screen requires the admission number, this code, and a new password of at least 12 characters. UID and Aadhaar are never passwords.</Typography></Stack>}</DialogContent>
        <DialogActions><Button startIcon={<PictureAsPdf />} onClick={() => downloadStudentAccountCodePdf({ student: activationResult.student, activation: activationResult, classLabel: classLabel(activationResult.student.class), purpose: activationResult.mode })} sx={{ color: "#cdbfff" }}>Download / Print PDF</Button><Button variant="contained" onClick={() => setActivationResult(null)} sx={{ bgcolor: "#5b3b9a" }}>I have delivered it securely</Button></DialogActions>
      </Dialog>

      <Dialog open={Boolean(acknowledgement)} onClose={() => setAcknowledgement(null)} fullWidth maxWidth="sm" PaperProps={{ sx: { bgcolor: "#101010", color: "#fff", border: "1px solid #3d7c53" } }}><DialogTitle>Sure Success Point School</DialogTitle><DialogContent>{acknowledgement && <Box sx={{ p: 1, border: "1px solid #3d7c53", borderRadius: 1.5 }}><Typography variant="h6" sx={{ color: "#75e59d" }}>Provisional {acknowledgement.kind} Acknowledgement</Typography><Typography sx={{ mt: 1 }}><strong>Student:</strong> {fullName(acknowledgement.student)}</Typography><Typography><strong>Admission no.:</strong> {acknowledgement.student.admissionNumber}</Typography><Typography><strong>Configured fee:</strong> {money.format(acknowledgement.configuredFee || 0)}</Typography>{acknowledgement.collection ? <><Typography><strong>Collected now:</strong> <span style={{ color: "#75e59d", fontWeight: 800 }}>{money.format(acknowledgement.collection.amount)}</span></Typography><Typography><strong>Acknowledgement:</strong> {acknowledgement.collection.publicId}</Typography></> : <Typography sx={{ color: "#ffd36b" }}>No money was collected; the fee is pending.</Typography>}<Alert severity="warning" sx={{ mt: 2 }}>This is a provisional acknowledgement. It is not a final ledger receipt until the existing custody and bank-confirmation workflow completes.</Alert></Box>}</DialogContent><DialogActions><Button onClick={() => window.print()} sx={{ color: "#75e59d" }}>Print</Button><Button variant="contained" onClick={() => setAcknowledgement(null)} sx={{ bgcolor: "#218c4c" }}>Close</Button></DialogActions></Dialog>
    </Box>
  );
}
