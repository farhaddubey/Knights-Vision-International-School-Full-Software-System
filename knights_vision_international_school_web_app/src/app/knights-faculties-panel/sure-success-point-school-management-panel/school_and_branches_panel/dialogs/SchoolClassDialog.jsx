import { useState } from 'react';
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
  IconButton,
  Typography,
} from '@mui/material';
import { Add, Close, Delete } from '@mui/icons-material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast, ToastContainer } from 'react-toastify';
import SchoolBranchSelect from '../../reuse_components/SchoolBranchSelect';
import SchoolSelect from '../../reuse_components/SchoolSelect';
import TeacherSelect from '../../reuse_components/TeacherSelect';

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

const SchoolClassDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchClasses,
}) => {
  const [commonFields, setCommonFields] = useState({
    branchId: editFields[0]?.branchId || '',
    schoolId: editFields[0]?.schoolId || '',
    academicYear: editFields[0]?.academicYear || 2025,
  });
  const [classEntries, setClassEntries] = useState(
    editFields.length > 0
      ? editFields.map((field) => ({
          id: field.id || null,
          name: field.name || '',
          section: field.section || '',
          roomNumber: field.roomNumber || '',
          teacherId: field.classTeacherId || '',
        }))
      : [{ id: null, name: '', section: '', roomNumber: '', teacherId: '' }]
  );

  const handleCommonFieldChange = (field, value) => {
    setCommonFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleClassEntryChange = (index, field, value) => {
    setClassEntries((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      )
    );
  };

  const addClassEntry = () => {
    setClassEntries((prev) => [
      ...prev,
      { id: null, name: '', section: '', roomNumber: '', teacherId: '' },
    ]);
  };

  const removeClassEntry = (index) => {
    if (classEntries.length === 1) {
      toast.error('At least one class entry is required.');
      return;
    }
    setClassEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveChanges = async () => {
    const token = Cookies.get('faculties_token');
    if (!token) {
      toast.error('User not authenticated.');
      return;
    }

    if (!commonFields.branchId || !commonFields.schoolId || !commonFields.academicYear) {
      toast.error('Please fill in School, Branch, and Academic Year.');
      return;
    }

    let hasError = false;
    const uniqueCheck = new Set();
    classEntries.forEach((entry, index) => {
      if (!entry.name) {
        toast.error(`Class Name is required for entry ${index + 1}.`);
        hasError = true;
      }
      if (entry.name.length > 20) {
        toast.error(`Class Name must be 20 characters or less for entry ${index + 1}.`);
        hasError = true;
      }
      if (entry.section && entry.section.length > 5) {
        toast.error(`Section must be 5 characters or less for entry ${index + 1}.`);
        hasError = true;
      }
      if (entry.roomNumber && entry.roomNumber.length > 50) {
        toast.error(`Room Number must be 50 characters or less for entry ${index + 1}.`);
        hasError = true;
      }
      const uniqueKey = `${commonFields.schoolId}-${commonFields.branchId}-${entry.name}-${entry.section || ''}-${commonFields.academicYear}`;
      if (uniqueCheck.has(uniqueKey)) {
        toast.error(`Duplicate class entry (Name: ${entry.name}, Section: ${entry.section || 'N/A'}) for entry ${index + 1}.`);
        hasError = true;
      }
      uniqueCheck.add(uniqueKey);
    });

    if (hasError) return;

    try {
      const payload = classEntries.map((entry) => ({
        branchId: parseInt(commonFields.branchId),
        schoolId: parseInt(commonFields.schoolId),
        name: entry.name,
        section: entry.section || null,
        roomNumber: entry.roomNumber || null,
        academicYear: parseInt(commonFields.academicYear),
        classTeacherId: entry.teacherId ? parseInt(entry.teacherId) : null,
        ...(entry.id && { id: entry.id }),
      }));

      console.log('Saving payload:', payload); // Debug payload

      await axios.post(`/api/school-classes`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('🎉 Classes saved successfully!');
      handleSaveAndCloseModal();
      fetchClasses();
      setCommonFields({ branchId: '', schoolId: '', academicYear: 2025 });
      setClassEntries([{ id: null, name: '', section: '', roomNumber: '', teacherId: '' }]);
    } catch (err) {
      console.error('Save Error:', err.response?.data || err.message);
      toast.error(err.response?.data?.error || '❌ Error saving classes.');
    }
  };

  return (
    <Dialog
      sx={{
        position: 'fixed',
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        transform: 'translate(0, 0)',
      }}
      open={openInsertion}
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
          <Add />
        </ListItemIcon>
        <ListItemText sx={{ color: '#fff' }} primary='Manage School Classes (Batch)' />
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
              Common Details
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
              Class Entries
            </Typography>
            {classEntries.map((entry, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #555', borderRadius: '4px' }}>
                <Typography variant='subtitle1' sx={{ mb: 1, color: '#fff' }}>
                  Class Entry {index + 1}
                </Typography>
                <TextField
                  sx={textFieldStyles}
                  label='Class Name'
                  fullWidth
                  margin='normal'
                  value={entry.name ?? ''}
                  onChange={(e) => handleClassEntryChange(index, 'name', e.target.value)}
                  required
                />
                <TextField
                  sx={textFieldStyles}
                  label='Section'
                  fullWidth
                  margin='normal'
                  value={entry.section ?? ''}
                  onChange={(e) => handleClassEntryChange(index, 'section', e.target.value)}
                />
                <TextField
                  sx={textFieldStyles}
                  label='Room Number'
                  fullWidth
                  margin='normal'
                  value={entry.roomNumber ?? ''}
                  onChange={(e) => handleClassEntryChange(index, 'roomNumber', e.target.value)}
                />
                <TeacherSelect
                  selectedTeacher={entry.teacherId}
                  setSelectedTeacher={(value) => handleClassEntryChange(index, 'teacherId', value)}
                />
                <IconButton
                  onClick={() => removeClassEntry(index)}
                  sx={{ color: '#f44336', mt: 1 }}
                  disabled={classEntries.length === 1}
                >
                  <Delete />
                </IconButton>
              </Box>
            ))}
            <Button
              variant='outlined'
              startIcon={<Add />}
              onClick={addClassEntry}
              sx={{ mt: 2, color: '#00c853', borderColor: '#00c853' }}
            >
              Add Class Entry
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} variant='contained' color='error'>
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} variant='contained' color='primary'>
            Save Classes
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default SchoolClassDialog;