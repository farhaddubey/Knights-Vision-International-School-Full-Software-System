// Shared Sure Success Point School selector.
import { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { getActiveStaffPanelToken } from "@/src/lib/client/panelSession";

import { toast } from 'react-toastify';

const textFieldStyles = {
  '& .MuiInputBase-input': { color: '#fff' },
  '& .MuiInputLabel-root': { color: '#aaa' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00c853' },
  backgroundColor: '#333',
  borderRadius: '4px',
};

const AdmissionSelect = ({ selectedAdmission, setSelectedAdmission }) => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdmissions = async () => {
      const token = getActiveStaffPanelToken();
      if (!token) {
        setError('User not authenticated.');
        toast.error('User not authenticated.');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/api/admissions/select', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.data || !Array.isArray(response.data.admissions)) {
          throw new Error('Invalid response format: admissions array missing');
        }
        setAdmissions(response.data.admissions);
      } catch (err) {
        console.error('Error fetching admissions:', err);
        setError(err.response?.data?.error || 'Failed to fetch admissions.');
        toast.error('Failed to fetch admissions.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdmissions();
  }, []);

  const handleChange = (event) => {
    setSelectedAdmission(event.target.value);
  };

  return (
    <FormControl sx={{ ...textFieldStyles, minWidth: '100%' }} fullWidth margin="normal">
      <InputLabel>Admission</InputLabel>
      {loading ? (
        <CircularProgress size={24} sx={{ color: '#00c853', margin: 'auto' }} />
      ) : error ? (
        <Typography color="error" sx={{ textAlign: 'center' }}>
          {error}
        </Typography>
      ) : (
        <Select
          value={selectedAdmission ?? ''}
          onChange={handleChange}
          label="Admission"
          required
        >
          <MenuItem value="">
            <em>Select Admission</em>
          </MenuItem>
          {admissions.map((admission) => (
            <MenuItem key={admission.id} value={admission.id}>
              {admission.student ? `${admission.student.firstName} ${admission.student.lastName}` : `Admission ${admission.id}`}
            </MenuItem>
          ))}
        </Select>
      )}
    </FormControl>
  );
};

export default AdmissionSelect;
