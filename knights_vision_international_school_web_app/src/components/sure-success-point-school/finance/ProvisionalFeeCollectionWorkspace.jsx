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
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { downloadCollectionAcknowledgementPdf } from "@/src/components/sure-success-point-school/finance/collectionAcknowledgementPdf";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const schoolLevelStatuses = [
  "PENDING_HANDOVER",
  "PENDING_VERIFICATION",
  "HANDED_OVER",
  "COEF_APPROVED",
  "BANK_SUBMITTED",
];

const statusMeta = {
  PENDING_HANDOVER: { label: "Collected — hand over to COEF", color: "warning" },
  PENDING_VERIFICATION: { label: "Legacy collection — hand over to COEF", color: "warning" },
  HANDED_OVER: { label: "Awaiting COEF receipt verification", color: "info" },
  COEF_APPROVED: { label: "COEF received — bank submission pending", color: "info" },
  BANK_SUBMITTED: { label: "Submitted to school bank", color: "success" },
  RECEIVED: { label: "Central Administration confirmed", color: "success" },
  VERIFIED: { label: "Legacy settled receipt", color: "success" },
  REJECTED: { label: "Rejected by COEF", color: "error" },
  CANCELLED: { label: "Cancelled", color: "default" },
};

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
  "& .MuiFormHelperText-root": { color: "#ababab" },
};

function studentName(student) {
  return [student?.firstName, student?.middleName, student?.lastName]
    .filter(Boolean)
    .join(" ") || "Unknown student";
}

function collectionStudent(collection) {
  return collection?.monthlyFee?.student || collection?.admission?.student || null;
}

function collectionItemLabel(collection) {
  if (collection?.paymentKind === "NEW_ADMISSION") return "New admission fee";
  if (collection?.paymentKind === "READMISSION") return "Readmission fee";
  return `${collection?.monthlyFee?.month || "?"}/${collection?.monthlyFee?.year || "?"}`;
}

function userName(user, fallback) {
  return user?.username || user?.email || fallback;
}

function collectionStatus(status) {
  return statusMeta[status] || { label: String(status || "UNKNOWN").replaceAll("_", " "), color: "default" };
}

async function responseJson(response, fallback) {
  const body = await response.text();
  let payload = {};
  if (body) {
    try {
      payload = JSON.parse(body);
    } catch {
      throw new Error(response.ok ? fallback : "The server returned an unexpected response. Please refresh and try again.");
    }
  }
  if (!response.ok) throw new Error(payload.error || fallback);
  return payload;
}

function dateTime(value) {
  return value ? new Date(value).toLocaleString() : "Not recorded";
}

