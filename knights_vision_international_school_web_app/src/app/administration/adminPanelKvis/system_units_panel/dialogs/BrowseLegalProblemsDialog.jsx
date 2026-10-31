import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid,
  Divider,
} from "@mui/material";
import { Add, RotateRight, Close } from "@mui/icons-material";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const textDisabledFieldStyles = {
  "& .MuiInputBase-root": {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    borderRadius: "4px",
  },
  "& .MuiInputLabel-root": {
    color: "#999",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#555",
    },
    "&:hover fieldset": {
      borderColor: "#777",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#888",
    },
  },
  "& .MuiInputBase-input:disabled": {
    color: "#888",
    WebkitTextFillColor: "#888",
  },
};

const formControlStyles = {
  "& .MuiInputBase-root": {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    borderRadius: "4px",
  },
  "& .MuiInputLabel-root": {
    color: "#999",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#555",
    },
    "&:hover fieldset": {
      borderColor: "#777",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#888",
    },
  },
};

const drawerWidth = 280;
const appBarHeight = 64;

const LegalProblemDialog = ({
  open,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchProblems,
}) => {
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [services, setServices] = useState([]);
  const [keywordsInput, setKeywordsInput] = useState("");

  const isEditing = !!editFields?.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, catRes, brandRes, serviceRes] = await Promise.all([
          axios.get("/api/departments"),
          axios.get("/api/categories"),
          axios.get("/api/brands"),
          axios.get("/api/legal-services"),
        ]);
        setDepartments(deptRes.data.data || []);
        setCategories(catRes.data.data || []);
        setBrands(brandRes.data.data || []);
        setServices(serviceRes.data.data || []);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
        setError("Failed to fetch dropdown data.");
        toast.error("Failed to fetch dropdown data.");
      }
    };
    if (open) {
      fetchData();
      setKeywordsInput(editFields?.keywords?.join(", ") || "");
    }
  }, [open, editFields]);

  const validateFields = () => {
    if (!editFields?.title || editFields?.title.length > 150) {
      return "Title is required and must be 150 characters or less.";
    }
    if (editFields?.description && editFields?.description.length > 500) {
      return "Description must be 500 characters or less.";
    }
    if (editFields?.iconUrl && !/^(http|https):\/\/[^\s]+$/.test(editFields?.iconUrl)) {
      return "Icon URL must be a valid URL.";
    }
    try {
      if (editFields?.translations) JSON.stringify(editFields?.translations);
    } catch (e) {
      return "Invalid JSON format in translations.";
    }
    return null;
  };

  const handleSaveChanges = async () => {
    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setApiLoading(true);
    try {
      const payload = {
        title: editFields?.title,
        description: editFields?.description || null,
        departmentId: editFields?.departmentId ? parseInt(editFields?.departmentId) : null,
        categoryId: editFields?.categoryId ? parseInt(editFields?.categoryId) : null,
        brandId: editFields?.brandId ? parseInt(editFields?.brandId) : null,
        serviceId: editFields?.serviceId ? parseInt(editFields?.serviceId) : null,
        iconUrl: editFields?.iconUrl || null,
        keywords: keywordsInput ? keywordsInput.split(",").map((k) => k.trim()).filter((k) => k) : [],
        translations: editFields?.translations || null,
      };

      const apiUrl = isEditing ? `/api/legal-problems/${editFields?.id}` : "/api/legal-problems";
      const response = isEditing ? await axios.put(apiUrl, payload) : await axios.post(apiUrl, payload);

      if (response.status === 200 || response.status === 201) {
        toast.success(isEditing ? "Problem Updated!" : "Problem Added!");
        handleSaveAndCloseModal();
      }
    } catch (err) {
      console.error("Save Error:", err.response?.data || err.message);
      setError(isEditing ? "Error updating problem." : "Error adding new problem.");
      toast.error(err.response?.data?.error || "Error saving problem.");
    } finally {
      setApiLoading(false);
    }
  };

  const handleDialogClose = (event, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      handleCloseModal();
    }
  };

