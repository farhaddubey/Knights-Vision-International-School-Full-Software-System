"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  Close,
  EmojiPeople,
  Notes,
  Person,
  Search as SearchIcon,
} from "@mui/icons-material";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
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
const darkSelectSx = {
  color: "#fff",
  backgroundColor: "#242424",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#666" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#fff" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#00c853" },
  "& .MuiSvgIcon-root": { color: "#fff" },
};

function noteColor(priority) {
  if (priority === "URGENT") return "error";
  if (priority === "HIGH") return "warning";
  return "info";
}

function feeOutstanding(fee) {
  return Math.max(0, (fee.totalDue + (fee.fineAmount || 0)) - fee.paidAmount - (fee.waivedAmount || 0));
}

function DetailTile({ label, value }) {
  return (
    <Box sx={{ p: 1.1, borderRadius: 1, backgroundColor: "#242424", minHeight: 62 }}>
      <Typography variant="caption" sx={{ color: "#aaa", display: "block", mb: 0.25 }}>{label}</Typography>
      <Typography variant="body2" sx={{ color: "#fff", overflowWrap: "anywhere" }}>{value || "—"}</Typography>
    </Box>
  );
}

function DarkSelect({ children, ...props }) {
  return <Select MenuProps={{ PaperProps: { sx: { bgcolor: "#242424", color: "#fff" } } }} sx={darkSelectSx} {...props}>{children}</Select>;
}

