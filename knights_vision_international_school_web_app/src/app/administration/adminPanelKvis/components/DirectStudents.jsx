"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Box, Typography, Button, List, ListItem, ListItemText,
  TextField, CircularProgress, Pagination, PaginationItem,
  FormControl, InputLabel, Select, MenuItem, Alert,
} from "@mui/material";
import {
  Search as SearchIcon, ChevronLeft, ChevronRight,
  EmojiPeople, AppRegistrationRounded, School, Apartment,
} from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DirectStudentDialog from "./dialogs/DirectStudentDialog";

const drawerWidth = 280;
const appBarHeight = 64;
const pageSize = 100;
const ALL_BRANCHES = "ALL";

export default function DirectStudents({ className }) {
  const [schools, setSchools] = useState([]);
  const [branches, setBranches] = useState([]);
  const [schoolId, setSchoolId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editFields, setEditFields] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const requestSequence = useRef(0);

  const tokenHeaders = () => {
    const token = Cookies.get("administration_token");
    if (!token) throw new Error("User not authenticated.");
    return { Authorization: `Bearer ${token}` };
  };

  // 1. Fetch schools once when the page opens.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingSchools(true);
        const { data } = await axios.get("/api/get-info", {
          headers: tokenHeaders(),
          params: { type: "schools" },
        });
        if (active) setSchools(data.schools || []);
      } catch (err) {
        if (active) setError(err.response?.data?.error || err.message);
      } finally {
        if (active) setLoadingSchools(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // 2. Only fetch branches for the selected school.
  useEffect(() => {
    let active = true;
    setBranches([]);
    if (!schoolId) return;
    (async () => {
      try {
        setLoadingBranches(true);
        setError("");
        const { data } = await axios.get("/api/get-info", {
          headers: tokenHeaders(),
          params: { type: "branches", schoolId },
        });
        if (active) setBranches(data.branches || []);
      } catch (err) {
        if (active) setError(err.response?.data?.error || err.message);
      } finally {
        if (active) setLoadingBranches(false);
      }
    })();
    return () => { active = false; };
  }, [schoolId]);

  // 3. The backend MUST filter by schoolId and (unless ALL) branchId.
  // It must also return totalPages for the filtered result.
  useEffect(() => {
    const sequence = ++requestSequence.current;
    setStudents([]);
    if (!schoolId || !branchId) {
      setLoadingStudents(false);
      return;
    }
    const controller = new AbortController();
    (async () => {
      try {
        setLoadingStudents(true);
        setError("");
        const { data } = await axios.get(
          `/api/students/direct/${encodeURIComponent(className)}`,
          {
            headers: tokenHeaders(),
            params: {
              page,
              pageSize,
              searchQuery,
              schoolId,
              ...(branchId === ALL_BRANCHES ? {} : { branchId }),
            },
            signal: controller.signal,
          }
        );
        if (!Array.isArray(data?.students)) throw new Error("Invalid student response format.");
        if (sequence === requestSequence.current) {
          setStudents(data.students);
          setTotalPages(Math.max(1, Number(data.totalPages) || 1));
        }
      } catch (err) {
        if (err.code !== "ERR_CANCELED" && sequence === requestSequence.current) {
          setError(err.response?.data?.error || err.message);
          toast.error("Failed to fetch students.");
        }
      } finally {
        if (sequence === requestSequence.current) setLoadingStudents(false);
      }
    })();
    return () => controller.abort();
  }, [schoolId, branchId, className, page, searchQuery, reloadKey]);

  const changeSchool = (id) => {
    setSchoolId(id);
    setBranchId("");
    setStudents([]);
    setPage(1);
    setTotalPages(1);
    setSearchQuery("");
  };

  const changeBranch = (id) => {
    setBranchId(id);
    setStudents([]);
    setPage(1);
    setTotalPages(1);
    setSearchQuery("");
  };

  const refreshStudents = useCallback(() => setReloadKey((key) => key + 1), []);
  // Compatibility with DirectStudentDialog's existing fetchStudents prop.
  const fetchStudents = useCallback(() => refreshStudents(), [refreshStudents]);

  const openDialog = (student = {}) => {
    if (!schoolId || !branchId) return toast.error("Select a school and branch first.");
    setEditFields(student);
    setOpen(true);
  };

  const closeDialog = () => {
    // No blocking browser confirm popup.
    setOpen(false);
    setEditFields({});
  };

  const saveAndClose = () => {
    closeDialog();
    refreshStudents();
  };

  const deleteStudent = async (student) => {
    // A non-blocking confirmation UI can be added here if needed.
    // Delete is intentionally NOT triggered without confirmation.
    if (!window.confirm(`Delete ${student.firstName} ${student.lastName}? This cannot be undone.`)) return;
    try {
      await axios.delete(
        `/api/students/direct/${encodeURIComponent(className)}/${encodeURIComponent(student.id)}`,
        { headers: tokenHeaders() }
      );
      toast.success("Student deleted successfully.");
      refreshStudents();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete student.");
    }
  };

  const columns = [
    ["Roll No.", 0.8], ["Name", 1], ["Admission No.", 1.2],
    ["Category", 0.8], ["Branch", 0.8], ["Section", 0.5],
    ["Fee Scheme", 1], ["Actions", 0.9],
  ];

  return (
    <Box sx={{ position: "fixed", width: `calc(100vw - ${drawerWidth}px)`, height: `calc(100vh - ${appBarHeight}px)`, bgcolor: "#212121", color: "#fff", overflow: "auto" }}>
      <ToastContainer position="bottom-center" theme="dark" />

      <Box sx={{ bgcolor: "#b71c1c", p: 1.5, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
        <EmojiPeople />
        <Typography sx={{ fontWeight: 700, flexGrow: 1 }}>{className} Direct Admission Students</Typography>
        <TextField size="small" placeholder="Search Students..." value={searchQuery}
          disabled={!branchId}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
          sx={{ width: 280, bgcolor: "#333", input: { color: "white" }, borderRadius: 1 }} />
        <Button variant="contained" disabled={!branchId || branchId === ALL_BRANCHES}
          onClick={() => openDialog({})}
          startIcon={<AppRegistrationRounded />}
          sx={{ bgcolor: "#00c853", color: "#000", "&:hover": { bgcolor: "#00a344" } }}>
          Add Student
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, p: 2, bgcolor: "#181818", flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 250 }}>
          <InputLabel sx={{ color: "#aaa" }}>School</InputLabel>
          <Select value={schoolId} label="School" onChange={(e) => changeSchool(e.target.value)}
            disabled={loadingSchools} sx={{ color: "#fff", bgcolor: "#303030" }} startAdornment={<School sx={{ mr: 1, color: "#00c853" }} />}>
            {schools.map((school) => <MenuItem key={school.id} value={String(school.id)}>{school.name}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 260 }} disabled={!schoolId || loadingBranches}>
          <InputLabel sx={{ color: "#aaa" }}>Branch</InputLabel>
          <Select value={branchId} label="Branch" onChange={(e) => changeBranch(e.target.value)}
            sx={{ color: "#fff", bgcolor: "#303030" }} startAdornment={<Apartment sx={{ mr: 1, color: "#00c853" }} />}>
            <MenuItem value={ALL_BRANCHES}>All Branches (selected school)</MenuItem>
            {branches.map((branch) => <MenuItem key={branch.id} value={String(branch.id)}>{branch.name} {branch.code ? `(${branch.code})` : ""}</MenuItem>)}
          </Select>
        </FormControl>
        {(loadingSchools || loadingBranches) && <CircularProgress size={25} sx={{ color: "#00c853" }} />}
        <Button onClick={refreshStudents} disabled={!branchId || loadingStudents} sx={{ color: "#00c853" }}>Refresh</Button>
      </Box>

      {error && <Alert severity="error" onClose={() => setError("")} sx={{ m: 2 }}>{error}</Alert>}
      {!schoolId ? (
        <Typography sx={{ p: 4, textAlign: "center" }}>Select a school to view its branches.</Typography>
      ) : !branchId ? (
        <Typography sx={{ p: 4, textAlign: "center" }}>Select a branch or All Branches to load students.</Typography>
      ) : (
        <Box sx={{ bgcolor: "#181818", pb: 9 }}>
          <Box sx={{ display: "flex", bgcolor: "#333", p: 1.5, minWidth: 950, position: "sticky", top: 0, zIndex: 2 }}>
            {columns.map(([name, flex]) => <Typography key={name} variant="body2" sx={{ flex, fontWeight: "bold" }}>{name}</Typography>)}
          </Box>
          {loadingStudents ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}><CircularProgress sx={{ color: "#00c853" }} /></Box>
          ) : (
            <List sx={{ p: 0, minWidth: 950 }}>
              {students.length ? students.map((student) => (
                <ListItem key={student.id} sx={{ display: "flex", bgcolor: "#181818", borderBottom: "2px solid #333", mb: 0.5, p: 1 }}>
                  <Box sx={{ flex: 0.8 }}><Button size="small" variant="outlined">{student.rollNumber || "N/A"}</Button></Box>
                  <Typography variant="body2" sx={{ flex: 1 }}>{student.firstName} {student.lastName}</Typography>
                  <Typography variant="body2" sx={{ flex: 1.2, overflowWrap: "anywhere" }}>{student.admissionNumber || "N/A"}</Typography>
                  <Typography variant="body2" sx={{ flex: 0.8 }}>{student.studentCategory || "N/A"}</Typography>
                  <Typography variant="body2" sx={{ flex: 0.8 }}>{student.class?.branchName || "N/A"}</Typography>
                  <Typography variant="body2" sx={{ flex: 0.5 }}>{student.class?.section || "N/A"}</Typography>
                  <Typography variant="body2" sx={{ flex: 1 }}>{student.feeSchemeCategory || "N/A"}</Typography>
                  <Box sx={{ flex: 0.9, display: "flex", gap: 1 }}>
                    <Button size="small" variant="outlined" onClick={() => openDialog(student)} sx={{ color: "#00c853", borderColor: "#00c853" }}>Edit</Button>
                    <Button size="small" variant="outlined" onClick={() => deleteStudent(student)} sx={{ color: "#f44336", borderColor: "#f44336" }}>Ban</Button>
                  </Box>
                </ListItem>
              )) : <Typography sx={{ p: 4, textAlign: "center" }}>No students found for this selection.</Typography>}
            </List>
          )}
          <Box sx={{ position: "fixed", bottom: 16, left: "56%", transform: "translateX(-50%)", bgcolor: "#181818", borderRadius: 2, p: 1, zIndex: 3 }}>
            <Pagination count={totalPages} page={page} disabled={loadingStudents}
              onChange={(_, value) => setPage(value)}
              renderItem={(item) => <PaginationItem components={{ previous: ChevronLeft, next: ChevronRight }} {...item} />}
              sx={{ "& .MuiPaginationItem-root": { color: "#fff", "&.Mui-selected": { bgcolor: "#00c853", color: "#000" } } }} />
          </Box>
        </Box>
      )}

      <DirectStudentDialog
        openInsertion={open}
        handleCloseModal={closeDialog}
        handleSaveAndCloseModal={saveAndClose}
        editFields={editFields}
        setEditFields={setEditFields}
        fetchStudents={fetchStudents}
        className={className}
        selectedSchoolId={schoolId}
        selectedBranchId={branchId === ALL_BRANCHES ? null : branchId}
      />
    </Box>
  );
}
