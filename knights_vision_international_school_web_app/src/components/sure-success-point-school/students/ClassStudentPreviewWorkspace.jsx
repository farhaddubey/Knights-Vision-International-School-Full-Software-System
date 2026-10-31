"use client";

// This is intentionally an extension of the established attendance register:
// the attendance buttons, History and Report actions remain familiar, while
// guardian contact is available to the Principal and GCI without exposing any
// government ID or account credential.
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Pagination,
  PaginationItem,
  TextField,
  Typography,
} from "@mui/material";
import { ChevronLeft, ChevronRight, EmojiPeople, SafetyCheck, Search as SearchIcon } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import AttendanceHistoryDialog from "@/src/app/knights-faculties-panel/sure-success-point-school-management-panel/components/dialogs/AttendanceHistoryDialog";
import AttendanceReportDialog from "@/src/app/knights-faculties-panel/sure-success-point-school-management-panel/components/dialogs/AttendanceReportDialog";

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 30;

function studentName(student) {
  return [student?.firstName, student?.middleName, student?.lastName].filter(Boolean).join(" ") || "Unnamed student";
}

async function requestJson(path, options) {
  const response = await fetch(path, { credentials: "same-origin", ...options });
  const raw = await response.text();
  let body = {};
  try { body = raw ? JSON.parse(raw) : {}; } catch { throw new Error("The server returned an unexpected response."); }
  if (!response.ok) throw new Error(body.error || body.message || "Unable to load the attendance register.");
  return body;
}

