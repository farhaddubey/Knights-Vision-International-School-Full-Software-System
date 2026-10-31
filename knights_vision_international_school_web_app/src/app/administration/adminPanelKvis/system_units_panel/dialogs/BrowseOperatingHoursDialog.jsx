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
const appBarHeight = 80;

const BrowseOperatingHoursDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchOperatingHours,
}) => {
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serviceCenters, setServiceCenters] = useState([]);

  const isEditing = !!editFields.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/legal-service-centers");
        setServiceCenters(response.data);
      } catch (err) {
        console.error("Error fetching service centers:", err);
        setError("Failed to fetch service centers.");
        toast.error("Failed to fetch service centers.");
      }
    };
    if (openInsertion) fetchData();
  }, [openInsertion]);

  const handleSaveChanges = async () => {
    setApiLoading(true);
    try {
      const payload = {
        serviceCenterId: parseInt(editFields.serviceCenterId),
        dayOfWeek: editFields.dayOfWeek,
        openingTime: editFields.openingTime,
        closingTime: editFields.closingTime,
      };

      const apiUrl = isEditing
        ? `/api/operating-hours/${editFields.id}`
        : "/api/operating-hours";

      const response = isEditing
        ? await axios.put(apiUrl, payload)
        : await axios.post(apiUrl, payload);

      if (response.status === 200 || response.status === 201) {
        toast.success(isEditing ? "Operating Hour Updated!" : "New Operating Hour Added!");
        handleSaveAndCloseModal();
      }
    } catch (err) {
      console.error("Save Error:", err.response?.data || err.message);
      setError(isEditing ? "Error updating operating hour." : "Error adding new operating hour.");
      toast.error(err.response?.data?.error || "Error saving operating hour.");
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
        <ListItemText primary={isEditing ? "Edit Operating Hour" : "Add New Operating Hour"} />
        <Button
          onClick={fetchOperatingHours}
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
          Close Modal
        </Button>
      </ListItem>

      <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#000", color: "#fff" }}>
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
            <Box sx={{ display: "flex", flexDirection: "row" }}>
              <Box sx={{ flex: 1, overflow: "auto", pr: 1, maxHeight: "80vh" }}>
                <FormControl fullWidth margin="normal" sx={textFieldStyles}>
                  <InputLabel>Service Center</InputLabel>
                  <Select
                    value={editFields.serviceCenterId || ""}
                    onChange={(e) =>
                      setEditFields({ ...editFields, serviceCenterId: e.target.value })
                    }
                  >
                    <MenuItem value="">Select</MenuItem>
                    {serviceCenters.map((center) => (
                      <MenuItem key={center.id} value={center.id}>
                        {center.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Day of Week"
                  name="dayOfWeek"
                  fullWidth
                  margin="normal"
                  value={editFields.dayOfWeek ?? ""}
                  onChange={(e) => setEditFields({ ...editFields, dayOfWeek: e.target.value })}
                  sx={textFieldStyles}
                />
              </Box>

              <Box sx={{ flex: 1, overflowY: "auto", pl: 1, maxHeight: "80vh" }}>
                <TextField
                  label="Opening Time"
                  name="openingTime"
                  type="time"
                  fullWidth
                  margin="normal"
                  value={editFields.openingTime ?? ""}
                  onChange={(e) => setEditFields({ ...editFields, openingTime: e.target.value })}
                  sx={textFieldStyles}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Closing Time"
                  name="closingTime"
                  type="time"
                  fullWidth
                  margin="normal"
                  value={editFields.closingTime ?? ""}
                  onChange={(e) => setEditFields({ ...editFields, closingTime: e.target.value })}
                  sx={textFieldStyles}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>
            {error && (
              <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>
                {error}
              </Typography>
            )}
            <DialogActions>
              <Button onClick={handleCloseModal} variant="contained" color="error">
                Cancel
              </Button>
              <Button onClick={handleSaveChanges} variant="contained" color="primary">
                Save Changes
              </Button>
            </DialogActions>
          </DialogContent>
        </Box>
      </Box>
    </Dialog>
  );
};

export default BrowseOperatingHoursDialog;
