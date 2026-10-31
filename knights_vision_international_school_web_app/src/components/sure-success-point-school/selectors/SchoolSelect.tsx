// Shared Sure Success Point School selector.
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

const SchoolSelect = ({ value, selectedSchool, setSelectedSchool }) => {
  const [schools, setSchools] = useState([]);
  const token = getActiveStaffPanelToken();

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await axios.get(`/api/schools/select`, {
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

        setSchools(formatted);
      } catch (error) {
        console.error("Error fetching schools:", error);
        toast.error('❌ Error fetching schools.');
      }
    };

    fetchSchools();
  }, [token]);

  return (
    <FormControl sx={textFieldStyles} fullWidth margin="normal">
      <InputLabel>Select School</InputLabel>
      <Select value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)}>
        {schools.map((school) => (
          <MenuItem key={school.id} value={school.id}>
            {school.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SchoolSelect;
