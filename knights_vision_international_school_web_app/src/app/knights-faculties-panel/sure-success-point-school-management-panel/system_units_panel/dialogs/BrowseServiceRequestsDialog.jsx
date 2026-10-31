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

const BrowseServiceRequestsDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchRequests,
}) => {
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);
  const [slots, setSlots] = useState([]);

  const isEditing = !!editFields.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [serviceRes, customerRes, userRes, districtRes, stateRes, countryRes, slotRes] =
          await Promise.all([
            axios.get("/api/legal-services"),
            axios.get("/api/customers"),
            axios.get("/api/users"),
            axios.get("/api/districts"),
            axios.get("/api/states"),
            axios.get("/api/countries"),
            axios.get("/api/slots"),
          ]);
        setServices(serviceRes.data);
        setCustomers(customerRes.data);
        setUsers(userRes.data);
        setDistricts(districtRes.data);
        setStates(stateRes.data);
        setCountries(countryRes.data);
        setSlots(slotRes.data);
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
        customerId: parseInt(editFields.customerId) || null,
        assignedUserId: editFields.assignedUserId ? parseInt(editFields.assignedUserId) : null,
        districtId: editFields.districtId ? parseInt(editFields.districtId) : null,
        stateId: editFields.stateId ? parseInt(editFields.stateId) : null,
        countryId: editFields.countryId ? parseInt(editFields.countryId) : null,
        uploadMethod: editFields.uploadMethod,
        whatsappNumber: editFields.whatsappNumber || null,
        paymentStatus: editFields.paymentStatus,
        slotId: editFields.slotId ? parseInt(editFields.slotId) : null,
        status: editFields.status,
        bookingMethod: editFields.bookingMethod,
        distribution: editFields.distribution,
        isOffline: editFields.isOffline,
      };

      const apiUrl = isEditing ? `/api/requests/${editFields.id}` : "/api/requests";

      const response = isEditing
        ? await axios.put(apiUrl, payload)
        : await axios.post(apiUrl, payload);

      if (response.status === 200 || response.status === 201) {
        toast.success(isEditing ? "Request Updated!" : "New Request Added!");
        handleSaveAndCloseModal();
      }
    } catch (err) {
      console.error("Save Error:", err.response?.data || err.message);
      setError(isEditing ? "Error updating request." : "Error adding new request.");
      toast.error(err.response?.data?.error || "Error saving request.");
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
        <ListItemText primary={isEditing ? "Edit Service Request" : "Add New Service Request"} />
        <Button
          onClick={fetchRequests}
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
                  <InputLabel>Customer</InputLabel>
                  <Select
                    value={editFields.customerId ?? ""}
                    onChange={(e) => setEditFields({ ...editFields, customerId: e.target.value })}
                  >
                    {customers.map((customer) => (
                      <MenuItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal" sx={textFieldStyles}>
                  <InputLabel>Assigned User</InputLabel>
                  <Select
                    value={editFields.assignedUserId ?? ""}
                    onChange={(e) => setEditFields({ ...editFields, assignedUserId: e.target.value })}
                  >
                    <MenuItem value="">None</MenuItem>
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name}
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
                <FormControl fullWidth margin="normal" sx={textFieldStyles}>
                  <InputLabel>Upload Method</InputLabel>
                  <Select
                    value={editFields.uploadMethod ?? "DIRECT_UPLOAD"}
                    onChange={(e) => setEditFields({ ...editFields, uploadMethod: e.target.value })}
                  >
                    <MenuItem value="DIRECT_UPLOAD">Direct Upload</MenuItem>
                    <MenuItem value="WHATSAPP">WhatsApp</MenuItem>
                    <MenuItem value="EMAIL">Email</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="WhatsApp Number"
                  name="whatsappNumber"
                  fullWidth
                  margin="normal"
                  value={editFields.whatsappNumber ?? ""}
                  onChange={(e) => setEditFields({ ...editFields, whatsappNumber: e.target.value })}
                  sx={textFieldStyles}
                />
                <FormControl fullWidth margin="normal" sx={textFieldStyles}>
                  <InputLabel>Payment Status</InputLabel>
                  <Select
                    value={editFields.paymentStatus ?? "UNPAID"}
                    onChange={(e) => setEditFields({ ...editFields, paymentStatus: e.target.value })}
                  >
                    <MenuItem value="PAID">Paid</MenuItem>
                    <MenuItem value="UNPAID">Unpaid</MenuItem>
                    <MenuItem value="PARTIALLY_PAID">Partially Paid</MenuItem>
                    <MenuItem value="REFUNDED">Refunded</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal" sx={textFieldStyles}>
                  <InputLabel>Slot</InputLabel>
                  <Select
                    value={editFields.slotId ?? ""}
                    onChange={(e) => setEditFields({ ...editFields, slotId: e.target.value })}
                  >
                    <MenuItem value="">None</MenuItem>
                    {slots.map((slot) => (
                      <MenuItem key={slot.id} value={slot.id}>
                        {new Date(slot.startTime).toLocaleString()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                <FormControl fullWidth margin="normal" sx={textFieldStyles}>
                  <InputLabel>Booking Method</InputLabel>
                  <Select
                    value={editFields.bookingMethod ?? "ONLINE"}
                    onChange={(e) => setEditFields({ ...editFields, bookingMethod: e.target.value })}
                  >
                    <MenuItem value="ONLINE">Online</MenuItem>
                    <MenuItem value="IN_OFFICE">In Office</MenuItem>
                    <MenuItem value="D2D">Door-to-Door</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal" sx={textFieldStyles}>
                  <InputLabel>Distribution</InputLabel>
                  <Select
                    value={editFields.distribution ?? "PENDING"}
                    onChange={(e) => setEditFields({ ...editFields, distribution: e.target.value })}
                  >
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="DISTRICT_ASSIGNED">District Assigned</MenuItem>
                    <MenuItem value="STATE_ESCALATED">State Escalated</MenuItem>
                    <MenuItem value="INTER_DISTRICT">Inter-District</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal" sx={textFieldStyles}>
                  <InputLabel>Is Offline</InputLabel>
                  <Select
                    value={editFields.isOffline ? "true" : "false"}
                    onChange={(e) =>
                      setEditFields({ ...editFields, isOffline: e.target.value === "true" })
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

export default BrowseServiceRequestsDialog;