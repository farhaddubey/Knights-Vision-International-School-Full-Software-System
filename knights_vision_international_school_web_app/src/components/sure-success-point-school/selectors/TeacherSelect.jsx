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

const TeacherSelect = ({ value, selectedTeacher, setSelectedTeacher }) => {
  const [teachers, setTeachers] = useState([]);
  const token = getActiveStaffPanelToken();

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get(`/api/teachers/select`, {
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
          name: item.username || 'Unnamed Teacher',
        }));

        setTeachers(formatted);
      } catch (error) {
        console.error("Error fetching teachers:", error);
        toast.error('❌ Error fetching teachers.');
      }
    };

    fetchTeachers();
  }, [token]);

  return (
    <FormControl sx={textFieldStyles} fullWidth margin="normal">
      <InputLabel>Select Teacher</InputLabel>
      <Select value={selectedTeacher || ''} onChange={(e) => setSelectedTeacher(e.target.value || null)}>
        <MenuItem value="">None</MenuItem>
        {teachers.map((teacher) => (
          <MenuItem key={teacher.id} value={teacher.id}>
            {teacher.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default TeacherSelect;
