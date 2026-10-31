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

const StudentSelect = ({ value, selectedStudent, setSelectedStudent }) => {
  const [students, setStudents] = useState([]);
  const token = getActiveStaffPanelToken();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`/api/students/select`, {
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
          name: `${item.firstName} ${item.lastName}`,
        }));

        setStudents(formatted);
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error('❌ Error fetching students.');
      }
    };

    fetchStudents();
  }, [token]);

  return (
    <FormControl sx={textFieldStyles} fullWidth margin="normal">
      <InputLabel>Select Student</InputLabel>
      <Select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
        {students.map((student) => (
          <MenuItem key={student.id} value={student.id}>
            {student.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default StudentSelect;
