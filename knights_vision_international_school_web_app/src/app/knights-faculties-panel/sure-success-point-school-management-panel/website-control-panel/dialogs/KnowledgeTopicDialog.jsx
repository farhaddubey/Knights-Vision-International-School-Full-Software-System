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
import { Add, RotateRight, Close, Info } from '@mui/icons-material';
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

const topicTypes = ['HELP', 'KNOWLEDGE', 'TUTORIAL', 'BOOK_CONSULTANT'];

const KnowledgeTopicDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchTopics,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddField = () => {
    setEditFields([...editFields, {
      title: '',
      wikigalaxy_link: '',
      youtube_link: '',
      slug: '',
      type: 'HELP'
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
        title: field.title || '',
        wikigalaxy_link: field.wikigalaxy_link || null,
        youtube_link: field.youtube_link || null,
        slug: field.slug || '',
        type: field.type || 'HELP',
        ...(field.id && { id: field.id }),
      }));

      const updates = payloads.filter((p) => p.id);
      const creates = payloads.filter((p) => !p.id);

      for (const update of updates) {
        const { id, ...data } = update;
        await axios.put(`/api/knowledge-topics/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (creates.length > 0) {
        await axios.post(`/api/knowledge-topics/get-for-admin`, creates, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      toast.success('🎉 Topics saved successfully!');
      handleSaveAndCloseModal();
      fetchTopics();
      setEditFields([{
        title: '',
        wikigalaxy_link: '',
        youtube_link: '',
        slug: '',
        type: 'HELP'
      }]);
    } catch (err) {
      console.error('Save Error:', err.response?.data || err.message);
      toast.error('❌ Error saving topics.');
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
            <Info />
          </ListItemIcon>
          <ListItemText primary='Manage Knowledge Topics' />
          <Button
            onClick={fetchTopics}
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
                      label='Title'
                      fullWidth
                      margin='normal'
                      value={field.title ?? ''}
                      onChange={(e) => handleFieldChange(index, 'title', e.target.value)}
                      sx={textFieldStyles}
                      required
                    />
                    <TextField
                      label='WikiGalaxy Link'
                      fullWidth
                      margin='normal'
                      value={field.wikigalaxy_link ?? ''}
                      onChange={(e) => handleFieldChange(index, 'wikigalaxy_link', e.target.value)}
                      sx={textFieldStyles}
                    />
                    <TextField
                      label='YouTube Link'
                      fullWidth
                      margin='normal'
                      value={field.youtube_link ?? ''}
                      onChange={(e) => handleFieldChange(index, 'youtube_link', e.target.value)}
                      sx={textFieldStyles}
                    />
                    <TextField
                      label='Slug'
                      fullWidth
                      margin='normal'
                      value={field.slug ?? ''}
                      onChange={(e) => handleFieldChange(index, 'slug', e.target.value)}
                      sx={textFieldStyles}
                      required
                    />
                    <FormControl fullWidth sx={textFieldStyles}>
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={field.type ?? 'HELP'}
                        onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                      >
                        {topicTypes.map((type) => (
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
                  Add Topic
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

export default KnowledgeTopicDialog;