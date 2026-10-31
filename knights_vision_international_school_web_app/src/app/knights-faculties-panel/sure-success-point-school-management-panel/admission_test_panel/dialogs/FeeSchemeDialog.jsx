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
  IconButton,
} from "@mui/material";
import { Add, Close, Delete } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import SchoolClassSelect from '../../reuse_components/SchoolClassSelect';

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

const categoryOptions = [
  'ECONOMICAL_PLUS_KSAT',
  'ECONOMICAL_KSAT',
  'STANDARD_KSAT',
  'GENERAL_KSAT',
  'GENERAL_DIRECT',
];

const FeeSchemeDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchFeeSchemes,
}) => {
  // State for common fields (classId)
  const [classId, setClassId] = useState(editFields[0]?.classId || '');

  // State for fee scheme entries
  const [feeSchemes, setFeeSchemes] = useState(
    editFields.length > 0
      ? editFields.map((field) => ({
          id: field.id || null,
          category: field.category || '',
          monthlyFee: field.monthlyFee || '',
          admissionFee: field.admissionFee || '',
          readmissionFee: field.readmissionFee || '',
        }))
      : [{ id: null, category: '', monthlyFee: '', admissionFee: '', readmissionFee: '' }]
  );

  // Handle changes to classId
  const handleClassIdChange = (value) => {
    setClassId(value);
  };

  // Handle changes to fee scheme fields
  const handleFeeSchemeChange = (index, field, value) => {
    setFeeSchemes((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      )
    );
  };

  // Add a new fee scheme entry
  const addFeeSchemeEntry = () => {
    setFeeSchemes((prev) => [
      ...prev,
      { id: null, category: '', monthlyFee: '', admissionFee: '', readmissionFee: '' },
    ]);
  };

  // Remove a fee scheme entry
  const removeFeeSchemeEntry = (index) => {
    if (feeSchemes.length === 1) {
      toast.error('At least one fee scheme entry is required.');
      return;
    }
    setFeeSchemes((prev) => prev.filter((_, i) => i !== index));
  };

  // Validate and save changes
  const handleSaveChanges = async () => {
    const token = Cookies.get('faculties_token');
    if (!token) {
      toast.error('User not authenticated.');
      return;
    }

    // Validate classId
    if (!classId) {
      toast.error('Please select a Class.');
      return;
    }

    // Validate fee scheme entries
    let hasError = false;
    const uniqueCategories = new Set();
    const payload = feeSchemes.map((entry, index) => {
      if (!entry.category) {
        toast.error(`Category is required for entry ${index + 1}.`);
        hasError = true;
      }
      if (!categoryOptions.includes(entry.category)) {
        toast.error(`Invalid Category for entry ${index + 1}.`);
        hasError = true;
      }
      if (!entry.monthlyFee || isNaN(parseFloat(entry.monthlyFee))) {
        toast.error(`Valid Monthly Fee is required for entry ${index + 1}.`);
        hasError = true;
      }
      if (!entry.admissionFee || isNaN(parseFloat(entry.admissionFee))) {
        toast.error(`Valid Admission Fee is required for entry ${index + 1}.`);
        hasError = true;
      }
      if (!entry.readmissionFee || isNaN(parseFloat(entry.readmissionFee))) {
        toast.error(`Valid Readmission Fee is required for entry ${index + 1}.`);
        hasError = true;
      }
      if (uniqueCategories.has(entry.category)) {
        toast.error(`Duplicate category "${entry.category}" in entry ${index + 1}.`);
        hasError = true;
      }
      uniqueCategories.add(entry.category);
      return {
        id: entry.id || undefined,
        classId: parseInt(classId),
        category: entry.category,
        monthlyFee: parseFloat(entry.monthlyFee),
        admissionFee: parseFloat(entry.admissionFee),
        readmissionFee: parseFloat(entry.readmissionFee),
      };
    });

    if (hasError) return;

    try {
      const updates = payload.filter((p) => p.id);
      const creates = payload.filter((p) => !p.id);

      if (updates.length > 0) {
        await Promise.all(
          updates.map((update) =>
            axios.put(`/api/fee-schemes/${update.id}`, update, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );
      }

      if (creates.length > 0) {
        await axios.post(`/api/fee-schemes`, creates, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      toast.success('🎉 Fee Schemes saved successfully!');
      handleSaveAndCloseModal();
      fetchFeeSchemes();
      setClassId('');
      setFeeSchemes([{ id: null, category: '', monthlyFee: '', admissionFee: '', readmissionFee: '' }]);
    } catch (err) {
      console.error('Save Error:', err.response?.data || err.message);
      toast.error(err.response?.data?.error || '❌ Error saving fee schemes.');
    }
  };

  return (
    <Dialog
      sx={{
        bgcolor:"#000",
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        transform: "translate(0, 0)",
      }}
      open={openInsertion}
      onClose={handleCloseModal}
      fullScreen
    >
      <Box sx={{bgcolor:"#000"}}>
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
        <ListItemText sx={{ color: "#fff" }} primary="Manage Fee Schemes (Batch)" />
        <Button
          onClick={handleCloseModal}
          variant="outlined"
          color="error"
          sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
        >
          <Close />
        </Button>
      </ListItemButton>
      <DialogContent sx={{ backgroundColor: '#000', color: '#fff' }}>
        <Box sx={{ maxWidth: "600px", mx: "auto", p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: "#fff" }}>
            Class Selection
          </Typography>
          <SchoolClassSelect
            selectedClass={classId}
            setSelectedClass={handleClassIdChange}
          />
          <Typography variant="h6" sx={{ mt: 3, mb: 2, color: "#fff" }}>
            Fee Scheme Entries
          </Typography>
          {feeSchemes.map((entry, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #555', borderRadius: '4px' }}>
              <Typography variant="subtitle1" sx={{ mb: 1, color: "#fff" }}>
                Fee Scheme Entry {index + 1}
              </Typography>
              <FormControl sx={textFieldStyles} fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  value={entry.category ?? ''}
                  onChange={(e) => handleFeeSchemeChange(index, 'category', e.target.value)}
                  required
                >
                  <MenuItem value="">Select Category</MenuItem>
                  {categoryOptions.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                sx={textFieldStyles}
                label="Monthly Fee"
                type="number"
                fullWidth
                margin="normal"
                value={entry.monthlyFee ?? ''}
                onChange={(e) => handleFeeSchemeChange(index, 'monthlyFee', e.target.value)}
                required
              />
              <TextField
                sx={textFieldStyles}
                label="Admission Fee"
                type="number"
                fullWidth
                margin="normal"
                value={entry.admissionFee ?? ''}
                onChange={(e) => handleFeeSchemeChange(index, 'admissionFee', e.target.value)}
                required
              />
              <TextField
                sx={textFieldStyles}
                label="Readmission Fee"
                type="number"
                fullWidth
                margin="normal"
                value={entry.readmissionFee ?? ''}
                onChange={(e) => handleFeeSchemeChange(index, 'readmissionFee', e.target.value)}
                required
              />
              <IconButton
                onClick={() => removeFeeSchemeEntry(index)}
                sx={{ color: '#f44336', mt: 1 }}
                disabled={feeSchemes.length === 1}
              >
                <Delete />
              </IconButton>
            </Box>
          ))}
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={addFeeSchemeEntry}
            sx={{ mt: 2, color: '#00c853', borderColor: '#00c853' }}
          >
            Add Fee Scheme Entry
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseModal} variant="contained" color="error">Cancel</Button>
        <Button onClick={handleSaveChanges} variant="contained" color="primary">Save</Button>
      </DialogActions>
      </Box>
    </Dialog>
  );
};

export default FeeSchemeDialog;