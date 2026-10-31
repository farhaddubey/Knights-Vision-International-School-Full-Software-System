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

const BrowseEscalationsDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchEscalations,
}) => {
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [states, setStates] = useState([]);

  const isEditing = !!editFields.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [requestRes, districtRes, stateRes] = await Promise.all([
          axios.get("/api/requests"),
          axios.get("/api/districts"),
          axios.get("/api/states"),
        ]);
        setRequests(requestRes.data);
        setDistricts(districtRes.data);
        setStates(stateRes.data);
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
        requestId: parseInt(editFields.requestId) || null,
        fromDistrictId: editFields.fromDistrictId ? parseInt(editFields.fromDistrictId) : null,
        toStateId: editFields.toStateId ? parseInt(editFields.toStateId) : null,
        toDistrictId: editFields.toDistrictId ? parseInt(editFields.toDistrictId) : null,
        reason: editFields.reason,
        status: editFields.status,
      };

      const apiUrl = isEditing ? `/api/escalations/${editFields.id}` : "/api/escalations";

      const response = isEditing
        ? await axios.put(apiUrl, payload)
        : await axios.post(apiUrl, payload);

      if (response.status === 200 || response.status === 201) {
        toast.success(isEditing ? "Escalation Updated!" : "New Escalation Added!");
        handleSaveAndCloseModal();
      }
    } catch (err) {
      console.error("Save Error:", err.response?.data || err.message);
      setError(isEditing ? "Error updating escalation." : "Error adding new escalation.");
      toast.error(err.response?.data?.error || "Error saving escalation.");
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
        <ListItemText primary={isEditing ? "Edit Escalation" : "Add New Escalation"} />
        <Button
          onClick={fetchEscalations}
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
                  <InputLabel>Request</InputLabel>
                  <Select
                    value={editFields.requestId ?? ""}
                    onChange={(e) => setEditFields({ ...editFields, requestId: e.target.value })}
                  >
                    {requests.map((request) => (
                      <MenuItem key={request.id} value={request.id}>
                        {request.id}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal" sx={textFieldStyles}>
                  <InputLabel>From District</InputLabel>
                  <Select
                    value={editFields.fromDistrictId ?? ""}
                    onChange={(e) =>
                      setEditFields({ ...editFields, fromDistrictId: e.target.value })
                    }
                  >
                    <MenuItem value="">None</MenuItem>
                    {districts.map((district) => (
                      <MenuItem key={district.id} value={district.id}>
                        {district.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal" sx={textFieldStyles}>
                  <InputLabel>To State</InputLabel>
                  <Select
                    value={editFields.toStateId ?? ""}
                    onChange={(e) => setEditFields({ ...editFields, toStateId: e.target.value })}
                  >
                    <MenuItem value="">None</MenuItem>
                    {states.map((state) => (
                      <MenuItem key={state.id} value={state.id}>
                        {state.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal" sx={textFieldStyles}>
                  <InputLabel>To District</InputLabel>
                  <Select
                    value={editFields.toDistrictId ?? ""}
                    onChange={(e) => setEditFields({ ...editFields, toDistrictId: e.target.value })}
                  >
                    <MenuItem value="">None</MenuItem>
                    {districts.map((district) => (
                      <MenuItem key={district.id} value={district.id}>
                        {district.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1, overflowY: "auto", pl: 1, maxHeight: "80vh" }}>
                <TextField
                  label="Reason"
                  name="reason"
                  fullWidth
                  margin="normal"
                  value={editFields.reason ?? ""}
                  onChange={(e) => setEditFields({ ...editFields, reason: e.target.value })}
                  sx={textFieldStyles}
                />
                <FormControl fullWidth margin="normal" sx={textFieldStyles}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editFields.status ?? "PENDING"}
                    onChange={(e) => setEditFields({ ...editFields, status: e.target.value })}
                  >
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                    <MenuItem value="ESCALATED">Escalated</MenuItem>
                    <MenuItem value="UNDER_REVIEW">Under Review</MenuItem>
                  </Select>
                </FormControl>
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

export default BrowseEscalationsDialog;