import React, { useState, useEffect } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Typography,
} from "@mui/material";
import { Add, RotateRight, Close } from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";
import textFieldStyles from "../../../../mui_styles/TextFieldStyles";

const drawerWidth = 280;
const appBarHeight = 80;

const BrowseCategoriesDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchCategories,
}) => {
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);

  const isEditing = !!editFields.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/departments");
        setDepartments(response.data);
      } catch (err) {
        console.error("Error fetching departments:", err);
        setError("Failed to fetch departments.");
        toast.error("Failed to fetch departments.");
      }
    };

    if (openInsertion) {
      fetchData();
    }
  }, [openInsertion]);

  const handleSaveChanges = async () => {
    setApiLoading(true);
    try {
      const payload = {
        name: editFields.name,
        description: editFields.description,
        departmentId: parseInt(editFields.departmentId),
      };

      const apiUrl = isEditing
        ? `/api/categories/${editFields.id}`
        : "/api/categories";

      const response = isEditing
        ? await axios.put(apiUrl, payload)
        : await axios.post(apiUrl, payload);

      if (response.status === 200 || response.status === 201) {
        toast.success(isEditing ? "Category Updated!" : "New Category Added!");
        handleSaveAndCloseModal();
      }
    } catch (err) {
      console.error("Save Error:", err.response?.data || err.message);
      setError(isEditing ? "Error updating category." : "Error adding new category.");
      toast.error(err.response?.data?.error || "Error saving category.");
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
      {apiLoading && (
        <LinearProgress sx={{ width: "100%", position: "absolute", top: 0 }} />
      )}
      <ListItem sx={{ backgroundColor: "#009688", color: "#fff" }}>
        <ListItemIcon>
          <Add />
        </ListItemIcon>
        <ListItemText primary={isEditing ? "Edit Category" : "Add New Category"} />
        <Button
          onClick={fetchCategories}
          variant="outlined"
          sx={{
            position: "absolute",
            right: 80,
            top: 8,
            color: "#00c853",
            borderColor: "#00c853",
          }}
          startIcon={<RotateRight />}
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
            color: "#f44336",
            borderColor: "#f44336",
          }}
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
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  overflow: "auto",
                  pr: 1,
                  maxHeight: "80vh",
                }}
              >
                <TextField
                  label="Name"
                  name="name"
                  fullWidth
                  margin="normal"
                  value={editFields.name ?? ""}
                  onChange={(e) =>
                    setEditFields({ ...editFields, name: e.target.value })
                  }
                  sx={textFieldStyles}
                />
                <TextField
                  label="Description"
                  name="description"
                  fullWidth
                  margin="normal"
                  value={editFields.description ?? ""}
                  onChange={(e) =>
                    setEditFields({ ...editFields, description: e.target.value })
                  }
                  sx={textFieldStyles}
                />
                <FormControl fullWidth margin="normal" sx={textFieldStyles}>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={editFields.departmentId ?? ""}
                    onChange={(e) =>
                      setEditFields({
                        ...editFields,
                        departmentId: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="">Select</MenuItem>
                    {departments.map((department) => (
                      <MenuItem key={department.id} value={department.id}>
                        {department.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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

export default BrowseCategoriesDialog;
