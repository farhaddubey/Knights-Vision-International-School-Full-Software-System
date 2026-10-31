import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  TextField,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Refresh, School, Apartment } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const drawerWidth = 280;
const appBarHeight = 64;
const greenAccent = '#00c853';

const DisplayPrayerAndOath = () => {
  const [schools, setSchools] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [prayerLeaders, setPrayerLeaders] = useState([]);
  const [oathLeaders, setOathLeaders] = useState([]);
  const [genderRatio, setGenderRatio] = useState({ boysDays: 2, girlsDays: 4 });
  const [selectedGender, setSelectedGender] = useState('MALE');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [academicYear, setAcademicYear] = useState(2025);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/get-info', { params: { type: 'schools' } });
      setSchools(response.data.schools || []);
    } catch (err) {
      console.error('Error fetching schools:', err);
      setError('Failed to fetch schools: ' + err.message);
      toast.error('Failed to fetch schools.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async (schoolId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/get-info', { params: { type: 'branches', schoolId } });
      setBranches(response.data.branches || []);
      setSelectedBranchId(null);
      setPrayerLeaders([]);
      setOathLeaders([]);
    } catch (err) {
      console.error('Error fetching branches:', err);
      setError('Failed to fetch branches: ' + err.message);
      toast.error('Failed to fetch branches.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async (branchId, date) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/get-info', { params: { type: 'prayer-oath', branchId, date, academicYear } });
      const assignments = response.data.assignments || [];
      const prayer = assignments.filter((a) => a.role === 'PRAYER').map((a) => a.student);
      const oath = assignments.filter((a) => a.role === 'OATH').map((a) => a.student);
      setPrayerLeaders(prayer);
      setOathLeaders(oath);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Failed to fetch assignments: ' + err.message);
      toast.error('Failed to fetch assignments.');
    } finally {
      setLoading(false);
    }
  };

  const assignLeaders = async () => {
    const token = Cookies.get('administration_token');
    if (!token) {
      toast.error('User not authenticated.');
      return;
    }

    if (!selectedBranchId) {
      toast.error('Please select a branch.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/get-info', {
        branchId: selectedBranchId,
        academicYear,
        date,
        genderRatio,
        gender: selectedGender,
      });
      setPrayerLeaders(response.data.prayerLeaders || []);
      setOathLeaders(response.data.oathLeaders || []);
      toast.success('🎉 Leaders assigned successfully!');
    } catch (err) {
      console.error('Error assigning leaders:', err);
      toast.error(`❌ Failed to assign leaders: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    if (selectedBranchId && date) {
      fetchAssignments(selectedBranchId, date);
    }
  }, [selectedBranchId, date, academicYear]);

  const handleSchoolClick = (schoolId) => {
    setSelectedSchoolId(schoolId);
    setSelectedBranchId(null);
    setBranches([]);
    setPrayerLeaders([]);
    setOathLeaders([]);
    fetchBranches(schoolId);
  };

  const handleBranchClick = (branchId) => {
    setSelectedBranchId(branchId);
    fetchAssignments(branchId, date);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#212121' }}>
        <CircularProgress size={120} sx={{ color: greenAccent }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color='error' sx={{ textAlign: 'center', mt: 4, bgcolor: '#212121' }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        width: `calc(100vw - ${drawerWidth}px)`,
        backgroundColor: '#212121',
        height: `calc(100vh - ${appBarHeight}px)`,
        color: '#fff',
        p: 2,
      }}
    >
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, bgcolor: '#181818', p: 2, borderRadius: 1 }}>
        <Typography variant='h6'>Prayer and Oath Assignment</Typography>
        <TextField
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          size='small'
          sx={{
            backgroundColor: '#333',
            borderRadius: '4px',
            '& .MuiInputBase-input': { color: '#fff' },
            '& .MuiInputLabel-root': { color: '#aaa' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: greenAccent },
          }}
        />
        <TextField
          label="Academic Year"
          type="number"
          value={academicYear}
          onChange={(e) => setAcademicYear(parseInt(e.target.value))}
          size='small'
          sx={{
            backgroundColor: '#333',
            borderRadius: '4px',
            '& .MuiInputBase-input': { color: '#fff' },
            '& .MuiInputLabel-root': { color: '#aaa' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: greenAccent },
          }}
        />
        <TextField
          label="Boys Days"
          type="number"
          value={genderRatio.boysDays}
          onChange={(e) => setGenderRatio({ ...genderRatio, boysDays: parseInt(e.target.value) || 0 })}
          size='small'
          sx={{
            backgroundColor: '#333',
            borderRadius: '4px',
            '& .MuiInputBase-input': { color: '#fff' },
            '& .MuiInputLabel-root': { color: '#aaa' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: greenAccent },
          }}
        />
        <TextField
          label="Girls Days"
          type="number"
          value={genderRatio.girlsDays}
          onChange={(e) => setGenderRatio({ ...genderRatio, girlsDays: parseInt(e.target.value) || 0 })}
          size='small'
          sx={{
            backgroundColor: '#333',
            borderRadius: '4px',
            '& .MuiInputBase-input': { color: '#fff' },
            '& .MuiInputLabel-root': { color: '#aaa' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: greenAccent },
          }}
        />
        <FormControl
          sx={{
            minWidth: 120,
            backgroundColor: '#333',
            borderRadius: '4px',
            '& .MuiInputBase-input': { color: '#fff' },
            '& .MuiInputLabel-root': { color: '#aaa' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: greenAccent },
          }}
          size="small"
        >
          <InputLabel sx={{ color: '#aaa' }}>Gender</InputLabel>
          <Select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            label="Gender"
            sx={{ color: '#fff' }}
          >
            <MenuItem value="MALE">Male</MenuItem>
            <MenuItem value="FEMALE">Female</MenuItem>
          </Select>
        </FormControl>
        <Button
          onClick={assignLeaders}
          variant='contained'
          sx={{ bgcolor: greenAccent, color: '#000', '&:hover': { bgcolor: '#00a548' } }}
        >
          <Refresh /> Assign Leaders
        </Button>
      </Box>

      <Box sx={{ bgcolor: '#181818', borderRadius: 2, overflow: 'hidden', mt: 2 }}>
        {!selectedSchoolId && (
          <>
            <Typography variant='h6' sx={{ p: 2, color: '#fff' }}>Schools</Typography>
            <List>
              {schools.map((school) => (
                <ListItemButton
                  key={school.id}
                  onClick={() => handleSchoolClick(school.id)}
                  sx={{ bgcolor: '#121212', mb: 1, borderRadius: 1 }}
                >
                  <ListItemIcon>
                    <School sx={{ color: greenAccent }} />
                  </ListItemIcon>
                  <ListItemText primary={school.name} secondary={school.address} />
                </ListItemButton>
              ))}
            </List>
          </>
        )}
        {selectedSchoolId && !selectedBranchId && (
          <>
            <Typography variant='h6' sx={{ p: 2, color: '#fff' }}>Branches</Typography>
            <List>
              {branches.map((branch) => (
                <ListItemButton
                  key={branch.id}
                  onClick={() => handleBranchClick(branch.id)}
                  sx={{ bgcolor: '#121212', mb: 1, borderRadius: 1 }}
                >
                  <ListItemIcon>
                    <Apartment sx={{ color: greenAccent }} />
                  </ListItemIcon>
                  <ListItemText primary={`${branch.name} (${branch.code})`} secondary={branch.address} />
                </ListItemButton>
              ))}
            </List>
          </>
        )}
        {selectedBranchId && (
          <>
            <Typography variant='h6' sx={{ p: 2, color: '#fff' }}>Prayer and Oath Leaders</Typography>
            <Box sx={{ p: 2, bgcolor: '#121212', borderRadius: 1 }}>
              <Typography variant='subtitle1' sx={{ color: '#fff', mb: 1 }}>
                Prayer Leaders:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {prayerLeaders.length > 0 ? (
                  prayerLeaders.map((student) => (
                    <Typography key={student.id} sx={{ color: '#fff' }}>
                      {`${student.firstName} ${student.lastName} (${student.class.name}${student.class.section ? '-' + student.class.section : ''})`}
                    </Typography>
                  ))
                ) : (
                  <Typography sx={{ color: '#fff' }}>No prayer leaders assigned for this date.</Typography>
                )}
              </Box>
              <Typography variant='subtitle1' sx={{ color: '#fff', mt: 2, mb: 1 }}>
                Prayer and Oath Leaders:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {[...prayerLeaders, ...oathLeaders].length > 0 ? (
                  [...prayerLeaders, ...oathLeaders].map((student) => (
                    <Typography key={student.id} sx={{ color: '#fff' }}>
                      {`${student.firstName} ${student.lastName} (${student.class.name}${student.class.section ? '-' + student.class.section : ''})`}
                    </Typography>
                  ))
                ) : (
                  <Typography sx={{ color: '#fff' }}>No leaders assigned for this date.</Typography>
                )}
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default DisplayPrayerAndOath;