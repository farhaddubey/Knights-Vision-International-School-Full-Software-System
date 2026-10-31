import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, ListItemButton, ListItemIcon, ListItemText, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { Add } from "@mui/icons-material";
import { RotateRight } from "@mui/icons-material";

const drawerWidth = 280;
const appBarHeight = 64; // Example AppBar height
const textFieldStyles = {
    "& .MuiInputBase-root": {
      color: "#fff", // Input text color
      backgroundColor: "#222", // Input background color
    },
    "& .MuiInputLabel-root": {
      color: "#fff", // Label text color
    },
  };
  const formControlStyles = {
    "& .MuiInputBase-root": {
      color: "#fff", // Input text color
      backgroundColor: "#222", // Input background color
    },
    "& .MuiInputLabel-root": {
      color: "#fff", // Label text color
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#666", // Border color
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#bbb", // Border color on hover
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#2196F3", // Highlight border color when focused
    },
  };
  
  const textDisabledFieldStyles = {
      "& .MuiInputBase-root": {
        color: "#fff !important", // Force white text
        backgroundColor: "#111", // Dark background
        opacity: 1, // Override default opacity
      },
      "& .MuiInputLabel-root": {
        color: "#fff", // White label text
      },
      "& .Mui-disabled": {
        color: "#fff !important", // Ensures text color remains white when disabled
        WebkitTextFillColor: "#fff !important", // Fixes some browser inconsistencies
        opacity: 1, // Ensures full visibility
      },
    };
  const SalesProductAssignDialog = ({ openInsertion, handleCloseModal, handleSaveAndCloseModal, editFields, setEditFields, fetchForwardedForPackaging }) => {
      const [error, setError] = useState(null);
      const [salesHubs, setSalesHubs] = useState([]);
      const [factoryWorkers, setFactoryWorkers] = useState([]);
      const [driver, setDriver]=useState([]); 
      const [sellsman1, setSellsman1]=useState([]); 
      const [sellsman2, setSellsman2]=useState([]);
      const [sellsman3, setSellsman3]=useState([]);
        // **Handle Select Changes**
        const handleChange = (event) => {
          const { name, value } = event.target;
          setEditFields((prevFields) => ({
            ...prevFields,
            [name]: value, // ✅ Correctly setting field based on name
          }));
        };
        
      useEffect(() => {
        const fetchData = async () => {
          try {
            // Fetch Sales Hub Names
            const salesHubResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_STRAPI_BASE_URL}/api/sales-centers?fields[0]=sales_hub_name`,
              {
                  headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}` },
              }
          );
            const salesHubOptions = salesHubResponse.data.data.map(hub => ({
              id: hub.id,
              name: hub.attributes.sales_hub_name || "Unnamed Hub",
            }));
            setSalesHubs(salesHubOptions);
    
            // Fetch Factory Workers
            const workersResponse = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_BASE_URL}/api/users?filters[jobRole][$eq]=Factory Worker&fields[0]=username`,
              {
                headers: {Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`}
              }
            );
            
            const workerOptions = workersResponse.data.map(worker => ({
              id: worker.id,
              username: worker.username || "Unnamed Worker",
            }));
            setFactoryWorkers(workerOptions);
            setDriver(workerOptions); 
            setSellsman1(workerOptions);
            setSellsman2(workerOptions); 
            setSellsman3(workerOptions);
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        };
    
        fetchData();
      }, [editFields]);
      const transferFromSellsHubtoSellsMan = async () => {
        const token = Cookies.get("faculties_token");
        if (!token) {
          toast.error("User not authenticated.");
          return;
        }
      
        const generateTransferId = () => {
          const invName = String(editFields?.inventory_storage_location || "INV")
            .replace(/\s+/g, "")
            .substring(0, 3)
            .toUpperCase();
          const sellHubName = String(editFields?.transferred_to || "HUB")
            .replace(/\s+/g, "")
            .substring(0, 3)
            .toUpperCase();
          const prodName = String(editFields?.company_product_ids || "PROD")
            .replace(/\s+/g, "")
            .substring(0, 3)
            .toUpperCase();
        
          // Get date & time in YYYYMMDDHHMMSS format (12 digits)
          const dateTimePart = new Date().toISOString()
            .replace(/[-:T]/g, "")  // Remove dashes, colons, and 'T'
            .substring(0, 12);       // Take first 12 characters (YYYYMMDDHHMM)
        
          return `${invName}-${sellHubName}-${prodName}-${dateTimePart}`;
        };
        
        
      
        try {
          // Prepare request payload
          const payload = {
            data: {
              transfer_id: generateTransferId(),
              departure_date_time: new Date().toISOString(),
              quantity_transferred: editFields?.amount_taken_for_sell || 0,
              measure_unit: editFields?.measure_unit || "N/A",
              receive_otp: null,
              receive_status: true,
              remarks: "Great",
              sales_center_id: editFields?.transferred_to || null,
              company_product: editFields?.company_product_ids || null,
              driver_name: editFields?.factories_tdil_storage_id || null,
              inventory_storage_location: editFields?.inventory_storage_location || null,
            },
          };
      
          // Send POST request
          await axios.post(
            `${process.env.NEXT_PUBLIC_STRAPI_BASE_URL}/api/inventory-to-sells-hubs`,
            payload,
            {
              headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}` },
            }
          );
      
          toast.success("Product transferred successfully.");
          console.log("Product Updated SUccessfully");
          handleSaveAndCloseModal();
        } catch (error) {
          console.error(
            "Error transferring product to sell hub:",
            error.response?.data || error.message || "Unknown error"
          );
          toast.error("Failed to transfer product.");
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
     open={openInsertion} onClose={handleCloseModal} fullScreen>
              <ListItemButton 
  sx={{ 
    backgroundColor: "#1a237e", 
    color: "#fff",
    "&:hover": { backgroundColor: "#1a237e" } // Prevents color change on hover
  }}
>
  <ListItemIcon>
    <Add/>
  </ListItemIcon>
  <ListItemText sx={{ color: "#fff" }} primary="Assign Sells" />
    <Button onClick={handleCloseModal} variant="contained" color="error" sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}>
        <CloseIcon sx={{color:"#fff"}}/>
    </Button>
        <Button onClick={fetchRawMaterials} variant="outlined" color="#00c853" sx={{ position: "absolute", right: 215, top: 8, color: "#00c853",  bgcolor:"#212121" }}>
          <RotateRight/>
      </Button>
    
</ListItemButton>
      
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
  <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#000", color: "#fff", p: 2,  overflowY: "auto", }}>
    {/* Left Side */}
    <Box sx={{ flex: 1,  pr: 1, maxHeight: "80vh" }}>
      
<FormControl sx={formControlStyles} fullWidth margin="normal">
  <InputLabel>Driver of the Sells Team</InputLabel>
  <Select
    name="factories_tdil_storage_id" // ✅ Added name
    value={editFields?.factories_tdil_storage_id || ""}
    onChange={handleChange}
    displayEmpty
  >
    <MenuItem value="">Select a Factory Worker</MenuItem>
    {driver.map(worker => (
      <MenuItem key={worker.id} value={worker.id}>
        {worker.username}
      </MenuItem>
    ))}
  </Select>
</FormControl>

<FormControl sx={formControlStyles} fullWidth margin="normal">
  <InputLabel>Sellsman 1</InputLabel>
  <Select
    name="factories_tdil_storage_id" // ✅ Added name
    value={editFields?.sellsman1 || ""}
    onChange={handleChange}
    displayEmpty
  >
    <MenuItem value="">Select a Factory Worker</MenuItem>
    {sellsman1.map(worker => (
      <MenuItem key={worker.id} value={worker.id}>
        {worker.username}
      </MenuItem>
    ))}
  </Select>
</FormControl>

<FormControl sx={formControlStyles} fullWidth margin="normal">
  <InputLabel>Sellsman 2</InputLabel>
  <Select
    name="factories_tdil_storage_id" // ✅ Added name
    value={editFields?.sellsman2 || ""}
    onChange={handleChange}
    displayEmpty
  >
    <MenuItem value="">Select a Factory Worker</MenuItem>
    {sellsman2.map(worker => (
      <MenuItem key={worker.id} value={worker.id}>
        {worker.username}
      </MenuItem>
    ))}
  </Select>
</FormControl>

<FormControl sx={formControlStyles} fullWidth margin="normal">
  <InputLabel>Sellsman 3</InputLabel>
  <Select
    name="factories_tdil_storage_id" // ✅ Added name
    value={editFields?.sellsman3 || ""}
    onChange={handleChange}
    displayEmpty
  >
    <MenuItem value="">Select a Factory Worker</MenuItem>
    {sellsman3.map(worker => (
      <MenuItem key={worker.id} value={worker.id}>
        {worker.username}
      </MenuItem>
    ))}
  </Select>
</FormControl>
      <TextField sx={textDisabledFieldStyles} label="Month Year" fullWidth margin="normal" value={editFields?.month_year ?? "N/A"} />
    </Box>

    {/* Right Side */}
    <Box sx={{ flex: 1, pl: 1, maxHeight: "80vh" }}>
      <TextField sx={textDisabledFieldStyles} disabled label="Company Product Name" fullWidth margin="normal" value={editFields?.product_name ?? 0} />
      <TextField sx={textDisabledFieldStyles} disabled label="Sales Hub Name" fullWidth margin="normal" value={editFields?.sales_hub_name ?? 0} />
      <TextField sx={textDisabledFieldStyles} label="Net Reaminging Product Quantity" fullWidth margin="normal" value={editFields?.net_remaining_quantity ?? 0} />
    <TextField 
  onChange={(e) => {
    const amount = Number(e.target.value) || 0; // Ensure it's a number
    setEditFields(prev => ({
      ...prev,
      amount_taken_for_sell: amount, 
      net_remaining_quantity: Math.max((prev.net_remaining_quantity || 0) - amount, 0) // Prevent negative stock
    }));
  }}
  sx={textDisabledFieldStyles}
  label="Amount To Transfer"
  fullWidth
  margin="normal"
  value={editFields?.amount_taken_for_sell ?? 0}
/>
      <TextField sx={textDisabledFieldStyles} label="Measure Unit" fullWidth margin="normal" value={editFields?.measure_unit ?? "N/A"} />
      <FormControl sx={formControlStyles} fullWidth margin="normal">
  <InputLabel>Transferring Sells Hub Name</InputLabel>
  <Select
    name="transferred_to" // ✅ Added name
    value={editFields?.transferred_to || ""}
    onChange={handleChange}
    displayEmpty
  >
    <MenuItem value="">Select a Sales Hub</MenuItem>
    {salesHubs.map(hub => (
      <MenuItem key={hub.id} value={hub.id}>
        {hub.name}
      </MenuItem>
    ))}
  </Select>
</FormControl>


    </Box>
  </Box>
</DialogContent>


      <DialogActions>
        <Button onClick={handleCloseModal} variant="contained" color="error">Cancel Transfer</Button>
        <Button onClick={transferFromSellsHubtoSellsMan} variant="contained" color="primary">Transfer to Sells Hub</Button>
      </DialogActions>
      </Box>
      </Box>
    </Dialog>
  );
};

export default SalesProductAssignDialog;