export default function ProvisionalFeeCollectionWorkspace({ paymentKinds = [], title = "Payments Proceeded", admissionRegister = false }) {
  const isAdmissionRegister = admissionRegister;
  const registerLabel = isAdmissionRegister ? "admission / readmission fee" : "monthly fee";
  const currentDate = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(() => currentDate.getMonth() + 1);
  const [year, setYear] = useState(() => currentDate.getFullYear());
  const [stage, setStage] = useState("ALL");
  const [collections, setCollections] = useState([]);
  const [capabilities, setCapabilities] = useState({
    actorUserId: null,
    canSubmit: false,
    canHandover: false,
    canVerify: false,
  });
  const [eligibleFees, setEligibleFees] = useState([]);
  const [openCollection, setOpenCollection] = useState(false);
  const [acknowledgement, setAcknowledgement] = useState(null);
  const [selectedFeeId, setSelectedFeeId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [transactionId, setTransactionId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [handoverNote, setHandoverNote] = useState({});
  const [verificationNote, setVerificationNote] = useState({});
  const [bankReference, setBankReference] = useState({});
  const [bankNote, setBankNote] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const selectedFee = useMemo(
    () => eligibleFees.find((fee) => String(fee.id) === String(selectedFeeId)) || null,
    [eligibleFees, selectedFeeId],
  );
  const downloadAcknowledgement = (collection) => {
    const student = collectionStudent(collection);
    if (!student) return;
    downloadCollectionAcknowledgementPdf({
      collection,
      student,
      classLabel: collection?.classLabel || (collection?.classId ? `Class ID ${collection.classId}` : "Not recorded"),
    });
  };
  const yearOptions = useMemo(
    () => Array.from({ length: 7 }, (_, index) => currentDate.getFullYear() - 4 + index),
    [currentDate],
  );

  const loadCollections = useCallback(async () => {
    setLoading(true);
    try {
      const search = new URLSearchParams({ month: String(month), year: String(year) });
      if (paymentKinds.length) search.set("paymentKinds", paymentKinds.join(","));
      const response = await fetch(`/api/provisional-fee-collections?${search.toString()}`, { credentials: "same-origin" });
      const payload = await responseJson(response, "Unable to load the school collection register.");
      setCollections(payload.collections || []);
      setCapabilities(payload.capabilities || {});
    } catch (error) {
      setMessage({ severity: "error", text: error.message || "Unable to load the school collection register." });
    } finally {
      setLoading(false);
    }
  }, [month, paymentKinds, year]);

  useEffect(() => { loadCollections(); }, [loadCollections]);

  const visibleCollections = useMemo(() => {
    if (stage === "ALL") return collections;
    if (stage === "HANDOVER_REQUIRED") {
      return collections.filter((collection) => ["PENDING_HANDOVER", "PENDING_VERIFICATION"].includes(collection.status));
    }
    return collections.filter((collection) => collection.status === stage);
  }, [collections, stage]);

  const stageCount = useCallback(
    (status) => collections.filter((collection) => collection.status === status).length,
    [collections],
  );

  const schoolLevelTotal = useMemo(
    () => collections
      .filter((collection) => schoolLevelStatuses.includes(collection.status))
      .reduce((total, collection) => total + Number(collection.amount || 0), 0),
    [collections],
  );

  const openSubmission = async () => {
    setMessage(null);
    try {
      const response = await fetch(isAdmissionRegister ? "/api/student-lifecycle/admission-fees/eligible" : "/api/provisional-fee-collections/eligible-fees", { credentials: "same-origin" });
      const payload = await responseJson(response, `Unable to load ${registerLabel} records.`);
      setEligibleFees(isAdmissionRegister ? (payload.eligibleAdmissions || []) : (payload.eligibleFees || []));
      setSelectedFeeId("");
      setAmount("");
      setMethod("CASH");
      setTransactionId("");
      setRemarks("");
      setOpenCollection(true);
    } catch (error) {
      setMessage({ severity: "error", text: error.message || "Unable to load student fee records." });
    }
  };

  const submitCollection = async () => {
    if (!selectedFee || !amount) {
      setMessage({ severity: "error", text: `Select the student's ${isAdmissionRegister ? "admission" : "fee"} record and enter the amount collected.` });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const collectionPayload = {
        amount: Number(amount),
        method,
        transactionId: transactionId || null,
        remarks: remarks || null,
        idempotencyKey: crypto.randomUUID(),
      };
      if (!isAdmissionRegister) collectionPayload.monthlyFeeId = selectedFee.id;
      const response = await fetch(isAdmissionRegister ? `/api/student-lifecycle/admission-fees/${selectedFee.id}/collection` : "/api/provisional-fee-collections", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(collectionPayload),
      });
      const payload = await responseJson(response, "Unable to record this guardian collection.");
      setOpenCollection(false);
      const acknowledgementRecord = {
        ...payload.collection,
        ...(isAdmissionRegister
          ? { admission: { ...selectedFee, student: selectedFee.student } }
          : { monthlyFee: { ...selectedFee, student: selectedFee.student } }),
      };
      setAcknowledgement(acknowledgementRecord);
      if (isAdmissionRegister) downloadAcknowledgement(acknowledgementRecord);
      setMessage({
        severity: "success",
        text: `${isAdmissionRegister ? "Admission payment" : "Guardian collection"} acknowledgement ${payload.collection.publicId} was recorded${isAdmissionRegister ? " and its PDF was downloaded" : ""}. Hand over the money/documents to COEF before progressing it.`,
      });
      await loadCollections();
    } catch (error) {
      setMessage({ severity: "error", text: error.message || "Unable to record this guardian collection." });
    } finally {
      setSubmitting(false);
    }
  };

  const postCollectionAction = async (collectionId, action, body, fallback) => {
    const response = await fetch(`/api/provisional-fee-collections/${collectionId}/${action}`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return responseJson(response, fallback);
  };

  const markHandover = async (collectionId) => {
    setSubmitting(true);
    setMessage(null);
    try {
      await postCollectionAction(
        collectionId,
        "handover",
        { handoverNote: handoverNote[collectionId] || null },
        "Unable to record the COEF handover.",
      );
      setMessage({ severity: "success", text: "Custody handover to COEF is recorded and cannot be repeated." });
      await loadCollections();
    } catch (error) {
      setMessage({ severity: "error", text: error.message || "Unable to record the COEF handover." });
    } finally {
      setSubmitting(false);
    }
  };

  const decide = async (collectionId, decision) => {
    const note = verificationNote[collectionId]?.trim();
    if (!note) {
      setMessage({ severity: "error", text: "COEF must enter a receipt-verification note before approving or rejecting this collection." });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      await postCollectionAction(
        collectionId,
        "decision",
        { decision, verificationNote: note },
        "Unable to record the COEF decision.",
      );
      setMessage({
        severity: "success",
        text: decision === "VERIFY"
          ? "COEF receipt verification is recorded. Enter the bank transaction after depositing the money."
          : "COEF rejection is recorded. The student ledger has not changed.",
      });
      await loadCollections();
    } catch (error) {
      setMessage({ severity: "error", text: error.message || "Unable to record the COEF decision." });
    } finally {
      setSubmitting(false);
    }
  };

  const submitToBank = async (collectionId) => {
    const bankTransactionId = bankReference[collectionId]?.trim();
    if (!bankTransactionId) {
      setMessage({ severity: "error", text: "Enter the school bank transaction ID before recording bank submission." });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      await postCollectionAction(
        collectionId,
        "bank-submit",
        { bankTransactionId, bankSubmissionNote: bankNote[collectionId] || null },
        "Unable to record bank submission.",
      );
      setMessage({
        severity: "success",
        text: "School bank submission is recorded. This completes Phase 1; no student ledger balance was changed.",
      });
      await loadCollections();
    } catch (error) {
      setMessage({ severity: "error", text: error.message || "Unable to record bank submission." });
    } finally {
      setSubmitting(false);
    }
  };

  const workflowFilters = [
    { key: "ALL", label: "All records", count: collections.length },
    { key: "HANDOVER_REQUIRED", label: "To hand over", count: stageCount("PENDING_HANDOVER") + stageCount("PENDING_VERIFICATION") },
    { key: "HANDED_OVER", label: "COEF verification", count: stageCount("HANDED_OVER") },
    { key: "COEF_APPROVED", label: "Ready for bank", count: stageCount("COEF_APPROVED") },
    { key: "BANK_SUBMITTED", label: "Bank submitted", count: stageCount("BANK_SUBMITTED") },
    { key: "REJECTED", label: "Rejected", count: stageCount("REJECTED") },
  ];

  return (
    <Box sx={{ minHeight: "100%", p: { xs: 1.5, md: 2.5 }, bgcolor: "#0b0b0b", color: "#fff" }}>
      <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" alignItems={{ lg: "center" }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>{title}</Typography>
          <Typography variant="body2" sx={{ color: "#c8c8c8", mt: 0.5 }}>
            {isAdmissionRegister ? "Admission / readmission fee acknowledgement → GCI/HOD custody handover → COEF receipt verification → school bank submission." : "Guardian collection acknowledgement → GCI/HOD custody handover → COEF receipt verification → school bank submission."}
          </Typography>
        </Box>
        {capabilities.canSubmit && (
          <Button variant="contained" onClick={openSubmission} sx={{ bgcolor: "#208c4c", fontWeight: 700, "&:hover": { bgcolor: "#16733d" } }}>
            {isAdmissionRegister ? "Record admission collection" : "Record guardian collection"}
          </Button>
        )}
      </Stack>

      <Alert severity="info" sx={{ mb: 2 }}>
        Phase 1 ends at <strong>Submitted to school bank</strong>. It is a controlled school-custody register, not a settled student ledger. Central Administration confirmation, final fee receipt, and any CEO review request belong to Phase 2.
      </Alert>

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.25} sx={{ mb: 2 }}>
        <Paper variant="outlined" sx={{ flex: 1, p: 1.5, bgcolor: "#121212", borderColor: "#4b9d68", color: "#fff" }}>
          <Typography variant="caption" sx={{ color: "#9bdcaf" }}>1. GCI / HOD collection</Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>Record a guardian acknowledgement and retain custody until COEF handover.</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ flex: 1, p: 1.5, bgcolor: "#121212", borderColor: "#338ccc", color: "#fff" }}>
          <Typography variant="caption" sx={{ color: "#8ecbff" }}>2. COEF custody verification</Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>COEF confirms the cash/documents received, or rejects with a written reason.</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ flex: 1, p: 1.5, bgcolor: "#121212", borderColor: "#d4a32e", color: "#fff" }}>
          <Typography variant="caption" sx={{ color: "#ffd572" }}>3. School bank submission</Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>COEF records the school bank transaction ID. Phase 2 later confirms it centrally.</Typography>
        </Paper>
      </Stack>

      <Paper variant="outlined" sx={{ mb: 2, p: 1.5, bgcolor: "#121212", borderColor: "#333", color: "#fff" }}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={1.5} alignItems={{ lg: "center" }}>
          <Typography variant="subtitle2" sx={{ minWidth: 140, color: "#fff" }}>Collection period</Typography>
          <FormControl size="small" sx={{ minWidth: 165, ...darkFieldSx }}>
            <InputLabel id="collection-month-label">Month</InputLabel>
            <Select labelId="collection-month-label" label="Month" value={month} onChange={(event) => setMonth(Number(event.target.value))}>
              {monthNames.map((label, index) => <MenuItem key={label} value={index + 1}>{label}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 125, ...darkFieldSx }}>
            <InputLabel id="collection-year-label">Year</InputLabel>
            <Select labelId="collection-year-label" label="Year" value={year} onChange={(event) => setYear(Number(event.target.value))}>
              {yearOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </Select>
          </FormControl>
          <Box sx={{ flex: 1 }} />
          <Typography variant="caption" sx={{ color: "#70e89c", fontWeight: 700 }}>
            School-custody total: {money.format(schoolLevelTotal)}
          </Typography>
        </Stack>
      </Paper>

      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
        {workflowFilters.map((filter) => (
          <Button
            key={filter.key}
            size="small"
            variant={stage === filter.key ? "contained" : "outlined"}
            onClick={() => setStage(filter.key)}
            sx={stage === filter.key
              ? { bgcolor: "#208c4c", "&:hover": { bgcolor: "#16733d" } }
              : { color: "#e7e7e7", borderColor: "#555", "&:hover": { borderColor: "#8b8b8b" } }}
          >
            {filter.label} ({filter.count})
          </Button>
        ))}
      </Stack>

      {message && <Alert severity={message.severity} sx={{ mb: 2 }} onClose={() => setMessage(null)}>{message.text}</Alert>}

      <Paper
        variant="outlined"
        sx={{
          overflowX: "auto",
          bgcolor: "#101010",
          borderColor: "#333",
          "& .MuiTableCell-root": { color: "#f4f4f4", borderColor: "#303030", verticalAlign: "top" },
          "& .MuiTableHead-root .MuiTableCell-root": { bgcolor: "#1a1a1a", color: "#fff", fontWeight: 700, whiteSpace: "nowrap" },
          "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even)": { bgcolor: "#151515" },
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{isAdmissionRegister ? "Student / admission" : "Student / fee item"}</TableCell>
              <TableCell>Guardian acknowledgement</TableCell>
              <TableCell>Collector / amount</TableCell>
              <TableCell>Payment reference</TableCell>
              <TableCell>School-custody state</TableCell>
              <TableCell>GCI / HOD handover</TableCell>
              <TableCell>COEF verification & bank trail</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && visibleCollections.length === 0 && (
              <TableRow><TableCell colSpan={7} sx={{ color: "#bdbdbd !important" }}>
                No matching payment acknowledgements for {monthNames[month - 1]} {year}.
              </TableCell></TableRow>
            )}
            {visibleCollections.map((collection) => {
              const status = collectionStatus(collection.status);
              const canHandover = capabilities.canHandover
                && collection.collector?.id === capabilities.actorUserId
                && ["PENDING_HANDOVER", "PENDING_VERIFICATION"].includes(collection.status);
              const isFinalLedgerReceipt = ["RECEIVED", "VERIFIED"].includes(collection.status);
              return (
                <TableRow key={collection.id}>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: "#fff", fontWeight: 600 }}>{studentName(collectionStudent(collection))}</Typography>
                    <Typography variant="caption" sx={{ color: "#bdbdbd" }}>
                      {collection.paymentKind && collection.paymentKind !== "MONTHLY_TUITION" ? `${collectionStudent(collection)?.admissionNumber || "No admission no."} · ${collectionItemLabel(collection)}` : null}
                      {(!collection.paymentKind || collection.paymentKind === "MONTHLY_TUITION") ? (
                        <>
                      {collection.monthlyFee?.student?.admissionNumber || "No admission no."} · {collection.monthlyFee?.month}/{collection.monthlyFee?.year}
                        </>
                      ) : null}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={collection.publicId} sx={{ maxWidth: 220, fontFamily: "monospace", color: "#fff", bgcolor: "#333", "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" } }} />
                    <Button size="small" onClick={() => setAcknowledgement(collection)} sx={{ mt: 0.5, px: 0, color: "#70e89c", textTransform: "none" }}>
                      View acknowledgement
                    </Button>
                    <Typography variant="caption" display="block" sx={{ color: isFinalLedgerReceipt ? "#70e89c" : "#bdbdbd" }}>
                      {isFinalLedgerReceipt ? `Final ledger receipt #${collection.finalPayment?.id || collection.finalAdmissionFeeTransaction?.id || "issued"}` : "Not a final fee receipt"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{userName(collection.collector, "Unknown")}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#70e89c", mt: 0.5 }}>{money.format(collection.amount)}</Typography>
                    <Typography variant="caption" sx={{ color: "#bdbdbd" }}>{dateTime(collection.collectedAt)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{collection.method}</Typography>
                    <Typography variant="caption" sx={{ color: "#bdbdbd" }}>{collection.transactionId || "Cash — no external reference"}</Typography>
                  </TableCell>
                  <TableCell><Chip size="small" color={status.color} label={status.label} /></TableCell>
                  <TableCell>
                    {canHandover ? (
                      <Stack spacing={1} sx={{ minWidth: 220 }}>
                        <TextField size="small" label="Handover note (optional)" value={handoverNote[collection.id] || ""} onChange={(event) => setHandoverNote((current) => ({ ...current, [collection.id]: event.target.value }))} inputProps={{ maxLength: 300 }} sx={darkFieldSx} />
                        <Button size="small" variant="contained" disabled={submitting} onClick={() => markHandover(collection.id)} sx={{ bgcolor: "#208c4c", "&:hover": { bgcolor: "#16733d" } }}>
                          Submit custody to COEF
                        </Button>
                      </Stack>
                    ) : collection.handedOverAt ? (
                      <Typography variant="caption" sx={{ color: "#70e89c", fontWeight: 700 }}>
                        Submitted by {userName(collection.handedOverBy, "collector")}<br />{dateTime(collection.handedOverAt)}
                        {collection.handoverNote ? <><br />{collection.handoverNote}</> : null}
                      </Typography>
                    ) : <Typography variant="caption" sx={{ color: "#bdbdbd" }}>Awaiting collector handover</Typography>}
                  </TableCell>
                  <TableCell>
                    {capabilities.canVerify && collection.status === "HANDED_OVER" ? (
                      <Stack spacing={1} sx={{ minWidth: 250 }}>
                        <TextField size="small" required label="COEF receipt-verification note" value={verificationNote[collection.id] || ""} onChange={(event) => setVerificationNote((current) => ({ ...current, [collection.id]: event.target.value }))} inputProps={{ maxLength: 300 }} sx={darkFieldSx} />
                        <Stack direction="row" spacing={1}>
                          <Button size="small" variant="contained" disabled={submitting} onClick={() => decide(collection.id, "VERIFY")} sx={{ bgcolor: "#208c4c", "&:hover": { bgcolor: "#16733d" } }}>Confirm received</Button>
                          <Button size="small" color="error" disabled={submitting} onClick={() => decide(collection.id, "REJECT")}>Reject</Button>
                        </Stack>
                      </Stack>
                    ) : capabilities.canVerify && collection.status === "COEF_APPROVED" ? (
                      <Stack spacing={1} sx={{ minWidth: 250 }}>
                        <TextField size="small" required label="School bank transaction ID" value={bankReference[collection.id] || ""} onChange={(event) => setBankReference((current) => ({ ...current, [collection.id]: event.target.value }))} inputProps={{ maxLength: 100 }} sx={darkFieldSx} />
                        <TextField size="small" label="Bank submission note (optional)" value={bankNote[collection.id] || ""} onChange={(event) => setBankNote((current) => ({ ...current, [collection.id]: event.target.value }))} inputProps={{ maxLength: 300 }} sx={darkFieldSx} />
                        <Button size="small" variant="contained" disabled={submitting} onClick={() => submitToBank(collection.id)} sx={{ bgcolor: "#208c4c", "&:hover": { bgcolor: "#16733d" } }}>
                          Record bank submission
                        </Button>
                      </Stack>
                    ) : collection.status === "BANK_SUBMITTED" ? (
                      <Typography variant="caption" sx={{ color: "#70e89c", fontWeight: 700 }}>
                        Bank transaction: {collection.bankTransactionId}<br />
                        Submitted by {userName(collection.bankSubmittedBy, "COEF")}<br />{dateTime(collection.bankSubmittedAt)}
                        {collection.bankSubmissionNote ? <><br />{collection.bankSubmissionNote}</> : null}
                        <br /><br /><span style={{ color: "#bdbdbd", fontWeight: 400 }}>Phase 2 Central Administration confirmation is pending.</span>
                      </Typography>
                    ) : (
                      <Typography variant="caption" sx={{ color: collection.status === "REJECTED" ? "#ff8585" : "#bdbdbd" }}>
                        {collection.verificationNote || "Awaiting the next authorised action"}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={openCollection} onClose={() => !submitting && setOpenCollection(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { bgcolor: "#111", color: "#fff", border: "1px solid #333" } }}>
        <DialogTitle sx={{ color: "#fff" }}>{isAdmissionRegister ? "Record admission fee collection" : "Record guardian payment collection"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="info">This issues an auditable guardian collection acknowledgement. It does not settle the student's fee balance or create a final fee receipt. Physically hand money/documents to COEF and record the custody handover next.</Alert>
            <FormControl fullWidth sx={darkFieldSx}>
              <InputLabel id="fee-record-label">{isAdmissionRegister ? "Admission fee record" : "Student fee record"}</InputLabel>
              <Select labelId="fee-record-label" label={isAdmissionRegister ? "Admission fee record" : "Student fee record"} value={selectedFeeId} onChange={(event) => { setSelectedFeeId(event.target.value); const fee = eligibleFees.find((item) => String(item.id) === String(event.target.value)); if (fee) setAmount(String(fee.outstandingAmount)); }}>
                {eligibleFees.map((fee) => <MenuItem key={fee.id} value={String(fee.id)}>{studentName(fee.student)} · {isAdmissionRegister ? `${String(fee.admissionType || "ADMISSION").replaceAll("_", " ")} · ${money.format(fee.outstandingAmount)} available` : `${fee.month}/${fee.year} · ${money.format(fee.outstandingAmount)} available`}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Collected amount" type="number" inputProps={{ min: 0.01, step: 0.01, max: selectedFee?.outstandingAmount }} value={amount} onChange={(event) => setAmount(event.target.value)} helperText={selectedFee ? `${money.format(selectedFee.outstandingAmount)} remains available after all unresolved collections.` : ""} fullWidth sx={darkFieldSx} />
            <FormControl fullWidth sx={darkFieldSx}>
              <InputLabel id="method-label">Payment method</InputLabel>
              <Select labelId="method-label" label="Payment method" value={method} onChange={(event) => setMethod(event.target.value)}>
                <MenuItem value="CASH">Cash</MenuItem><MenuItem value="UPI">UPI</MenuItem><MenuItem value="NET_BANKING">Net banking</MenuItem><MenuItem value="ONLINE_GATEWAY">Online gateway</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Transaction reference" required={method !== "CASH"} value={transactionId} onChange={(event) => setTransactionId(event.target.value)} inputProps={{ maxLength: 100 }} fullWidth sx={darkFieldSx} />
            <TextField label="Collection note" value={remarks} onChange={(event) => setRemarks(event.target.value)} inputProps={{ maxLength: 300 }} multiline minRows={2} fullWidth sx={darkFieldSx} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button disabled={submitting} onClick={() => setOpenCollection(false)} sx={{ color: "#ddd" }}>Cancel</Button>
          <Button variant="contained" disabled={submitting || !selectedFeeId || !amount || (method !== "CASH" && !transactionId)} onClick={submitCollection} sx={{ bgcolor: "#208c4c", "&:hover": { bgcolor: "#16733d" } }}>Issue acknowledgement</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(acknowledgement)} onClose={() => setAcknowledgement(null)} fullWidth maxWidth="sm" PaperProps={{ sx: { bgcolor: "#111", color: "#fff", border: "1px solid #3d7c53" } }}>
        <DialogTitle sx={{ color: "#fff", pb: 0 }}>Sure Success Point School</DialogTitle>
        <DialogContent>
          {acknowledgement && (
            <Box sx={{ mt: 2, border: "1px solid #3d7c53", borderRadius: 1.5, p: 2, bgcolor: "#151515" }}>
              <Typography variant="h6" sx={{ color: "#70e89c", fontWeight: 700 }}>Guardian Collection Acknowledgement</Typography>
              <Typography variant="caption" sx={{ color: "#bdbdbd" }}>Acknowledgement no. {acknowledgement.publicId}</Typography>
              <Stack spacing={0.75} sx={{ mt: 2 }}>
                <Typography><strong>Student:</strong> {studentName(collectionStudent(acknowledgement))}</Typography>
                <Typography><strong>Admission no.:</strong> {collectionStudent(acknowledgement)?.admissionNumber || "Not recorded"}</Typography>
                {acknowledgement.paymentKind && acknowledgement.paymentKind !== "MONTHLY_TUITION" ? <Typography><strong>Fee item:</strong> {collectionItemLabel(acknowledgement)}</Typography> : null}
                {!acknowledgement.paymentKind || acknowledgement.paymentKind === "MONTHLY_TUITION" ? <Typography><strong>Fee period:</strong> {acknowledgement.monthlyFee?.month}/{acknowledgement.monthlyFee?.year}</Typography> : null}
                <Typography><strong>Collected amount:</strong> <span style={{ color: "#70e89c", fontWeight: 700 }}>{money.format(acknowledgement.amount)}</span></Typography>
                <Typography><strong>Method:</strong> {acknowledgement.method}{acknowledgement.transactionId ? ` · ${acknowledgement.transactionId}` : ""}</Typography>
                <Typography><strong>Collected on:</strong> {dateTime(acknowledgement.collectedAt || new Date())}</Typography>
              </Stack>
              <Alert severity="warning" sx={{ mt: 2 }}>
                This is proof that the guardian paid the stated amount to the school collector. The amount is marked as school custody and reserved against this fee; it becomes a final fee receipt only after the authorised completion stages.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => acknowledgement && downloadAcknowledgement(acknowledgement)} sx={{ color: "#70e89c" }}>Download PDF</Button>
          <Button onClick={() => window.print()} sx={{ color: "#70e89c" }}>Print acknowledgement</Button>
          <Button variant="contained" onClick={() => setAcknowledgement(null)} sx={{ bgcolor: "#208c4c", "&:hover": { bgcolor: "#16733d" } }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
