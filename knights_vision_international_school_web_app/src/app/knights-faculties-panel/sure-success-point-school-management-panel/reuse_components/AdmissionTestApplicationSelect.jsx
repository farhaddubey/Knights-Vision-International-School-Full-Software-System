import axios from "axios";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
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

const AdmissionTestApplicationSelect = ({ value, selectedApplication, setSelectedApplication }) => {
  const [applications, setApplications] = useState([]);
  const token = Cookies.get('faculties_token');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get(`/api/admission-test-applications/select`, {
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

        setApplications(formatted);
      } catch (error) {
        console.error("Error fetching admission test applications:", error);
        toast.error('❌ Error fetching applications.');
      }
    };

    fetchApplications();
  }, [token]);

  return (
    <FormControl sx={textFieldStyles} fullWidth margin="normal">
      <InputLabel>Select Application</InputLabel>
      <Select value={selectedApplication} onChange={(e) => setSelectedApplication(e.target.value)}>
        {applications.map((application) => (
          <MenuItem key={application.id} value={application.id}>
            {application.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default AdmissionTestApplicationSelect;