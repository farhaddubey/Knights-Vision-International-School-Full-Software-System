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
  IconButton,
  Typography,
} from "@mui/material";
import { Add, Close, Delete } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";

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

const SubjectDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchSubjects,
}) => {
  // State for subject entries
  const [subjectEntries, setSubjectEntries] = useState(
    editFields.length > 0
      ? editFields.map((field) => ({
          id: field.id || null,
          name: field.name || '',
          description: field.description || '',
        }))
      : [{ id: null, name: '', description: '' }]
  );

  // Handle changes to individual subject entry fields
  const handleSubjectEntryChange = (index, field, value) => {
    setSubjectEntries((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      )
    );
  };

  // Add a new subject entry
  const addSubjectEntry = () => {
    setSubjectEntries((prev) => [
      ...prev,
      { id: null, name: '', description: '' },
    ]);
  };

  // Remove a subject entry
  const removeSubjectEntry = (index) => {
    if (subjectEntries.length === 1) {
      toast.error('At least one subject entry is required.');
      return;
    }
    setSubjectEntries((prev) => prev.filter((_, i) => i !== index));
  };

  // Generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphen
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .slice(0, 50); // Ensure within 50 chars
  };

  // Validate and save changes
  const handleSaveChanges = async () => {
    const token = Cookies.get('administration_token');
    if (!token) {
      toast.error('User not authenticated.');
      return;
    }

    // Validate subject entries
    let hasError = false;
    const uniqueSlugs = new Set();
    const payload = subjectEntries.map((entry, index) => {
      if (!entry.name) {
        toast.error(`Subject Name is required for entry ${index + 1}.`);
        hasError = true;
      }
      if (entry.name.length > 50) {
        toast.error(`Subject Name must be 50 characters or less for entry ${index + 1}.`);
        hasError = true;
      }
      if (entry.description && entry.description.length > 65535) { // MySQL TEXT max length
        toast.error(`Description must be 65,535 characters or less for entry ${index + 1}.`);
        hasError = true;
      }
      const slug = generateSlug(entry.name);
      if (uniqueSlugs.has(slug)) {
        toast.error(`Duplicate slug generated for "${entry.name}" in entry ${index + 1}. Please use a unique name.`);
        hasError = true;
      }
      uniqueSlugs.add(slug);
      return {
        id: entry.id || undefined,
        name: entry.name,
        slug,
        description: entry.description || null,
      };
    });

    if (hasError) return;

    try {
      if (editFields.length > 0) {
        // Update existing subjects
      //   await Promise.all(
      //     payload
      //       .filter((item) => item.id)
      //       .map((item) =>
      //         axios.put(`/api/subjects/${item.id}`, item, {
      //           headers: { Authorization: `Bearer ${token}` },
      //         })
      //       )
      //   );
      // } else {
        // Create new subjects in batch
        await axios.post(`/api/subjects`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      toast.success('🎉 Subjects saved successfully!');
      handleSaveAndCloseModal();
      fetchSubjects();
      setSubjectEntries([{ id: null, name: '', description: '' }]);
    } catch (err) {
      console.error('Save Error:', err.response?.data || err.message);
      toast.error(err.response?.data?.error || '❌ Error saving subjects.');
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
        <ListItemText sx={{ color: "#fff" }} primary="Manage Subjects (Batch)" />
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
            <Typography variant="h6" sx={{ mb: 2, color: "#fff" }}>
              Subject Entries
            </Typography>
            {subjectEntries.map((entry, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #555', borderRadius: '4px' }}>
                <Typography variant="subtitle1" sx={{ mb: 1, color: "#fff" }}>
                  Subject Entry {index + 1}
                </Typography>
                <TextField
                  sx={textFieldStyles}
                  label="Subject Name"
                  fullWidth
                  margin="normal"
                  value={entry.name ?? ''}
                  onChange={(e) => handleSubjectEntryChange(index, 'name', e.target.value)}
                  required
                />
                <TextField
                  sx={textFieldStyles}
                  label="Description"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={4}
                  value={entry.description ?? ''}
                  onChange={(e) => handleSubjectEntryChange(index, 'description', e.target.value)}
                />
                <IconButton
                  onClick={() => removeSubjectEntry(index)}
                  sx={{ color: '#f44336', mt: 1 }}
                  disabled={subjectEntries.length === 1}
                >
                  <Delete />
                </IconButton>
              </Box>
            ))}
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={addSubjectEntry}
              sx={{ mt: 2, color: '#00c853', borderColor: '#00c853' }}
            >
              Add Subject Entry
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} variant="contained" color="error">
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} variant="contained" color="primary">
            Save Subjects
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default SubjectDialog;