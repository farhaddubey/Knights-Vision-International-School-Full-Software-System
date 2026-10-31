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
} from "@mui/material";
import { Add, Close } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
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

const SchoolBranchDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchBranches,
}) => {
  // Use a single object for editFields instead of an array
  const [fields, setFields] = useState(
    editFields[0] || {
      schoolId: '',
      name: '',
      code: '',
      slug: '',
      address: '',
      roomNumber: '',
    }
  );

  const handleFieldChange = (field, value) => {
    setFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    const token = Cookies.get('faculties_token');
    if (!token) {
      toast.error('User not authenticated.');
      return;
    }

    // Validate required fields
    if (!fields.schoolId || !fields.name || !fields.code || !fields.slug) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      const payload = {
        schoolId: parseInt(fields.schoolId),
        name: fields.name,
        code: fields.code,
        slug: fields.slug,
        address: fields.address || null,
        roomNumber: fields.roomNumber || null,
        ...(fields.id && { id: fields.id }),
      };

      if (fields.id) {
        // Update existing branch
        await axios.put(`/api/school-branches/${fields.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Create new branch
        await axios.post(`/api/school-branches`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      toast.success('🎉 Branch saved successfully!');
      handleSaveAndCloseModal();
      fetchBranches();
      setFields({ schoolId: '', name: '', code: '', slug: '', address: '', roomNumber: '' });
    } catch (err) {
      console.error('Save Error:', err.response?.data || err.message);
      toast.error('❌ Error saving branch.');
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
        <ListItemText sx={{ color: "#fff" }} primary="Manage School Branch" />
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
          <Box sx={{ maxWidth: "600px", mx: "auto", p: 2 }}>
            <SchoolSelect
              selectedSchool={fields.schoolId}
              setSelectedSchool={(value) => handleFieldChange('schoolId', value)}
            />
            <TextField
              sx={textFieldStyles}
              label="Branch Name"
              fullWidth
              margin="normal"
              value={fields.name ?? ''}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              required
            />
            <TextField
              sx={textFieldStyles}
              label="Branch Code"
              fullWidth
              margin="normal"
              value={fields.code ?? ''}
              onChange={(e) => handleFieldChange('code', e.target.value)}
              required
            />
            <TextField
              sx={textFieldStyles}
              label="Slug"
              fullWidth
              margin="normal"
              value={fields.slug ?? ''}
              onChange={(e) => handleFieldChange('slug', e.target.value)}
              required
            />
            <TextField
              sx={textFieldStyles}
              label="Address"
              fullWidth
              margin="normal"
              value={fields.address ?? ''}
              onChange={(e) => handleFieldChange('address', e.target.value)}
            />
            <TextField
              sx={textFieldStyles}
              label="Room Number"
              fullWidth
              margin="normal"
              value={fields.roomNumber ?? ''}
              onChange={(e) => handleFieldChange('roomNumber', e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} variant="contained" color="error">
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default SchoolBranchDialog;