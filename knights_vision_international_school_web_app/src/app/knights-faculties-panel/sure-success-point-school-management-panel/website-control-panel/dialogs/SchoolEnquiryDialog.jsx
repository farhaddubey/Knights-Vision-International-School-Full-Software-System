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
import { Add, RotateRight, Close, QuestionAnswer } from '@mui/icons-material';
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

const SchoolEnquiryDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchEnquiries,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddField = () => {
    setEditFields([...editFields, {
      fullName: '',
      email: '',
      phone: '',
      role: 'STUDENT',
      enquiryType: 'GENERAL_QUERY',
      subject: '',
      message: '',
      attachmentUrl: '',
      schoolId: '',
      classOrGrade: '',
      identification: '',
      preferredContactMethod: 'EMAIL',
      status: 'PENDING',
      adminNotes: ''
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
        fullName: field.fullName || '',
        email: field.email || null,
        phone: field.phone || null,
        role: field.role || 'STUDENT',
        enquiryType: field.enquiryType || 'GENERAL_QUERY',
        subject: field.subject || '',
        message: field.message || '',
        attachmentUrl: field.attachmentUrl || null,
        schoolId: field.schoolId ? parseInt(field.schoolId) : null,
        classOrGrade: field.classOrGrade || null,
        identification: field.identification || null,
        preferredContactMethod: field.preferredContactMethod || 'EMAIL',
        status: field.status || 'PENDING',
        adminNotes: field.adminNotes || null,
        ...(field.id && { id: field.id }),
      }));

      const updates = payloads.filter((p) => p.id);
      const creates = payloads.filter((p) => !p.id);

      for (const update of updates) {
        const { id, ...data } = update;
        await axios.put(`/api/school-enquiry/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (creates.length > 0) {
        await axios.post(`/api/school-enquiry/get-for-admin`, creates, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      toast.success('🎉 Enquiries saved successfully!');
      handleSaveAndCloseModal();
      fetchEnquiries();
      setEditFields([{
        fullName: '',
        email: '',
        phone: '',
        role: 'STUDENT',
        enquiryType: 'GENERAL_QUERY',
        subject: '',
        message: '',
        attachmentUrl: '',
        schoolId: '',
        classOrGrade: '',
        identification: '',
        preferredContactMethod: 'EMAIL',
        status: 'PENDING',
        adminNotes: ''
      }]);
    } catch (err) {
      console.error('Save Error:', err.response?.data || err.message);
      toast.error('❌ Error saving enquiries.');
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
            <QuestionAnswer />
          </ListItemIcon>
          <ListItemText primary='Manage School Enquiries' />
          <Button
            onClick={fetchEnquiries}
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
                      label='Full Name'
                      fullWidth
                      margin='normal'
                      value={field.fullName ?? ''}
                      onChange={(e) => handleFieldChange(index, 'fullName', e.target.value)}
                      sx={textFieldStyles}
                    />
                    <TextField
                      label='Email'
                      fullWidth
                      margin='normal'
                      value={field.email ?? ''}
                      onChange={(e) => handleFieldChange(index, 'email', e.target.value)}
                      sx={textFieldStyles}
                    />
                    <TextField
                      label='Phone'
                      fullWidth
                      margin='normal'
                      value={field.phone ?? ''}
                      onChange={(e) => handleFieldChange(index, 'phone', e.target.value)}
                      sx={textFieldStyles}
                    />
                    <FormControl fullWidth sx={textFieldStyles}>
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={field.role ?? 'STUDENT'}
                        onChange={(e) => handleFieldChange(index, 'role', e.target.value)}
                      >
                        <MenuItem value='STUDENT'>Student</MenuItem>
                        <MenuItem value='GUARDIAN'>Guardian</MenuItem>
                        <MenuItem value='TEACHER'>Teacher</MenuItem>
                        <MenuItem value='OTHER'>Other</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl fullWidth sx={textFieldStyles}>
                      <InputLabel>Enquiry Type</InputLabel>
                      <Select
                        value={field.enquiryType ?? 'GENERAL_QUERY'}
                        onChange={(e) => handleFieldChange(index, 'enquiryType', e.target.value)}
                      >
                        <MenuItem value='ADMISSION'>Admission</MenuItem>
                        <MenuItem value='FEE'>Fee</MenuItem>
                        <MenuItem value='HOMEWORK'>Homework</MenuItem>
                        <MenuItem value='TEST_RESULT'>Test Result</MenuItem>
                        <MenuItem value='SYLLABUS'>Syllabus</MenuItem>
                        <MenuItem value='TRANSFER'>Transfer</MenuItem>
                        <MenuItem value='DISCIPLINE'>Discipline</MenuItem>
                        <MenuItem value='COMPLAINT'>Complaint</MenuItem>
                        <MenuItem value='FEEDBACK'>Feedback</MenuItem>
                        <MenuItem value='TECHNICAL_SUPPORT'>Technical Support</MenuItem>
                        <MenuItem value='GENERAL_QUERY'>General Query</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label='Subject'
                      fullWidth
                      margin='normal'
                      value={field.subject ?? ''}
                      onChange={(e) => handleFieldChange(index, 'subject', e.target.value)}
                      sx={textFieldStyles}
                    />
                    <TextField
                      label='Message'
                      fullWidth
                      margin='normal'
                      multiline
                      rows={4}
                      value={field.message ?? ''}
                      onChange={(e) => handleFieldChange(index, 'message', e.target.value)}
                      sx={textFieldStyles}
                    />
                    <TextField
                      label='Attachment URL'
                      fullWidth
                      margin='normal'
                      value={field.attachmentUrl ?? ''}
                      onChange={(e) => handleFieldChange(index, 'attachmentUrl', e.target.value)}
                      sx={textFieldStyles}
                    />
                    <TextField
                      label='School ID'
                      fullWidth
                      margin='normal'
                      value={field.schoolId ?? ''}
                      onChange={(e) => handleFieldChange(index, 'schoolId', e.target.value)}
                      sx={textFieldStyles}
                    />
                    <TextField
                      label='Class or Grade'
                      fullWidth
                      margin='normal'
                      value={field.classOrGrade ?? ''}
                      onChange={(e) => handleFieldChange(index, 'classOrGrade', e.target.value)}
                      sx={textFieldStyles}
                    />
                    <TextField
                      label='Identification'
                      fullWidth
                      margin='normal'
                      value={field.identification ?? ''}
                      onChange={(e) => handleFieldChange(index, 'identification', e.target.value)}
                      sx={textFieldStyles}
                    />
                    <FormControl fullWidth sx={textFieldStyles}>
                      <InputLabel>Preferred Contact Method</InputLabel>
                      <Select
                        value={field.preferredContactMethod ?? 'EMAIL'}
                        onChange={(e) => handleFieldChange(index, 'preferredContactMethod', e.target.value)}
                      >
                        <MenuItem value='EMAIL'>Email</MenuItem>
                        <MenuItem value='PHONE'>Phone</MenuItem>
                        <MenuItem value='WHATSAPP'>WhatsApp</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl fullWidth sx={textFieldStyles}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={field.status ?? 'PENDING'}
                        onChange={(e) => handleFieldChange(index, 'status', e.target.value)}
                      >
                        <MenuItem value='PENDING'>Pending</MenuItem>
                        <MenuItem value='RESPONDED'>Responded</MenuItem>
                        <MenuItem value='CLOSED'>Closed</MenuItem>
                        <MenuItem value='REJECTED'>Rejected</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label='Admin Notes'
                      fullWidth
                      margin='normal'
                      multiline
                      rows={4}
                      value={field.adminNotes ?? ''}
                      onChange={(e) => handleFieldChange(index, 'adminNotes', e.target.value)}
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
                  Add Enquiry
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

export default SchoolEnquiryDialog;