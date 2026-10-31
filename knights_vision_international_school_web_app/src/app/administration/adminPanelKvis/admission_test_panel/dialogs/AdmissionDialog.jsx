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
  Typography,
} from "@mui/material";
import { Add, RotateRight, Close } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import StudentSelect from '../../reuse_components/StudentSelect';
import SchoolBranchSelect from '../../reuse_components/SchoolBranchSelect';
import SchoolClassSelect from '../../reuse_components/SchoolClassSelect';
import SchoolSelect from '../../reuse_components/SchoolSelect';
import AdmissionTestApplicationSelect from '../../reuse_components/AdmissionTestApplicationSelect';

const drawerWidth = 280;
const appBarHeight = 64;

// Define AdmissionType values based on Prisma enum
const admissionTypeValues = ['NEW', 'TRANSFER', 'PROMOTION'];

const textFieldStyles = {
  '& .MuiInputBase-input': { color: '#fff' },
  '& .MuiInputLabel-root': { color: '#aaa' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00c853' },
  backgroundColor: '#333',
  borderRadius: '4px',
};

const AdmissionDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchAdmissions,
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
        studentId: field.studentId || null,
        branchId: field.branchId || null,
        schoolId: field.schoolId || null,
        classId: field.classId || null,
        admissionType: field.admissionType || 'NEW',
        admissionDate: field.admissionDate ? new Date(field.admissionDate).toISOString() : null,
        previousClassId: field.previousClassId || null,
        transferCertificateId: field.transferCertificateId || null,
        status: field.status || 'pending',
        applicationId: field.applicationId || null,
        ...(field.id && { id: field.id }),
      }));

      const updates = payloads.filter((p) => p.id);
      const creates = payloads.filter((p) => !p.id);

      for (const update of updates) {
        const { id, ...data } = update;
        await axios.put(`/api/admissions/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (creates.length > 0) {
        await axios.post(`/api/admissions`, creates, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      toast.success('🎉 Admission saved successfully!');
      handleSaveAndCloseModal();
      fetchAdmissions();
      setEditFields([{ 
        studentId: '', 
        branchId: '', 
        schoolId: '', 
        classId: '', 
        admissionType: 'NEW', 
        admissionDate: '', 
        previousClassId: '', 
        transferCertificateId: '', 
        status: 'pending',
        applicationId: '',
      }]);
    } catch (err) {
      console.error('Save Error:', err.response?.data || err.message);
      toast.error('❌ Error saving admission.');
    }
  };

  if (!editFields.length) {
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
          <ListItemText sx={{ color: "#fff" }} primary="Manage Admission" />
          <Button
            variant="outlined"
            sx={{ position: "absolute", right: 80, top: 8, color: "#00c853", bgcolor: "#212121" }}
            onClick={fetchAdmissions}
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
        <DialogContent>
          <Typography sx={{ color: '#fff', textAlign: 'center' }}>
            No admission data available. Please try again.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} variant="contained" color="error">Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

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
        <ListItemText sx={{ color: "#fff" }} primary="Manage Admission" />
        <Button
          variant="outlined"
          sx={{ position: "absolute", right: 80, top: 8, color: "#00c853", bgcolor: "#212121" }}
          onClick={fetchAdmissions}
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
                    <StudentSelect
                      selectedStudent={field.studentId}
                      setSelectedStudent={(value) => handleFieldChange(index, 'studentId', value)}
                    />
                    <AdmissionTestApplicationSelect
                      selectedApplication={field.applicationId}
                      setSelectedApplication={(value) => handleFieldChange(index, 'applicationId', value)}
                    />
                  </Box>
                ))}
              </Box>
              <Box sx={{ flex: 1, overflowY: "auto", pl: 1, maxHeight: "80vh" }}>
                {editFields.map((field, index) => (
                  <Box key={index}>
                    <FormControl sx={textFieldStyles} fullWidth margin="normal">
                      <InputLabel>Admission Type</InputLabel>
                      <Select
                        value={field.admissionType ?? 'NEW'}
                        onChange={(e) => handleFieldChange(index, 'admissionType', e.target.value)}
                      >
                        {admissionTypeValues.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      sx={textFieldStyles}
                      label="Admission Date"
                      type="date"
                      fullWidth
                      margin="normal"
                      value={field.admissionDate ?? ''}
                      onChange={(e) => handleFieldChange(index, 'admissionDate', e.target.value)}
                    />
                    <SchoolClassSelect
                      selectedClass={field.previousClassId}
                      setSelectedClass={(value) => handleFieldChange(index, 'previousClassId', value)}
                      label="Previous Class"
                    />
                    <TextField
                      sx={textFieldStyles}
                      label="Transfer Certificate ID"
                      fullWidth
                      margin="normal"
                      value={field.transferCertificateId ?? ''}
                      onChange={(e) => handleFieldChange(index, 'transferCertificateId', e.target.value)}
                    />
                    <FormControl sx={textFieldStyles} fullWidth margin="normal">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={field.status ?? 'pending'}
                        onChange={(e) => handleFieldChange(index, 'status', e.target.value)}
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                      </Select>
                    </FormControl>
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

export default AdmissionDialog;