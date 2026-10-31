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

const BrowseAnalyticsDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchAnalytics,
}) => {
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [services, setServices] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);

  const isEditing = !!editFields.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [serviceRes, districtRes, stateRes, countryRes] = await Promise.all([
          axios.get("/api/legal-services"),
          axios.get("/api/districts"),
          axios.get("/api/states"),
          axios.get("/api/countries"),
        ]);
        setServices(serviceRes.data);
        setDistricts(districtRes.data);
        setStates(stateRes.data);
        setCountries(countryRes.data);
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
        serviceId: editFields.serviceId ? parseInt(editFields.serviceId) : null,
        districtId: editFields.districtId ? parseInt(editFields.districtId) : null,
        stateId: editFields.stateId ? parseInt(editFields.stateId) : null,
        countryId: editFields.countryId ? parseInt(editFields.countryId) : null,
        requestCount: editFields.requestCount ? parseInt(editFields.requestCount) : null,
        completionRate: editFields.completionRate ? parseFloat(editFields.completionRate) : null,
        avgResolutionTime: editFields.avgResolutionTime
          ? parseFloat(editFields.avgResolutionTime)
          : null,
        slaCompliance: editFields.slaCompliance ? parseFloat(editFields.slaCompliance) : null,
      };

      const apiUrl = isEditing ? `/api/analytics/${editFields.id}` : "/api/analytics";

      const response = isEditing
        ? await axios.put(apiUrl, payload)
        : await axios.post(apiUrl, payload);

      if (response.status === 200 || response.status === 201) {
        toast.success(isEditing ? "Analytic Updated!" : "New Analytic Added!");
        handleSaveAndCloseModal();
      }
    } catch (err) {
      console.error("Save Error:", err.response?.data || err.message);
      setError(isEditing ? "Error updating analytic." : "Error adding new analytic.");
      toast.error(err.response?.data?.error || "Error saving analytic.");
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
        <ListItemText primary={isEditing ? "Edit Analytic" : "Add New Analytic"} />
        <Button
          onClick={fetchAnalytics}
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
                    <MenuItem value="">None</MenuItem>
                    {services.map((service) => (
                      <MenuItem key={service.id} value={service.id}>
                        {service.name}
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
                  <InputLabel>State</InputLabel>
                  <Select
                    value={editFields.stateId ?? ""}
                    onChange={(e) => setEditFields({ ...editFields, stateId: e.target.value })}
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
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={editFields.countryId ?? ""}
                    onChange={(e) => setEditFields({ ...editFields, countryId: e.target.value })}
                  >
                    <MenuItem value="">None</MenuItem>
                    {countries.map((country) => (
                      <MenuItem key={country.id} value={country.id}>
                        {country.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1, overflowY: "auto", pl: 1, maxHeight: "80vh" }}>
                <TextField
                  label="Request Count"
                  name="requestCount"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={editFields.requestCount ?? ""}
                  onChange={(e) => setEditFields({ ...editFields, requestCount: e.target.value })}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Completion Rate (%)"
                  name="completionRate"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={editFields.completionRate ?? ""}
                  onChange={(e) => setEditFields({ ...editFields, completionRate: e.target.value })}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Average Resolution Time (hrs)"
                  name="avgResolutionTime"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={editFields.avgResolutionTime ?? ""}
                  onChange={(e) =>
                    setEditFields({ ...editFields, avgResolutionTime: e.target.value })
                  }
                  sx={textFieldStyles}
                />
                <TextField
                  label="SLA Compliance (%)"
                  name="slaCompliance"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={editFields.slaCompliance ?? ""}
                  onChange={(e) => setEditFields({ ...editFields, slaCompliance: e.target.value })}
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

export default BrowseAnalyticsDialog;