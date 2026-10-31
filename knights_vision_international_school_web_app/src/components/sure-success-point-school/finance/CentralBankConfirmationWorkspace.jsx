"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
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
import { AccountBalance, CheckCircle, Refresh } from "@mui/icons-material";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
const darkFieldSx = {
  "& .MuiInputLabel-root": { color: "#c7c7c7" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#66e895" },
  "& .MuiOutlinedInput-root": { color: "#fff", backgroundColor: "#151515", "& fieldset": { borderColor: "#424242" }, "&:hover fieldset": { borderColor: "#777" }, "&.Mui-focused fieldset": { borderColor: "#49d17b" } },
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function dateTime(value) {
  return value ? new Date(value).toLocaleString("en-IN") : "Not recorded";
}

function userName(user, fallback) {
  return user?.username || user?.email || fallback;
}

async function requestJson(path, options) {
  const response = await fetch(path, { credentials: "same-origin", ...options });
  const raw = await response.text();
  let body = {};
  try { body = raw ? JSON.parse(raw) : {}; } catch { throw new Error("The server returned an unexpected response."); }
  if (!response.ok) throw new Error(body.error || "Unable to process the bank confirmation.");
  return body;
}

/** Central headquarters Phase 2 ledger settlement workspace. */
export default function CentralBankConfirmationWorkspace({ kind = "MONTHLY" }) {
  const isMonthly = kind === "MONTHLY";
  const title = isMonthly ? "Monthly Fee - Daily Bank Settlement" : "Admission Fee - Bank Credit Confirmation";
  const [settlementDate, setSettlementDate] = useState(today);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [creditReference, setCreditReference] = useState({});
  const [creditNote, setCreditNote] = useState({});
  const [creditDate, setCreditDate] = useState({});

  const query = useMemo(() => {
    const params = new URLSearchParams({ kind });
    if (isMonthly && settlementDate) params.set("settlementDate", settlementDate);
    return params.toString();
  }, [isMonthly, kind, settlementDate]);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      setData(await requestJson(`/api/administration/finance/bank-confirmations?${query}`));
    } catch (error) {
      setMessage({ severity: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  const confirmBankCredit = async (collection) => {
    const bankCreditReference = String(creditReference[collection.id] || "").trim();
    if (!bankCreditReference) {
      setMessage({ severity: "error", text: "Enter the central bank-credit confirmation reference before finalising this record." });
      return;
    }
    setSubmittingId(collection.id);
    setMessage(null);
    try {
      await requestJson(`/api/provisional-fee-collections/${collection.id}/receive`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          bankCreditReference,
          bankCreditDate: creditDate[collection.id] || settlementDate || today(),
          receivedNote: String(creditNote[collection.id] || "").trim() || null,
        }),
      });
      setMessage({ severity: "success", text: `${isMonthly ? "Monthly fee" : "Admission fee"} bank credit confirmed. The final student ledger receipt has been issued.` });
      await loadRecords();
    } catch (error) {
      setMessage({ severity: "error", text: error.message });
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <Box sx={{ minHeight: "100%", p: { xs: 1.5, md: 2.5 }, bgcolor: "#0b0b0b", color: "#fff" }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "center" }} spacing={1.5} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>{title}</Typography>
          <Typography variant="body2" sx={{ color: "#c8c8c8", mt: 0.5 }}>
            Phase 2 only: COEF has already verified custody and recorded the school-bank submission. Central Administration now checks the bank credit before a final receipt is posted.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          {isMonthly && <TextField size="small" label="COEF bank-submission date" type="date" value={settlementDate} onChange={(event) => setSettlementDate(event.target.value)} InputLabelProps={{ shrink: true }} sx={darkFieldSx} />}
          <Button variant="outlined" startIcon={<Refresh />} onClick={loadRecords} disabled={loading} sx={{ color: "#75e59d", borderColor: "#3f7751", textTransform: "none" }}>Refresh</Button>
        </Stack>
      </Stack>

      {message && <Alert severity={message.severity} sx={{ mb: 2 }} onClose={() => setMessage(null)}>{message.text}</Alert>}
      <Alert severity="warning" sx={{ mb: 2 }}>
        A COEF bank-submission reference proves only that the school submitted funds. Enter the independently verified bank-credit reference below before confirming. This action writes the final receipt and cannot be used by Faculty users.
      </Alert>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ mb: 2 }}>
        <Paper variant="outlined" sx={{ flex: 1, p: 1.5, bgcolor: "#121212", borderColor: "#d4a32e", color: "#fff" }}>
          <Typography variant="caption" sx={{ color: "#ffd572" }}>Awaiting bank-credit confirmation</Typography>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>{data?.summary?.bankSubmittedCount || 0} records</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ flex: 1, p: 1.5, bgcolor: "#121212", borderColor: "#4b9d68", color: "#fff" }}>
          <Typography variant="caption" sx={{ color: "#8deab0" }}>Controlled settlement value</Typography>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>{money.format(data?.summary?.bankSubmittedAmount || 0)}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ flex: 1, p: 1.5, bgcolor: "#121212", borderColor: "#338ccc", color: "#fff" }}>
          <Typography variant="caption" sx={{ color: "#8ecbff" }}>COEF bank references</Typography>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>{data?.summary?.distinctBankReferences || 0}</Typography>
        </Paper>
      </Stack>

      <Paper variant="outlined" sx={{ overflow: "auto", bgcolor: "#121212", borderColor: "#343434" }}>
        <Table size="small" sx={{ minWidth: 1500 }}>
          <TableHead><TableRow>
            <TableCell>Student / fee</TableCell><TableCell>Institution scope</TableCell><TableCell>Custody chain</TableCell><TableCell>COEF bank submission</TableCell><TableCell>Central confirmation</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {loading && <TableRow><TableCell colSpan={5}><Stack alignItems="center" sx={{ py: 4 }}><CircularProgress /></Stack></TableCell></TableRow>}
            {!loading && !(data?.collections || []).length && <TableRow><TableCell colSpan={5} sx={{ color: "#bdbdbd !important", py: 4, textAlign: "center" }}>No COEF bank-submitted {isMonthly ? "monthly-fee records for this settlement date" : "admission-fee records"} are awaiting Central Administration.</TableCell></TableRow>}
            {(data?.collections || []).map((collection) => {
              const schoolClass = collection.schoolClass;
              const feeDescription = isMonthly
                ? `Monthly fee - ${collection.monthlyFee?.month}/${collection.monthlyFee?.year}`
                : `${String(collection.admission?.admissionType || collection.paymentKind).replaceAll("_", " ")} - ${collection.admission?.finalAdmissionNumber || "Admission pending number"}`;
              return <TableRow key={collection.id} hover>
                <TableCell>
                  <Typography sx={{ fontWeight: 800 }}>{collection.studentName}</Typography>
                  <Typography variant="caption" sx={{ color: "#75e59d" }}>Student UID #{collection.student?.id || "-"} · {collection.student?.admissionNumber || "Admission number pending"}</Typography><br />
                  <Chip size="small" label={`${feeDescription} · ${money.format(collection.amount)}`} sx={{ mt: 0.5, bgcolor: "#253b58", color: "#e2efff" }} />
                </TableCell>
                <TableCell>
                  <Typography>{schoolClass?.branch?.school?.name || "School"}</Typography>
                  <Typography variant="caption" sx={{ color: "#bdbdbd" }}>{schoolClass?.branch?.name || `Branch #${collection.branchId}`} · {schoolClass ? `${schoolClass.name}-${schoolClass.section}` : `Class #${collection.classId}`} · AY {schoolClass?.academicYear || "-"}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">Collector: {userName(collection.collector, "Unknown")}</Typography>
                  <Typography variant="body2">Handed over: {userName(collection.handedOverBy, "Not recorded")}</Typography>
                  <Typography variant="body2">COEF verified: {userName(collection.verifier, "Not recorded")}</Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ color: "#ffd572", fontWeight: 700 }}>{collection.bankTransactionId || "Missing reference"}</Typography>
                  <Typography variant="caption" sx={{ color: "#bdbdbd" }}>Submitted by {userName(collection.bankSubmittedBy, "COEF")}<br />{dateTime(collection.bankSubmittedAt)}</Typography>
                  {collection.bankSubmissionNote && <Typography variant="caption" display="block" sx={{ color: "#bdbdbd", mt: 0.5 }}>{collection.bankSubmissionNote}</Typography>}
                </TableCell>
                <TableCell sx={{ minWidth: 330 }}>
                  <Stack spacing={1}>
                    <TextField size="small" required label="Bank-credit confirmation reference" value={creditReference[collection.id] || ""} onChange={(event) => setCreditReference((current) => ({ ...current, [collection.id]: event.target.value }))} inputProps={{ maxLength: 100 }} sx={darkFieldSx} />
                    <TextField size="small" label="Bank-credit date" type="date" value={creditDate[collection.id] || settlementDate || today()} onChange={(event) => setCreditDate((current) => ({ ...current, [collection.id]: event.target.value }))} InputLabelProps={{ shrink: true }} sx={darkFieldSx} />
                    <TextField size="small" label="Confirmation note (optional)" value={creditNote[collection.id] || ""} onChange={(event) => setCreditNote((current) => ({ ...current, [collection.id]: event.target.value }))} inputProps={{ maxLength: 300 }} sx={darkFieldSx} />
                    <Button variant="contained" startIcon={<CheckCircle />} disabled={submittingId === collection.id} onClick={() => confirmBankCredit(collection)} sx={{ bgcolor: "#208c4c", "&:hover": { bgcolor: "#16733d" }, textTransform: "none" }}>Confirm bank credit and issue final receipt</Button>
                  </Stack>
                </TableCell>
              </TableRow>;
            })}
          </TableBody>
        </Table>
      </Paper>
      <Divider sx={{ borderColor: "#333", my: 2 }} />
      <Stack direction="row" spacing={1} alignItems="center"><AccountBalance sx={{ color: "#75e59d" }} /><Typography variant="caption" sx={{ color: "#bdbdbd" }}>Separate central modules prevent admission-fee receipts from being mixed with the daily monthly-fee settlement register.</Typography></Stack>
    </Box>
  );
}