export default function GuardianStudentCareWorkspace({ className }) {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [record, setRecord] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tab, setTab] = useState("overview");
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingRecord, setLoadingRecord] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [interaction, setInteraction] = useState({ communicationType: "GENERAL", method: "PHONE", summary: "", details: "" });
  const [specialNote, setSpecialNote] = useState({ note: "", priority: "NORMAL" });

  const classPath = useMemo(() => encodeURIComponent(String(className).toLowerCase()), [className]);
  const visibleStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) => [student.name, student.admissionNumber, student.guardianName, student.guardianContact]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query)));
  }, [searchQuery, students]);

  const loadStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      const response = await fetch(`/api/guardian-care/${classPath}`, { credentials: "same-origin" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to load class students.");
      setStudents(payload.students || []);
    } catch (error) {
      setMessage({ severity: "error", text: error.message || "Unable to load class students." });
    } finally {
      setLoadingStudents(false);
    }
  }, [classPath]);

  const loadRecord = useCallback(async () => {
    if (!selectedStudentId) return;
    setLoadingRecord(true);
    try {
      const response = await fetch(`/api/guardian-care/${classPath}?studentId=${encodeURIComponent(selectedStudentId)}`, { credentials: "same-origin" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to load the GCI record.");
      setRecord(payload);
    } catch (error) {
      setMessage({ severity: "error", text: error.message || "Unable to load the GCI record." });
    } finally {
      setLoadingRecord(false);
    }
  }, [classPath, selectedStudentId]);

  useEffect(() => { loadStudents(); }, [loadStudents]);
  useEffect(() => {
    if (dialogOpen) loadRecord();
  }, [dialogOpen, loadRecord]);

  const openGciNotes = (studentId) => {
    setMessage(null);
    setRecord(null);
    setSelectedStudentId(String(studentId));
    setTab("overview");
    setDialogOpen(true);
  };

  const save = async (body, success) => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/guardian-care/${classPath}`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ studentId: Number(selectedStudentId), ...body }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to save GCI information.");
      setMessage({ severity: "success", text: success });
      await loadRecord();
      return true;
    } catch (error) {
      setMessage({ severity: "error", text: error.message || "Unable to save GCI information." });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const recordInteraction = async () => {
    if (!interaction.summary.trim()) {
      setMessage({ severity: "error", text: "Write a concise interaction summary." });
      return;
    }
    const saved = await save({ action: "INTERACTION", ...interaction }, "Guardian interaction recorded in the unified timeline.");
    if (saved) setInteraction({ communicationType: "GENERAL", method: "PHONE", summary: "", details: "" });
  };

  const addSpecialNote = async () => {
    if (!specialNote.note.trim()) {
      setMessage({ severity: "error", text: "Write the special guardian note before saving it." });
      return;
    }
    const saved = await save({ action: "SPECIAL_NOTE", ...specialNote }, "Special guardian note saved for this student.");
    if (saved) setSpecialNote({ note: "", priority: "NORMAL" });
  };

  const resolveSpecialNote = async (noteId) => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/guardian-care/${classPath}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "RESOLVE_SPECIAL_NOTE", noteId }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to resolve special guardian note.");
      setMessage({ severity: "success", text: "Special guardian note marked resolved." });
      await loadRecord();
    } catch (error) {
      setMessage({ severity: "error", text: error.message || "Unable to resolve special guardian note." });
    } finally {
      setSaving(false);
    }
  };

  const student = record?.student;
  const timeline = record?.timeline || [];
  const specialNotes = record?.specialNotes || [];
  const behaviourLogs = record?.behaviourLogs || [];
  const monthlyFees = record?.monthlyFees || [];

  return (
    <Box sx={{ position: "fixed", minWidth: "calc(100vw - 280px)", minHeight: "calc(100vh - 64px)", bgcolor: "#212121", color: "#fff", overflow: "auto" }}>
      <Box sx={{ backgroundColor: "#b71c1c", display: "flex", alignItems: "center", gap: 2, px: 2, py: 1.1, flexWrap: "wrap" }}>
        <EmojiPeople />
        <Box sx={{ flex: 1, minWidth: 190 }}>
          <Typography variant="subtitle1" fontWeight={700}>GCI Department — Class {className}</Typography>
          <Typography variant="caption" sx={{ color: "#ffe5e5" }}>Guardian information, care notes and fee follow-up</Typography>
        </Box>
        <TextField
          variant="outlined"
          placeholder="Search student or guardian..."
          size="small"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ color: "#fff", mr: 1 }} /> }}
          sx={{ width: { xs: "100%", sm: 310 }, ...darkInputSx }}
        />
      </Box>

      <Box sx={{ p: 2, maxWidth: 1500, mx: "auto" }}>
        {message && !dialogOpen && <Alert severity={message.severity} sx={{ mb: 2 }} onClose={() => setMessage(null)}>{message.text}</Alert>}
        {loadingStudents && <Typography sx={{ p: 3, textAlign: "center", color: "#c7c7c7" }}>Loading class students…</Typography>}
        {!loadingStudents && visibleStudents.length === 0 && <Typography sx={{ p: 3, textAlign: "center", color: "#c7c7c7" }}>No students match this search in Class {className}.</Typography>}

        <Grid container spacing={2}>
          {visibleStudents.map((item) => (
            <Grid item xs={12} md={6} key={item.id}>
              <Card sx={{ height: "100%", bgcolor: "#181818", color: "#fff", border: "1px solid #3b3b3b", boxShadow: "none", transition: "border-color 160ms ease", "&:hover": { borderColor: "#00c853" } }}>
                <CardContent>
                  <Stack direction="row" spacing={1.25} alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1.5 }}>
                    <Stack direction="row" spacing={1.25} alignItems="center" minWidth={0}>
                      <Box sx={{ display: "grid", placeItems: "center", width: 38, height: 38, borderRadius: "50%", bgcolor: "#333", color: "#00c853", flex: "0 0 auto" }}><Person /></Box>
                      <Box minWidth={0}><Typography fontWeight={700} noWrap>{item.name}</Typography><Typography variant="caption" sx={{ color: "#bdbdbd" }}>Admission no.: {item.admissionNumber || "—"}</Typography></Box>
                    </Stack>
                    <Chip label={`ID ${item.id}`} size="small" sx={{ color: "#d7d7d7", bgcolor: "#303030" }} />
                  </Stack>
                  <Grid container spacing={1} sx={{ mb: 1.75 }}>
                    <Grid item xs={12} sm={6}><DetailTile label="Guardian" value={item.guardianName} /></Grid>
                    <Grid item xs={12} sm={6}><DetailTile label="Contact" value={item.guardianContact} /></Grid>
                    <Grid item xs={12} sm={6}><DetailTile label="Relation" value={item.guardianRelation} /></Grid>
                    <Grid item xs={12} sm={6}><DetailTile label="Father / Mother" value={[item.fatherName, item.motherName].filter(Boolean).join(" / ")} /></Grid>
                  </Grid>
                  <Button fullWidth variant="contained" startIcon={<Notes />} onClick={() => openGciNotes(item.id)} sx={{ bgcolor: "#00a844", color: "#051c0e", fontWeight: 700, "&:hover": { bgcolor: "#00c853" } }}>Open GCI Notes</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        fullWidth
        maxWidth="lg"
        PaperProps={{ sx: { bgcolor: "#181818", color: "#fff", border: "1px solid #444", minHeight: "72vh" } }}
      >
        <DialogTitle sx={{ bgcolor: "#b71c1c", display: "flex", alignItems: "center", gap: 1.25, pr: 1 }}>
          <Notes />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontWeight={700} noWrap>GCI Notes — {student?.name || "Loading student…"}</Typography>
            {student?.admissionNumber && <Typography variant="caption" sx={{ color: "#ffe5e5" }}>Admission no.: {student.admissionNumber}</Typography>}
          </Box>
          <IconButton aria-label="Close GCI notes" onClick={() => setDialogOpen(false)} disabled={saving} sx={{ color: "#fff" }}><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2, borderColor: "#444", bgcolor: "#181818" }}>
          {message && <Alert severity={message.severity} sx={{ mb: 2 }} onClose={() => setMessage(null)}>{message.text}</Alert>}
          {loadingRecord && <Typography sx={{ py: 6, textAlign: "center", color: "#c7c7c7" }}>Loading GCI notes…</Typography>}
          {!loadingRecord && student && <>
            <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2, borderBottom: "1px solid #444", "& .MuiTab-root": { color: "#c7c7c7" }, "& .Mui-selected": { color: "#00c853 !important" }, "& .MuiTabs-indicator": { backgroundColor: "#00c853" } }}>
              <Tab value="overview" label="Student & Guardian" />
              <Tab value="timeline" label="Care Timeline" />
              <Tab value="notes" label="Special Notes" />
              <Tab value="wellbeing" label="Wellbeing & Fees" />
            </Tabs>

            {tab === "overview" && <Grid container spacing={2}>
              <Grid item xs={12} md={6}><Paper sx={{ p: 2, bgcolor: "#202020", color: "#fff", border: "1px solid #3e3e3e" }}><Typography variant="h6" sx={{ mb: 1.5 }}>Student & Guardian</Typography><Grid container spacing={1}><Grid item xs={12} sm={6}><DetailTile label="Student" value={student.name} /></Grid><Grid item xs={12} sm={6}><DetailTile label="Admission no." value={student.admissionNumber} /></Grid><Grid item xs={12} sm={6}><DetailTile label="Guardian" value={student.guardianName} /></Grid><Grid item xs={12} sm={6}><DetailTile label="Relation" value={student.guardianRelation} /></Grid><Grid item xs={12}><DetailTile label="Guardian contact" value={student.guardianContact} /></Grid><Grid item xs={12}><DetailTile label="Guardian address" value={student.guardianAddress} /></Grid></Grid></Paper></Grid>
              <Grid item xs={12} md={6}><Paper sx={{ p: 2, bgcolor: "#202020", color: "#fff", border: "1px solid #3e3e3e" }}><Typography variant="h6" sx={{ mb: 1.5 }}>Family Contacts</Typography><Grid container spacing={1}><Grid item xs={12} sm={6}><DetailTile label="Father" value={student.fatherName} /></Grid><Grid item xs={12} sm={6}><DetailTile label="Father contact" value={student.fatherContact} /></Grid><Grid item xs={12} sm={6}><DetailTile label="Mother" value={student.motherName} /></Grid><Grid item xs={12} sm={6}><DetailTile label="Mother contact" value={student.motherContact} /></Grid><Grid item xs={12}><DetailTile label="Open special notes" value={specialNotes.filter((note) => !note.isResolved).length} /></Grid></Grid></Paper></Grid>
            </Grid>}

            {tab === "timeline" && <Grid container spacing={2}>
              <Grid item xs={12} md={5}><Paper sx={{ p: 2, bgcolor: "#202020", color: "#fff", border: "1px solid #3e3e3e" }}><Typography variant="h6" sx={{ mb: 2 }}>Record Guardian Interaction</Typography><Stack spacing={2}><FormControl fullWidth><InputLabel id="interaction-type">Interaction type</InputLabel><DarkSelect labelId="interaction-type" label="Interaction type" value={interaction.communicationType} onChange={(event) => setInteraction((current) => ({ ...current, communicationType: event.target.value }))}><MenuItem value="GENERAL">General</MenuItem><MenuItem value="ALERT">Alert</MenuItem><MenuItem value="CALL">Call</MenuItem><MenuItem value="SMS">SMS</MenuItem><MenuItem value="EMAIL">Email</MenuItem><MenuItem value="MEETING">Guardian meeting</MenuItem></DarkSelect></FormControl><FormControl fullWidth><InputLabel id="interaction-method">Contact method</InputLabel><DarkSelect labelId="interaction-method" label="Contact method" value={interaction.method} onChange={(event) => setInteraction((current) => ({ ...current, method: event.target.value }))}><MenuItem value="PHONE">Phone</MenuItem><MenuItem value="SMS">SMS</MenuItem><MenuItem value="WHATSAPP">WhatsApp</MenuItem><MenuItem value="EMAIL">Email</MenuItem><MenuItem value="IN_PERSON">In person</MenuItem></DarkSelect></FormControl><TextField label="Summary" value={interaction.summary} onChange={(event) => setInteraction((current) => ({ ...current, summary: event.target.value }))} inputProps={{ maxLength: 200 }} required fullWidth sx={darkInputSx} /><TextField label="Details / agreed follow-up" value={interaction.details} onChange={(event) => setInteraction((current) => ({ ...current, details: event.target.value }))} inputProps={{ maxLength: 2000 }} multiline minRows={4} fullWidth sx={darkInputSx} /><Button variant="contained" disabled={saving} onClick={recordInteraction} sx={{ bgcolor: "#00a844", color: "#051c0e", fontWeight: 700, "&:hover": { bgcolor: "#00c853" } }}>Save Interaction</Button></Stack></Paper></Grid>
              <Grid item xs={12} md={7}><Paper sx={{ p: 2, bgcolor: "#202020", color: "#fff", border: "1px solid #3e3e3e", height: "100%" }}><Typography variant="h6" sx={{ mb: 2 }}>Unified Timeline</Typography><Stack spacing={1.25}>{timeline.length === 0 && <Typography color="#bdbdbd">No guardian communication, call, or PTM history yet.</Typography>}{timeline.map((entry) => <Card sx={{ bgcolor: "#272727", color: "#fff", border: "1px solid #3b3b3b", boxShadow: "none" }} key={entry.id}><CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}><Stack direction="row" justifyContent="space-between" spacing={1}><Chip label={entry.category} size="small" sx={{ color: "#fff", bgcolor: "#454545" }} /><Typography variant="caption" color="#bdbdbd">{new Date(entry.at).toLocaleString()}</Typography></Stack><Typography variant="body2" sx={{ mt: 1 }}>{entry.title}</Typography><Typography variant="caption" color="#bdbdbd">{entry.method}</Typography>{entry.detail && <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mt: 0.5, color: "#dedede" }}>{typeof entry.detail === "string" ? entry.detail : JSON.stringify(entry.detail)}</Typography>}</CardContent></Card>)}</Stack></Paper></Grid>
            </Grid>}

            {tab === "notes" && <Grid container spacing={2}>
              <Grid item xs={12} md={5}><Paper sx={{ p: 2, bgcolor: "#202020", color: "#fff", border: "1px solid #3e3e3e" }}><Typography variant="h6" sx={{ mb: 0.75 }}>Add Private Guardian Note</Typography><Typography variant="body2" color="#bdbdbd" sx={{ mb: 2 }}>For an important guardian instruction, sensitive follow-up, or risk which must not be buried in a normal call log.</Typography><Stack spacing={2}><FormControl fullWidth><InputLabel id="special-note-priority">Priority</InputLabel><DarkSelect labelId="special-note-priority" label="Priority" value={specialNote.priority} onChange={(event) => setSpecialNote((current) => ({ ...current, priority: event.target.value }))}><MenuItem value="NORMAL">Normal</MenuItem><MenuItem value="HIGH">High</MenuItem><MenuItem value="URGENT">Urgent</MenuItem></DarkSelect></FormControl><TextField label="Special guardian note" value={specialNote.note} onChange={(event) => setSpecialNote((current) => ({ ...current, note: event.target.value }))} inputProps={{ maxLength: 3000 }} multiline minRows={6} fullWidth sx={darkInputSx} /><Button variant="contained" disabled={saving} onClick={addSpecialNote} sx={{ bgcolor: "#00a844", color: "#051c0e", fontWeight: 700, "&:hover": { bgcolor: "#00c853" } }}>Save Special Note</Button></Stack></Paper></Grid>
              <Grid item xs={12} md={7}><Paper sx={{ p: 2, bgcolor: "#202020", color: "#fff", border: "1px solid #3e3e3e", height: "100%" }}><Typography variant="h6" sx={{ mb: 2 }}>Special Guardian Note History</Typography><Stack spacing={1.25}>{specialNotes.length === 0 && <Typography color="#bdbdbd">No special notes for this student.</Typography>}{specialNotes.map((note) => <Card sx={{ bgcolor: "#272727", color: "#fff", border: "1px solid #3b3b3b", boxShadow: "none" }} key={note.id}><CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}><Stack direction="row" justifyContent="space-between" spacing={1}><Chip label={note.isResolved ? "RESOLVED" : note.priority} size="small" color={note.isResolved ? "success" : noteColor(note.priority)} /><Typography variant="caption" color="#bdbdbd">{new Date(note.createdAt).toLocaleString()}</Typography></Stack><Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mt: 1 }}>{note.note}</Typography><Typography variant="caption" color="#bdbdbd">By {note.createdBy?.username || note.createdBy?.email || "System"}</Typography>{!note.isResolved && <Button size="small" sx={{ mt: 1, color: "#69f0ae" }} disabled={saving} onClick={() => resolveSpecialNote(note.id)}>Mark Resolved</Button>}</CardContent></Card>)}</Stack></Paper></Grid>
            </Grid>}

            {tab === "wellbeing" && <Grid container spacing={2}>
              <Grid item xs={12} md={6}><Paper sx={{ p: 2, bgcolor: "#202020", color: "#fff", border: "1px solid #3e3e3e", height: "100%" }}><Typography variant="h6" sx={{ mb: 2 }}>Behaviour & Wellbeing</Typography><Stack spacing={1}>{behaviourLogs.length === 0 && <Typography color="#bdbdbd">No behaviour records for this student.</Typography>}{behaviourLogs.map((log) => <Card sx={{ bgcolor: "#272727", color: "#fff", border: "1px solid #3b3b3b", boxShadow: "none" }} key={log.id}><CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}><Typography variant="body2">{log.category} · {log.type}</Typography><Typography variant="caption" color="#bdbdbd">Severity {log.severityLevel} · {new Date(log.incidentDate).toLocaleDateString()} · {log.isResolved ? "Resolved" : "Open"}</Typography>{log.description && <Typography variant="body2" sx={{ mt: 0.5, color: "#dedede" }}>{log.description}</Typography>}</CardContent></Card>)}</Stack></Paper></Grid>
              <Grid item xs={12} md={6}><Paper sx={{ p: 2, bgcolor: "#202020", color: "#fff", border: "1px solid #3e3e3e", height: "100%", overflowX: "auto" }}><Typography variant="h6" sx={{ mb: 2 }}>Fee Follow-up Visibility</Typography><Table size="small" sx={{ "& .MuiTableCell-root": { color: "#e4e4e4", borderColor: "#444" } }}><TableHead><TableRow><TableCell>Month</TableCell><TableCell>Status</TableCell><TableCell>Due / balance</TableCell></TableRow></TableHead><TableBody>{monthlyFees.length === 0 && <TableRow><TableCell colSpan={3}>No fee records available.</TableCell></TableRow>}{monthlyFees.map((fee) => <TableRow key={fee.id}><TableCell>{fee.month}/{fee.year}</TableCell><TableCell><Chip size="small" label={fee.status} color={fee.status === "PAID" ? "success" : fee.status === "UNPAID" ? "warning" : "default"} /></TableCell><TableCell>{money.format(fee.totalDue)} / {money.format(feeOutstanding(fee))}</TableCell></TableRow>)}</TableBody></Table></Paper></Grid>
            </Grid>}
          </>}
        </DialogContent>
        <DialogActions sx={{ bgcolor: "#202020", px: 2, py: 1.25 }}><Button onClick={() => setDialogOpen(false)} disabled={saving} sx={{ color: "#fff", borderColor: "#777" }} variant="outlined">Close</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
