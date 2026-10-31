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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Edit, Close } from '@mui/icons-material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast, ToastContainer } from 'react-toastify';

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

const readOnlyStyles = {
  ...textFieldStyles,
  '& .MuiInputBase-input': { color: '#aaa', cursor: 'not-allowed' },
};

const TestMarkEntryDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchApplications,
}) => {
  const handleFieldChange = (index, field, value) => {
    const updatedFields = [...editFields];
    updatedFields[index] = { ...updatedFields[index], [field]: value };
    setEditFields(updatedFields);
  };

  const handleSaveChanges = async () => {
    const token = Cookies.get('faculties_token');
    if (!token) {
      toast.error('User not authenticated.');
      return;
    }

    if (!editFields[0].totalMarks || editFields[0].qualified === undefined) {
      toast.error('Please fill all required fields (Total Marks, Qualified).');
      return;
    }

    try {
      const payload = {
        totalMarks: parseFloat(editFields[0].totalMarks),
        qualified: editFields[0].qualified,
      };
      await axios.put(`/api/admission-test-applications/fetch-test-related/${editFields[0].id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('🎉 Marks and qualification status updated successfully!');
      handleSaveAndCloseModal();
      fetchApplications();
      setEditFields([]);
    } catch (err) {
      console.error('Save Error:', err.response?.data || err.message);
      toast.error('❌ Error updating marks.');
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
      fullWidth
      maxWidth="sm"
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
        <ListItemText sx={{ color: '#fff' }} primary="Enter Test Marks" />
        <Button
          onClick={handleCloseModal}
          variant="outlined"
          color="error"
          sx={{ position: 'absolute', right: 8, top: 8, color: '#f44336' }}
        >
          <Close />
        </Button>
      </ListItemButton>
      <DialogContent sx={{ backgroundColor: '#000', color: '#fff' }}>
        {editFields.map((field, index) => (
          <Box key={index}>
            <TextField
              sx={readOnlyStyles}
              label="First Name"
              fullWidth
              margin="normal"
              value={field.firstName ?? ''}
              InputProps={{ readOnly: true }}
            />
            <TextField
              sx={readOnlyStyles}
              label="Last Name"
              fullWidth
              margin="normal"
              value={field.lastName ?? ''}
              InputProps={{ readOnly: true }}
            />
            <TextField
              sx={readOnlyStyles}
              label="Class"
              fullWidth
              margin="normal"
              value={field.className ?? ''}
              InputProps={{ readOnly: true }}
            />
            <TextField
              sx={textFieldStyles}
              label="Total Marks"
              type="number"
              fullWidth
              margin="normal"
              value={field.totalMarks ?? ''}
              onChange={(e) => handleFieldChange(index, 'totalMarks', e.target.value)}
              required
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.qualified ?? false}
                  onChange={(e) => handleFieldChange(index, 'qualified', e.target.checked)}
                  sx={{ color: '#fff', '&.Mui-checked': { color: '#00c853' } }}
                />
              }
              label="Qualified"
              sx={{ color: '#fff', mt: 2 }}
            />
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseModal} variant="contained" color="error">Cancel</Button>
        <Button onClick={handleSaveChanges} variant="contained" color="primary">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TestMarkEntryDialog;