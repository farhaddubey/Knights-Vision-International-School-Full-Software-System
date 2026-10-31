import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid,
  Divider,
  LinearProgress,
  CircularProgress,
  Chip,
} from "@mui/material";
import { Add, Close, Check } from "@mui/icons-material";
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
  "& .MuiSelect-icon": {
    color: "#fff",
  },
  "& .MuiMenu-paper": {
    backgroundColor: "#1e1e1e",
    color: "#fff",
  },
};

const drawerWidth = 280;
const appBarHeight = 64;

const DepartmentCategoryDialog = ({ open, setOpenDialog, department, handleClose }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [existingMappings, setExistingMappings] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const handleCloseDialog = () => {
    const ifClosingYes=alert("Are you sure want to close"); 
    if(ifClosingYes){
      setSelectedCategoryIds([]); 
      setExistingMappings([]);
      setSelectedDepartment(null);
      setOpenDialog(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const [categoriesRes, mappingsRes] = await Promise.all([
          axios.get("/api/categories/id_name"),
          axios.get("/api/department-categories", { params: { departmentId: department?.id } }),
        ]);
        setCategories(categoriesRes.data);
        setExistingMappings(mappingsRes.data.data);
        setSelectedCategoryIds(mappingsRes.data.data.map((map) => map.categoryId));
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch categories or mappings.");
        toast.error("Failed to fetch categories or mappings.");
      } finally {
        setFetching(false);
      }
    };
    if (open && department) {
      fetchData();
    }
  }, [open, department]);

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const currentIds = existingMappings.map((map) => map.categoryId);
      const toAdd = selectedCategoryIds.filter((id) => !currentIds.includes(id));
      const toRemove = currentIds.filter((id) => !selectedCategoryIds.includes(id));

      if (toAdd.length > 0) {
        await axios.post("/api/department-categories", {
          departmentId: department.id,
          categoryIds: toAdd,
        });
      }

      if (toRemove.length > 0) {
        await Promise.all(
          existingMappings
            .filter((map) => toRemove.includes(map.categoryId))
            .map((map) => axios.delete(`/api/department-categories/${map.id}`))
        );
      }

      toast.success("Category mappings updated successfully!");
      handleCloseDialog();
    } catch (err) {
      console.error("Error saving mappings:", err);
      setError("Failed to save mappings.");
      toast.error("Failed to save mappings.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteChip = (categoryId) => {
    setSelectedCategoryIds((prev) => prev.filter((id) => id !== categoryId));
  };

  return (
    <Dialog
      sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `${drawerWidth}px`,
        "& .MuiDialog-paper": {
          backgroundColor: "#000",
          color: "#fff",
          border: "1px solid #555",
        },
      }}
      open={open}
      onClose={handleClose}
      fullScreen
    >
      <ToastContainer theme="dark" position="bottom-center" autoClose={5000} />
      {fetching && <LinearProgress sx={{ width: "100%", position: "absolute", top: 0, backgroundColor: "#1e1e1e" }} />}
      <Box sx={{ bgcolor: "#1a237e", color: "#fff", p: 1, display: "flex", alignItems: "center" }}>
        <Add sx={{ color: "#fff", mr: 1 }} />
        <Typography variant="h6">Manage Categories for {department?.name}</Typography>
        <Button
          onClick={handleClose}
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
        <Box sx={{ flex: 1, pr: 1, maxHeight: "80vh" }}>
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Select Categories</Typography>
          <Divider sx={{ mb: 2, bgcolor: "#fff" }} />
          {error && <Typography sx={{ mt: 2, color: "#ff5252" }}>{error}</Typography>}
          <FormControl sx={textDisabledFieldStyles} fullWidth margin="normal">
            <InputLabel sx={{ color: "#999" }}>Categories</InputLabel>
            <Select
              multiple
              value={selectedCategoryIds}
              onChange={(e) => setSelectedCategoryIds(e.target.value)}
              renderValue={(selected) =>
                selected
                  .map((id) => categories.find((c) => c.id === id)?.name)
                  .filter(Boolean)
                  .join(", ")
              }
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: "#1e1e1e",
                    color: "#fff",
                    "& .MuiMenuItem-root": {
                      "&:hover": {
                        backgroundColor: "#333",
                      },
                      "&.Mui-selected": {
                        backgroundColor: "#444",
                      },
                    },
                  },
                },
              }}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedCategoryIds.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, color: "#bbb" }}>
                Selected Categories:
              </Typography>
              <Grid container spacing={1}>
                {selectedCategoryIds.map((id) => {
                  const category = categories.find((c) => c.id === id);
                  return (
                    category && (
                      <Grid item xs={12} sm={6} md={4} key={id}>
                        <Chip
                          label={category.name}
                          onDelete={() => handleDeleteChip(id)}
                          sx={{
                            backgroundColor: "#333",
                            color: "#fff",
                            "&:hover": {
                              backgroundColor: "#444",
                            },
                            "& .MuiChip-deleteIcon": {
                              color: "#ff5252",
                              "&:hover": {
                                color: "#ff867f",
                              },
                            },
                          }}
                        />
                      </Grid>
                    )
                  );
                })}
              </Grid>
            </Box>
          )}
          <Typography variant="body2" sx={{ mt: 2, color: "#bbb" }}>
            Selected {selectedCategoryIds.length} category(ies)
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ bgcolor: "#000", p: 2 }}>
        <Button
          onClick={handleClose}
          variant="contained"
          sx={{
            backgroundColor: "#ff5252",
            color: "#fff",
            "&:hover": { backgroundColor: "#ff867f" },
          }}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            backgroundColor: "#555",
            color: "#fff",
            "&:hover": { backgroundColor: "#777" },
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <CircularProgress size={20} sx={{ color: "#fff" }} />
              Saving...
            </>
          ) : (
            <>
              <Check sx={{ color: "#fff" }} />
              Save Changes
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DepartmentCategoryDialog;