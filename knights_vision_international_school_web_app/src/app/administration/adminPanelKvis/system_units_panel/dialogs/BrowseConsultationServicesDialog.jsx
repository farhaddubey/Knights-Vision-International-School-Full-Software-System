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
  Chip,
  IconButton,
  Grid,
  Divider,
  LinearProgress,
} from "@mui/material";
import { Add, RotateRight, Close, Delete } from "@mui/icons-material";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const textDisabledFieldStyles = {
  "& .MuiInputBase-root": {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    borderRadius: "4px",
  },
  "& .MuiInputLabel-root": {
    color: "#bbb",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#555" },
    "&:hover fieldset": { borderColor: "#777" },
    "&.Mui-focused fieldset": { borderColor: "#888" },
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
  "& .MuiInputLabel-root": { color: "#bbb" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#555" },
    "&:hover fieldset": { borderColor: "#777" },
    "&.Mui-focused fieldset": { borderColor: "#888" },
  },
};

const drawerWidth = 280;
const appBarHeight = 64;

const BrowseConsultationServicesDialog = ({
  open,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchServices,
}) => {
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [lawyerProfiles, setLawyerProfiles] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [newDocument, setNewDocument] = useState({ name: "", url: "" });
  const [newFormField, setNewFormField] = useState({ name: "", type: "text", required: false });

  const isEditing = !!editFields?.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, lawyerRes] = await Promise.all([
          axios.get("/api/categories/id_name"),
          axios.get("/api/users/lawyer_profiles"),
        ]);
        setCategories(categoryRes.data);
        setLawyerProfiles(lawyerRes.data);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
        setError("Failed to fetch dropdown data.");
        toast.error("Failed to fetch dropdown data.");
      }
    };
    if (open) fetchData();
  }, [open]);

  const validateFields = () => {
    if (!editFields.name || editFields.name.length > 100) {
      return "Name is required and must be 100 characters or less.";
    }
    if (editFields.description && editFields.description.length > 300) {
      return "Description must be 300 characters or less.";
    }
    if (editFields.price && (isNaN(editFields.price) || editFields.price < 0)) {
      return "Price must be a non-negative number.";
    }
    if (editFields.hasSlot && (!editFields.daysOfWeek?.length || !editFields.startTime || !editFields.endTime || !editFields.durationMinutes || !editFields.lawyerProfileId)) {
      return "All slot fields (days, start time, end time, duration, lawyer) are required if slots are enabled.";
    }
    try {
      if (editFields.translations) JSON.stringify(editFields.translations);
      if (editFields.tags) JSON.stringify(editFields.tags);
      if (editFields.customFormSchema) JSON.stringify(editFields.customFormSchema);
      if (editFields.regionRules) JSON.stringify(editFields.regionRules);
      if (editFields.documents) JSON.stringify(editFields.documents);
    } catch (e) {
      return "Invalid JSON format in one of the JSON fields.";
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
        name: editFields.name,
        categoryId: editFields.categoryId ? parseInt(editFields.categoryId) : null,
        description: editFields.description || null,
        translations: editFields.translations || null,
        price: editFields.price ? parseFloat(editFields.price) : null,
        hasSlot: editFields.hasSlot,
        lawyerProfileId: editFields.lawyerProfileId ? parseInt(editFields.lawyerProfileId) : null,
        daysOfWeek: editFields.daysOfWeek || [],
        startTime: editFields.startTime || null,
        endTime: editFields.endTime || null,
        durationMinutes: editFields.durationMinutes ? parseInt(editFields.durationMinutes) : null,
        availability: editFields.availability,
        uploadMode: editFields.uploadMode,
        isWhatsAppEnabled: editFields.isWhatsAppEnabled,
        isOnlinePayEnabled: editFields.isOnlinePayEnabled,
        isD2DEnabled: editFields.isD2DEnabled,
        tags: Array.isArray(editFields.tags) ? editFields.tags : [],
        customFormSchema: Array.isArray(editFields.customFormSchema) ? editFields.customFormSchema : [],
        regionRules: editFields.regionRules || null,
        visibilityScope: editFields.visibilityScope,
        thumbnailUrl: editFields.thumbnailUrl || null,
        introVideoUrl: editFields.introVideoUrl || null,
        documents: Array.isArray(editFields.documents) ? editFields.documents : [],
        aiSupportLevel: editFields.aiSupportLevel,
        id: editFields.id || undefined,
      };

      const response = await axios.post("/api/legal-services/consultation", payload);

      if (response.status === 200 || response.status === 201) {
        toast.success(isEditing ? "Service Updated!" : "New Service Added!");
        handleSaveAndCloseModal();
      }
    } catch (err) {
      console.error("Save Error:", err.response?.data || err.message);
      setError(isEditing ? "Error updating service." : "Error adding new service.");
      toast.error(err.response?.data?.error || "Error saving service.");
    } finally {
      setApiLoading(false);
    }
  };

  const handleAddTag = () => {
    if (newTag && !editFields.tags.includes(newTag)) {
      setEditFields({ ...editFields, tags: [...editFields.tags, newTag] });
      setNewTag("");
    }
  };

  const handleDeleteTag = (tag) => {
    setEditFields({ ...editFields, tags: editFields.tags.filter((t) => t !== tag) });
  };

  const handleAddDocument = () => {
    if (newDocument.name && newDocument.url) {
      setEditFields({
        ...editFields,
        documents: [...editFields.documents, { name: newDocument.name, url: newDocument.url }],
      });
      setNewDocument({ name: "", url: "" });
    }
  };

  const handleDeleteDocument = (index) => {
    setEditFields({
      ...editFields,
      documents: editFields.documents.filter((_, i) => i !== index),
    });
  };

  const handleAddFormField = () => {
    if (newFormField.name && newFormField.type) {
      setEditFields({
        ...editFields,
        customFormSchema: [...editFields.customFormSchema, newFormField],
      });
      setNewFormField({ name: "", type: "text", required: false });
    }
  };

  const handleDeleteFormField = (index) => {
    setEditFields({
      ...editFields,
      customFormSchema: editFields.customFormSchema.filter((_, i) => i !== index),
    });
  };

  const renderTextField = (label, name, type = "text", otherProps = {}) => (
    <TextField
      label={label}
      name={name}
      type={type}
      value={editFields[name] ?? ""}
      onChange={(e) => setEditFields({ ...editFields, [name]: e.target.value })}
      fullWidth
      margin="normal"
      sx={textDisabledFieldStyles}
      error={!!error && error.includes(label)}
      helperText={error && error.includes(label) ? error : ""}
      {...otherProps}
    />
  );

  const renderSelect = (label, name, value, onChange, options, multiple = false, error = '') => (
    <>
      <FormControl sx={formControlStyles} fullWidth margin="normal" error={!!error && error.includes(label)}>
        <InputLabel>{label}</InputLabel>
        <Select
          name={name}
          value={value ?? (multiple ? [] : "")}
          onChange={onChange}
          multiple={multiple}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {error && error.includes(label) && (
        <Typography color="error" variant="caption" sx={{ pl: 1 }}>
          {error}
        </Typography>
      )}
    </>
  );

  return (
    <Dialog
      sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `${drawerWidth}px`,
        width: `calc(100vw - ${drawerWidth}px)`,
        maxWidth: `calc(100vw - ${drawerWidth}px)`,
        "& .MuiDialog-paper": {
          backgroundColor: "#000",
          color: "#fff",
          border: "1px solid #555",
          width: "100%",
          maxWidth: "100%",
          margin: 0,
        },
      }}
      open={open}
      onClose={handleCloseModal}
      fullScreen
    >
      <ToastContainer theme="dark" position="bottom-center" autoClose={5000} />
      {apiLoading && <LinearProgress sx={{ width: "100%", position: "absolute", top: 0, backgroundColor: "#1e1e1e" }} />}
      <Box sx={{ bgcolor: "#1a237e", color: "#fff", p: 1, display: "flex", alignItems: "center" }}>
        <Add sx={{ color: "#fff", mr: 1 }} />
        <Typography variant="h6">{isEditing ? "Edit Consultation Service" : "Add New Consultation Service"}</Typography>
        <Button
          onClick={fetchServices}
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

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          height: `calc(100vh - ${appBarHeight}px - 48px)`, // Adjust for header and actions
          backgroundColor: "#000",
          color: "#fff",
          p: 2,
          overflowY: "auto",
        }}
      >
        <Box sx={{ width: "50%", maxHeight: "100%", overflowY: "auto", pr:1 }}>
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Basic Information</Typography>
          <Divider sx={{ mb: 2, bgcolor: "#fff" }} />
          <Grid spacing={2}>
            <Grid item xs={6}>{renderTextField("Service Name", "name", "text", { required: true })}</Grid>
            <Grid item xs={6}>
              {renderSelect(
                "Category",
                "categoryId",
                editFields.categoryId,
                (e) => setEditFields({ ...editFields, categoryId: e.target.value }),
                [{ value: "", label: "None" }, ...categories.map((cat) => ({ value: cat.id, label: cat.name }))]
              )}
            </Grid>
            <Grid item xs={6}>{renderTextField("Price", "price", "number", { inputProps: { min: 0, step: "0.01" } })}</Grid>
            <Grid item xs={6}>{renderTextField("Description", "description", "text", { multiline: true, rows: 4, inputProps: { maxLength: 300 } })}</Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Slot Configuration</Typography>
          <Divider sx={{ mb: 2, bgcolor: "#fff" }} />
          <Grid  spacing={2}>
            <Grid item xs={6}>
              {renderSelect(
                "Has Slot",
                "hasSlot",
                editFields.hasSlot ? "true" : "false",
                (e) => setEditFields({ ...editFields, hasSlot: e.target.value === "true" }),
                [{ value: "true", label: "Yes" }, { value: "false", label: "No" }]
              )}
            </Grid>
            {editFields.hasSlot && (
              <>
                <Grid item xs={6}>
                  {renderSelect(
                    "Lawyer",
                    "lawyerProfileId",
                    editFields.lawyerProfileId,
                    (e) => setEditFields({ ...editFields, lawyerProfileId: e.target.value }),
                    [{ value: "", label: "Select Lawyer" }, ...lawyerProfiles.map((profile) => ({ value: profile.id, label: profile.user.username }))]
                  )}
                </Grid>
                <Grid item xs={6}>
                  {renderSelect(
                    "Days of Week",
                    "daysOfWeek",
                    editFields.daysOfWeek || [],
                    (e) => setEditFields({ ...editFields, daysOfWeek: e.target.value }),
                    ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => ({ value: day, label: day })),
                    true
                  )}
                </Grid>
                <Grid item xs={6}>{renderTextField("Start Time", "startTime", "time")}</Grid>
                <Grid item xs={6}>{renderTextField("End Time", "endTime", "time")}</Grid>
                <Grid item xs={6}>
                  {renderSelect(
                    "Duration (minutes)",
                    "durationMinutes",
                    editFields.durationMinutes,
                    (e) => setEditFields({ ...editFields, durationMinutes: e.target.value }),
                    [15, 30, 60].map((val) => ({ value: val, label: `${val} minutes` }))
                  )}
                </Grid>
              </>
            )}
          </Grid>

          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Configuration</Typography>
          <Divider sx={{ mb: 2, bgcolor: "#fff" }} />
          <Grid  spacing={2}>
            <Grid item xs={6}>
              {renderSelect(
                "Availability",
                "availability",
                editFields.availability,
                (e) => setEditFields({ ...editFields, availability: e.target.value }),
                ["ONLINE", "OFFLINE", "BOTH"].map((val) => ({ value: val, label: val }))
              )}
            </Grid>
            <Grid item xs={6}>
              {renderSelect(
                "Upload Mode",
                "uploadMode",
                editFields.uploadMode,
                (e) => setEditFields({ ...editFields, uploadMode: e.target.value }),
                ["DIRECT_UPLOAD", "WHATSAPP", "EMAIL"].map((val) => ({ value: val, label: val }))
              )}
            </Grid>
            <Grid item xs={6}>
              {renderSelect(
                "WhatsApp Enabled",
                "isWhatsAppEnabled",
                editFields.isWhatsAppEnabled ? "true" : "false",
                (e) => setEditFields({ ...editFields, isWhatsAppEnabled: e.target.value === "true" }),
                [{ value: "true", label: "Yes" }, { value: "false", label: "No" }]
              )}
            </Grid>
            <Grid item xs={6}>
              {renderSelect(
                "Online Payment Enabled",
                "isOnlinePayEnabled",
                editFields.isOnlinePayEnabled ? "true" : "false",
                (e) => setEditFields({ ...editFields, isOnlinePayEnabled: e.target.value === "true" }),
                [{ value: "true", label: "Yes" }, { value: "false", label: "No" }]
              )}
            </Grid>
            <Grid item xs={6}>
              {renderSelect(
                "Door-to-Door Enabled",
                "isD2DEnabled",
                editFields.isD2DEnabled ? "true" : "false",
                (e) => setEditFields({ ...editFields, isD2DEnabled: e.target.value === "true" }),
                [{ value: "true", label: "Yes" }, { value: "false", label: "No" }]
              )}
            </Grid>
            <Grid item xs={6}>
              {renderSelect(
                "Visibility Scope",
                "visibilityScope",
                editFields.visibilityScope,
                (e) => setEditFields({ ...editFields, visibilityScope: e.target.value }),
                ["PUBLIC", "INTERNAL", "PARTNER_ONLY"].map((val) => ({ value: val, label: val }))
              )}
            </Grid>
            <Grid item xs={6}>
              {renderSelect(
                "AI Support Level",
                "aiSupportLevel",
                editFields.aiSupportLevel,
                (e) => setEditFields({ ...editFields, aiSupportLevel: e.target.value }),
                ["NONE", "BASIC", "ADVANCED", "GPT_ASSISTED"].map((val) => ({ value: val, label: val }))
              )}
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ width: "50%", maxHeight: "100%", overflowY: "auto", pl:1 }}>
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Tags</Typography>
          <Divider sx={{ mb: 2, bgcolor: "#fff" }} />
          <Grid  spacing={2}>
            <Grid item xs={10}>
              <TextField
                label="New Tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                fullWidth
                margin="normal"
                sx={textDisabledFieldStyles}
              />
            </Grid>
            <Grid item xs={2}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#555",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#777" },
                  mt: 2,
                }}
                onClick={handleAddTag}
                fullWidth
              >
                Add
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mt: 1 }}>
                {Array.isArray(editFields.tags) && editFields.tags.length > 0 ? (
                  editFields.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleDeleteTag(tag)}
                      sx={{
                        mr: 1,
                        mb: 1,
                        backgroundColor: "#555",
                        color: "#fff",
                        "& .MuiChip-deleteIcon": { color: "#ff5252" },
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: "#888" }}>
                    No tags added
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Documents</Typography>
          <Divider sx={{ mb: 2, bgcolor: "#fff" }} />
          <Grid  spacing={2}>
            <Grid item xs={5}>
              <TextField
                label="Document Name"
                value={newDocument.name}
                onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                fullWidth
                margin="normal"
                sx={textDisabledFieldStyles}
              />
            </Grid>
            <Grid item xs={5}>
              <TextField
                label="Document URL"
                value={newDocument.url}
                onChange={(e) => setNewDocument({ ...newDocument, url: e.target.value })}
                fullWidth
                margin="normal"
                sx={textDisabledFieldStyles}
              />
            </Grid>
            <Grid item xs={2}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#555",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#777" },
                  mt: 2,
                }}
                onClick={handleAddDocument}
                fullWidth
              >
                Add
              </Button>
            </Grid>
            <Grid item xs={12}>
              {Array.isArray(editFields.documents) && editFields.documents.length > 0 ? (
                editFields.documents.map((doc, index) => (
                  <Box key={index} sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    <Typography sx={{ flex: 1, color: "#fff" }}>
                      {doc.name}: {doc.url}
                    </Typography>
                    <IconButton
                      sx={{ color: "#ff5252" }}
                      onClick={() => handleDeleteDocument(index)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" sx={{ color: "#888" }}>
                  No documents added
                </Typography>
              )}
            </Grid>
          </Grid>
          {error && (
            <Typography sx={{ mt: 2, textAlign: "center", color: "#ff5252" }}>
              {error}
            </Typography>
          )}
        </Box>
      </Box>

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

export default BrowseConsultationServicesDialog;