import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import { Edit, Close, Check } from '@mui/icons-material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast, ToastContainer } from 'react-toastify';
import TeacherSelect from "@/components/sure-success-point-school/selectors/TeacherSelect";
import textDisabledFieldStyles from '@/src/app/mui_styles/TextDisableFieldStyles';
import selectStyles from '@/src/app/mui_styles/SelectStyles';
const drawerWidth = 280;
const appBarHeight = 64;


const ClassSubjectTeacherUpdateDialog = ({
  open,
  handleCloseModal,
  handleSaveAndCloseModal,
  classSubjectId,
  fetchClassSubjects,
}) => {
  const [fields, setFields] = useState({
    id: null,
    schoolName: '',
    branchName: '',
    className: '',
    subjectName: '',
    teacherId: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassSubjectData = async () => {
      if (!classSubjectId) return;
      const token = Cookies.get('administration_token');
      if (!token) {
        toast.error('User not authenticated.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await axios.get(`/api/class-subjects/${classSubjectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const classSubjectData = response.data;
        setFields({
          id: classSubjectData.id,
          schoolName: classSubjectData.school?.name || 'N/A',
          branchName: classSubjectData.branch?.name || 'N/A',
          className: classSubjectData.class?.name
            ? `${classSubjectData.class.name}${classSubjectData.class.section ? ` - ${classSubjectData.class.section}` : ''}`
            : 'N/A',
          subjectName: classSubjectData.subject?.name || 'N/A',
          teacherId: classSubjectData.teacherId || '',
        });
      } catch (err) {
        console.error('Error fetching class subject:', err);
        toast.error(err.response?.data?.error || 'Failed to fetch class subject data.');
      } finally {
        setLoading(false);
      }
    };

    if (open && classSubjectId) {
      fetchClassSubjectData();
    }
  }, [open, classSubjectId]);

  const handleFieldChange = (field, value) => {
    setFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    const token = Cookies.get('administration_token');
    if (!token) {
      toast.error('User not authenticated.');
      return;
    }

    if (!fields.teacherId) {
      toast.error('Please select a teacher.');
      return;
    }

    try {
      const payload = {
        id: fields.id,
        teacherId: parseInt(fields.teacherId),
      };

      await axios.put(`/api/class-subjects/${classSubjectId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('🎉 Teacher updated successfully!');
      handleSaveAndCloseModal();
    } catch (err) {
      console.error('Save Error:', err.response?.data || err.message);
      toast.error(err.response?.data?.error || '❌ Error updating teacher.');
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
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#000' }}>
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
        <ListItemText sx={{ color: '#fff' }} primary='Update Class Subject Teacher' />
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
              Class Subject Details
            </Typography>
            <TextField
              label="School"
              value={fields.schoolName}
              disabled
              fullWidth
              margin="normal"
              sx={textDisabledFieldStyles}
            />
            <TextField
              label="Branch"
              value={fields.branchName}
              disabled
              fullWidth
              margin="normal"
              sx={textDisabledFieldStyles}
            />
            <TextField
              label="Class"
              value={fields.className}
              disabled
              fullWidth
              margin="normal"
              sx={textDisabledFieldStyles}
            />
            <TextField
              label="Subject"
              value={fields.subjectName}
              disabled
              fullWidth
              margin="normal"
              sx={textDisabledFieldStyles}
            />
            <FormControl fullWidth margin='normal' sx={selectStyles}>
              <InputLabel sx={{ color: '#aaa' }}>Teacher</InputLabel>
              <TeacherSelect
                selectedTeacher={fields.teacherId}
                setSelectedTeacher={(value) => handleFieldChange('teacherId', value)}
              />
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} variant='contained' color='error'>
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} variant='contained' color='primary'>
            Save Teacher
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default ClassSubjectTeacherUpdateDialog;
