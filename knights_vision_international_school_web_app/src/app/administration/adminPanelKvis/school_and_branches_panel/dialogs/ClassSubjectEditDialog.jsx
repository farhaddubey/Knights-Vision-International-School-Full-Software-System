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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { Edit, Close, Check } from '@mui/icons-material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast, ToastContainer } from 'react-toastify';
import SchoolSelect from "@/components/sure-success-point-school/selectors/SchoolSelect";
import SchoolBranchSelect from "@/components/sure-success-point-school/selectors/SchoolBranchSelect";
import SchoolClassSelect from "@/components/sure-success-point-school/selectors/SchoolClassSelect";
import SubjectSelect from "@/components/sure-success-point-school/selectors/SubjectSelect";
import TeacherSelect from "@/components/sure-success-point-school/selectors/TeacherSelect";

const drawerWidth = 280;
const appBarHeight = 64;

const selectStyles = {
  '& .MuiSelect-select': { color: '#fff' },
  '& .MuiInputLabel-root': { color: '#aaa' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00c853' },
  backgroundColor: '#333',
  borderRadius: '4px',
};

const ClassSubjectEditDialog = ({
  open,
  handleCloseModal,
  handleSaveAndCloseModal,
  classSubjectId,
  fetchClassSubjects,
}) => {
  const [fields, setFields] = useState({
    id: null,
    schoolId: '',
    branchId: '',
    classId: '',
    subjectId: '',
    teacherId: '',
    syllabus: { activities: [] },
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
          schoolId: classSubjectData.schoolId || '',
          branchId: classSubjectData.branchId || '',
          classId: classSubjectData.classId || '',
          subjectId: classSubjectData.subjectId || '',
          teacherId: classSubjectData.teacherId || '',
          syllabus: classSubjectData.syllabus || { activities: [] },
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

    if (!fields.schoolId || !fields.branchId || !fields.classId || !fields.subjectId || !fields.teacherId) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      const payload = {
        id: fields.id,
        schoolId: parseInt(fields.schoolId),
        branchId: parseInt(fields.branchId),
        classId: parseInt(fields.classId),
        subjectId: parseInt(fields.subjectId),
        teacherId: parseInt(fields.teacherId),
        syllabus: fields.syllabus,
      };

      await axios.put(`/api/class-subjects/${classSubjectId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('🎉 Class subject updated successfully!');
      handleSaveAndCloseModal();
    } catch (err) {
      console.error('Save Error:', err.response?.data || err.message);
      toast.error(err.response?.data?.error || '❌ Error updating class subject.');
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
        <ListItemText sx={{ color: '#fff' }} primary='Edit Class Subject' />
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
            <SchoolSelect
              selectedSchool={fields.schoolId}
              setSelectedSchool={(value) => handleFieldChange('schoolId', value)}
            />
            <SchoolBranchSelect
              selectedBranch={fields.branchId}
              setSelectedBranch={(value) => handleFieldChange('branchId', value)}
            />
            <FormControl fullWidth margin='normal' sx={selectStyles}>
              <InputLabel sx={{ color: '#aaa' }}>Class</InputLabel>
              <SchoolClassSelect
                selectedClass={fields.classId}
                setSelectedClass={(value) => handleFieldChange('classId', value)}
              />
            </FormControl>
            <FormControl fullWidth margin='normal' sx={selectStyles}>
              <InputLabel sx={{ color: '#aaa' }}>Subject</InputLabel>
              <SubjectSelect
                selectedSubject={fields.subjectId}
                setSelectedSubject={(value) => handleFieldChange('subjectId', value)}
              />
            </FormControl>
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
            Save Class Subject
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default ClassSubjectEditDialog;
