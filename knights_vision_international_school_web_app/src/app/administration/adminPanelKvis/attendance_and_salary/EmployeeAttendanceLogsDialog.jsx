import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { Add, FactCheck } from "@mui/icons-material";
import textFieldStyles from "../../../mui_styles/TextFieldStyles";
import ReusableFactorySelect from "../reuse_components/FactorySelect";
const drawerWidth = 280;
const appBarHeight = 64; // Example AppBar height
import { RotateRight } from "@mui/icons-material";

const FactoryMachinesOverviewDialog = ({
    openInsertion,
    handleCloseModal,
    handleSaveAndCloseModal,
    editFields,
    setEditFields  }) => {
  const [factoryId, setFactoryId]=useState("");
    const handleSaveChanges = async () => {
      const token = Cookies.get("administration_token");
      if (!token) {
        toast.error("User not authenticated.");
        return;
      }
    
      // Decode token to retrieve user ID
      let userId;
      try {
        const base64Payload = token.split(".")[1];
        if (!base64Payload) throw new Error("Invalid token format");
    
        const decodedPayload = JSON.parse(atob(base64Payload));
        userId = decodedPayload?.id;
        console.log("User's id is:", userId);
      } catch (error) {
        console.error("Token decoding error:", error);
        toast.error("Failed to authenticate user.");
        return;
      }
    
      // Construct API URL
      const apiUrl = editFields?.id
        ? `/api/machines_tdils/${editFields.id}`
        : `/api/machines_tdils`;
        const payload = {
          machine_id: editFields?.machine_id?.trim() || null,
          machine_name: editFields?.machine_name?.trim() || "N/A",
          machine_type: editFields?.machine_type?.trim() || "N/A",
          servicing_period: editFields?.servicing_period?.trim() || "N/A",
          production_capacity: editFields?.production_capacity?.trim() || "N/A",
          machine_net_worth: editFields?.machine_net_worth?.trim() || "N/A", // 👈 FIXED
          factory_id: factoryId, // ensure valid value
        };
        console.log("Submitting Payload:", payload);
        
      try {
        const response = editFields?.id
          ? await axios.put(apiUrl, payload, {
              headers: { Authorization: `Bearer ${token}` },
            })
          : await axios.post(apiUrl, payload, {
              headers: { Authorization: `Bearer ${token}` },
            });
    
        console.log("Server Response:", response.data);
    
        if (response.status === 200 || response.status === 201) {
          toast.success(
            editFields?.id
              ? "Machine Updated Successfully."
              : "Machine Created Successfully."
          );
          fetchMachines();
          handleSaveAndCloseModal();
        }
      } catch (err) {
        console.error("Save Error:", err.response?.data || err.message);
        toast.error("Failed to save. Check logs for details.");
      }
    };
    
    
  
    return (
      <Dialog
        sx={{
          position: "fixed",
          top: `${appBarHeight}px`,
          left: `calc(${drawerWidth}px)`,
          transform: "translate(0, 0)"
        }}
        open={openInsertion} onClose={handleCloseModal} fullScreen
      >
        <ListItemButton
          sx={{
            backgroundColor: "#009688",
            color: "#fff",
            "&:hover": { backgroundColor: "#009688" }
          }}
        >
          <ListItemIcon>
            <Add />
          </ListItemIcon>
          <ListItemText sx={{ color: "#fff" }} primary="Insert Factory" />
          <Button onClick={handleCloseModal} variant="outlined" color="error" sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}>
            <CloseIcon />
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
              "&::-webkit-scrollbar": { display: "none" }
            }}
          >
       <DialogContent>
  <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#000", color: "#fff", p: 2 }}>
    
    {/* Left Side */}
    <Box sx={{ flex: 1, overflowY: "auto", pr: 1, maxHeight: "80vh" }}>
      <TextField
        label="Machine ID"
        name="machine_id"
        fullWidth
        margin="normal"
        value={editFields?.machine_id ?? ""}
        onChange={(e) => setEditFields({ ...editFields, machine_id: e.target.value })}
        sx={textFieldStyles}
      />


      <TextField
        label="Machine Name"
        name="machine_name"
        fullWidth
        margin="normal"
        value={editFields?.machine_name ?? ""}
        onChange={(e) => setEditFields({ ...editFields, machine_name: e.target.value })}
        sx={textFieldStyles}
      />

      <TextField
        label="Machine Type"
        name="machine_type"
        fullWidth
        margin="normal"
        value={editFields?.machine_type ?? ""}
        onChange={(e) => setEditFields({ ...editFields, machine_type: e.target.value })}
        sx={textFieldStyles}
      />
    </Box>

    {/* Right Side */}
    <Box sx={{ flex: 1, overflowY: "auto", pl: 1, maxHeight: "80vh" }}>
    <TextField
  label="Machine Net Worth"
  name="machine_net_worth"
  fullWidth
  type="number"
  margin="normal"
  value={editFields?.machine_net_worth ?? ""}
  onChange={(e) => setEditFields({ ...editFields, machine_net_worth: e.target.value })}
  sx={textFieldStyles}
/>


      <TextField
        label="Servicing Period"
        name="servicing_period"
        fullWidth
        margin="normal"
        value={editFields?.servicing_period ?? ""}
        onChange={(e) => setEditFields({ ...editFields, servicing_period: e.target.value })}
        sx={textFieldStyles}
      />

      <TextField
        label="Production Capacity"
        name="production_capacity"
        fullWidth
        margin="normal"
        value={editFields?.production_capacity ?? ""}
        onChange={(e) => setEditFields({ ...editFields, production_capacity: e.target.value })}
        sx={textFieldStyles}
      />
       <ReusableFactorySelect value={"Select Factory"} selectedFactory={factoryId} setSelectedFactory={setFactoryId}/>
      
    </Box>
  </Box>
</DialogContent>
  
            <DialogActions>
              <Button onClick={handleCloseModal} variant="contained" color="error">Cancel</Button>
              <Button onClick={handleSaveChanges} variant="contained" color="primary">Save Changes</Button>
            </DialogActions>
          </Box>
        </Box>
      </Dialog>
    );
  };
  
  export default FactoryMachinesOverviewDialog;
  