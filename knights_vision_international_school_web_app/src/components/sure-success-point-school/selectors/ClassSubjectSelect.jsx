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

const ClassSubjectSelect = ({ value, selectedClassSubject, setSelectedClassSubject }) => {
  const [classSubjects, setClassSubjects] = useState([]);
  const token = getActiveStaffPanelToken();

  useEffect(() => {
    const fetchClassSubjects = async () => {
      try {
        const response = await axios.get(`/api/class-subjects/select`, {
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
          name: `${item.class.name} - ${item.subject.name}`,
        }));

        setClassSubjects(formatted);
      } catch (error) {
        console.error("Error fetching class subjects:", error);
        toast.error('❌ Error fetching class subjects.');
      }
    };

    fetchClassSubjects();
  }, [token]);

  return (
    <FormControl sx={textFieldStyles} fullWidth margin="normal">
      <InputLabel>Select Class Subject</InputLabel>
      <Select value={selectedClassSubject} onChange={(e) => setSelectedClassSubject(e.target.value)}>
        {classSubjects.map((classSubject) => (
          <MenuItem key={classSubject.id} value={classSubject.id}>
            {classSubject.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ClassSubjectSelect;
