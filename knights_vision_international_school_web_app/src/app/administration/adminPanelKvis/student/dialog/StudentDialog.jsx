import { useState } from "react";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Add, RotateRight, Close } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import SchoolBranchSelect from '../../reuse_components/SchoolBranchSelect';
import SchoolClassSelect from '../../reuse_components/SchoolClassSelect';
import SchoolSelect from '../../reuse_components/SchoolSelect';

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

const StudentDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchStudents,
}) => {
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

    try {
      const payloads = editFields.map((field) => ({
        branchId: field.branchId || null,
        schoolId: field.schoolId || null,
        classId: field.classId || null,
        firstName: field.firstName || null,
        lastName: field.lastName || null,
        dateOfBirth: field.dateOfBirth ? new Date(field.dateOfBirth).toISOString() : null,
        admissionDate: field.admissionDate ? new Date(field.admissionDate).toISOString() : null,
        rollNumber: field.rollNumber || null,
        status: field.status || 'ACTIVE',
        guardianContact: field.guardianContact || null,
        healthImmunization: field.healthImmunization || { records: [] },
        ...(field.id && { id: field.id }),
      }));

      const updates = payloads.filter((p) => p.id);
      const creates = payloads.filter((p) => !p.id);

      for (const update of updates) {
        const { id, ...data } = update;
        await axios.put(`/api-schools-panel/students/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (creates.length > 0) {
        for (const create of creates) {
          await axios.post(`/api-schools-panel/students`, create, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }

      toast.success('🎉 Student saved successfully!');
      handleSaveAndCloseModal();
      fetchStudents();
      setEditFields([{ branchId: '', schoolId: '', classId: '', firstName: '', lastName: '', dateOfBirth: '', admissionDate: '', rollNumber: '', status: 'ACTIVE', guardianContact: '', healthImmunization: { records: [] } }]);
    } catch (err) {
      console.error('Save Error:', err.response?.data || err.message);
      toast.error('❌ Error saving student.');
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
          "&:hover": { backgroundColor: "#212121" }
        }}
      >
        <ListItemIcon>
          <Add />
        </ListItemIcon>
        <ListItemText sx={{ color: "#fff" }} primary="Manage Student" />
        <Button
          variant="outlined"
          sx={{ position: "absolute", right: 80, top: 8, color: "#00c853", bgcolor: "#212121" }}
          onClick={fetchStudents}
        >
          <RotateRight />
        </Button>
        <Button
          onClick={handleCloseModal}
          variant="outlined"
          color="error"
          sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
        >
          <Close />
        </Button>
      </ListItemButton>
      <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#000", color: "#fff" }}>
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "row", height: "100%", backgroundColor: "#000", color: "#fff", p: 2 }}>
              <Box sx={{ flex: 1, overflowY: "auto", pr: 1, maxHeight: "80vh" }}>
                {editFields.map((field, index) => (
                  <Box key={index}>
                    <SchoolSelect
                      selectedSchool={field.schoolId}
                      setSelectedSchool={(value) => handleFieldChange(index, 'schoolId', value)}
                    />
                    <SchoolBranchSelect
                      selectedBranch={field.branchId}
                      setSelectedBranch={(value) => handleFieldChange(index, 'branchId', value)}
                    />
                    <SchoolClassSelect
                      selectedClass={field.classId}
                      setSelectedClass={(value) => handleFieldChange(index, 'classId', value)}
                    />
                    <TextField
                      sx={textFieldStyles}
                      label="First Name"
                      fullWidth-runtime
                      margin="normal"
                      value={field.firstName ?? ''}
                      onChange={(e) => handleFieldChange(index, 'firstName', e.target.value)}
                    />
                    <TextField
                      sx={textFieldStyles}
                      label="Last Name"
                      fullWidth
                      margin="normal"
                      value={field.lastName ?? ''}
                      onChange={(e) => handleFieldChange(index, 'lastName', e.target.value)}
                    />
                  </Box>
                ))}
              </Box>
              <Box sx={{ flex: 1, overflowY: "auto", pl: 1, maxHeight: "80vh" }}>
                {editFields.map((index) => (
                  <Box key={index}>
                    <TextField
                      sx={textFieldStyles}
                      label="Date of Birth"
                      type="date"
                      fullWidth
                      margin="normal"
                      value={editFields[index].dateOfBirth ?? ''}
                      onChange={(e) => handleFieldChange(index, 'dateOfBirth', e.target.value)}
                    />
                    <TextField
                      sx={textFieldStyles}
                      label="Admission Date"
                      type="date"
                      fullWidth
                      margin="normal"
                      value={editFields[index].admissionDate ?? ''}
                      onChange={(e) => handleFieldChange(index, 'admissionDate', e.target.value)}
                    />
                    <TextField
                      sx={textFieldStyles}
                      label="Roll Number"
                      fullWidth
                      margin="normal"
                      value={editFields[index].rollNumber ?? ''}
                      onChange={(e) => handleFieldChange(index, 'rollNumber', e.target.value)}
                    />
                    <FormControl sx={textFieldStyles} fullWidth margin="normal">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={editFields[index].status ?? 'ACTIVE'}
                        onChange={(e) => handleFieldChange(index, 'status', e.target.value)}
                      >
                        <MenuItem value="ACTIVE">Active</MenuItem>
                        <MenuItem value="INACTIVE">Inactive</MenuItem>
                        <MenuItem value="SUSPENDED">Suspended</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      sx={textFieldStyles}
                      label="Guardian Contact"
                      fullWidth
                      margin="normal"
                      value={editFields[index].guardianContact ?? ''}
                      onChange={(e) => handleFieldChange(index, 'guardianContact', e.target.value)}
                    />
                    <TextField
                      sx={textFieldStyles}
                      label="Health Immunization (JSON)"
                      fullWidth
                      margin="normal"
                      multiline
                      rows={4}
                      value={JSON.stringify(editFields[index].healthImmunization, null, 2) ?? '{}'}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          handleFieldChange(index, 'healthImmunization', parsed);
                        } catch {
                          // Ignore invalid JSON for now
                        }
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} variant="contained" color="error">Cancel</Button>
            <Button onClick={handleSaveChanges} variant="contained" color="primary">Save</Button>
          </DialogActions>
        </Box>
      </Box>
    </Dialog>
  );
};

export default StudentDialog;
