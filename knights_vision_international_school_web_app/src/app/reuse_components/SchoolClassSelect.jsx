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

const SchoolClassSelect = ({ value, selectedClass, setSelectedClass }) => {
  const [classes, setClasses] = useState([]);
  const token = getActiveStaffPanelToken();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get(`/api/school-classes/select`, {
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
          name: `${item.name}${item.section ? ` - ${item.section}` : ''}`,
        }));

        setClasses(formatted);
      } catch (error) {
        console.error("Error fetching classes:", error);
        toast.error('❌ Error fetching classes.');
      }
    };

    fetchClasses();
  }, [token]);

  return (
    <FormControl sx={textFieldStyles} fullWidth>
      <InputLabel>Select Class</InputLabel>
      <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
        {classes.map((classItem) => (
          <MenuItem key={classItem.id} value={classItem.id}>
            {classItem.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SchoolClassSelect;