export default function ClassStudentPreviewWorkspace({ className, authorization }) {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const currentAcademicYear = new Date().getFullYear();
  const canManageAttendance = (authorization?.permissions || []).includes("*") || (authorization?.permissions || []).includes("attendance.manage");
  const classOptions = useMemo(() => classes.filter((item) => item.name === className), [classes, className]);
  const selectedClass = useMemo(() => classOptions.find((item) => String(item.id) === String(selectedClassId)) || null, [classOptions, selectedClassId]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    requestJson(`/api/student-lifecycle/catalog?className=${encodeURIComponent(className)}`)
      .then((payload) => { if (active) setClasses(payload.classes || []); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [className]);

  useEffect(() => {
    if (!classOptions.length) {
      setSelectedClassId("");
      return;
    }
    const actorSchoolId = authorization?.user?.schoolId;
    const actorBranchId = authorization?.user?.branchId;
    const preferred = classOptions.find((item) => item.academicYear === currentAcademicYear && (!actorSchoolId || item.schoolId === actorSchoolId) && (!actorBranchId || item.branchId === actorBranchId))
      || classOptions.find((item) => item.academicYear === currentAcademicYear)
      || classOptions.find((item) => (!actorSchoolId || item.schoolId === actorSchoolId) && (!actorBranchId || item.branchId === actorBranchId))
      || classOptions[0];
    setSelectedClassId((current) => {
      const existing = classOptions.find((item) => String(item.id) === String(current));
      return existing?.academicYear === currentAcademicYear ? current : String(preferred.id);
    });
  }, [authorization?.user?.branchId, authorization?.user?.schoolId, classOptions, currentAcademicYear]);

  const loadAttendance = useCallback(async () => {
    if (!selectedClassId) {
      setStudents([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ classId: String(selectedClassId), page: String(page), pageSize: String(pageSize) });
      const payload = await requestJson(`/api-schools-panel/attendance/${encodeURIComponent(className)}?${params.toString()}`);
      setStudents(payload.students || []);
      setTotalPages(Math.max(1, payload.totalPages || 1));
    } catch (requestError) {
      setError(requestError.message);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [className, page, selectedClassId]);

  useEffect(() => { loadAttendance(); }, [loadAttendance]);

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) => [studentName(student), student.rollNumber, student.guardianName, student.guardianContact, student.id]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query)));
  }, [searchQuery, students]);

  const handleStatusChange = async (student, status) => {
    if (!canManageAttendance || !selectedClassId) return;
    try {
      const payload = await requestJson(`/api-schools-panel/attendance/${encodeURIComponent(className)}/${student.id}?classId=${encodeURIComponent(selectedClassId)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status, date: new Date().toISOString().slice(0, 10) }),
      });
      setStudents((current) => current.map((entry) => entry.id === student.id ? { ...entry, status: payload.attendance.status } : entry));
      toast.success(`Attendance updated to ${status} for student ID ${student.id}`);
    } catch (requestError) {
      toast.error(requestError.message || "Failed to update attendance.");
    }
  };

  const handlePageChange = (_event, nextPage) => setPage(nextPage);
  const openHistory = (student) => { setSelectedStudent(student); setHistoryDialogOpen(true); };
  const openReport = (student) => { setSelectedStudent(student); setReportDialogOpen(true); };
  const closeDialogs = () => { setHistoryDialogOpen(false); setReportDialogOpen(false); setSelectedStudent(null); };

  const scopeLabel = selectedClass
    ? `${selectedClass.branch?.school?.name || "School"} / ${selectedClass.branch?.name || "Branch"} / ${selectedClass.name}-${selectedClass.section} / Academic year ${selectedClass.academicYear}`
    : "Loading assigned school, branch, and current academic year";

  if (loading && !selectedClassId) {
    return <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}><CircularProgress size={120} /></Box>;
  }

  return (
    <Box sx={{ position: "fixed", minWidth: `calc(100vw - ${drawerWidth}px)`, backgroundColor: "#212121", height: `calc(100vh - ${appBarHeight}px)`, color: "#fff", overflowX: "auto" }}>
      <ToastContainer position="bottom-center" autoClose={3000} theme="dark" />
      <ListItemButton sx={{ backgroundColor: "#b71c1c", color: "#fff", "&:hover": { backgroundColor: "#b71c1c" }, display: "flex", alignItems: "center", gap: 2, padding: "4px 16px", borderRadius: 1 }}>
        <ListItemIcon sx={{ color: "#fff" }}><EmojiPeople /></ListItemIcon>
        <ListItemText primary={`${className} Attendance & Guardian Contact`} secondary={scopeLabel} secondaryTypographyProps={{ sx: { color: "#d7d7d7", fontSize: 12 } }} />
        <TextField
          variant="outlined"
          placeholder="Search students or guardian..."
          size="small"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ color: "#fff", mr: 1 }} />, style: { color: "#fff", backgroundColor: "#333", borderRadius: 4 } }}
          sx={{ width: 320, "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#fff" }, "&:hover fieldset": { borderColor: "#fff" }, "&.Mui-focused fieldset": { borderColor: "#00c853" } } }}
        />
      </ListItemButton>
      {error && <Alert severity="error" sx={{ m: 1 }} onClose={() => setError("")}>{error}</Alert>}
      {!canManageAttendance && <Alert severity="info" sx={{ m: 1 }}>Your role can view this current-year attendance register and guardian contacts, but cannot change attendance.</Alert>}

      <Box sx={{ bgcolor: "#181818", borderRadius: 2, minWidth: 1280 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, p: 1, bgcolor: "#333", borderRadius: 1, position: "sticky", top: 0, zIndex: 10 }}>
          <Typography variant="body2" sx={{ flex: 0.35, fontWeight: "bold", color: "#fff" }}>ID</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Name</Typography>
          <Typography variant="body2" sx={{ flex: 0.55, fontWeight: "bold", color: "#fff" }}>Roll No.</Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>Parent / Guardian</Typography>
          <Typography variant="body2" sx={{ flex: 0.85, fontWeight: "bold", color: "#fff" }}>Guardian Contact</Typography>
          <Typography variant="body2" sx={{ flex: 1.2, fontWeight: "bold", color: "#fff" }}>Status</Typography>
          <Typography variant="body2" sx={{ flex: 0.8, fontWeight: "bold", color: "#fff" }}>Actions</Typography>
        </Box>
        <Box sx={{ overflowY: "auto", bgcolor: "#121212", borderRadius: 1, maxHeight: "80vh" }}>
          {loading ? <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}><CircularProgress /></Box> : <List>
            {filteredStudents.length ? filteredStudents.map((student) => (
              <ListItem key={student.id} sx={{ display: "flex", justifyContent: "space-between", gap: 1, p: 1, bgcolor: "#181818", mb: 1, borderRadius: 1, borderBottom: "2px solid #333" }}>
                <Typography variant="body2" sx={{ flex: 0.35, color: "#75e59d", fontWeight: 800 }}>{student.id}</Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>{studentName(student)}</Typography>
                <Typography variant="body2" sx={{ flex: 0.55, color: "#fff" }}>{student.rollNumber}</Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>{student.guardianName}{student.guardianRelation ? ` (${student.guardianRelation})` : ""}</Typography>
                <Typography variant="body2" sx={{ flex: 0.85, color: "#75e59d", fontWeight: 700 }}>{student.guardianContact}</Typography>
                <Box sx={{ flex: 1.2, display: "flex", gap: 1 }}>
                  {[['PRESENT', 'Present', 'success'], ['ABSENT', 'Absent', 'error'], ['HOLIDAY', 'Holiday', 'warning'], ['WEEKLY_HOLIDAY', 'Sunday', 'info']].map(([status, label, color]) => <Button key={status} variant={student.status === status ? "contained" : "outlined"} color={color} disabled={!canManageAttendance} onClick={() => handleStatusChange(student, status)} sx={{ minWidth: 80 }}>{label}</Button>)}
                </Box>
                <Box sx={{ flex: 0.8, display: "flex", gap: 1 }}>
                  <Button variant="outlined" color="secondary" onClick={() => openHistory(student)} sx={{ color: "#ffeb3b" }}>History</Button>
                  <Button variant="outlined" color="warning" onClick={() => openReport(student)}><SafetyCheck /> Report</Button>
                </Box>
              </ListItem>
            )) : <Typography sx={{ color: "#fff", textAlign: "center", p: 2 }}>No active students found for this assigned current-year class-section.</Typography>}
          </List>}
        </Box>
      </Box>
      {totalPages > 1 && <Box sx={{ position: "fixed", bottom: 16, left: "60%", transform: "translateX(-50%)", zIndex: 1300, display: "flex", justifyContent: "center", p: 1, bgcolor: "#181818", borderRadius: 2, boxShadow: 4 }}><Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" sx={{ "& .MuiPaginationItem-root": { color: "#fff", "&:hover": { bgcolor: "#333" }, "&.Mui-selected": { bgcolor: "#00c853", color: "#000", "&:hover": { bgcolor: "#00c853" } } } }} renderItem={(item) => <PaginationItem components={{ previous: ChevronLeft, next: ChevronRight }} {...item} />} /></Box>}
      <AttendanceHistoryDialog open={historyDialogOpen} onClose={closeDialogs} studentId={selectedStudent?.id} studentName={studentName(selectedStudent)} className={className} classId={selectedClassId} />
      <AttendanceReportDialog open={reportDialogOpen} onClose={closeDialogs} studentId={selectedStudent?.id} studentName={studentName(selectedStudent)} className={className} classId={selectedClassId} />
    </Box>
  );
}