const renderTextField = (label, name, type = "text", otherProps = {}) => (
  <TextField
    label={label}
    name={name}
    type={type}
    value={editFields?.[name] ?? ""}
    onChange={(e) => setEditFields({ ...editFields, [name]: e.target.value })}
    fullWidth
    margin="normal"
    sx={textDisabledFieldStyles}
    error={!!error && error.includes(label)}
    helperText={error && error.includes(label) ? error : ""}
    {...otherProps}
  />
);

  const renderSelect = (label, name, value, onChange, options, otherProps = {}) => (
    <FormControl sx={formControlStyles} fullWidth margin="normal" error={!!error && error.includes(label)}>
      <InputLabel>{label}</InputLabel>
      <Select name={name} value={value ?? ""} onChange={onChange} {...otherProps}>
        <MenuItem value="">None</MenuItem>
        {options.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {option.name}
          </MenuItem>
        ))}
      </Select>
      {error && error.includes(label) && <Typography color="error" variant="caption">{error}</Typography>}
    </FormControl>
  );

  return (
    <Dialog
      sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `${drawerWidth}px`,
        transform: "translate(0, 0)",
        "& .MuiDialog-paper": {
          backgroundColor: "#000",
          color: "#fff",
          border: "1px solid #555",
        },
      }}
      open={open}
      onClose={handleDialogClose}
      fullScreen
    >
      <ToastContainer theme="dark" position="bottom-center" autoClose={5000} />
      {apiLoading && <LinearProgress sx={{ width: "100%", position: "absolute", top: 0, backgroundColor: "#1e1e1e" }} />}
      <Box sx={{ bgcolor: "#1a237e", color: "#fff", p: 1, display: "flex", alignItems: "center" }}>
        <Add sx={{ color: "#fff", mr: 1 }} />
        <Typography variant="h6">{isEditing ? "Edit Legal Problem" : "Add New Legal Problem"}</Typography>
        <Button
          onClick={fetchProblems}
          variant="outlined"
          sx={{
            position: "absolute",
            right: 120,
            top: 8,
            color: "#fff",
            borderColor: "#555",
            "&:hover": { borderColor: "#777", backgroundColor: "#1e1e1e" },
          }}
          startIcon={<RotateRight sx={{ color: "#fff" }} />}
        >
          Refresh
        </Button>
        <Button
          onClick={handleCloseModal}
          variant="outlined"
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "#ff5252",
            borderColor: "#ff5252",
            "&:hover": { borderColor: "#ff867f", backgroundColor: "#1e1e1e" },
          }}
          startIcon={<Close sx={{ color: "#ff5252" }} />}
        >
          Close
        </Button>
      </Box>

      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "row",
          height: "100%",
          backgroundColor: "#000",
          color: "#fff",
          p: 1,
          overflowY: "auto",
        }}
      >
        {/* Left Side */}
        <Box sx={{ flex: 1, pr: 1, maxHeight: "80vh" }}>
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            Basic Information
          </Typography>
          <Divider sx={{ mb: 2, bgcolor: "#fff" }} />
          <Grid spacing={2}>
            <Grid item xs={12}>
              {renderTextField("Title", "title", "text", { required: true })}
            </Grid>
            <Grid item xs={6}>
              {renderSelect(
                "Category",
                "categoryId",
                editFields?.categoryId,
                (e) => setEditFields({ ...editFields, categoryId: e.target.value }),
                categories
              )}
            </Grid>
            <Grid item xs={6}>
              {renderSelect(
                "Department",
                "departmentId",
                editFields?.departmentId,
                (e) => setEditFields({ ...editFields, departmentId: e.target.value }),
                departments
              )}
            </Grid>
            <Grid item xs={6}>
              {renderSelect(
                "Brand",
                "brandId",
                editFields?.brandId,
                (e) => setEditFields({ ...editFields, brandId: e.target.value }),
                brands
              )}
            </Grid>
            <Grid item xs={6}>
              {renderSelect(
                "Direct Service",
                "serviceId",
                editFields?.serviceId,
                (e) => setEditFields({ ...editFields, serviceId: e.target.value }),
                services
              )}
            </Grid>
            <Grid item xs={12}>
              {renderTextField("Description", "description", "text", { multiline: true, rows: 4 })}
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Keywords (comma-separated)"
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                fullWidth
                margin="normal"
                sx={textDisabledFieldStyles}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Right Side */}
        <Box sx={{ flex: 1, pl: 1, maxHeight: "80vh" }}>
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            Additional Details
          </Typography>
          <Divider sx={{ mb: 2, bgcolor: "#fff" }} />
          <Grid spacing={2}>
            <Grid item xs={12}>
              {renderTextField("Icon URL", "iconUrl", "text")}
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="English Translation"
                value={editFields?.translations?.en ?? ""}
                onChange={(e) =>
                  setEditFields({
                    ...editFields,
                    translations: { ...editFields?.translations, en: e.target.value },
                  })
                }
                fullWidth
                margin="normal"
                sx={textDisabledFieldStyles}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Hindi Translation"
                value={editFields?.translations?.hi ?? ""}
                onChange={(e) =>
                  setEditFields({
                    ...editFields,
                    translations: { ...editFields?.translations, hi: e.target.value },
                  })
                }
                fullWidth
                margin="normal"
                sx={textDisabledFieldStyles}
              />
            </Grid>
          </Grid>
          {error && (
            <Typography sx={{ mt: 2, textAlign: "center", color: "#ff5252" }}>
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ bgcolor: "#000", p: 2 }}>
        <Button
          onClick={handleCloseModal}
          variant="contained"
          sx={{
            backgroundColor: "#ff5252",
            color: "#fff",
            "&:hover": { backgroundColor: "#ff867f" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSaveChanges}
          variant="contained"
          sx={{
            backgroundColor: "#555",
            color: "#fff",
            "&:hover": { backgroundColor: "#777" },
          }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LegalProblemDialog;