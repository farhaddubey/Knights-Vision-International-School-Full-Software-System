"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Alert, Box, Button, Chip, CircularProgress, FormControl, InputLabel,
  MenuItem, Pagination, PaginationItem, Select, TextField, Typography,
} from "@mui/material";
import { Search as SearchIcon, ChevronLeft, ChevronRight, SafetyCheck, School, Apartment } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AttendanceHistoryDialog from "./dialogs/AttendanceHistoryDialog";
import AttendanceReportDialog from "./dialogs/AttendanceReportDialog";

const PAGE_SIZE = 100;
const ALL_BRANCHES = "ALL";
const fieldSx = {
  minWidth: 230,
  "& .MuiInputLabel-root": { color: "#fff" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#fff" },
  "& .MuiOutlinedInput-root": { color: "#fff", bgcolor: "#303030" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#888" },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#fff" },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#00c853" },
  "& .MuiSvgIcon-root": { color: "#fff" },
};

export default function Attendance({ className }) {
  const [schools, setSchools] = useState([]);
  const [branches, setBranches] = useState([]);
  const [schoolId, setSchoolId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState("");
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const requestCounter = useRef(0);

  // Same school and branch discovery endpoints used by your Prayer/Oath page.
  useEffect(() => {
    const controller = new AbortController();
    async function loadSchools() {
      try {
        setLoadingSchools(true);
        const token = Cookies.get("administration_token");
        if (!token) throw new Error("User not authenticated");
        const { data } = await axios.get("/api/get-info", {
          params: { type: "schools" },
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        setSchools(data.schools || []);
      } catch (err) {
        if (err.code !== "ERR_CANCELED") {
          setError(err.message || "Failed to fetch schools");
          toast.error("Failed to fetch schools");
        }
      } finally {
        if (!controller.signal.aborted) setLoadingSchools(false);
      }
    }
    loadSchools();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    setBranches([]);
    setBranchId("");
    setStudents([]);
    setPage(1);
    setTotalPages(1);
    setError("");
    if (!schoolId) return;
    const controller = new AbortController();
    async function loadBranches() {
      try {
        setLoadingBranches(true);
        const token = Cookies.get("administration_token");
        if (!token) throw new Error("User not authenticated");
        const { data } = await axios.get("/api/get-info", {
          params: { type: "branches", schoolId },
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        setBranches(data.branches || []);
      } catch (err) {
        if (err.code !== "ERR_CANCELED") {
          setError("Failed to fetch branches");
          toast.error("Failed to fetch branches");
        }
      } finally {
        if (!controller.signal.aborted) setLoadingBranches(false);
      }
    }
    loadBranches();
    return () => controller.abort();
  }, [schoolId]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => { setPage(1); }, [branchId, debouncedSearch, className]);

  // Fetch only after a branch or "All Branches" is explicitly selected.
  useEffect(() => {
    const requestId = ++requestCounter.current;
    setStudents([]);
    setTotalPages(1);
    setError("");
    if (!schoolId || !branchId || !className) {
      setLoadingStudents(false);
      return;
    }
    const controller = new AbortController();
    async function loadStudents() {
      try {
        setLoadingStudents(true);
        const token = Cookies.get("administration_token");
        if (!token) throw new Error("User not authenticated");
        const params = {
          schoolId,
          page,
          pageSize: PAGE_SIZE,
          searchQuery: debouncedSearch,
          ...(branchId !== ALL_BRANCHES ? { branchId } : {}),
        };
        const { data } = await axios.get(`/api/attendance/${encodeURIComponent(className)}`, {
          params,
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!Array.isArray(data?.students)) throw new Error("Invalid attendance response format");
        if (requestId !== requestCounter.current) return;
        setStudents(data.students);
        setTotalPages(Math.max(1, Number(data.totalPages) || 1));
      } catch (err) {
        if (err.code !== "ERR_CANCELED" && requestId === requestCounter.current) {
          setError(err.message || "Failed to fetch attendance");
          toast.error("Failed to fetch attendance");
        }
      } finally {
        if (requestId === requestCounter.current) setLoadingStudents(false);
      }
    }
    loadStudents();
    return () => controller.abort();
  }, [schoolId, branchId, className, page, debouncedSearch]);

  const selectedBranchName = useMemo(() => branchId === ALL_BRANCHES
    ? "All Branches"
    : branches.find(b => String(b.id) === String(branchId))?.name || "", [branches, branchId]);

  function openReview(student, type) {
    setSelectedStudent({ id: student.id, name: `${student.firstName || ""} ${student.lastName || ""}`.trim() });
    if (type === "history") setHistoryDialogOpen(true);
    else setReportDialogOpen(true);
  }
  function closeReviews() {
    setHistoryDialogOpen(false);
    setReportDialogOpen(false);
    setSelectedStudent(null);
  }

  const statusColors = {
    PRESENT: "success", ABSENT: "error", HOLIDAY: "warning", WEEKLY_HOLIDAY: "info",
  };

  return (
    <Box sx={{ position: "fixed", width: "calc(100vw - 280px)", height: "calc(100vh - 64px)", bgcolor: "#212121", color: "#fff", overflow: "auto", pb: 8 }}>
      <ToastContainer position="bottom-center" autoClose={3000} theme="dark" />
      <Box sx={{ bgcolor: "#b71c1c", px: 2, py: 1.5, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <SafetyCheck />
        <Typography sx={{ fontWeight: 700, flex: 1, minWidth: 220 }}>{className} Attendance — Review Only</Typography>
        <TextField size="small" placeholder="Search Students..." value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)} disabled={!branchId}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "#fff" }} /> }}
          sx={{ width: 290, ...fieldSx, "& input": { color: "#fff" }, "& input::placeholder": { color: "#fff", opacity: 1 } }} />
      </Box>

      <Box sx={{ p: 2, bgcolor: "#181818", display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
        <FormControl size="small" sx={fieldSx} disabled={loadingSchools}>
          <InputLabel shrink={Boolean(schoolId)} id="attendance-school-label">School</InputLabel>
          <Select labelId="attendance-school-label" value={schoolId} label="School" displayEmpty
            onChange={e => setSchoolId(e.target.value)}
            renderValue={value => value === "" ? <Typography sx={{ color: "#fff" }}>Select a school first</Typography>
              : schools.find(s => String(s.id) === String(value))?.name || "Selected School"}>
            <MenuItem value="" disabled sx={{ color: "#fff", bgcolor: "#333" }}>Select a school first</MenuItem>
            {schools.map(s => <MenuItem key={s.id} value={String(s.id)}>{s.name}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={fieldSx} disabled={!schoolId || loadingBranches}>
          <InputLabel shrink={Boolean(branchId)} id="attendance-branch-label">Branch</InputLabel>
          <Select labelId="attendance-branch-label" value={branchId} label="Branch" displayEmpty
            onChange={e => setBranchId(e.target.value)}
            renderValue={value => value === "" ? <Typography sx={{ color: "#fff" }}>Select a branch or all branches</Typography> : selectedBranchName}>
            <MenuItem value="" disabled sx={{ color: "#fff", bgcolor: "#333" }}>Select a branch or all branches</MenuItem>
            <MenuItem value={ALL_BRANCHES}>All Branches (Selected School)</MenuItem>
            {branches.map(b => <MenuItem key={b.id} value={String(b.id)}>{b.name} {b.code ? `(${b.code})` : ""}</MenuItem>)}
          </Select>
        </FormControl>
        {(loadingSchools || loadingBranches) && <CircularProgress size={22} sx={{ color: "#00c853" }} />}
        {branchId && <Chip label={`Scope: ${selectedBranchName}`} sx={{ color: "#fff", border: "1px solid #00c853" }} />}
        <Chip label="READ ONLY" color="info" variant="outlined" />
      </Box>

      {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}
      {!schoolId && <Typography sx={{ p: 3, textAlign: "center", color: "#fff" }}>Select a school to view its branches.</Typography>}
      {schoolId && !branchId && <Typography sx={{ p: 3, textAlign: "center", color: "#fff" }}>Select a branch or All Branches to review attendance.</Typography>}
      {branchId && (
        <Box sx={{ mx: 1, mt: 1, bgcolor: "#181818", borderRadius: 1, overflowX: "auto" }}>
          <Box sx={{ minWidth: 780 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 2fr 1.3fr 1.3fr 2fr", bgcolor: "#333", p: 1.5, fontWeight: 700, gap: 1 }}>
              <span>Roll No.</span><span>Name</span><span>Branch</span><span>Status</span><span>Review Actions</span>
            </Box>
            {loadingStudents ? <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}><CircularProgress sx={{ color: "#00c853" }} /></Box>
              : students.length === 0 ? <Typography sx={{ p: 3, textAlign: "center" }}>No attendance records found for this selection.</Typography>
              : students.map(student => (
                <Box key={student.id} sx={{ display: "grid", gridTemplateColumns: "1fr 2fr 1.3fr 1.3fr 2fr", alignItems: "center", gap: 1, bgcolor: "#181818", borderBottom: "2px solid #333", p: 1.5 }}>
                  <Box><Button size="small" variant="outlined" tabIndex={-1} sx={{ pointerEvents: "none" }}>{student.rollNumber || "N/A"}</Button></Box>
                  <Typography variant="body2">{`${student.firstName || ""} ${student.lastName || ""}`.trim()}</Typography>
                  <Typography variant="body2">{student.class?.branchName || selectedBranchName}</Typography>
                  <Box><Chip size="small" label={(student.status || "NOT RECORDED").replaceAll("_", " ")} color={statusColors[student.status] || "default"} variant="outlined" /></Box>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button size="small" variant="outlined" sx={{ color: "#ffeb3b", borderColor: "#ffeb3b" }} onClick={() => openReview(student, "history")}>History</Button>
                    <Button size="small" variant="outlined" color="warning" startIcon={<SafetyCheck />} onClick={() => openReview(student, "report")}>Report</Button>
                  </Box>
                </Box>
              ))}
          </Box>
        </Box>
      )}
      {branchId && totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 4 }}>
          <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)}
            renderItem={item => <PaginationItem {...item} components={{ previous: ChevronLeft, next: ChevronRight }} />}
            sx={{ "& .MuiPaginationItem-root": { color: "#fff" }, "& .Mui-selected": { bgcolor: "#00c853 !important", color: "#000 !important" } }} />
        </Box>
      )}
      <AttendanceHistoryDialog open={historyDialogOpen} onClose={closeReviews} studentId={selectedStudent?.id}
        studentName={selectedStudent?.name} className={className} schoolId={schoolId}
        branchId={branchId === ALL_BRANCHES ? undefined : branchId} />
      <AttendanceReportDialog open={reportDialogOpen} onClose={closeReviews} studentId={selectedStudent?.id}
        studentName={selectedStudent?.name} className={className} schoolId={schoolId}
        branchId={branchId === ALL_BRANCHES ? undefined : branchId} />
    </Box>
  );
}
