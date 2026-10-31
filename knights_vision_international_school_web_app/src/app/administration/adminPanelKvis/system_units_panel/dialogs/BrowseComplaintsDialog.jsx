import { useState, useEffect } from "react";
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
const appBarHeight = 64;

const BrowseComplaintsDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchComplaints,
}) => {
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);

  const isEditing = !!editFields.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/complaints?resource=students");
        setStudents(response.data?.data || []);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
        setError("Failed to fetch dropdown data.");
        toast.error("Failed to fetch dropdown data.");
      }
    };
    if (openInsertion) fetchData();
  }, [openInsertion]);

  const handleSaveChanges = async () => {
    setApiLoading(true);
    try {
      const payload = {
        studentId: parseInt(editFields.studentId) || null,
        category: editFields.category,
        description: editFields.description,
        status: editFields.status,
        resolution: editFields.resolution || null,
      };

      const apiUrl = isEditing ? `/api/complaints/${editFields.id}` : "/api/complaints";

      const response = isEditing
        ? await axios.put(apiUrl, payload)
        : await axios.post(apiUrl, payload);

      if (response.status === 200 || response.status === 201) {
        toast.success(isEditing ? "Complaint Updated!" : "New Complaint Added!");
        handleSaveAndCloseModal();
      }
    } catch (err) {
      console.error("Save Error:", err.response?.data || err.message);
      setError(isEditing ? "Error updating complaint." : "Error adding new complaint.");
      toast.error(err.response?.data?.error || "Error saving complaint.");
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
      <ListItem sx={{ backgroundColor: "#009688", color: "#fff" }}>
        <ListItemIcon>
          <Add />
        </ListItemIcon>
        <ListItemText primary={isEditing ? "Edit Complaint" : "Add New Complaint"} />
        <Button
          onClick={fetchComplaints}
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
                  <InputLabel>Student</InputLabel>
                  <Select
                    value={editFields.studentId ?? ""}
                    disabled={isEditing}
                    onChange={(e) => setEditFields({ ...editFields, studentId: e.target.value })}
                  >
                    {students.map((student) => (
                      <MenuItem key={student.id} value={student.id}>
                        {[student.firstName, student.middleName, student.lastName].filter(Boolean).join(" ")}{student.admissionNumber ? ` (${student.admissionNumber})` : ""}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal" sx={textFieldStyles}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={editFields.category ?? "OTHER"}
                    disabled={isEditing}
                    onChange={(e) => setEditFields({ ...editFields, category: e.target.value })}
                  >
                    <MenuItem value="DISCIPLINE">Discipline</MenuItem>
                    <MenuItem value="UNIFORM">Uniform</MenuItem>
                    <MenuItem value="SYLLABUS">Syllabus</MenuItem>
                    <MenuItem value="HOMEWORK">Homework</MenuItem>
                    <MenuItem value="TEACHER_BEHAVIOR">Teacher Behaviour</MenuItem>
                    <MenuItem value="CLEANLINESS">Cleanliness</MenuItem>
                    <MenuItem value="TRANSPORT">Transport</MenuItem>
                    <MenuItem value="EXTRACURRICULAR">Extracurricular</MenuItem>
                    <MenuItem value="TIMETABLE">Timetable</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Description"
                  name="description"
                  fullWidth
                  margin="normal"
                  disabled={isEditing}
                  value={editFields.description ?? ""}
                  onChange={(e) => setEditFields({ ...editFields, description: e.target.value })}
                  sx={textFieldStyles}
                />
              </Box>
              <Box sx={{ flex: 1, overflowY: "auto", pl: 1, maxHeight: "80vh" }}>
                <FormControl fullWidth margin="normal" sx={textFieldStyles}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editFields.status ?? "OPEN"}
                    onChange={(e) => setEditFields({ ...editFields, status: e.target.value })}
                  >
                    <MenuItem value="OPEN">Open</MenuItem>
                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                    <MenuItem value="RESOLVED">Resolved</MenuItem>
                    <MenuItem value="ESCALATED">Escalated</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Resolution"
                  name="resolution"
                  fullWidth
                  margin="normal"
                  value={editFields.resolution ?? ""}
                  onChange={(e) => setEditFields({ ...editFields, resolution: e.target.value })}
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

export default BrowseComplaintsDialog;
