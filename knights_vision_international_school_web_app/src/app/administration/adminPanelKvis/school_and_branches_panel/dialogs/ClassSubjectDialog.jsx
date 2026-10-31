import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
} from "@mui/material";
import { Add, Close, Delete } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import SchoolSelect from "@/components/sure-success-point-school/selectors/SchoolSelect";
import SchoolBranchSelect from "@/components/sure-success-point-school/selectors/SchoolBranchSelect";
import SchoolClassSelect from "@/components/sure-success-point-school/selectors/SchoolClassSelect";
import SubjectSelect from "@/components/sure-success-point-school/selectors/SubjectSelect";
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

const ClassSubjectDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchClassSubjects,
}) => {
  // State for common fields (schoolId, branchId)
  const [commonFields, setCommonFields] = useState({
    schoolId: editFields[0]?.schoolId || '',
    branchId: editFields[0]?.branchId || '',
  });

  // State for class entries, each containing subject-teacher assignments
  const [classEntries, setClassEntries] = useState(
    editFields.length > 0
      ? editFields.reduce((acc, field) => {
          const existingClass = acc.find((entry) => entry.classId === field.classId);
          if (existingClass) {
            existingClass.subjects.push({
              id: field.id || null,
              subjectId: field.subjectId || '',
              teacherId: field.teacherId || '',
            });
          } else {
            acc.push({
              classId: field.classId || '',
              subjects: [{ id: field.id || null, subjectId: field.subjectId || '', teacherId: field.teacherId || '' }],
            });
          }
          return acc;
        }, [])
      : [{ classId: '', subjects: [{ id: null, subjectId: '', teacherId: '' }] }]
  );

  // Handle changes to common fields
  const handleCommonFieldChange = (field, value) => {
    setCommonFields((prev) => ({ ...prev, [field]: value }));
  };

  // Handle changes to classId for a class entry
  const handleClassEntryChange = (classIndex, value) => {
    setClassEntries((prev) =>
      prev.map((entry, i) => (i === classIndex ? { ...entry, classId: value } : entry))
    );
  };

  // Handle changes to subject or teacher in a class entry
  const handleSubjectTeacherChange = (classIndex, subjectIndex, field, value) => {
    setClassEntries((prev) =>
      prev.map((entry, i) =>
        i === classIndex
          ? {
              ...entry,
              subjects: entry.subjects.map((subj, j) =>
                j === subjectIndex ? { ...subj, [field]: value } : subj
              ),
            }
          : entry
      )
    );
  };

  // Add a new class entry
  const addClassEntry = () => {
    setClassEntries((prev) => [
      ...prev,
      { classId: '', subjects: [{ id: null, subjectId: '', teacherId: '' }] },
    ]);
  };

  // Remove a class entry
  const removeClassEntry = (classIndex) => {
    if (classEntries.length === 1) {
      toast.error('At least one class entry is required.');
      return;
    }
    setClassEntries((prev) => prev.filter((_, i) => i !== classIndex));
  };

  // Add a new subject-teacher pair to a class entry
  const addSubjectTeacher = (classIndex) => {
    setClassEntries((prev) =>
      prev.map((entry, i) =>
        i === classIndex
          ? { ...entry, subjects: [...entry.subjects, { id: null, subjectId: '', teacherId: '' }] }
          : entry
      )
    );
  };

  // Remove a subject-teacher pair from a class entry
  const removeSubjectTeacher = (classIndex, subjectIndex) => {
    setClassEntries((prev) =>
      prev.map((entry, i) => {
        if (i === classIndex) {
          if (entry.subjects.length === 1) {
            toast.error('At least one subject-teacher assignment is required per class.');
            return entry;
          }
          return {
            ...entry,
            subjects: entry.subjects.filter((_, j) => j !== subjectIndex),
          };
        }
        return entry;
      })
    );
  };

  // Validate and save changes
  const handleSaveChanges = async () => {
    const token = Cookies.get('administration_token');
    if (!token) {
      toast.error('User not authenticated.');
      return;
    }

    // Validate common fields
    if (!commonFields.schoolId || !commonFields.branchId) {
      toast.error('Please select School and Branch.');
      return;
    }

    // Validate class entries and subject-teacher assignments
    let hasError = false;
    const uniqueCheck = new Set();
    const payload = [];

    classEntries.forEach((classEntry, classIndex) => {
      if (!classEntry.classId) {
        toast.error(`Class is required for entry ${classIndex + 1}.`);
        hasError = true;
      }
      classEntry.subjects.forEach((subj, subjIndex) => {
        if (!subj.subjectId) {
          toast.error(`Subject is required for subject entry ${subjIndex + 1} in class ${classIndex + 1}.`);
          hasError = true;
        }
        if (!subj.teacherId) {
          toast.error(`Teacher is required for subject entry ${subjIndex + 1} in class ${classIndex + 1}.`);
          hasError = true;
        }
        const uniqueKey = `${classEntry.classId}-${subj.subjectId}`;
        if (uniqueCheck.has(uniqueKey)) {
          toast.error(`Duplicate subject assignment for class ${classIndex + 1}, subject ${subjIndex + 1}.`);
          hasError = true;
        }
        uniqueCheck.add(uniqueKey);
        payload.push({
          id: subj.id || undefined,
          schoolId: parseInt(commonFields.schoolId),
          branchId: parseInt(commonFields.branchId),
          classId: parseInt(classEntry.classId),
          subjectId: parseInt(subj.subjectId),
          teacherId: parseInt(subj.teacherId),
          syllabus: { activities: [] }, // Default syllabus
        });
      });
    });

    if (hasError) return;

    try {
      await axios.post(`/api/class-subjects`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('🎉 Class-Subject assignments saved successfully!');
      handleSaveAndCloseModal();
      fetchClassSubjects();
      setCommonFields({ schoolId: '', branchId: '' });
      setClassEntries([{ classId: '', subjects: [{ id: null, subjectId: '', teacherId: '' }] }]);
    } catch (err) {
      console.error('Save Error:', err.response?.data || err.message);
      toast.error(err.response?.data?.error || '❌ Error saving class-subject assignments.');
    }
  };

  return (
    <Dialog
      sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        transform: "translate(0, 0)",
      }}
      open={openInsertion}
      onClose={handleCloseModal}
      fullScreen
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
          backgroundColor: "#212121",
          color: "#fff",
          "&:hover": { backgroundColor: "#212121" },
        }}
      >
        <ListItemIcon>
          <Add />
        </ListItemIcon>
        <ListItemText sx={{ color: "#fff" }} primary="Manage Class-Subject Assignments (Batch)" />
        <Button
          onClick={handleCloseModal}
          variant="outlined"
          color="error"
          sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
        >
          <Close />
        </Button>
      </ListItemButton>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#000", color: "#fff" }}>
        <DialogContent>
          <Box sx={{ maxWidth: "1200px", mx: "auto", p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#fff" }}>
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
            <Typography variant="h6" sx={{ mt: 3, mb: 2, color: "#fff" }}>
              Class and Subject Entries
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {classEntries.map((classEntry, classIndex) => (
                <Box
                  key={classIndex}
                  sx={{
                    width: { xs: '100%', md: 'calc(50% - 8px)' }, // Two entries per row
                    mb: 2,
                    p: 2,
                    border: '1px solid #555',
                    borderRadius: '4px',
                  }}
                >
                  <Typography variant="subtitle1" sx={{ mb: 1, color: "#fff" }}>
                    Class Entry {classIndex + 1}
                  </Typography>
                  <SchoolClassSelect
                    selectedClass={classEntry.classId}
                    setSelectedClass={(value) => handleClassEntryChange(classIndex, value)}
                  />
                  {classEntry.subjects.map((subj, subjIndex) => (
                    <Box key={subjIndex} sx={{ ml: 2, mt: 1, p: 1, border: '1px solid #444', borderRadius: '4px' }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: "#fff" }}>
                        Subject-Teacher Assignment {subjIndex + 1}
                      </Typography>
                      <SubjectSelect
                        selectedSubject={subj.subjectId}
                        setSelectedSubject={(value) => handleSubjectTeacherChange(classIndex, subjIndex, 'subjectId', value)}
                      />
                      <TeacherSelect
                        selectedTeacher={subj.teacherId}
                        setSelectedTeacher={(value) => handleSubjectTeacherChange(classIndex, subjIndex, 'teacherId', value)}
                      />
                      <IconButton
                        onClick={() => removeSubjectTeacher(classIndex, subjIndex)}
                        sx={{ color: '#f44336', mt: 1 }}
                        disabled={classEntry.subjects.length === 1}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  ))}
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => addSubjectTeacher(classIndex)}
                    sx={{ mt: 1, color: '#00c853', borderColor: '#00c853' }}
                  >
                    Add Subject-Teacher
                  </Button>
                  <IconButton
                    onClick={() => removeClassEntry(classIndex)}
                    sx={{ color: '#f44336', mt: 1, ml: 2 }}
                    disabled={classEntries.length === 1}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
            </Box>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={addClassEntry}
              sx={{ mt: 2, color: '#00c853', borderColor: '#00c853' }}
            >
              Add Class Entry
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} variant="contained" color="error">
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} variant="contained" color="primary">
            Save Assignments
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default ClassSubjectDialog;
