import { useState } from "react";
import {
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { Add, RotateRight } from "@mui/icons-material";
import textFieldStyles from "../../../../mui_styles/TextFieldStyles";
import SchoolBranchSelect from "@/components/sure-success-point-school/selectors/SchoolBranchSelect";
const drawerWidth = 280;
const appBarHeight = 64;

const FleetRegisterOrUpdateDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
}) => {
  const handleSaveChanges = async () => {
    const token = Cookies.get("faculties_token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }

    // Construct payload
    const payload = {
      registrationNumber: editFields?.registrationNumber || "",
      chassisNumber: editFields?.chassisNumber || "",
      engineNumber: editFields?.engineNumber || "",
      vinNumber: editFields?.vinNumber || null,
      vehicleType: editFields?.vehicleType || "CAR",
      make: editFields?.make || "",
      model: editFields?.model || "",
      variant: editFields?.variant || null,
      fuelType: editFields?.fuelType || "PETROL",
      transmissionType: editFields?.transmissionType || "MANUAL",
      color: editFields?.color || null,
      seatingCapacity: Number(editFields?.seatingCapacity) || 0,
      loadingCapacityKg: Number(editFields?.loadingCapacityKg) || null,
      registrationDate: editFields?.registrationDate || new Date().toISOString(),
      modelYear: Number(editFields?.modelYear) || new Date().getFullYear(),
      rcExpiryDate: editFields?.rcExpiryDate || new Date().toISOString(),
      fitnessExpiryDate: editFields?.fitnessExpiryDate || new Date().toISOString(),
      insuranceCompany: editFields?.insuranceCompany || null,
      insurancePolicyNumber: editFields?.insurancePolicyNumber || null,
      insuranceExpiryDate: editFields?.insuranceExpiryDate || new Date().toISOString(),
      pucExpiryDate: editFields?.pucExpiryDate || new Date().toISOString(),
      permitType: editFields?.permitType || null,
      permitExpiryDate: editFields?.permitExpiryDate || new Date().toISOString(),
      odometer: Number(editFields?.odometer) || 0,
      lastServiceDate: editFields?.lastServiceDate || null,
      nextServiceDueDate: editFields?.nextServiceDueDate || null,
      warrantyExpiryDate: editFields?.warrantyExpiryDate || null,
      leaseExpiryDate: editFields?.leaseExpiryDate || null,
      status: editFields?.status || "ACTIVE",
      ownershipType: editFields?.ownershipType || "OWNED",
      decommissionDate: editFields?.decommissionDate || null,
      remarks: editFields?.remarks || null,
      assignedDriverId: Number(editFields?.assignedDriverId) || null,
      depotId: Number(editFields?.depotId) || null,
      branchId: Number(editFields?.branchId) || null,
      gpsDeviceId: editFields?.gpsDeviceId || null,
      telematicsProfile: editFields?.telematicsProfile
        ? (editFields.telematicsProfile)
        : null,
    };

    const apiUrl = editFields?.id
      ? `/api/fleets_management/fleet/${editFields.id}`
      : `/api/fleets_management/fleet`;

    try {
      const response = await axios({
        method: editFields?.id ? "PATCH" : "POST",
        url: apiUrl,
        data: payload,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success(
          editFields?.id
            ? "Vehicle Updated Successfully."
            : "Vehicle Registered Successfully."
        );
        handleSaveAndCloseModal();
      }
    } catch (err) {
      console.error("Save Error:", err.response?.data || err.message);
      toast.error("Failed to save vehicle. Check logs for details.");
    }
  };

  const handleTelematicsChange = (field, value) => {
    const currentTelematics = editFields?.telematicsProfile
      ? (editFields.telematicsProfile)
      : {};
    const updatedTelematics = { ...currentTelematics, [field]: value };
    setEditFields({
      ...editFields,
      telematicsProfile: JSON.stringify(updatedTelematics),
    });
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
      <ListItemButton
        sx={{
          backgroundColor: "#009688",
          color: "#fff",
          "&:hover": { backgroundColor: "#009688" },
        }}
      >
        <ListItemIcon>
          <Add />
        </ListItemIcon>
        <ListItemText
          sx={{ color: "#fff" }}
          primary={editFields?.id ? "Update Vehicle" : "Register Vehicle"}
        />
        <Button
          onClick={handleCloseModal}
          variant="outlined"
          color="error"
          sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
        >
          <CloseIcon />
        </Button>
      </ListItemButton>

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
            {!editFields?.id && <SchoolBranchSelect selectedBranch={editFields?.branchId || ""} setSelectedBranch={(branchId) => setEditFields({ ...editFields, branchId })} />}
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 2,
                backgroundColor: "#000",
                color: "#fff",
                p: 2,
                maxHeight: "85vh",
                overflowY: "auto",
              }}
            >
              {/* Column 1 - Identification, Vehicle Details, Specs */}
              <Box sx={{ flex: 1, overflowY: "auto", pr: 1, maxHeight: "80vh" }}>
                <Typography variant="subtitle1" sx={{ color: "#fff", mb: 1 }}>
                  Identification
                </Typography>
                <TextField
                  label="Registration Number"
                  fullWidth
                  sx={textFieldStyles}
                  value={editFields?.registrationNumber || ""}
                  onChange={(e) =>
                    setEditFields({ ...editFields, registrationNumber: e.target.value })
                  }
                  required
                />
                <TextField
                  label="Chassis Number"
                  fullWidth
                  sx={textFieldStyles}
                  value={editFields?.chassisNumber || ""}
                  onChange={(e) =>
                    setEditFields({ ...editFields, chassisNumber: e.target.value })
                  }
                  required
                />
                <TextField
                  label="Engine Number"
                  fullWidth
                  sx={textFieldStyles}
                  value={editFields?.engineNumber || ""}
                  onChange={(e) =>
                    setEditFields({ ...editFields, engineNumber: e.target.value })
                  }
                  required
                />
                <TextField
                  label="VIN Number"
                  fullWidth
                  sx={textFieldStyles}
                  value={editFields?.vinNumber || ""}
                  onChange={(e) =>
                    setEditFields({ ...editFields, vinNumber: e.target.value })
                  }
                />

                <Typography variant="subtitle1" sx={{ color: "#fff", mt: 2, mb: 1 }}>
                  Vehicle Details
                </Typography>
                <FormControl fullWidth sx={textFieldStyles}>
                  <InputLabel>Vehicle Type</InputLabel>
                  <Select
                    value={editFields?.vehicleType || "CAR"}
                    onChange={(e) =>
                      setEditFields({ ...editFields, vehicleType: e.target.value })
                    }
                    label="Vehicle Type"
                  >
                    {[
                      "CAR",
                      "SUV",
                      "VAN",
                      "TRUCK",
                      "PICKUP",
                      "BIKE",
                      "ELECTRIC_CAR",
                      "BUS",
                      "FORKLIFT",
                      "TRACTOR",
                      "OTHER",
                    ].map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Make"
                  fullWidth
                  sx={textFieldStyles}
                  value={editFields?.make || ""}
                  onChange={(e) =>
                    setEditFields({ ...editFields, make: e.target.value })
                  }
                  required
                />
                <TextField
                  label="Model"
                  fullWidth
                  sx={textFieldStyles}
                  value={editFields?.model || ""}
                  onChange={(e) =>
                    setEditFields({ ...editFields, model: e.target.value })
                  }
                  required
                />
                <TextField
                  label="Variant"
                  fullWidth
                  sx={textFieldStyles}
                  value={editFields?.variant || ""}
                  onChange={(e) =>
                    setEditFields({ ...editFields, variant: e.target.value })
                  }
                />

                <Typography variant="subtitle1" sx={{ color: "#fff", mt: 2, mb: 1 }}>
                  Specs
                </Typography>
                <FormControl fullWidth sx={textFieldStyles}>
                  <InputLabel>Fuel Type</InputLabel>
                  <Select
                    value={editFields?.fuelType || "PETROL"}
                    onChange={(e) =>
                      setEditFields({ ...editFields, fuelType: e.target.value })
                    }
                    label="Fuel Type"
                  >
                    {["PETROL", "DIESEL", "ELECTRIC", "HYBRID", "CNG", "LPG", "OTHER"].map(
                      (type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={textFieldStyles}>
                  <InputLabel>Transmission Type</InputLabel>
                  <Select
                    value={editFields?.transmissionType || "MANUAL"}
                    onChange={(e) =>
                      setEditFields({ ...editFields, transmissionType: e.target.value })
                    }
                    label="Transmission Type"
                  >
                    {["MANUAL", "AUTOMATIC", "SEMI_AUTOMATIC", "CVT", "OTHER"].map(
                      (type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
                <TextField
                  label="Color"
                  fullWidth
                  sx={textFieldStyles}
                  value={editFields?.color || ""}
                  onChange={(e) =>
                    setEditFields({ ...editFields, color: e.target.value })
                  }
                />
                <TextField
                  label="Seating Capacity"
                  type="number"
                  fullWidth
                  sx={textFieldStyles}
                  value={editFields?.seatingCapacity || ""}
                  onChange={(e) =>
                    setEditFields({ ...editFields, seatingCapacity: e.target.value })
                  }
                  required
                />
                <TextField
                  label="Loading Capacity (kg)"
                  type="number"
                  fullWidth
                  sx={textFieldStyles}
                  value={editFields?.loadingCapacityKg || ""}
                  onChange={(e) =>
                    setEditFields({ ...editFields, loadingCapacityKg: e.target.value })
                  }
                />
              </Box>

              {/* Column 2 - Legal, Compliance, Operational, Status, Relations */}
              <Box sx={{ flex: 1, overflowY: "auto", pl: 1, maxHeight: "80vh" }}>
                <Typography variant="subtitle1" sx={{ color: "#fff", mb: 1 }}>
                  Legal Info
                </Typography>
                <TextField
                  label="Registration Date"
                  type="date"
                  fullWidth
                  sx={textFieldStyles}
                  InputLabelProps={{ shrink: true }}
                  value={editFields?.registrationDate?.split("T")[0] || ""}
                  onChange={(e) =>
                    setEditFields({
                      ...editFields,
                      registrationDate: new Date(e.target.value).toISOString(),
                    })
                  }
                  required
                />
                <TextField
                  label="Model Year"
                  type="number"
                  fullWidth
                  sx={textFieldStyles}
                  value={editFields?.modelYear || ""}
                  onChange={(e) =>
                    setEditFields({ ...editFields, modelYear: e.target.value })
                  }
                  required
                />
                <TextField
                  label="RC Expiry Date"
                  type="date"
                  fullWidth
                  sx={textFieldStyles}
                  InputLabelProps={{ shrink: true }}
                  value={editFields?.rcExpiryDate?.split("T")[0] || ""}
                  onChange={(e) =>
                    setEditFields({
                      ...editFields,
                      rcExpiryDate: new Date(e.target.value).toISOString(),
                    })
                  }
                  required
                />
                <TextField
                  label="Fitness Expiry Date"
                  type="date"
                  fullWidth
                  sx={textFieldStyles}
                  InputLabelProps={{ shrink: true }}
                  value={editFields?.fitnessExpiryDate?.split("T")[0] || ""}
                  onChange={(e) =>
                    setEditFields({
                      ...editFields,
                      fitnessExpiryDate: new Date(e.target.value).toISOString(),
                    })
                  }
                  required
                />

                <Typography variant="subtitle1" sx={{ color: "#fff", mt: 2, mb: 1 }}>
                  Compliance
                </Typography>
                <TextField
                  label="Insurance Company"
                  fullWidth
                  sx={textFieldStyles}
                  value={editFields?.insuranceCompany || ""}
                  onChange={(e) =>
                    setEditFields({ ...editFields, insuranceCompany: e.target.value })
                  }
                />
                <TextField
                  label="Insurance Policy Number"
                  fullWidth
                  sx={textFieldStyles}
                  value={editFields?.insurancePolicyNumber || ""}
                  onChange={(e) =>
                    setEditFields({
                      ...editFields,
                      insurancePolicyNumber: e.target.value,
                    })
                  }
                />
                <TextField
                  label="Insurance Expiry Date"
                  type="date"
                  fullWidth
                  sx={textFieldStyles}
                  InputLabelProps={{ shrink: true }}
                  value={editFields?.insuranceExpiryDate?.split("T")[0] || ""}
                  onChange={(e) =>
                    setEditFields({
                      ...editFields,
                      insuranceExpiryDate: new Date(e.target.value).toISOString(),
                    })
                  }
                  required
                />
                <TextField
                  label="PUC Expiry Date"
                  type="date"
                  fullWidth
                  sx={textFieldStyles}
                  InputLabelProps={{ shrink: true }}
                  value={editFields?.pucExpiryDate?.split("T")[0] || ""}
                  onChange={(e) =>
                    setEditFields({
                      ...editFields,
                      pucExpiryDate: new Date(e.target.value).toISOString(),
                    })
                  }
                  required
                />
                <TextField
                  label="Permit Type"
                  fullWidth
                  sx={textFieldStyles}
                  value={editFields?.permitType || ""}
                  onChange={(e) =>
                    setEditFields({ ...editFields, permitType: e.target.value })
                  }
                />
                <TextField
                  label="Permit Expiry Date"
                  type="date"
                  fullWidth
                  sx={textFieldStyles}
                  InputLabelProps={{ shrink: true }}
                  value={editFields?.permitExpiryDate?.split("T")[0] || ""}
                  onChange={(e) =>
                    setEditFields({
                      ...editFields,
                      permitExpiryDate: new Date(e.target.value).toISOString(),
                    })
                  }
                  required
                />

                <Typography variant="subtitle1" sx={{ color: "#fff", mt: 2, mb: 1 }}>
                  Operational
                </Typography>
                <TextField
                  label="Odometer"
                  type="number"
                  fullWidth
                  sx={textFieldStyles}
                  value={editFields?.odometer || ""}
                  onChange={(e) =>
                    setEditFields({ ...editFields, odometer: e.target.value })
                  }
                />
                <TextField
                  label="Last Service Date"
                  type="date"
                  fullWidth
                  sx={textFieldStyles}
                  InputLabelProps={{ shrink: true }}
                  value={editFields?.lastServiceDate?.split("T")[0] || ""}
                  onChange={(e) =>
                    setEditFields({
                      ...editFields,
                      lastServiceDate: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : null,
                    })
                  }
                />
                <TextField
                  label="Next Service Due Date"
                  type="date"
                  fullWidth
                  sx={textFieldStyles}
                  InputLabelProps={{ shrink: true }}
                  value={editFields?.nextServiceDueDate?.split("T")[0] || ""}
                  onChange={(e) =>
                    setEditFields({
                      ...editFields,
                      nextServiceDueDate: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : null,
                    })
                  }
                />
                <TextField
                  label="Warranty Expiry Date"
                  type="date"
                  fullWidth
                  sx={textFieldStyles}
                  InputLabelProps={{ shrink: true }}
                  value={editFields?.warrantyExpiryDate?.split("T")[0] || ""}
                  onChange={(e) =>
                    setEditFields({
                      ...editFields,
                      warrantyExpiryDate: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : null,
                    })
                  }
                />
                <TextField
                  label="Lease Expiry Date"
                  type="date"
                  fullWidth
                  sx={textFieldStyles}
                  InputLabelProps={{ shrink: true }}
                  value={editFields?.leaseExpiryDate?.split("T")[0] || ""}
                  onChange={(e) =>
                    setEditFields({
                      ...editFields,
                      leaseExpiryDate: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : null,
                    })
                  }
                />

                <Typography variant="subtitle1" sx={{ color: "#fff", mt: 2, mb: 1 }}>
                  Status
                </Typography>
                <FormControl fullWidth sx={textFieldStyles}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editFields?.status || "ACTIVE"}
                    onChange={(e) =>
                      setEditFields({ ...editFields, status: e.target.value })
                    }
                    label="Status"
                  >
                    {["ACTIVE", "IN_MAINTENANCE", "DECOMMISSIONED", "SOLD", "SCRAPPED"].map(
                      (status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={textFieldStyles}>
                  <InputLabel>Ownership Type</InputLabel>
                  <Select
                    value={editFields?.ownershipType || "OWNED"}
                    onChange={(e) =>
                      setEditFields({ ...editFields, ownershipType: e.target.value })
                    }
                    label="Ownership Type"
                  >
                    {["OWNED", "LEASED", "RENTED", "FINANCED"].map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Decommission Date"
                  type="date"
                  fullWidth
                  sx={textFieldStyles}
                  InputLabelProps={{ shrink: true }}
                  value={editFields?.decommissionDate?.split("T")[0] || ""}
                  onChange={(e) =>
                    setEditFields({
                      ...editFields,
                      decommissionDate: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : null,
                    })
                  }
                />
                <TextField
                  label="Remarks"
                  fullWidth
                  sx={textFieldStyles}
                  value={editFields?.remarks || ""}
                  onChange={(e) =>
                    setEditFields({ ...editFields, remarks: e.target.value })
                  }
                />

                <Typography variant="subtitle1" sx={{ color: "#fff", mt: 2, mb: 1 }}>
                  Relations
                </Typography>
                <TextField
                  label="Assigned Driver ID"
                  type="number"
                  fullWidth
                  sx={textFieldStyles}
                  value={editFields?.assignedDriverId || ""}
                  onChange={(e) =>
                    setEditFields({ ...editFields, assignedDriverId: e.target.value })
                  }
                />
                <TextField
                  label="Depot ID"
                  type="number"
                  fullWidth
                  sx={textFieldStyles}
                  value={editFields?.depotId || ""}
                  onChange={(e) =>
                    setEditFields({ ...editFields, depotId: e.target.value })
                  }
                />
                <TextField
                  label="GPS Device ID"
                  fullWidth
                  sx={textFieldStyles}
                  value={editFields?.gpsDeviceId || ""}
                  onChange={(e) =>
                    setEditFields({ ...editFields, gpsDeviceId: e.target.value })
                  }
                />

                <Typography variant="subtitle1" sx={{ color: "#fff", mt: 2, mb: 1 }}>
                  Telematics Profile
                </Typography>
                <TextField
                  label="Telematics Device Model"
                  fullWidth
                  sx={textFieldStyles}
                  value={
                    editFields?.telematicsProfile
                      ? (editFields.telematicsProfile)?.deviceModel || ""
                      : ""
                  }
                  onChange={(e) => handleTelematicsChange("deviceModel", e.target.value)}
                />
                <TextField
                  label="Telematics Last Ping"
                  type="datetime-local"
                  fullWidth
                  sx={textFieldStyles}
                  InputLabelProps={{ shrink: true }}
                  value={
                    editFields?.telematicsProfile
                      ? (editFields.telematicsProfile)?.lastPing?.slice(0, 16) ||
                        ""
                      : ""
                  }
                  onChange={(e) =>
                    handleTelematicsChange(
                      "lastPing",
                      e.target.value ? new Date(e.target.value).toISOString() : null
                    )
                  }
                />
              </Box>
            </Box>
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

export default FleetRegisterOrUpdateDialog;
