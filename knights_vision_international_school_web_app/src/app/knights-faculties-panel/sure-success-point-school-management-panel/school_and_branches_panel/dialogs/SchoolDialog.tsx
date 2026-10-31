import React, { useState } from 'react';
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
  CircularProgress,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { Add, RotateRight, Close, Image as ImageIcon } from '@mui/icons-material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

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

const SchoolDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchSchools,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddField = () => {
    setEditFields([...editFields, { name: '', city: '', address: '', type: 'LOCAL', logoUrl: '' }]);
  };

  const handleRemoveField = (index) => {
    setEditFields(editFields.filter((_, i) => i !== index));
  };

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

    setIsLoading(true);
    try {
      const payloads = editFields.map((field) => ({
        name: field.name || null,
        city: field.city || null,
        address: field.address || null,
        type: field.type || 'LOCAL',
        logoUrl: field.logoUrl || null,
        ...(field.id && { id: field.id }),
      }));

      const updates = payloads.filter((p) => p.id);
      const creates = payloads.filter((p) => !p.id);

      for (const update of updates) {
        const { id, ...data } = update;
        await axios.put(`/api/schools/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (creates.length > 0) {
        await axios.post(`/api/schools`, creates, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      toast.success('🎉 School saved successfully!');
      handleSaveAndCloseModal();
      fetchSchools();
      setEditFields([{ name: '', city: '', address: '', type: 'LOCAL', logoUrl: '' }]);
    } catch (err) {
      console.error('Save Error:', err.response?.data || err.message);
      toast.error('❌ Error saving school.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
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
        <ListItemButton
          sx={{
            backgroundColor: '#263238',
            color: '#fff',
            '&:hover': { backgroundColor: '#263238' },
          }}
        >
          <ListItemIcon>
            <ImageIcon />
          </ListItemIcon>
          <ListItemText primary='Manage School' />
          <Button
            onClick={fetchSchools}
            variant='outlined'
            sx={{ position: 'absolute', right: 90, top: 8, color: '#00c853', borderColor: '#00c853' }}
          >
            <RotateRight />
          </Button>
          <Button
            onClick={handleCloseModal}
            variant='outlined'
            color='error'
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </Button>
        </ListItemButton>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            height: '100%',
            backgroundColor: '#000',
            color: '#fff',
          }}
        >
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            <DialogContent>
              <Box sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
                {editFields.map((field, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 3,
                      p: 2,
                      border: '2px solid #333',
                      borderRadius: 2,
                      bgcolor: '#181818',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    <TextField
                      label='School Name'
                      fullWidth
                      margin='normal'
                      value={field.name ?? ''}
                      onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                      sx={textFieldStyles}
                    />
                    <TextField
                      label='City'
                      fullWidth
                      margin='normal'
                      value={field.city ?? ''}
                      onChange={(e) => handleFieldChange(index, 'city', e.target.value)}
                      sx={textFieldStyles}
                    />
                    <TextField
                      label='Address'
                      fullWidth
                      margin='normal'
                      value={field.address ?? ''}
                      onChange={(e) => handleFieldChange(index, 'address', e.target.value)}
                      sx={textFieldStyles}
                    />
                    <FormControl fullWidth margin='normal' sx={textFieldStyles}>
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={field.type ?? 'LOCAL'}
                        onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                      >
                        <MenuItem value='LOCAL'>Local</MenuItem>
                        <MenuItem value='REGIONAL'>Regional</MenuItem>
                        <MenuItem value='NATIONAL'>National</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label='Logo URL'
                      fullWidth
                      margin='normal'
                      value={field.logoUrl ?? ''}
                      onChange={(e) => handleFieldChange(index, 'logoUrl', e.target.value)}
                      sx={textFieldStyles}
                    />
                    {editFields.length > 1 && (
                      <IconButton color='error' onClick={() => handleRemoveField(index)}>
                        <Close />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button
                  variant='outlined'
                  color='primary'
                  startIcon={<Add />}
                  onClick={handleAddField}
                  sx={{ mt: 2 }}
                >
                  Add School
                </Button>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModal} variant='contained' color='error'>
                Cancel
              </Button>
              <Button onClick={handleSaveChanges} variant='contained' color='primary'>
                Save Changes
              </Button>
            </DialogActions>
          </Box>
        </Box>
      </Dialog>
      {isLoading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            zIndex: 9999,
            backgroundColor: 'rgba(2, 2, 20, 0.28)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backdropFilter: 'blur(2px)',
          }}
        >
          <CircularProgress size={180} />
        </Box>
      )}
    </Box>
  );
};

export default SchoolDialog;
