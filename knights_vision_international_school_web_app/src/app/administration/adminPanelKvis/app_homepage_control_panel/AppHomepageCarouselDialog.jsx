import React, { useState } from "react";
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
  CircularProgress,
  IconButton,
} from "@mui/material";
import { Add, RotateRight, Close, Image } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import textFieldStyles from "../../../mui_styles/TextFieldStyles";

const drawerWidth = 280;
const appBarHeight = 64;

const SiteHomepageCarouselDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchImages,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddField = () => {
    setEditFields([...editFields, { img_url: "" }]);
  };

  const handleRemoveField = (index) => {
    setEditFields(editFields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index, value) => {
    const updatedFields = [...editFields];
    updatedFields[index] = { ...updatedFields[index], img_url: value };
    setEditFields(updatedFields);
  };

  const handleSaveChanges = async () => {
    const token = Cookies.get("administration_token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }

    setIsLoading(true);
    try {
      // Prepare batch payload
      const payloads = editFields.map((field) => ({
        img_url: field.img_url || null,
        ...(field.id && { id: field.id }), // Include ID for updates
      }));

      // Batch process: Handle updates and creates separately
      const updates = payloads.filter(p => p.id);
      const creates = payloads.filter(p => !p.id);

      // Process updates
      for (const update of updates) {
        const { id, ...data } = update;
        await axios.put(`/api/site-homepage-carousel/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // Process creates in a single POST request
      if (creates.length > 0) {
        await axios.post(`/api/site-homepage-carousel`, creates, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      toast.success("🎉 Carousel images saved successfully!");
      handleSaveAndCloseModal();
      fetchImages();
      setEditFields([{ img_url: "" }]);
    } catch (err) {
      console.error("Save Error:", err.response?.data || err.message);
      toast.error("❌ Error saving carousel images.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ position: "relative" }}>
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
        <ListItemButton
          sx={{
            backgroundColor: "#263238",
            color: "#fff",
            "&:hover": { backgroundColor: "#263238" },
          }}
        >
          <ListItemIcon>
            <Image />
          </ListItemIcon>
          <ListItemText primary="Manage Carousel Images" />
          <Button
            onClick={fetchImages}
            variant="outlined"
            sx={{ position: "absolute", right: 90, top: 8, color: "#00c853", borderColor: "#00c853" }}
          >
            <RotateRight />
          </Button>
          <Button
            onClick={handleCloseModal}
            variant="outlined"
            color="error"
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </Button>
        </ListItemButton>
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
              <Box sx={{ maxHeight: "80vh", overflowY: "auto" }}>
                {editFields.map((field, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 3,
                      p: 2,
                      border: "2px solid #333",
                      borderRadius: 2,
                      bgcolor: "#181818",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <TextField
                      label="Image URL"
                      fullWidth
                      margin="normal"
                      value={field.img_url ?? ""}
                      onChange={(e) => handleFieldChange(index, e.target.value)}
                      sx={textFieldStyles}
                    />
                    {editFields.length > 1 && (
                      <IconButton color="error" onClick={() => handleRemoveField(index)}>
                        <Close />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Add />}
                  onClick={handleAddField}
                  sx={{ mt: 2 }}
                >
                  Add Image
                </Button>
              </Box>
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
      {isLoading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
            zIndex: 9999,
            backgroundColor: "rgba(2, 2, 20, 0.28)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backdropFilter: "blur(2px)",
          }}
        >
          <CircularProgress size={180} />
        </Box>
      )}
    </Box>
  );
};

export default SiteHomepageCarouselDialog;