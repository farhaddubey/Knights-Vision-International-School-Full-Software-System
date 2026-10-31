import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import { Edit, Close, Check } from '@mui/icons-material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast, ToastContainer } from 'react-toastify';
import SchoolBranchSelect from "@/components/sure-success-point-school/selectors/SchoolBranchSelect";
import SchoolSelect from "@/components/sure-success-point-school/selectors/SchoolSelect";
import TeacherSelect from "@/components/sure-success-point-school/selectors/TeacherSelect";

const drawerWidth = 280;
const appBarHeight = 64;

const textFieldStyles = {
  '& .MuiInputBase-input': { color: '#fff' },
  '& .MuiInputLabel-root': { color: '#aaa' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00c853' },
  backgroundColor: '#333',
  borderRadius: '4px',
};

const selectStyles = {
  '& .MuiSelect-select': { color: '#fff' },
  '& .MuiInputLabel-root': { color: '#aaa' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00c853' },
  backgroundColor: '#333',
  borderRadius: '4px',
};

const SchoolClassEditDialog = ({
  open,
  handleCloseModal,
  handleSaveAndCloseModal,
  classId,
  fetchClasses,
}) => {
  const classOptions = [
    'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII',
    'IX', 'X', 'XS', 'XI', 'XII', 'XIIS', 'XIIIJ'
  ];
  const sectionOptions = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

  const [commonFields, setCommonFields] = useState({
    branchId: '',
    schoolId: '',
    academicYear: 2025,
  });
  const [classEntry, setClassEntry] = useState({
    id: null,
    name: '',
    section: '',
    roomNumber: '',
    teacherId: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassData = async () => {
      if (!classId) return;
      const token = Cookies.get('administration_token');
      if (!token) {
        toast.error('User not authenticated.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await axios.get(`/api/school-classes/${classId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const classData = response.data;
        setCommonFields({
          branchId: classData.branchId || '',
          schoolId: classData.schoolId || '',
          academicYear: classData.academicYear || 2025,
        });
        setClassEntry({
          id: classData.id,
          name: classData.name || '',
          section: classData.section || '',
          roomNumber: classData.roomNumber || '',
          teacherId: classData.classTeacherId || '',
        });
      } catch (err) {
        console.error('Error fetching class:', err);
        toast.error(err.response?.data?.error || 'Failed to fetch class data.');
      } finally {
        setLoading(false);
      }
    };

    if (open && classId) {
      fetchClassData();
    }
  }, [open, classId]);

  const handleCommonFieldChange = (field, value) => {
    setCommonFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleClassEntryChange = (field, value) => {
    setClassEntry((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    const token = Cookies.get('administration_token');
    if (!token) {
      toast.error('User not authenticated.');
      return;
    }

    if (!commonFields.branchId || !commonFields.schoolId || !commonFields.academicYear) {
      toast.error('Please fill in School, Branch, and Academic Year.');
      return;
    }

    if (!classEntry.name) {
      toast.error('Class Name is required.');
      return;
    }
    if (!classOptions.includes(classEntry.name)) {
      toast.error('Invalid Class Name.');
      return;
    }
    if (!classEntry.section) {
      toast.error('Section is required.');
      return;
    }
    if (!sectionOptions.includes(classEntry.section)) {
      toast.error('Invalid Section.');
      return;
    }
    if (classEntry.roomNumber && classEntry.roomNumber.length > 50) {
      toast.error('Room Number must be 50 characters or less.');
      return;
    }

    try {
      const payload = {
        id: classEntry.id,
        branchId: parseInt(commonFields.branchId),
        schoolId: parseInt(commonFields.schoolId),
        name: classEntry.name,
        section: classEntry.section || null,
        roomNumber: classEntry.roomNumber || null,
        academicYear: parseInt(commonFields.academicYear),
        classTeacherId: classEntry.teacherId ? parseInt(classEntry.teacherId) : null,
      };

      console.log('Saving payload:', payload); // Debug payload
      await axios.put(`/api/school-classes/${classId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('🎉 Class updated successfully!');
      handleSaveAndCloseModal();
    } catch (err) {
      console.error('Save Error:', err.response?.data || err.message);
      toast.error(err.response?.data?.error || '❌ Error updating class.');
    }
  };

  if (loading) {
    return (
      <Dialog
        sx={{
          position: 'fixed',
          top: `${appBarHeight}px`,
          left: `calc(${drawerWidth}px)`,
          transform: 'translate(0, 0)',

        }}
        open={open}
        onClose={handleCloseModal}
        fullScreen
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor:"#000" }}>
          <CircularProgress size={120} />
        </Box>
      </Dialog>
    );
  }

  return (
    <Dialog
      sx={{
        position: 'fixed',
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        transform: 'translate(0, 0)',
      }}
      open={open}
      onClose={handleCloseModal}
      fullScreen
    >
      <ToastContainer
        position='bottom-center'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='dark'
      />
      <ListItemButton
        sx={{
          backgroundColor: '#212121',
          color: '#fff',
          '&:hover': { backgroundColor: '#212121' },
        }}
      >
        <ListItemIcon>
          <Edit />
        </ListItemIcon>
        <ListItemText sx={{ color: '#fff' }} primary='Edit School Class' />
        <Button
          onClick={handleCloseModal}
          variant='outlined'
          color='error'
          sx={{ position: 'absolute', right: 8, top: 8, color: '#f44336' }}
        >
          <Close />
        </Button>
      </ListItemButton>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#000', color: '#fff' }}>
        <DialogContent>
          <Box sx={{ maxWidth: '600px', mx: 'auto', p: 2 }}>
            <Typography variant='h6' sx={{ mb: 2, color: '#fff' }}>
              Class Details
            </Typography>
            <SchoolSelect
              selectedSchool={commonFields.schoolId}
              setSelectedSchool={(value) => handleCommonFieldChange('schoolId', value)}
            />
            <SchoolBranchSelect
              selectedBranch={commonFields.branchId}
              setSelectedBranch={(value) => handleCommonFieldChange('branchId', value)}
            />
            <TextField
              sx={textFieldStyles}
              label='Academic Year'
              type='number'
              fullWidth
              margin='normal'
              value={commonFields.academicYear ?? 2025}
              onChange={(e) => handleCommonFieldChange('academicYear', parseInt(e.target.value))}
              required
            />
            <Typography variant='h6' sx={{ mt: 3, mb: 2, color: '#fff' }}>
              Class Entry
            </Typography>
            <Box sx={{ p: 2, border: '1px solid #555', borderRadius: '4px' }}>
              <FormControl fullWidth margin='normal' sx={selectStyles}>
                <InputLabel sx={{ color: '#aaa' }}>Class Name</InputLabel>
                <Select
                  value={classEntry.name ?? ''}
                  onChange={(e) => handleClassEntryChange('name', e.target.value)}
                  label='Class Name'
                  required
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {selected}
                      {selected && <Check sx={{ color: '#00c853', ml: 1 }} />}
                    </Box>
                  )}
                >
                  {classOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        {option}
                        {classEntry.name === option && <Check sx={{ color: '#00c853' }} />}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin='normal' sx={selectStyles}>
                <InputLabel sx={{ color: '#aaa' }}>Section</InputLabel>
                <Select
                  value={classEntry.section ?? ''}
                  onChange={(e) => handleClassEntryChange('section', e.target.value)}
                  label='Section'
                  required
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {selected}
                      {selected && <Check sx={{ color: '#00c853', ml: 1 }} />}
                    </Box>
                  )}
                >
                  {sectionOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        {option}
                        {classEntry.section === option && <Check sx={{ color: '#00c853' }} />}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                sx={textFieldStyles}
                label='Room Number'
                fullWidth
                margin='normal'
                value={classEntry.roomNumber ?? ''}
                onChange={(e) => handleClassEntryChange('roomNumber', e.target.value)}
              />
              <TeacherSelect
                selectedTeacher={classEntry.teacherId}
                setSelectedTeacher={(value) => handleClassEntryChange('teacherId', value)}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} variant='contained' color='error'>
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} variant='contained' color='primary'>
            Save Class
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default SchoolClassEditDialog;
