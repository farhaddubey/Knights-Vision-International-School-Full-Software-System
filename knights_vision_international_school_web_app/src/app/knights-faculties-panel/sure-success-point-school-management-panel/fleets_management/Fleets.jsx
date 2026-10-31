import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  ListItemButton,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Inventory, Edit, Close, AddBusiness, Settings, RotateRight, Search as SearchIcon } from "@mui/icons-material";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import FleetsDialog from './dialog/FleetDialog';
import FleetViewDialog from './dialog/FleetViewDialog';
const appBarHeight = 64; // Example AppBar height

const FleetsCollection = () => {
  const [rawMaterials, setRawMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [openII, setOpenII] = useState(false);
  const [editFields, setEditFields] = useState({});

  const fetchRawMaterials = async () => {
    const token = Cookies.get("faculties_token");
    if (!token) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }
    try {
      const decoded = jwtDecode(token);
      const sales_center_id = decoded.sales_center_id;
      const response = await axios.get(`/api/fleets_management/fleet`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(response.data);
      console.log("Data Check: ");
      const formattedVehicles = response.data.map((item, index) => ({
        id: item.id ?? index + 1,
        // 🆔 Identification
        registrationNumber: item.registrationNumber ?? "N/A",
        chassisNumber: item.chassisNumber ?? "N/A",
        engineNumber: item.engineNumber ?? "N/A",
        vinNumber: item.vinNumber ?? "N/A",
        // 🚛 Vehicle Details
        vehicleType: item.vehicleType ?? "UNKNOWN",
        make: item.make ?? "Unknown Make",
        model: item.model ?? "Unknown Model",
        variant: item.variant ?? "Unknown Variant",
        fuelType: item.fuelType ?? "N/A",
        transmissionType: item.transmissionType ?? "N/A",
        color: item.color ?? "No Color",
        seatingCapacity: item.seatingCapacity ?? 0,
        loadingCapacityKg: item.loadingCapacityKg ?? 0,
        // 📄 Legal Info
        registrationDate: item.registrationDate ?? null,
        modelYear: item.modelYear ?? null,
        rcExpiryDate: item.rcExpiryDate ?? null,
        fitnessExpiryDate: item.fitnessExpiryDate ?? null,
        insuranceCompany: item.insuranceCompany ?? "N/A",
        insurancePolicyNumber: item.insurancePolicyNumber ?? "N/A",
        insuranceExpiryDate: item.insuranceExpiryDate ?? null,
        pucExpiryDate: item.pucExpiryDate ?? null,
        permitType: item.permitType ?? "Unknown",
        permitExpiryDate: item.permitExpiryDate ?? null,
        // 🔧 Operational Info
        odometer: item.odometer ?? 0,
        lastServiceDate: item.lastServiceDate ?? null,
        nextServiceDueDate: item.nextServiceDueDate ?? null,
        warrantyExpiryDate: item.warrantyExpiryDate ?? null,
        leaseExpiryDate: item.leaseExpiryDate ?? null,
        // 🔄 Status
        status: item.status ?? "UNKNOWN",
        ownershipType: item.ownershipType ?? "UNKNOWN",
        decommissionDate: item.decommissionDate ?? null,
        remarks: item.remarks ?? "",
        // 👥 Relational
        assignedDriverId: item.assignedDriverId ?? null,
        depotId: item.depotId ?? null,
        // 📡 Telematics
        gpsDeviceId: item.gpsDeviceId ?? "N/A",
        telematicsProfile: item.telematicsProfile ?? {},
        // 📅 Metadata
        createdAt: item.createdAt ?? null,
        updatedAt: item.updatedAt ?? null,
      }));

      setRawMaterials(formattedVehicles);
      setFilteredMaterials(formattedVehicles);
      console.log("Updated State:", formattedVehicles); // Debugging
    } catch (err) {
      console.error("Error fetching raw materials:", err);
      setError("Failed to fetch raw materials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = rawMaterials.filter((item) =>
      [
        item.registrationNumber,
        item.chassisNumber,
        item.engineNumber,
        item.vinNumber,
        item.vehicleType,
        item.make,
        item.model,
        item.variant,
        item.fuelType,
        item.transmissionType,
        item.color,
        item.insuranceCompany,
        item.insurancePolicyNumber,
        item.permitType,
        item.status,
        item.ownershipType,
        item.remarks,
        item.gpsDeviceId,
        item.telematicsProfile?.deviceModel,
        item.seatingCapacity.toString(),
        item.loadingCapacityKg.toString(),
        item.odometer.toString(),
        item.modelYear?.toString(),
        formatLocalDate(item.registrationDate),
        formatLocalDate(item.rcExpiryDate),
        formatLocalDate(item.fitnessExpiryDate),
        formatLocalDate(item.insuranceExpiryDate),
        formatLocalDate(item.pucExpiryDate),
        formatLocalDate(item.permitExpiryDate),
        formatLocalDate(item.lastServiceDate),
        formatLocalDate(item.nextServiceDueDate),
        formatLocalDate(item.warrantyExpiryDate),
        formatLocalDate(item.leaseExpiryDate),
        formatLocalDate(item.decommissionDate),
        formatLocalDate(item.createdAt),
        formatLocalDate(item.updatedAt),
      ].some((field) => field?.toLowerCase().includes(query))
    );

    setFilteredMaterials(filtered);
  };

  useEffect(() => {
    fetchRawMaterials();
  }, []);

  const handleOpenModal = (item = {}) => {
    console.log("Opening Modal with Material:", item); // Debugging
    setEditFields(item);
    setOpen(true);
  };

  const handleOpenModalII = (item = {}) => {
    console.log("Opening Modal with Material:", item); // Debugging
    setEditFields(item);
    setOpenII(true);
  };

  const handleCloseModal = () => {
    const userConfirmed = window.confirm("Are you sure you want to close the modal, unsaved?");
    if (userConfirmed) {
      setOpen(false);
      setOpenII(false);
      setEditFields({});
    }
  };

  const handleSaveAndCloseModal = () => {
    setOpen(false);
    setOpenII(false);
    setEditFields({});
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress size={120} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ textAlign: "center", mt: 4 }}>
        {error}
      </Typography>
    );
  }

  const formatLocalDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }); // Example: 10 May 2025
  };

  return (
    <Box sx={{ position: "fixed", minWidth: `82vw`, backgroundColor: "#212121", height: `calc(100vh - ${appBarHeight}px)`, color: "#fff" }}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <ListItemButton
        sx={{
          backgroundColor: "#b71c1c",
          color: "#fff",
          "&:hover": { backgroundColor: "#b71c1c" },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingRight: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <ListItemIcon sx={{ color: "#fff", minWidth: 40 }}>
            <Inventory />
          </ListItemIcon>
          <TextField
            size="small"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#fff" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              bgcolor: "#333",
              borderRadius: 1,
              "& .MuiInputBase-input": { color: "#fff", padding: "6px" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#555" },
                "&:hover fieldset": { borderColor: "#777" },
                "&.Mui-focused fieldset": { borderColor: "#00c853" },
              },
              width: 200,
              mr: 2,
            }}
          />
          <ListItemText sx={{ color: "#fff" }} primary="CUSTOMERS MANAGEMENT PANEL" />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            onClick={fetchRawMaterials}
            variant="outlined"
            sx={{
              color: "#00c853",
              bgcolor: "#212121",
              minWidth: 40,
              padding: "6px",
            }}
          >
            <RotateRight />
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenModal()}
          >
            <Settings /> REGISTER A VEHICLE
          </Button>
        </Box>
      </ListItemButton>

      <Box sx={{ bgcolor: "#181818", borderRadius: 2, display: "flex", flexDirection: "column" }}>
        {/* Header Row */}
        <Box
          sx={{
            display: "flex",
            p: 1.4,
            bgcolor: "#333",
            borderRadius: 1,
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <Typography variant="body2" sx={{ flex: 1.5, fontWeight: "bold", color: "#fff", px: 1 }}>
            Identification
          </Typography>
          <Typography variant="body2" sx={{ flex: 1.5, fontWeight: "bold", color: "#fff", px: 1 }}>
            Vehicle Details
          </Typography>
          <Typography variant="body2" sx={{ flex: 1.5, fontWeight: "bold", color: "#fff", px: 1 }}>
            Specs
          </Typography>
          <Typography variant="body2" sx={{ flex: 2, fontWeight: "bold", color: "#fff", px: 1 }}>
            Legal Info
          </Typography>
          <Typography variant="body2" sx={{ flex: 2, fontWeight: "bold", color: "#fff", px: 1 }}>
            Compliance
          </Typography>
        </Box>

        {/* Data Rows */}
        <Box sx={{ maxHeight: "700px", overflowY: "auto", bgcolor: "#121212", borderRadius: 1, paddingBottom: 10 }}>
          <List>
            {filteredMaterials.map((item) => (
              <ListItem
                key={item.id}
                sx={{
                  display: "flex",
                  p: 1,
                  bgcolor: "#000",
                  borderRadius: 1,
                  borderBottom: "2px solid #555",
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Box sx={{ display: "flex", flexDirection: "row", minWidth: "81vw" }}>
                    <Box sx={{ flex: 1.5, color: "#fff", px: 1 }}>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>ID:</Typography>
                        <Button variant="outlined" size="small" color="info">{item.id}</Button>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Reg:</Typography>
                        <Button variant="outlined" size="small" color="success" sx={{ color: "#00c853" }}>{item.registrationNumber}</Button>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Chassis:</Typography>
                        <Button variant="outlined" size="small" color="success" sx={{ color: "#00c853" }}>{item.chassisNumber}</Button>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Engine:</Typography>
                        <Button variant="outlined" size="small" color="success" sx={{ color: "#00c853" }}>{item.engineNumber}</Button>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>VIN:</Typography>
                        <Button variant="outlined" size="small" color="success" sx={{ color: "#00c853" }}>{item.vinNumber}</Button>
                      </Box>
                    </Box>
                    <Box sx={{ flex: 1.5, color: "#fff", px: 1 }}>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Type:</Typography>
                        <Typography>{item.vehicleType}</Typography>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Make:</Typography>
                        <Typography>{item.make}</Typography>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Model:</Typography>
                        <Typography>{item.model}</Typography>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Variant:</Typography>
                        <Typography>{item.variant}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ flex: 1.5, color: "#fff", px: 1 }}>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Fuel:</Typography>
                        <Typography>{item.fuelType}</Typography>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Trans:</Typography>
                        <Typography>{item.transmissionType}</Typography>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Color:</Typography>
                        <Typography>{item.color}</Typography>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Seats:</Typography>
                        <Button variant="outlined" size="small" color="info">
                          {item.seatingCapacity}
                        </Button>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Load:</Typography>
                        <Button variant="outlined" size="small" color="info">
                          {item.loadingCapacityKg}
                        </Button>
                      </Box>
                    </Box>
                    <Box sx={{ flex: 3, color: "#fff", px: 1 }}>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Reg Date:</Typography>
                        <Button variant="outlined" size="small" color="info">
                          {formatLocalDate(item.registrationDate)}
                        </Button>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Model Year:</Typography>
                        <Button variant="outlined" size="small" color="info">
                          {item.modelYear || "N/A"}
                        </Button>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>RC Expiry:</Typography>
                        <Button variant="outlined" size="small" color="error">
                          {formatLocalDate(item.rcExpiryDate)}
                        </Button>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Fitness Expiry:</Typography>
                        <Button variant="outlined" size="small" color="error">
                          {formatLocalDate(item.fitnessExpiryDate)}
                        </Button>
                      </Box>
                    </Box>
                    <Box sx={{ flex: 3, color: "#fff", px: 1 }}>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Ins. Co:</Typography>
                        <Typography>{item.insuranceCompany}</Typography>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Policy:</Typography>
                        <Typography>{item.insurancePolicyNumber}</Typography>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Ins. Expiry:</Typography>
                        <Button variant="outlined" size="small" color="error">
                          {formatLocalDate(item.insuranceExpiryDate)}
                        </Button>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>PUC Expiry:</Typography>
                        <Button variant="outlined" size="small" color="error">
                          {formatLocalDate(item.pucExpiryDate)}
                        </Button>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Permit:</Typography>
                        <Typography>{item.permitType}</Typography>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Permit Expiry:</Typography>
                        <Button variant="outlined" size="small" color="error">
                          {formatLocalDate(item.permitExpiryDate)}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "row", py: 2 }}>
                    <Box sx={{ flex: 2, color: "#fff", px: 1 }}>
                      <Typography sx={{ fontWeight: "bold" }}>Operational</Typography>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Odometer:</Typography>
                        <Button variant="outlined" size="small" color="info">
                          {item.odometer}
                        </Button>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Last Service:</Typography>
                        <Button variant="outlined" size="small" color="info">
                          {formatLocalDate(item.lastServiceDate)}
                        </Button>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Next Service:</Typography>
                        <Button variant="outlined" size="small" color="info">
                          {formatLocalDate(item.nextServiceDueDate)}
                        </Button>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Warranty Expiry:</Typography>
                        <Button variant="outlined" size="small" color="error" sx={{ color: "#d50000" }}>
                          {formatLocalDate(item.warrantyExpiryDate)}
                        </Button>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Lease Expiry:</Typography>
                        <Button variant="outlined" size="small" color="error" sx={{ color: "#d50000" }}>
                          {formatLocalDate(item.leaseExpiryDate)}
                        </Button>
                      </Box>
                    </Box>
                    <Box sx={{ flex: 1.5, color: "#fff", px: 1 }}>
                      <Typography sx={{ fontWeight: "bold" }}>Status</Typography>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Status:</Typography>
                        <Typography>{item.status}</Typography>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Ownership:</Typography>
                        <Typography>{item.ownershipType}</Typography>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Decommission:</Typography>
                        <Button variant="outlined" size="small" color="error">
                          {formatLocalDate(item.decommissionDate)}
                        </Button>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Remarks:</Typography>
                        <Typography>{item.remarks}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ flex: 1.5, color: "#fff", px: 1 }}>
                      <Typography sx={{ fontWeight: "bold" }}>Relations</Typography>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Driver ID:</Typography>
                        <Typography>{item.assignedDriverId || "N/A"}</Typography>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Depot ID:</Typography>
                        <Typography>{item.depotId || "N/A"}</Typography>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>GPS:</Typography>
                        <Typography>{item.gpsDeviceId}</Typography>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Telematics:</Typography>
                        <Typography>{item.telematicsProfile?.deviceModel || "N/A"}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ flex: 1.2, color: "#fff", px: 1 }}>
                      <Typography sx={{ fontWeight: "bold" }}>Metadata</Typography>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Created:</Typography>
                        <Button variant="outlined" size="small" color="info">
                          {formatLocalDate(item.createdAt)}
                        </Button>
                      </Box>
                      <Box sx={{ py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>Updated:</Typography>
                        <Button variant="outlined" size="small" color="info">
                          {formatLocalDate(item.updatedAt)}
                        </Button>
                      </Box>
                    </Box>
                    <Box sx={{ flex: 1, px: 1 }}>
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Button
                          variant="outlined"
                          color="success"
                          sx={{
                            mx: 2,
                            my: 0.5,
                            color: "#00c853",
                            "&:hover": { bgcolor: "#000" },
                          }}
                          onClick={() => handleOpenModalII(item)}
                        >
                          Explore
                        </Button>
                        <Button
                          onClick={() => handleOpenModal(item)}
                          variant="outlined"
                          color="info"
                          sx={{
                            mx: 2,
                            my: 0.5,
                            color: "#0091ea",
                          }}
                        >
                          Update
                        </Button>
                        <Button
                          variant="outlined"
                          color="warning"
                          sx={{
                            mx: 2,
                            my: 0.5,
                            color: "#ffc107",
                          }}
                        >
                          Logs
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
      <FleetsDialog
        openInsertion={open}
        handleCloseModal={handleCloseModal}
        handleSaveAndCloseModal={handleSaveAndCloseModal}
        editFields={editFields}
        setEditFields={setEditFields}
      />
      <FleetViewDialog
        openInsertion={openII}
        handleCloseModal={handleCloseModal}
        handleSaveAndCloseModal={handleSaveAndCloseModal}
        editFields={editFields}
        setEditFields={setEditFields}
      />
    </Box>
  );
};

export default FleetsCollection;