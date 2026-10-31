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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Checkbox,
} from '@mui/material';
import { Add, Close, Delete, Check } from '@mui/icons-material';
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

const SchoolClassDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchClasses,
}) => {
  const classOptions = [
    'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII',
    'IX', 'X', 'XS', 'XI', 'XII', 'XIIS', 'XIIIJ'
  ];
  const sectionOptions = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

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
          sections: field.section ? [{ section: field.section, roomNumber: field.roomNumber || '', teacherId: field.classTeacherId || '' }] : [],
        }))
      : [{ id: null, name: '', sections: [] }]
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

  const handleSectionChange = (index, sectionIndex, field, value) => {
    setClassEntries((prev) =>
      prev.map((entry, i) =>
        i === index
          ? {
              ...entry,
              sections: entry.sections.map((sec, j) =>
                j === sectionIndex ? { ...sec, [field]: value } : sec
              ),
            }
          : entry
      )
    );
  };

  const handleSectionsChange = (index, selectedSections) => {
    setClassEntries((prev) =>
      prev.map((entry, i) =>
        i === index
          ? {
              ...entry,
              sections: selectedSections.map((section) => ({
                section,
                roomNumber: entry.sections.find((s) => s.section === section)?.roomNumber || '',
                teacherId: entry.sections.find((s) => s.section === section)?.teacherId || '',
              })),
            }
          : entry
      )
    );
  };

  const addClassEntry = () => {
    setClassEntries((prev) => [
      ...prev,
      { id: null, name: '', sections: [] },
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
    const token = Cookies.get('administration_token');
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
    const payload = [];

    classEntries.forEach((entry, index) => {
      if (!entry.name) {
        toast.error(`Class Name is required for entry ${index + 1}.`);
        hasError = true;
        return;
      }
      if (!classOptions.includes(entry.name)) {
        toast.error(`Invalid Class Name for entry ${index + 1}.`);
        hasError = true;
        return;
      }
      if (entry.sections.length === 0) {
        toast.error(`At least one section is required for entry ${index + 1}.`);
        hasError = true;
        return;
      }

      entry.sections.forEach((sectionEntry, sectionIndex) => {
        if (sectionEntry.roomNumber && sectionEntry.roomNumber.length > 50) {
          toast.error(`Room Number must be 50 characters or less for ${entry.name} - Section ${sectionEntry.section} in entry ${index + 1}.`);
          hasError = true;
          return;
        }
        const uniqueKey = `${commonFields.schoolId}-${commonFields.branchId}-${entry.name}-${sectionEntry.section}-${commonFields.academicYear}`;
        if (uniqueCheck.has(uniqueKey)) {
          toast.error(`Duplicate class entry (Name: ${entry.name}, Section: ${sectionEntry.section}) for entry ${index + 1}.`);
          hasError = true;
          return;
        }
        uniqueCheck.add(uniqueKey);
        payload.push({
          branchId: parseInt(commonFields.branchId),
          schoolId: parseInt(commonFields.schoolId),
          name: entry.name,
          section: sectionEntry.section,
          roomNumber: sectionEntry.roomNumber || null,
          academicYear: parseInt(commonFields.academicYear),
          classTeacherId: sectionEntry.teacherId ? parseInt(sectionEntry.teacherId) : null,
          ...(entry.id && { id: entry.id }),
        });
      });
    });

    if (hasError) return;

    try {
      console.log('Saving payload:', payload); // Debug payload
      await axios.post(`/api/school-classes`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('🎉 Classes saved successfully!');
      handleSaveAndCloseModal();
      fetchClasses();
      setCommonFields({ branchId: '', schoolId: '', academicYear: 2025 });
      setClassEntries([{ id: null, name: '', sections: [] }]);
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
          <Box sx={{ maxWidth: '1200px', mx: 'auto', p: 2 }}>
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
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {classEntries.map((entry, index) => (
                <Box
                  key={index}
                  sx={{
                    width: { xs: '100%', md: 'calc(50% - 8px)' }, // Two entries per row
                    mb: 2,
                    p: 2,
                    border: '1px solid #555',
                    borderRadius: '4px',
                  }}
                >
                  <Typography variant='subtitle1' sx={{ mb: 1, color: '#fff' }}>
                    Class Entry {index + 1}
                  </Typography>
                  <FormControl fullWidth margin='normal' sx={selectStyles}>
                    <InputLabel sx={{ color: '#aaa' }}>Class Name</InputLabel>
                    <Select
                      value={entry.name ?? ''}
                      onChange={(e) => handleClassEntryChange(index, 'name', e.target.value)}
                      label='Class Name'
                      required
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {selected}
                          {selected && (
                            <Check sx={{ color: '#00c853', ml: 1 }} />
                          )}
                        </Box>
                      )}
                    >
                      {classOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            {option}
                            {entry.name === option && (
                              <Check sx={{ color: '#00c853' }} />
                            )}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth margin='normal' sx={selectStyles}>
                    <InputLabel sx={{ color: '#aaa' }}>Sections</InputLabel>
                    <Select
                      multiple
                      value={entry.sections.map((s) => s.section) ?? []}
                      onChange={(e) => handleSectionsChange(index, e.target.value)}
                      label='Sections'
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip
                              key={value}
                              label={value}
                              sx={{ color: '#fff', backgroundColor: '#555' }}
                              deleteIcon={<Check sx={{ color: '#00c853 !important' }} />}
                              onDelete={() => {}}
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {sectionOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          <Checkbox
                            checked={entry.sections.some((s) => s.section === option)}
                            sx={{ color: '#00c853', '&.Mui-checked': { color: '#00c853' } }}
                          />
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {entry.sections.map((sectionEntry, sectionIndex) => (
                    <Box key={sectionIndex} sx={{ mt: 2, pl: 2, borderLeft: '2px solid #555' }}>
                      <Typography variant='subtitle2' sx={{ mb: 1, color: '#fff' }}>
                        Section {sectionEntry.section}
                      </Typography>
                      <TextField
                        sx={textFieldStyles}
                        label={`Room Number (Section ${sectionEntry.section})`}
                        fullWidth
                        margin='normal'
                        value={sectionEntry.roomNumber ?? ''}
                        onChange={(e) => handleSectionChange(index, sectionIndex, 'roomNumber', e.target.value)}
                      />
                      <TeacherSelect
                        selectedTeacher={sectionEntry.teacherId}
                        setSelectedTeacher={(value) => handleSectionChange(index, sectionIndex, 'teacherId', value)}
                      />
                    </Box>
                  ))}
                  <IconButton
                    onClick={() => removeClassEntry(index)}
                    sx={{ color: '#f44336', mt: 1 }}
                    disabled={classEntries.length === 1}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
            </Box>
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
