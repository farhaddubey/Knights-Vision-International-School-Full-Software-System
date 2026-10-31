"use client";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Box, Typography, Button, List, ListItem, TextField, CircularProgress,
  Pagination, PaginationItem, Alert, MenuItem, Chip
} from "@mui/material";
import { ChevronLeft, ChevronRight, EmojiPeople, Refresh } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LeaveRequestDetailsDialog from "./dialogs/LeaveRequestDetailsDialog";
import StudentDetailsDialog from "./dialogs/StudentDetailsDialog";

const pageSize = 30;
const selectSx = {
  minWidth: 230,
  "& .MuiInputBase-root": { backgroundColor: "#303030", color: "#fff" },
  "& .MuiSelect-icon": { color: "#fff" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#fff" },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#00c853" },
};

export default function AttendanceManagement({ className }) {
  const [schools, setSchools] = useState([]);
  const [branches, setBranches] = useState([]);
  const [schoolId, setSchoolId] = useState("");
  const [branchId, setBranchId] = useState(""); // "ALL" = all branches within selected school
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [error, setError] = useState("");
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [studentOpen, setStudentOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [dialogView, setDialogView] = useState("attendance");
  const scopeReady = schoolId !== "" && branchId !== "";

  useEffect(() => {
    const controller = new AbortController();
    async function loadSchools() {
      setLoadingSchools(true);
      try {
        const { data } = await axios.get("/api/get-info", {
          params: { type: "schools" }, signal: controller.signal,
        });
        if (!Array.isArray(data?.schools)) throw new Error("Invalid schools response");
        setSchools(data.schools);
      } catch (err) {
        if (err.code !== "ERR_CANCELED") {
          setError("Could not load schools.");
          toast.error("Could not load schools.");
        }
      } finally {
        if (!controller.signal.aborted) setLoadingSchools(false);
      }
    }
    loadSchools();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!schoolId) return;
    const controller = new AbortController();
    async function loadBranches() {
      setLoadingBranches(true);
      try {
        const { data } = await axios.get("/api/get-info", {
          params: { type: "branches", schoolId }, signal: controller.signal,
        });
        if (!Array.isArray(data?.branches)) throw new Error("Invalid branches response");
        setBranches(data.branches);
      } catch (err) {
        if (err.code !== "ERR_CANCELED") {
          setError("Could not load branches.");
          toast.error("Could not load branches.");
        }
      } finally {
        if (!controller.signal.aborted) setLoadingBranches(false);
      }
    }
    loadBranches();
    return () => controller.abort();
  }, [schoolId]);

  const fetchLeaveRequests = useCallback(async (pageNum, signal) => {
    const params = { page: pageNum, pageSize, status: "ALL", schoolId };
    if (branchId !== "ALL") params.branchId = branchId;
    const { data } = await axios.get(
      `/api/attendance/${encodeURIComponent(String(className).toLowerCase())}/leave-requests`,
      { params, signal }
    );
    if (!Array.isArray(data?.leaveRequests)) throw new Error("Invalid leave requests response");
    return data;
  }, [className, schoolId, branchId]);

  useEffect(() => {
    if (!scopeReady || !className) return;
    const controller = new AbortController();
    async function loadRequests() {
      setLoadingRequests(true);
      setError("");
      try {
        const data = await fetchLeaveRequests(page, controller.signal);
        if (!controller.signal.aborted) {
          setLeaveRequests(data.leaveRequests);
          setTotalPages(Math.max(1, Number(data.totalPages) || 1));
        }
      } catch (err) {
        if (err.code !== "ERR_CANCELED") {
          setError("Failed to fetch leave requests.");
          setLeaveRequests([]);
          toast.error("Failed to fetch leave requests.");
        }
      } finally {
        if (!controller.signal.aborted) setLoadingRequests(false);
      }
    }
    loadRequests();
    return () => controller.abort();
  }, [scopeReady, className, page, fetchLeaveRequests]);

  const chooseSchool = (value) => {
    setSchoolId(value);
    setBranchId("");
    setBranches([]);
    setLeaveRequests([]);
    setTotalPages(1);
    setPage(1);
    setError("");
  };
  const chooseBranch = (value) => {
    setBranchId(value);
    setLeaveRequests([]);
    setTotalPages(1);
    setPage(1);
    setError("");
  };
  const openRequestDetails = (request) => {
    if (!request?.id) return toast.error("Invalid leave request.");
    setSelectedRequest(request);
    setDetailsOpen(true);
  };
  const openStudentDetails = (request, view) => {
    if (!request?.studentId) return toast.error("Student not found in request.");
    setSelectedStudent({ id: request.studentId, name: request.studentName });
    setDialogView(view);
    setStudentOpen(true);
  };
  const statusLabel = (request) => request.approved == null ? "Pending" : request.approved ? "Approved" : "Rejected";
  const statusColor = (request) => request.approved == null ? "warning" : request.approved ? "success" : "error";

  return (
    <Box sx={{ bgcolor: "#212121", color: "#fff", minHeight: "calc(100vh - 64px)", p: 2 }}>
      <ToastContainer position="bottom-center" autoClose={3000} theme="dark" />
      <Box sx={{ bgcolor: "#b71c1c", p: 1.5, borderRadius: 1, display: "flex", alignItems: "center", gap: 1 }}>
        <EmojiPeople />
        <Typography sx={{ fontWeight: 700, flexGrow: 1 }}>{className} Leave Requests — Administration Review</Typography>
        <Chip label="READ ONLY" sx={{ bgcolor: "#222", color: "#fff", fontWeight: 700 }} />
      </Box>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", bgcolor: "#181818", p: 2, mt: 1, borderRadius: 1 }}>
        <TextField select size="small" label="School" value={schoolId}
          onChange={(e) => chooseSchool(e.target.value)} disabled={loadingSchools}
          SelectProps={{ displayEmpty: true, renderValue: (v) => v === "" ? <span style={{ color: "#fff" }}>Select a school first</span> : schools.find(s => String(s.id) === String(v))?.name || String(v), MenuProps: { PaperProps: { sx: { bgcolor: "#303030", color: "#fff" } } } }}
          InputLabelProps={{ shrink: true, sx: { color: "#fff", "&.Mui-focused": { color: "#fff" } } }} sx={selectSx}>
          <MenuItem value="" disabled sx={{ color: "#fff" }}>Select a school first</MenuItem>
          {schools.map(s => <MenuItem key={s.id} value={String(s.id)}>{s.name}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Branch" value={branchId}
          onChange={(e) => chooseBranch(e.target.value)} disabled={!schoolId || loadingBranches}
          SelectProps={{ displayEmpty: true, renderValue: (v) => v === "" ? <span style={{ color: "#fff" }}>Select a branch or all branches</span> : v === "ALL" ? "All Branches" : branches.find(b => String(b.id) === String(v))?.name || String(v), MenuProps: { PaperProps: { sx: { bgcolor: "#303030", color: "#fff" } } } }}
          InputLabelProps={{ shrink: true, sx: { color: "#fff", "&.Mui-focused": { color: "#fff" } } }} sx={selectSx}>
          <MenuItem value="" disabled>Select a branch or all branches</MenuItem>
          <MenuItem value="ALL">All Branches (selected school)</MenuItem>
          {branches.map(b => <MenuItem key={b.id} value={String(b.id)}>{b.name}{b.code ? ` (${b.code})` : ""}</MenuItem>)}
        </TextField>
        {(loadingSchools || loadingBranches) && <CircularProgress size={24} sx={{ color: "#00c853" }} />}
        <Typography sx={{ color: "#ddd", fontSize: 13 }}>
          {!schoolId ? "Choose a school to load branches." : !branchId ? "Choose a branch to review leave requests." : branchId === "ALL" ? "Showing all branches within the selected school." : "Showing the selected branch only."}
        </Typography>
      </Box>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      <Box sx={{ mt: 2, bgcolor: "#181818", borderRadius: 1, overflow: "hidden" }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "0.7fr 1.4fr 1.5fr 2fr 1fr 2fr", gap: 1, p: 1.5, bgcolor: "#333", minWidth: 850, fontWeight: 700 }}>
          {['Request ID','Student Name','Date Range','Reason','Status','Review'].map(h => <Typography key={h} fontWeight={700}>{h}</Typography>)}
        </Box>
        <Box sx={{ maxHeight: "68vh", overflow: "auto" }}>
          {!scopeReady ? <Typography sx={{ p: 4, textAlign: "center", color: "#fff" }}>Select a school and branch to review leave requests.</Typography> :
           loadingRequests ? <Box sx={{ p: 5, textAlign: "center" }}><CircularProgress sx={{ color: "#00c853" }} /></Box> :
           leaveRequests.length === 0 ? <Typography sx={{ p: 4, textAlign: "center" }}>No leave requests found for {className}.</Typography> :
           <List disablePadding sx={{ minWidth: 850 }}>
             {leaveRequests.map(request => <ListItem key={request.id} disableGutters sx={{ display: "grid", gridTemplateColumns: "0.7fr 1.4fr 1.5fr 2fr 1fr 2fr", gap: 1, p: 1.5, bgcolor: "#181818", borderBottom: "1px solid #333" }}>
               <Typography>{request.id}</Typography>
               <Typography>{request.studentName || "N/A"}</Typography>
               <Typography>{String(request.fromDate || "").slice(0, 10)} to {String(request.toDate || "").slice(0, 10)}</Typography>
               <Typography sx={{ overflowWrap: "anywhere" }}>{request.reason || "N/A"}</Typography>
               <Box><Chip label={statusLabel(request)} color={statusColor(request)} size="small" variant="outlined" /></Box>
               <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                 <Button size="small" variant="outlined" sx={{ color: "#fff", borderColor: "#fff" }} onClick={() => openRequestDetails(request)}>Details</Button>
                 <Button size="small" variant="outlined" onClick={() => openStudentDetails(request, "attendance")}>Attendance</Button>
                 <Button size="small" variant="outlined" color="info" onClick={() => openStudentDetails(request, "leave")}>Leave History</Button>
               </Box>
             </ListItem>)}
           </List>}
        </Box>
      </Box>
      {scopeReady && <Box sx={{ display: "flex", justifyContent: "center", mt: 2, pb: 2 }}>
        <Pagination count={totalPages} page={Math.min(page, totalPages)} disabled={loadingRequests} onChange={(_, value) => setPage(value)}
          renderItem={(item) => <PaginationItem components={{ previous: ChevronLeft, next: ChevronRight }} {...item} />}
          sx={{ "& .MuiPaginationItem-root": { color: "#fff" }, "& .Mui-selected": { bgcolor: "#00c853 !important", color: "#000 !important" } }} />
      </Box>}
      <LeaveRequestDetailsDialog open={detailsOpen} onClose={() => { setDetailsOpen(false); setSelectedRequest(null); }}
        request={selectedRequest} className={className} schoolId={schoolId} branchId={branchId === "ALL" ? undefined : branchId} readOnly />
      <StudentDetailsDialog open={studentOpen} onClose={() => { setStudentOpen(false); setSelectedStudent(null); }}
        studentId={selectedStudent?.id} studentName={selectedStudent?.name} className={className}
        view={dialogView} schoolId={schoolId} branchId={branchId === "ALL" ? undefined : branchId} readOnly />
    </Box>
  );
}
