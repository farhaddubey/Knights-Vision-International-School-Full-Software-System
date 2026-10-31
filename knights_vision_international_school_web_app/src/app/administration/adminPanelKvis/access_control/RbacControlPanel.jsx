"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const emptyAssignment = {
  userId: "",
  roleId: "",
  scopeType: "GLOBAL",
  schoolId: "",
  branchId: "",
  classId: "",
};

function authHeaders() {
  const token = Cookies.get("administration_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function personLabel(user) {
  const name = user.username?.trim() || "Unnamed user";
  return `${name} — ${user.email}`;
}

export default function RbacControlPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [authorization, setAuthorization] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyAssignment);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const config = { headers: authHeaders() };
      const [authorizationResponse, rolesResponse, permissionsResponse, assignmentsResponse, usersResponse] = await Promise.all([
        axios.get("/api-schools-panel/rbac/authorization", config),
        axios.get("/api-schools-panel/rbac/roles", config),
        axios.get("/api-schools-panel/rbac/permissions", config),
        axios.get("/api-schools-panel/rbac/assignments", config),
        axios.get("/api-schools-panel/rbac/users", config),
      ]);

      setAuthorization(authorizationResponse.data?.data || null);
      setRoles(rolesResponse.data?.data || []);
      setPermissions(permissionsResponse.data?.data || []);
      setAssignments(assignmentsResponse.data?.data || []);
      setUsers(usersResponse.data?.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load the access-control data for this account.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const canManage = authorization?.permissions?.includes("*") || authorization?.permissions?.includes("rbac.manage");
  const permissionsByCategory = useMemo(() => permissions.reduce((categories, permission) => {
    const category = permission.category || "Other";
    categories[category] = [...(categories[category] || []), permission];
    return categories;
  }, {}), [permissions]);

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "scopeType" && value === "GLOBAL" ? { schoolId: "", branchId: "", classId: "" } : {}),
    }));
  };

  const submitAssignment = async (event) => {
    event.preventDefault();
    if (!canManage) return;

    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = {
        userId: Number(form.userId),
        roleId: Number(form.roleId),
        scopeType: form.scopeType,
        schoolId: form.schoolId ? Number(form.schoolId) : null,
        branchId: form.branchId ? Number(form.branchId) : null,
        classId: form.classId ? Number(form.classId) : null,
      };
      await axios.post("/api-schools-panel/rbac/assignments", payload, { headers: authHeaders() });
      setForm(emptyAssignment);
      setNotice("Role assignment saved and added to the access audit log.");
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "The role assignment could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const removeAssignment = async (assignmentId) => {
    if (!canManage) return;

    setSaving(true);
    setError("");
    setNotice("");
    try {
      await axios.delete("/api-schools-panel/rbac/assignments", {
        headers: authHeaders(),
        data: { assignmentId },
      });
      setNotice("Role assignment removed and recorded in the access audit log.");
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "The role assignment could not be removed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "65vh", display: "grid", placeItems: "center", backgroundColor: "#000" }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress sx={{ color: "#ce93d8" }} />
          <Typography sx={{ color: "#ce93d8" }}>Loading access control…</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100%", p: { xs: 1, md: 2 }, backgroundColor: "#000", color: "#f5f5f5" }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 2,
          color: "#fff",
          border: "1px solid #4a148c",
          background: "linear-gradient(135deg, #13051e 0%, #000 55%, #170522 100%)",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#e1bee7", mb: 0.5 }}>
          Access Control
        </Typography>
        <Typography sx={{ color: "#bdbdbd" }}>
          Review roles, permissions, scoped access, and active assignments without changing the panel’s established visual system.
        </Typography>
        {authorization && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
            <Chip label={`Session: ${authorization.source === "rbac" ? "RBAC" : "Legacy compatible"}`} sx={{ color: "#fff", backgroundColor: "#4a148c" }} />
            {authorization.roles.map((role) => <Chip key={role.code} label={role.name} variant="outlined" sx={{ color: "#e1bee7", borderColor: "#7b1fa2" }} />)}
          </Stack>
        )}
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", xl: "minmax(360px, 0.9fr) minmax(0, 1.6fr)" }, gap: 2 }}>
        <Card sx={{ backgroundColor: "#080808", border: "1px solid #3d1356", color: "#fff" }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: "#e1bee7", mb: 0.5 }}>Assign a role</Typography>
            <Typography variant="body2" sx={{ color: "#9e9e9e", mb: 2 }}>
              Assignments are additive. A user receives the union of active role permissions within the listed scope.
            </Typography>
            {!canManage && <Alert severity="info" sx={{ mb: 2 }}>Your account can review RBAC, but it cannot change assignments.</Alert>}
            {users.length === 0 && <Alert severity="warning" sx={{ mb: 2 }}>No users exist in this new school database yet. Create the first account, then grant it the System Administrator role using the guarded bootstrap command.</Alert>}
            <Box component="form" onSubmit={submitAssignment} sx={{ display: "grid", gap: 2 }}>
              <FormControl fullWidth disabled={!canManage || saving || users.length === 0}>
                <InputLabel id="rbac-user-label">User</InputLabel>
                <Select labelId="rbac-user-label" label="User" value={form.userId} onChange={(event) => updateForm("userId", event.target.value)}>
                  {users.map((user) => <MenuItem key={user.id} value={String(user.id)}>{personLabel(user)}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth disabled={!canManage || saving}>
                <InputLabel id="rbac-role-label">Role</InputLabel>
                <Select labelId="rbac-role-label" label="Role" value={form.roleId} onChange={(event) => updateForm("roleId", event.target.value)}>
                  {roles.filter((role) => role.isActive).map((role) => <MenuItem key={role.id} value={String(role.id)}>{role.name}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth disabled={!canManage || saving}>
                <InputLabel id="rbac-scope-label">Access scope</InputLabel>
                <Select labelId="rbac-scope-label" label="Access scope" value={form.scopeType} onChange={(event) => updateForm("scopeType", event.target.value)}>
                  <MenuItem value="GLOBAL">Global</MenuItem>
                  <MenuItem value="SCHOOL">School</MenuItem>
                  <MenuItem value="BRANCH">Branch</MenuItem>
                  <MenuItem value="CLASS">Class</MenuItem>
                </Select>
              </FormControl>
              {form.scopeType !== "GLOBAL" && (
                <TextField
                  label={`${form.scopeType[0]}${form.scopeType.slice(1).toLowerCase()} ID`}
                  value={form.scopeType === "SCHOOL" ? form.schoolId : form.scopeType === "BRANCH" ? form.branchId : form.classId}
                  onChange={(event) => updateForm(form.scopeType === "SCHOOL" ? "schoolId" : form.scopeType === "BRANCH" ? "branchId" : "classId", event.target.value)}
                  required
                  type="number"
                  inputProps={{ min: 1 }}
                  disabled={!canManage || saving}
                />
              )}
              <Button type="submit" variant="contained" disabled={!canManage || saving || !form.userId || !form.roleId} sx={{ backgroundColor: "#6a1b9a", "&:hover": { backgroundColor: "#8e24aa" } }}>
                {saving ? "Saving…" : "Save role assignment"}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: "#080808", border: "1px solid #3d1356", color: "#fff" }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: "#e1bee7" }}>Active assignments</Typography>
            <Divider sx={{ my: 1.5, borderColor: "#3d1356" }} />
            {assignments.length === 0 ? (
              <Typography sx={{ color: "#9e9e9e" }}>No RBAC assignments have been made yet.</Typography>
            ) : (
              <Stack spacing={1.25}>
                {assignments.map((assignment) => (
                  <Paper key={assignment.id} variant="outlined" sx={{ p: 1.5, backgroundColor: "#111", color: "#fff", borderColor: "#42145a" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, alignItems: "start", flexWrap: "wrap" }}>
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>{personLabel(assignment.user)}</Typography>
                        <Typography variant="body2" sx={{ color: "#bdbdbd" }}>{assignment.role.name} · {assignment.scopeType.toLowerCase()} scope</Typography>
                      </Box>
                      {canManage && <Button size="small" color="error" disabled={saving} onClick={() => removeAssignment(assignment.id)}>Remove</Button>}
                    </Box>
                  </Paper>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>

      <Typography variant="h6" sx={{ color: "#e1bee7", mt: 3, mb: 1.25 }}>Role definitions</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", xxl: "repeat(3, minmax(0, 1fr))" }, gap: 1.5 }}>
        {roles.map((role) => (
          <Card key={role.id} sx={{ backgroundColor: "#080808", border: "1px solid #331043", color: "#fff" }}>
            <CardContent>
              <Typography sx={{ color: "#e1bee7", fontWeight: 700 }}>{role.name}</Typography>
              <Typography variant="caption" sx={{ color: "#9e9e9e" }}>{role.code}{role.isSystem ? " · system role" : " · custom role"}</Typography>
              {role.description && <Typography variant="body2" sx={{ color: "#bdbdbd", mt: 1 }}>{role.description}</Typography>}
              <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.75} sx={{ mt: 1.5 }}>
                {role.permissions.map(({ permission }) => <Chip key={permission.code} size="small" label={permission.code} sx={{ backgroundColor: "#271032", color: "#e1bee7" }} />)}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Typography variant="h6" sx={{ color: "#e1bee7", mt: 3, mb: 1.25 }}>Permission catalogue</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" }, gap: 1.5 }}>
        {Object.entries(permissionsByCategory).map(([category, entries]) => (
          <Paper key={category} variant="outlined" sx={{ p: 1.5, backgroundColor: "#080808", color: "#fff", borderColor: "#331043" }}>
            <Typography sx={{ color: "#e1bee7", fontWeight: 700, mb: 1 }}>{category}</Typography>
            <Stack spacing={0.75}>
              {entries.map((permission) => (
                <Box key={permission.code}>
                  <Typography variant="body2" sx={{ color: "#fff" }}>{permission.name} <Box component="span" sx={{ color: "#ce93d8" }}>({permission.code})</Box></Typography>
                  {permission.description && <Typography variant="caption" sx={{ color: "#9e9e9e" }}>{permission.description}</Typography>}
                </Box>
              ))}
            </Stack>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
