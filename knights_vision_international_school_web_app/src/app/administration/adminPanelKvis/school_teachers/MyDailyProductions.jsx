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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  ListItemButton,
  ListItemIcon,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Inventory,
  Edit,
  Close,
  EmojiPeople,
  Money,
  Home,
  ManageAccounts,
  Explore,
  RotateRight,
  Search as SearchIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

const drawerWidth = 280;
const appBarHeight = 64;

const InsertDailyProductions = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openInsertion, setOpenInsertion] = useState(false);
  const [editFields, setEditFields] = useState({});

  const fetchRawMaterials = async () => {
    const token = Cookies.get("administration_token");
    if (!token) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const userId = Number(decoded?.id);
      if (!userId) {
        throw new Error("Invalid user ID in token");
      }

      const response = await axios.get(`/api/production_logs/by_worker_id/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Response Data:", response.data);

      const userFormattedInfo = response.data.data.map((log) => ({
        // 📊 Production Log Info
        log_id: log?.id ?? null,
        date: log?.date ? new Date(log.date).toISOString().split("T")[0] : "N/A",
        unit_produced: log?.unit_produced ?? "0",
        wastage: log?.wastage ?? "0",
        total_money_generated: log?.total_money_generated ?? "0",
        net_profit_or_loss: log?.net_profit_or_loss ?? "0",
        remarks: log?.remarks ?? "",

        // 👤 Employee Info
        employee_id: log?.worker?.id ?? null,
        employee_name: log?.worker?.username ?? "N/A",
        employee_email: log?.worker?.email ?? "N/A",
        department: log?.worker?.department ?? "N/A",
        job_role: log?.worker?.role ?? "N/A",

        // 🏭 Factory Info
        factory_id: log?.factory?.id ?? null,
        factory_name: log?.factory?.factory_name ?? "N/A",
        factory_production_type: log?.factory?.factory_production_type ?? "N/A",

        // 📦 Produced Material Info
        produced_material_id: log?.produced_material?.id ?? null,
        produced_material_name: log?.produced_material?.product_name ?? "N/A",
        produced_material_unit: log?.produced_material?.measure_unit ?? "N/A",
        produced_material_unit_weight: log?.produced_material?.unit_weight ?? null,
        produced_material_unit_cost: log?.produced_material?.unit_cost ?? null,
        produced_material_package_unit: log?.produced_material?.package_unit ?? "N/A",
        produced_material_package_unit_weight: log?.produced_material?.package_unit_weight ?? null,
        produced_material_package_unit_cost: log?.produced_material?.package_unit_cost ?? null,

        // 🧰 Work Type
        work_type_id: log?.work_type?.id ?? null,
        work_type_name: log?.work_type?.type_name ?? "N/A",
      }));

      console.log("User Formatted Data:", userFormattedInfo);
      setRawMaterials(userFormattedInfo);
      setFilteredMaterials(userFormattedInfo); // Initialize filtered data
    } catch (err) {
      console.error("Error fetching raw materials:", err);
      setError("Failed to fetch raw materials.");
    } finally {
      setLoading(false);
    }
  };

  // Handle search input changes
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = rawMaterials.filter((material) =>
      [
        material.employee_name,
        material.factory_name,
        material.produced_material_name,
        material.department,
        material.date,
      ].some((field) => field?.toLowerCase().includes(query))
    );

    setFilteredMaterials(filtered);
  };

  useEffect(() => {
    fetchRawMaterials();
  }, []);

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

  return (
    <Box
      sx={{
        position: "fixed",
        minWidth: `82vw`,
        backgroundColor: "#212121",
        height: `calc(100vh - ${appBarHeight}px)`,
        color: "#fff",
      }}
    >
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
            <Home />
          </ListItemIcon>
          <ListItemText
            sx={{ color: "#fff" }}
            primary="Employee Work Force Management Panel"
          />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button variant="contained" color="primary">
            <Explore /> Detailed Employee Production Management System
          </Button>
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
            }}
          />
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
        </Box>
      </ListItemButton>

      <Box sx={{ bgcolor: "#181818", borderRadius: 2 }}>
        {/* Header Row */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            p: 1,
            bgcolor: "#333",
            borderRadius: 1,
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Date
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Employee Name
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Department
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Factory Name
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Material Name
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Unit Produced
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Wastage
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Money Generated
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Net Profit/Loss
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Remarks
          </Typography>
        </Box>

        {/* Data Rows */}
        <Box
          sx={{
            maxHeight: "700px",
            overflowY: "auto",
            bgcolor: "#121212",
            borderRadius: 1,
            paddingBottom: 10,
          }}
        >
          <List>
            {filteredMaterials.map((material) => (
              <ListItem
                key={material.log_id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  p: 1,
                  bgcolor: "#181818",
                  mb: 1,
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {material.date}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {material.employee_name}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {material.department}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {material.factory_name}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {material.produced_material_name}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {material.unit_produced} {material.produced_material_unit}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {material.wastage} {material.produced_material_unit}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  ₹{material.total_money_generated}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  ₹{material.net_profit_or_loss}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, color: "#fff" }}>
                  {material.remarks || "N/A"}
                </Typography>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Box>
  );
};

export default InsertDailyProductions;