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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { Add, RotateRight, Close, Event } from '@mui/icons-material';
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

const programTypes = [
  'REPUBLIC_DAY',
  'INDEPENDENCE_DAY',
  'FAREWELL_DAY',
  'TEACHERS_DAY',
  'ANNUAL_SPORTS_DAY',
  'ANNUAL_FUNCTION',
  'SCIENCE_EXHIBITION',
  'ART_CULTURAL_FEST',
  'CHILDRENS_DAY',
  'FOUNDATION_DAY',
  'FRESHERS_WELCOME',
  'CAREER_COUNSELLING_SEMINAR',
  'BLOOD_DONATION_CAMP',
  'SOCIAL_AWARENESS_DRIVE',
  'QUIZ_COMPETITION',
  'DEBATE_COMPETITION',
  'SPELL_BEE',
  'INTERHOUSE_COMPETITION',
  'YOGA_DAY',
  'STUDENTS_COUNCIL_ELECTION',
  'INTERNATIONAL_ENGLISH_DAY',
  'MATHS_WEEK',
  'COMPUTER_LITERACY_WEEK',
  'EDUCATIONAL_TOUR',
  'PARENT_TEACHER_MEETING'
];

const FeatureSchoolsProgramsDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchPrograms,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddField = () => {
    setEditFields([...editFields, {
      img_url: '',
      title: '',
      description: '',
      type: 'REPUBLIC_DAY'
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
    const token = Cookies.get('administration_token');
    if (!token) {
      toast.error('User not authenticated.');
      return;
    }

    setIsLoading(true);
    try {
      const payloads = editFields.map((field) => ({
        img_url: field.img_url || null,
        title: field.title || null,
        description: field.description || null,
        type: field.type || 'REPUBLIC_DAY',
        ...(field.id && { id: field.id }),
      }));

      const updates = payloads.filter((p) => p.id);
      const creates = payloads.filter((p) => !p.id);

      for (const update of updates) {
        const { id, ...data } = update;
        await axios.put(`/api/feature-schools-programs/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (creates.length > 0) {
        await axios.post(`/api/feature-schools-programs/get-for-admin`, creates, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      toast.success('🎉 Programs saved successfully!');
      handleSaveAndCloseModal();
      fetchPrograms();
      setEditFields([{
        img_url: '',
        title: '',
        description: '',
        type: 'REPUBLIC_DAY'
      }]);
    } catch (err) {
      console.error('Save Error:', err.response?.data || err.message);
      toast.error('❌ Error saving programs.');
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
            <Event />
          </ListItemIcon>
          <ListItemText primary='Manage School Programs' />
          <Button
            onClick={fetchPrograms}
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
                      label='Description'
                      fullWidth
                      margin='normal'
                      multiline
                      rows={4}
                      value={field.description ?? ''}
                      onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                      sx={textFieldStyles}
                    />
                    <FormControl fullWidth sx={textFieldStyles}>
                      <InputLabel>Program Type</InputLabel>
                      <Select
                        value={field.type ?? 'REPUBLIC_DAY'}
                        onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                      >
                        {programTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
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
                  Add Program
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

export default FeatureSchoolsProgramsDialog;