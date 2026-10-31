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

const SubjectSelect = ({ value, selectedSubject, setSelectedSubject }) => {
  const [subjects, setSubjects] = useState([]);
  const token = getActiveStaffPanelToken();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(`/api/subjects/select`, {
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

        setSubjects(formatted);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        toast.error('❌ Error fetching subjects.');
      }
    };

    fetchSubjects();
  }, [token]);

  return (
    <FormControl sx={textFieldStyles} fullWidth margin="normal">
      <InputLabel>Select Subject</InputLabel>
      <Select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
        {subjects.map((subject) => (
          <MenuItem key={subject.id} value={subject.id}>
            {subject.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SubjectSelect;
