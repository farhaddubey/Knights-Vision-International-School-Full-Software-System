// Shared Sure Success Point School selector.
import { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';
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

const AdmissionTestSelect = ({ selectedTest, setSelectedTest }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/api/admission-tests');
        if (!response.data || !Array.isArray(response.data.tests)) {
          throw new Error('Invalid response format: tests array missing');
        }
        setTests(response.data.tests);
      } catch (err) {
        console.error('Error fetching admission tests:', err);
        setError(err.response?.data?.error || 'Failed to fetch admission tests.');
        toast.error('Failed to fetch admission tests.');
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const handleChange = (event) => {
    setSelectedTest(event.target.value);
  };

  return (
    <FormControl sx={{ ...textFieldStyles, minWidth: '100%' }} fullWidth margin="normal">
      <InputLabel>Test</InputLabel>
      {loading ? (
        <CircularProgress size={24} sx={{ color: '#00c853', margin: 'auto' }} />
      ) : error ? (
        <Typography color="error" sx={{ textAlign: 'center' }}>
          {error}
        </Typography>
      ) : (
        <Select
          value={selectedTest ?? ''}
          onChange={handleChange}
          label="Test"
          required
        >
          <MenuItem value="">
            <em>Select Test</em>
          </MenuItem>
          {tests.map((test) => (
            <MenuItem key={test.id} value={test.id}>
              {test.name}
            </MenuItem>
          ))}
        </Select>
      )}
    </FormControl>
  );
};

export default AdmissionTestSelect;
