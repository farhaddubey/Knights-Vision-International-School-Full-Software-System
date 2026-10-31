import axios from "axios";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { getActiveStaffPanelToken } from "@/src/lib/client/panelSession";

import { toast } from "react-toastify";
import { TextField, MenuItem, FormControl, InputLabel, Select } from "@mui/material";

const textFieldStyles = {
  '& .MuiInputBase-input': { color: '#fff' },
  '& .MuiInputLabel-root': { color: '#aaa' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00c853' },
  backgroundColor: '#333',
  borderRadius: '4px',
};

const SchoolBranchSelect = ({ value, selectedBranch, setSelectedBranch }) => {
  const [branches, setBranches] = useState([]);
  const token = getActiveStaffPanelToken();
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get(`/api/school-branches/select`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;
        if (!Array.isArray(data)) {
          throw new Error("Invalid API response structure");
        }

        const formatted = data.map((item) => ({
          id: item.id,
          name: item.name,
        }));

        setBranches(formatted);
      } catch (error) {
        console.error("Error fetching branches:", error);
        toast.error('❌ Error fetching branches.');
      }
    };

    fetchBranches();
  }, [token]);

  return (
    <FormControl sx={textFieldStyles} fullWidth>
      <InputLabel>Select Branch</InputLabel>
      <Select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
        {branches.map((branch) => (
          <MenuItem key={branch.id} value={branch.id}>
            {branch.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SchoolBranchSelect;