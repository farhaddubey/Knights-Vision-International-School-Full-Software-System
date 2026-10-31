import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  InputLabel,
  LinearProgress,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Close, RotateRight } from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";
import textFieldStyles from "../../../../mui_styles/TextFieldStyles";

const drawerWidth = 280;
const appBarHeight = 64;

const statusOptions = ["PENDING", "IN_PROGRESS", "ON_HOLD", "APPROVED", "REJECTED", "COMPLETED", "CANCELLED"];
const priorityOptions = ["LOW", "NORMAL", "HIGH", "URGENT"];

const BrowseServiceRequestsDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchRequests,
}) => {
  const [apiLoading, setApiLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState(null);
  const isEditing = Boolean(editFields.id);

  useEffect(() => {
    if (!openInsertion) return;
    axios.get("/api/requests?resource=branches")
      .then((response) => setBranches(response.data?.data || []))
      .catch(() => {
        setError("Unable to load the branches available to your role.");
        toast.error("Unable to load available branches.");
      });
  }, [openInsertion]);

  const save = async () => {
    setApiLoading(true);
    setError(null);
    try {
      const payload = {
        title: editFields.title,
        description: editFields.description || null,
        category: editFields.category,
        priority: editFields.priority || "NORMAL",
        ...(isEditing ? { status: editFields.status, decisionNote: editFields.decisionNote || null } : { branchId: editFields.branchId }),
      };
      const url = isEditing ? `/api/requests/${editFields.id}` : "/api/requests";
      const response = isEditing ? await axios.put(url, payload) : await axios.post(url, payload);
      if (response.status === 200 || response.status === 201) {
        toast.success(isEditing ? "Operational request updated." : "Operational request created.");
        handleSaveAndCloseModal();
      }
    } catch (saveError) {
      const message = saveError.response?.data?.error || "Unable to save the operational request.";
      setError(message);
      toast.error(message);
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <Dialog
      sx={{ position: "fixed", top: `${appBarHeight}px`, left: `${drawerWidth}px`, transform: "translate(0, 0)" }}
      open={openInsertion}
      onClose={handleCloseModal}
      fullScreen
    >
      {apiLoading && <LinearProgress sx={{ width: "100%", position: "absolute", top: 0 }} />}
      <ListItem sx={{ backgroundColor: "#009688", color: "#fff" }}>
        <ListItemIcon><Add /></ListItemIcon>
        <ListItemText primary={isEditing ? "Update Operational Request" : "Create Operational Request"} />
        <Button onClick={fetchRequests} variant="outlined" sx={{ position: "absolute", right: 80, top: 8, color: "#00c853", borderColor: "#00c853" }} startIcon={<RotateRight />}>Refresh</Button>
        <Button onClick={handleCloseModal} variant="outlined" sx={{ position: "absolute", right: 8, top: 8, color: "#f44336", borderColor: "#f44336" }} startIcon={<Close />}>Close</Button>
      </ListItem>
      <Box sx={{ minHeight: "100%", backgroundColor: "#000", color: "#fff", p: 2 }}>
        <DialogContent>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
            <FormControl fullWidth sx={textFieldStyles} disabled={isEditing}>
              <InputLabel>Branch</InputLabel>
              <Select value={editFields.branchId ?? ""} label="Branch" onChange={(event) => setEditFields({ ...editFields, branchId: event.target.value })}>
                {branches.map((branch) => <MenuItem key={branch.id} value={branch.id}>{branch.name} ({branch.code})</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Request title" fullWidth required value={editFields.title ?? ""} onChange={(event) => setEditFields({ ...editFields, title: event.target.value })} sx={textFieldStyles} />
            <TextField label="Category" fullWidth required value={editFields.category ?? ""} onChange={(event) => setEditFields({ ...editFields, category: event.target.value })} sx={textFieldStyles} />
            <FormControl fullWidth sx={textFieldStyles}>
              <InputLabel>Priority</InputLabel>
              <Select value={editFields.priority ?? "NORMAL"} label="Priority" onChange={(event) => setEditFields({ ...editFields, priority: event.target.value })}>
                {priorityOptions.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
              </Select>
            </FormControl>
            {isEditing && <FormControl fullWidth sx={textFieldStyles}>
              <InputLabel>Status</InputLabel>
              <Select value={editFields.status ?? "PENDING"} label="Status" onChange={(event) => setEditFields({ ...editFields, status: event.target.value })}>
                {statusOptions.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
              </Select>
            </FormControl>}
            {isEditing && <TextField label="Decision note" fullWidth value={editFields.decisionNote ?? ""} onChange={(event) => setEditFields({ ...editFields, decisionNote: event.target.value })} sx={textFieldStyles} />}
          </Box>
          <TextField label="Description" fullWidth multiline minRows={5} value={editFields.description ?? ""} onChange={(event) => setEditFields({ ...editFields, description: event.target.value })} sx={{ ...textFieldStyles, mt: 2 }} />
          {error && <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} variant="contained" color="error">Cancel</Button>
          <Button onClick={save} variant="contained" color="primary">Save Changes</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default BrowseServiceRequestsDialog;
