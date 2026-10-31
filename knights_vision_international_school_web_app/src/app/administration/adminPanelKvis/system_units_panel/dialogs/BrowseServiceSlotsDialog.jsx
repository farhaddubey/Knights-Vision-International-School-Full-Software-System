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

const BrowseServiceSlotsDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchSlots,
}) => {
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [services, setServices] = useState([]);
  const [centers, setCenters] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [timezones, setTimezones] = useState([]);

  const isEditing = !!editFields.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [serviceRes, centerRes, districtRes, timezoneRes] = await Promise.all([
          axios.get("/api/legal-services"),
          axios.get("/api/service-centers"),
          axios.get("/api/districts"),
          axios.get("/api/timezones"),
        ]);
        setServices(serviceRes.data);
        setCenters(centerRes.data);
        setDistricts(districtRes.data);
        setTimezones(timezoneRes.data);
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
        serviceId: parseInt(editFields.serviceId) || null,
        serviceCenterId: editFields.serviceCenterId ? parseInt(editFields.serviceCenterId) : null,
        districtId: editFields.districtId ? parseInt(editFields.districtId) : null,
        timezoneId: parseInt(editFields.timezoneId) || null,
        date: editFields.date,
        startTime: new Date(`1970-01-01T${editFields.startTime}:00Z`).toISOString(),
        endTime: new Date(`1970-01-01T${editFields.endTime}:00Z`).toISOString(),
        isBooked: editFields.isBooked,
      };

      const apiUrl = isEditing ? `/api/slots/${editFields.id}` : "/api/slots";

      const response = isEditing
        ? await axios.put(apiUrl, payload)
        : await axios.post(apiUrl, payload);

      if (response.status === 200 || response.status === 201) {
        toast.success(isEditing ? "Slot Updated!" : "New Slot Added!");
        handleSaveAndCloseModal();
      }
    } catch (err) {
      console.error("Save Error:", err.response?.data || err.message);
      setError(isEditing ? "Error updating slot." : "Error adding new slot.");
      toast.error(err.response?.data?.error || "Error saving slot.");
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
        <ListItemText primary={isEditing ? "Edit Service Slot" : "Add New Service Slot"} />
        <Button
          onClick={fetchSlots}
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
                  <InputLabel>Service</InputLabel>
                  <Select
                    value={editFields.serviceId ?? ""}
                    onChange={(e) => setEditFields({ ...editFields, serviceId: e.target.value })}
                  >
                    {services.map((service) => (
                      <MenuItem key={service.id} value={service.id}>
                        {service.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal" sx={textFieldStyles}>
                  <InputLabel>Service Center</InputLabel>
                  <Select
                    value={editFields.serviceCenterId ?? ""}
                    onChange={(e) =>
                      setEditFields({ ...editFields, serviceCenterId: e.target.value })
                    }
                  >
                    <MenuItem value="">None</MenuItem>
                    {centers.map((center) => (
                      <MenuItem key={center.id} value={center.id}>
                        {center.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal" sx={textFieldStyles}>
                  <InputLabel>District</InputLabel>
                  <Select
                    value={editFields.districtId ?? ""}
                    onChange={(e) => setEditFields({ ...editFields, districtId: e.target.value })}
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
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={editFields.timezoneId ?? ""}
                    onChange={(e) => setEditFields({ ...editFields, timezoneId: e.target.value })}
                  >
                    {timezones.map((timezone) => (
                      <MenuItem key={timezone.id} value={timezone.id}>
                        {timezone.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1, overflowY: "auto", pl: 1, maxHeight: "80vh" }}>
                <TextField
                  label="Date"
                  name="date"
                  type="date"
                  fullWidth
                  margin="normal"
                  value={editFields.date ?? ""}
                  onChange={(e) => setEditFields({ ...editFields, date: e.target.value })}
                  sx={textFieldStyles}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Start Time"
                  name="startTime"
                  type="time"
                  fullWidth
                  margin="normal"
                  value={editFields.startTime ?? ""}
                  onChange={(e) => setEditFields({ ...editFields, startTime: e.target.value })}
                  sx={textFieldStyles}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="End Time"
                  name="endTime"
                  type="time"
                  fullWidth
                  margin="normal"
                  value={editFields.endTime ?? ""}
                  onChange={(e) => setEditFields({ ...editFields, endTime: e.target.value })}
                  sx={textFieldStyles}
                  InputLabelProps={{ shrink: true }}
                />
                <FormControl fullWidth margin="normal" sx={textFieldStyles}>
                  <InputLabel>Is Booked</InputLabel>
                  <Select
                    value={editFields.isBooked ? "true" : "false"}
                    onChange={(e) =>
                      setEditFields({ ...editFields, isBooked: e.target.value === "true" })
                    }
                  >
                    <MenuItem value="true">Yes</MenuItem>
                    <MenuItem value="false">No</MenuItem>
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

export default BrowseServiceSlotsDialog;