import { useState, useEffect } from "react";
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
  Grid,
  Chip,
} from "@mui/material";
import { Add, Close } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import textDisabledFieldStyles from "../../../../mui_styles/TextDisableFieldStyles";

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
  'KSAT_SUPPORT_PLUS',
  'KSAT_SUPPORT',
  'KSAT_STANDARD',
  'KSAT_GENERAL',
  'DIRECT_GENERAL',
];

const SchoolClassSelect = ({ selectedClass, setSelectedClass }) => {
  const [classes, setClasses] = useState([]);
  const token = Cookies.get('administration_token');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get(`/api/school-classes/select`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;
        if (!Array.isArray(data)) {
          throw new Error("Invalid API response structure");
        }

        const formatted = data.map((item) => ({
          id: item.id,
          name: `${item.name}${item.section ? ` - ${item.section}` : ''}`,
        }));

        setClasses(formatted);
      } catch (error) {
        console.error("Error fetching classes:", error);
        toast.error('❌ Error fetching classes.');
      }
    };

    fetchClasses();
  }, [token]);

  const handleDelete = (classIdToDelete) => {
    setSelectedClass(selectedClass.filter((id) => id !== classIdToDelete));
  };

  return (
    <FormControl sx={textFieldStyles} fullWidth size="small">
      <InputLabel shrink={selectedClass.length > 0}>Select Classes</InputLabel>
      <Select
        multiple
        value={selectedClass || []}
        onChange={(e) => setSelectedClass(e.target.value)}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((value) => {
              const classItem = classes.find((c) => c.id === value);
              return classItem ? (
                <Chip
                  key={value}
                  label={classItem.name}
                  onDelete={() => handleDelete(value)}
                  sx={{ bgcolor: '#444', color: '#fff' }}
                />
              ) : null;
            })}
          </Box>
        )}
      >
        {classes.map((classItem) => (
          <MenuItem key={classItem.id} value={classItem.id}>
            {classItem.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

const FeeSchemeDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchFeeSchemes,
}) => {
  const [classIds, setClassIds] = useState(editFields[0]?.classId ? [editFields[0].classId] : []);

  const [feeSchemes, setFeeSchemes] = useState(
    editFields.length > 0
      ? editFields.map((field) => ({
          id: field.id || null,
          category: field.category || '',
          monthlyFee: field.monthlyFee || '',
          admissionFee: field.admissionFee || '',
          readmissionFee: field.readmissionFee || '',
        }))
      : categoryOptions.map(category => ({
          id: null,
          category,
          monthlyFee: '',
          admissionFee: '',
          readmissionFee: ''
        }))
  );

  const handleFeeSchemeChange = (index, field, value) => {
    setFeeSchemes((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleSaveChanges = async () => {
    const token = Cookies.get('administration_token');
    if (!token) {
      toast.error('User not authenticated.');
      return;
    }

    if (classIds.length === 0) {
      toast.error('Please select at least one Class.');
      return;
    }

    let hasError = false;
    const uniqueCategories = new Set();
    const payload = [];

    // Create payload for each class
    classIds.forEach(classId => {
      feeSchemes.forEach((entry, index) => {
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
        if (uniqueCategories.has(`${classId}-${entry.category}`)) {
          toast.error(`Duplicate category "${entry.category}" for class ${classId}.`);
          hasError = true;
        }
        uniqueCategories.add(`${classId}-${entry.category}`);
        payload.push({
          id: entry.id || undefined,
          classId: parseInt(classId),
          category: entry.category,
          monthlyFee: parseFloat(entry.monthlyFee),
          admissionFee: parseFloat(entry.admissionFee),
          readmissionFee: parseFloat(entry.readmissionFee),
        });
      });
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
      setClassIds([]);
      setFeeSchemes(categoryOptions.map(category => ({
        id: null,
        category,
        monthlyFee: '',
        admissionFee: '',
        readmissionFee: ''
      })));
    } catch (err) {
      console.error('Save Error:', err.response?.data || err.message);
      toast.error(err.response?.data?.error || '❌ Error saving fee schemes.');
    }
  };

  return (
    <Dialog
      sx={{
        bgcolor: "#000",
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        transform: "translate(0, 0)",
      }}
      open={openInsertion}
      onClose={handleCloseModal}
      fullScreen
    >
      <Box sx={{ bgcolor: "#000" }}>
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
            "&:hover": { backgroundColor: '#212121' }
          }}
        >
          <ListItemIcon>
            <Add />
          </ListItemIcon>
          <ListItemText sx={{ color: "#fff" }} primary="Manage Fee Schemes" />
          <Button
            onClick={handleCloseModal}
            variant="outlined"
            color="error"
            sx={{ position: "absolute", right: 8, top: 8, color: "#f44336" }}
          >
            <Close />
          </Button>
        </ListItemButton>
        <DialogContent sx={{ backgroundColor: '#000', color: '#fff', height: "81vh", overflowY: 'scroll' }}>
          <Box sx={{ width: "80vw", mx: "auto", p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#fff" }}>
              Class Selection (Select multiple classes)
            </Typography>
            <SchoolClassSelect
              selectedClass={classIds}
              setSelectedClass={setClassIds}
            />
            <Typography variant="h6" sx={{ mt: 3, mb: 2, color: "#fff" }}>
              Fee Scheme Entries
            </Typography>
            <Grid container spacing={2}>
              {feeSchemes.map((entry, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Box sx={{ p: 2, border: '1px solid #555', borderRadius: '5px', height: '100%', width: '25vw' }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, color: "#fff" }}>
                      {entry.category}
                    </Typography>
                    <FormControl sx={textFieldStyles} fullWidth margin="normal">
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={entry.category || ''}
                        sx={textDisabledFieldStyles}
                        onChange={(e) => handleFeeSchemeChange(index, 'category', e.target.value)}
                        required
                        disabled
                      >
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
                      value={entry.monthlyFee || ''}
                      onChange={(e) => handleFeeSchemeChange(index, 'monthlyFee', e.target.value)}
                      required
                    />
                    <TextField
                      sx={textFieldStyles}
                      label="Admission Fee"
                      type="number"
                      fullWidth
                      margin="normal"
                      value={entry.admissionFee || ''}
                      onChange={(e) => handleFeeSchemeChange(index, 'admissionFee', e.target.value)}
                      required
                    />
                    <TextField
                      sx={textFieldStyles}
                      label="Readmission Fee"
                      type="number"
                      fullWidth
                      margin="normal"
                      value={entry.readmissionFee || ''}
                      onChange={(e) => handleFeeSchemeChange(index, 'readmissionFee', e.target.value)}
                      required
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
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