import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import textDisabledFieldStyles from "../../../mui_styles/TextDisableFieldStyles";

const stockStatusTypes = [
    // ✅ Healthy / Optimal
    "In Stock",
    "Sufficient Stock",
    "Above Minimum Level",
    "Optimal Stock",
    "Freshly Refilled",
  
    // ⚠️ Warnings
    "Low Stock",
    "Below Reorder Level",
    "Near Expiry",
    "Approaching Minimum Level",
    "Quality Under Inspection",
  
    // ❌ Critical & Out-of-Bounds
    "Out of Stock",
    "Expired",
    "Damaged Stock",
    "Quarantined",
    "Rejected by Quality Control",
    "Blocked for Maintenance",
  
    // 🚚 Movement & Processing
    "Under Procurement",
    "In Transit",
    "Pending Inspection",
    "Awaiting Quality Check",
    "Reserved for Production",
  
    // 🔁 Transfer & Sync
    "Transferred to Another Factory",
    "In Internal Transfer",
    "Under Reallocation",
    "Reserved for Dispatch",
    "Awaiting Approval",
    "Pending",
    // 🧪 Special Scenarios
    "Test Batch Only",
    "On Trial Production",
    "Marked for R&D",
    "Sample Dispatch Only",
  
    // 🛑 Error/Manual Attention
    "Missing Stock",
    "Not Recorded",
    "Inventory Error",
    "Unidentified Entry",
    "Stock Adjustment Needed",
    // 
  ];
  
const ReusableStockStatusSelect = ({ stockStatus, setStockStatus }) => {
  return (
    <FormControl sx={textDisabledFieldStyles} fullWidth margin="normal">
      <InputLabel>Stock Status</InputLabel>
      <Select
        value={stockStatus}
        onChange={(e) => setStockStatus(e.target.value)}
        label="Stock Status"
      >
        {stockStatusTypes.map((status, index) => (
          <MenuItem key={index} value={status}>
            {status}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ReusableStockStatusSelect;
