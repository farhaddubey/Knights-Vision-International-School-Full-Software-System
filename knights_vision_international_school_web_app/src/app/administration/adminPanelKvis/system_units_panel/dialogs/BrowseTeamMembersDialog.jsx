import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  ListItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Typography,
} from "@mui/material";
import { Add, RotateRight, Close } from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";
import textFieldStyles from "../../../../mui_styles/TextFieldStyles";

const drawerWidth = 280;
const appBarHeight = 80;

const BrowseTeamMembersDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchTeamMembers,
}) => {
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);

  const isEditing = !!editFields.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, departmentRes] = await Promise.all([
          axios.get("/api/users"),
          axios.get("/api/departments"),
        ]);
        setUsers(userRes.data);
        setDepartments(departmentRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data.");
        toast.error("Failed to fetch data.");
      }
    };
    if (openInsertion) fetchData();
  }, [openInsertion]);

  const handleSaveChanges = async () => {
    setApiLoading(true);
    try {
      const payload = {
        userId: parseInt(editFields.userId),
        departmentId: parseInt(editFields.departmentId),
        role: editFields.role,
      };

      const apiUrl = isEditing ? `/api/team-members/${editFields.id}` : "/api/team-members";

      const response = isEditing
        ? await axios.put(apiUrl, payload)
        : await axios.post(apiUrl, payload);

      if (response.status === 200 || response.status === 201) {
        toast.success(isEditing ? "Team Member Updated!" : "New Team Member Added!");
        handleSaveAndCloseModal();
      }
    } catch (err) {
      console.error("Save Error:", err.response?.data || err.message);
      setError(isEditing ? "Error updating team member." : "Error adding new team member.");
      toast.error(err.response?.data?.error || "Error saving team member.");
    } finally {
      setApiLoading(false);
    }
  };

  return (
   <Dialog
      sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        transform: "translate(0, 0)",
      }}
      open={openInsertion}
      onClose={handleCloseModal}
      fullScreen
    >
      {apiLoading && <LinearProgress sx={{ width: "100%", position: "absolute", top: 0 }} />}
      <ListItem sx={{ backgroundColor: "#2196f3", color: "#fff" }}>
        <ListItemIcon>
          <Add />
        </ListItemIcon>
        <ListItemText primary={isEditing ? "Edit Team Member" : "Add New Team Member"} />
        <Button
          onClick={fetchTeamMembers}
          variant="outlined"
          sx={{ position: "absolute", right: 80, top: 8, color: "#00c853", borderColor: "#00c853" }}
          startIcon={<RotateRight />}
        >
          Refresh
        </Button>
        <Button
          onClick={handleCloseModal}
          variant="outlined"
          sx={{ position: "absolute", right: 8, top: 8, color: "#f44336", borderColor: "#f44336" }}
          startIcon={<Close />}
        >
          Close
        </Button>
      </ListItem>

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          height: "100%",
          backgroundColor: "#000",
          color: "#fff",
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <DialogContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                height: "100%",
                backgroundColor: "#000",
                color: "#fff",
                p: 2,
              }}
            >
              <Box sx={{ flex: 1, overflowY: "auto", pr: 1, maxHeight: "80vh" }}>
                <FormControl fullWidth margin="normal" sx={textFieldStyles}>
                  <InputLabel>User</InputLabel>
                  <Select
                    value={editFields.userId || ""}
                    onChange={(e) => setEditFields({ ...editFields, userId: e.target.value })}
                  >
                    <MenuItem value="">Select</MenuItem>
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal" sx={textFieldStyles}>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={editFields.departmentId || ""}
                    onChange={(e) => setEditFields({ ...editFields, departmentId: e.target.value })}
                  >
                    <MenuItem value="">Select</MenuItem>
                    {departments.map((department) => (
                      <MenuItem key={department.id} value={department.id}>
                        {department.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Role"
                  name="role"
                  fullWidth
                  margin="normal"
                  value={editFields.role || ""}
                  onChange={(e) => setEditFields({ ...editFields, role: e.target.value })}
                  sx={textFieldStyles}
                />
              </Box>
            </Box>
            {error && (
              <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>
                {error}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} variant="contained" color="error">
              Cancel
            </Button>
            <Button onClick={handleSaveChanges} variant="contained" color="primary">
              Save Changes
            </Button>
          </DialogActions>
        </Box>
      </Box>
    </Dialog>
  );
};

export default BrowseTeamMembersDialog;