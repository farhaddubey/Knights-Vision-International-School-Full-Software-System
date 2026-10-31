import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Typography,
} from "@mui/material";
import { Add, RotateRight, Close } from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";
import textFieldStyles from "../../../../mui_styles/TextFieldStyles";

const drawerWidth = 280;
const appBarHeight = 80;

const BrowseDepartmentsDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchDepartments,
}) => {
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = !!editFields.id;

  const handleSaveChanges = async () => {
    setApiLoading(true);
    try {
      const payload = {
        name: editFields.name,
        description: editFields.description,
        slug: editFields.slug,
        translations: editFields.translations,
      };

      const apiUrl = isEditing ? `/api/departments/${editFields.id}` : "/api/departments";

      const response = isEditing
        ? await axios.put(apiUrl, payload)
        : await axios.post(apiUrl, payload);

      if (response.status === 200 || response.status === 201) {
        toast.success(isEditing ? "Department Updated!" : "New Department Added!");
        handleSaveAndCloseModal();
      }
    } catch (err) {
      console.error("Save Error:", err.response?.data || err.message);
      setError(isEditing ? "Error updating department." : "Error adding new department.");
      toast.error(err.response?.data?.error || "Error saving department.");
    } finally {
      setApiLoading(false);
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
      {apiLoading && <LinearProgress sx={{ width: "100%", position: "absolute", top: 0 }} />}
      <ListItem sx={{ backgroundColor: "#009688", color: "#fff" }}>
        <ListItemIcon>
          <Add />
        </ListItemIcon>
        <ListItemText primary={isEditing ? "Edit Department" : "Add New Department"} />
        <Button
          onClick={fetchDepartments}
          variant="outlined"
          sx={{ position: "absolute", right: 80, top: 8, color: "#00c853", borderColor: "#00c853" }}
          startIcon={<RotateRight />}
        >
          Refresh
        </Button>
        <Button
          onClick={handleCloseModal}
          variant="outlined"
          sx={{ position: "absolute", right: 8, top: 8, color: "#f44336", borderColor: "#f44336" }}
          startIcon={<Close />}
        >
          Close
        </Button>
      </ListItem>

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          height: "100%",
          backgroundColor: "#000",
          color: "#fff",
        }}
      >
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
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                height: "100%",
                backgroundColor: "#000",
                color: "#fff",
                p: 2,
              }}
            >
              <Box sx={{ flex: 1, overflowY: "auto", pr: 1, maxHeight: "80vh" }}>
                <TextField
                  label="Name"
                  name="name"
                  fullWidth
                  margin="normal"
                  value={editFields.name ?? ""}
                  onChange={(e) => setEditFields({ ...editFields, name: e.target.value })}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Description"
                  name="description"
                  fullWidth
                  margin="normal"
                  value={editFields.description ?? ""}
                  onChange={(e) => setEditFields({ ...editFields, description: e.target.value })}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Slug"
                  name="slug"
                  fullWidth
                  margin="normal"
                  value={editFields.slug ?? ""}
                  onChange={(e) => setEditFields({ ...editFields, slug: e.target.value })}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Translations (JSON)"
                  name="translations"
                  fullWidth
                  margin="normal"
                  multiline
                  minRows={2}
                  value={JSON.stringify(editFields.translations ?? {}, null, 2)}
                  onChange={(e) => {
                    try {
                      setEditFields({ ...editFields, translations: JSON.parse(e.target.value) });
                      setError(null);
                    } catch (jsonErr) {
                      setError("Invalid JSON in translations.");
                    }
                  }}
                  sx={textFieldStyles}
                />
              </Box>
            </Box>
            {error && (
              <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>
                {error}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} variant="contained" color="error">
              Cancel
            </Button>
            <Button onClick={handleSaveChanges} variant="contained" color="primary">
              Save Changes
            </Button>
          </DialogActions>
        </Box>
      </Box>
    </Dialog>
  );
};

export default BrowseDepartmentsDialog;
