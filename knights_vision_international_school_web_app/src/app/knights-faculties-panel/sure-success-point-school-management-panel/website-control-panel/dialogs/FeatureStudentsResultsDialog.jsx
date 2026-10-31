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
} from '@mui/material';
import { Add, RotateRight, Close, Image } from '@mui/icons-material';
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

const FeatureStudentsResultsDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchResults,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddField = () => {
    setEditFields([...editFields, {
      img_url: '',
      title: '',
      position: '',
      marks: '',
      pass_year: '',
      college: '',
      designation: '',
      qualified_profession_year: '',
      highest_awards: '',
      highest_respect: ''
    }]);
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
        img_url: field.img_url || null,
        title: field.title || null,
        position: field.position || null,
        marks: field.marks || null,
        pass_year: field.pass_year || null,
        college: field.college || null,
        designation: field.designation || null,
        qualified_profession_year: field.qualified_profession_year || null,
        highest_awards: field.highest_awards || null,
        highest_respect: field.highest_respect || null,
        ...(field.id && { id: field.id }),
      }));

      const updates = payloads.filter((p) => p.id);
      const creates = payloads.filter((p) => !p.id);

      for (const update of updates) {
        const { id, ...data } = update;
        await axios.put(`/api/feature-students-results/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (creates.length > 0) {
        await axios.post(`/api/feature-students-results/get-for-admin`, creates, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      toast.success('🎉 Student results saved successfully!');
      handleSaveAndCloseModal();
      fetchResults();
      setEditFields([{
        img_url: '',
        title: '',
        position: '',
        marks: '',
        pass_year: '',
        college: '',
        designation: '',
        qualified_profession_year: '',
        highest_awards: '',
        highest_respect: ''
      }]);
    } catch (err) {
      console.error('Save Error:', err.response?.data || err.message);
      toast.error('❌ Error saving student results.');
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
            <Image />
          </ListItemIcon>
          <ListItemText primary='Manage Student Results' />
          <Button
            onClick={fetchResults}
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
                      label='Image URL'
                      fullWidth
                      margin='normal'
                      value={field.img_url ?? ''}
                      onChange={(e) => handleFieldChange(index, 'img_url', e.target.value)}
                      sx={textFieldStyles}
                    />
                    <TextField
                      label='Title'
                      fullWidth
                      margin='normal'
                      value={field.title ?? ''}
                      onChange={(e) => handleFieldChange(index, 'title', e.target.value)}
                      sx={textFieldStyles}
                    />
                    <TextField
                      label='Position'
                      fullWidth
                      margin='normal'
                      value={field.position ?? ''}
                      onChange={(e) => handleFieldChange(index, 'position', e.target.value)}
                      sx={textFieldStyles}
                    />
                    <TextField
                      label='Marks'
                      fullWidth
                      margin='normal'
                      value={field.marks ?? ''}
                      onChange={(e) => handleFieldChange(index, 'marks', e.target.value)}
                      sx={textFieldStyles}
                    />
                    <TextField
                      label='Pass Year'
                      fullWidth
                      margin='normal'
                      value={field.pass_year ?? ''}
                      onChange={(e) => handleFieldChange(index, 'pass_year', e.target.value)}
                      sx={textFieldStyles}
                    />
                    <TextField
                      label='College'
                      fullWidth
                      margin='normal'
                      value={field.college ?? ''}
                      onChange={(e) => handleFieldChange(index, 'college', e.target.value)}
                      sx={textFieldStyles}
                    />
                    <TextField
                      label='Designation'
                      fullWidth
                      margin='normal'
                      value={field.designation ?? ''}
                      onChange={(e) => handleFieldChange(index, 'designation', e.target.value)}
                      sx={textFieldStyles}
                    />
                    <TextField
                      label='Qualified Profession Year'
                      fullWidth
                      margin='normal'
                      value={field.qualified_profession_year ?? ''}
                      onChange={(e) => handleFieldChange(index, 'qualified_profession_year', e.target.value)}
                      sx={textFieldStyles}
                    />
                    <TextField
                      label='Highest Awards'
                      fullWidth
                      margin='normal'
                      value={field.highest_awards ?? ''}
                      onChange={(e) => handleFieldChange(index, 'highest_awards', e.target.value)}
                      sx={textFieldStyles}
                    />
                    <TextField
                      label='Highest Respect'
                      fullWidth
                      margin='normal'
                      value={field.highest_respect ?? ''}
                      onChange={(e) => handleFieldChange(index, 'highest_respect', e.target.value)}
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
                  Add Student Result
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

export default FeatureStudentsResultsDialog;