import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  TextField,
  CircularProgress,
} from "@mui/material";
import { Image, Edit, Delete, Add, RotateRight, Search } from "@mui/icons-material";
import { toast } from "react-toastify";
import SiteHomepageCarouselDialog from "./AppHomepageCarouselDialog";

const drawerWidth = 280;
const appBarHeight = 64;

const SiteHomepageCarousel = () => {
  const [carouselImages, setCarouselImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editFields, setEditFields] = useState([]);

  const fetchImages = async () => {
    const token = Cookies.get("faculties_token");
    if (!token) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`/api/site-homepage-carousel`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCarouselImages(response.data);
      setFilteredImages(response.data);
    } catch (err) {
      console.error("Error fetching carousel images:", err);
      setError("Failed to fetch carousel images.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = carouselImages.filter((image) =>
      image.img_url?.toLowerCase().includes(query)
    );
    setFilteredImages(filtered);
  };

  const handleOpenDialog = (image = null) => {
    if (image) {
      setEditFields([{ id: image.id, img_url: image.img_url || "" }]);
    } else {
      setEditFields([{ img_url: "" }]);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    if (window.confirm("Are you sure you want to close the modal, unsaved?")) {
      setOpenDialog(false);
      setEditFields([]);
    }
  };

  const handleSaveAndCloseDialog = () => {
    setOpenDialog(false);
    setEditFields([]);
  };

  const handleDeleteImage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    const token = Cookies.get("faculties_token");
    if (!token) {
      toast.error("User not authenticated.");
      return;
    }
    try {
      await axios.delete(`/api/site-homepage-carousel/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Image deleted successfully!");
      fetchImages();
    } catch (err) {
      console.error("Delete Error:", err.response?.data || err.message);
      toast.error("❌ Error deleting image.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress size={120} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ textAlign: "center", mt: 4 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        minWidth: `calc(100vw - ${drawerWidth}px)`,
        backgroundColor: "#212121",
        height: `calc(100vh - ${appBarHeight}px)`,
        color: "#fff",
      }}
    >
      <ListItemButton
        sx={{
          backgroundColor: "#181818",
          color: "#fff",
          "&:hover": { backgroundColor: "#181818" },
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "8px 16px",
          borderRadius: 1,
        }}
      >
        <ListItemIcon sx={{ fontSize: 30, color: "orange", fontWeight: "bold" }}>
          🖼️
        </ListItemIcon>
        <ListItemText primary="Homepage Carousel Control Panel" />
        <TextField
          placeholder="Search by Image URL"
          value={searchQuery}
          onChange={handleSearch}
          size="small"
          sx={{
            width: "250px",
            backgroundColor: "#333",
            borderRadius: "4px",
            "& .MuiInputBase-input": { color: "#fff" },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
          }}
          InputProps={{
            startAdornment: <Search sx={{ color: "#fff", mr: 1 }} />,
          }}
        />
        <Button
          onClick={fetchImages}
          variant="outlined"
          sx={{ color: "#00c853", borderColor: "#00c853" }}
        >
          <RotateRight />
        </Button>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          <Add /> Add New Image
        </Button>
      </ListItemButton>

      <Box sx={{ bgcolor: "#181818", borderRadius: 2, overflow: "hidden" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            p: 1,
            bgcolor: "#333",
            borderRadius: 1,
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Typography variant="body2" sx={{ flex: 0.5, fontWeight: "bold", color: "#fff" }}>
            ID
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold", color: "#fff" }}>
            Image Preview
          </Typography>
          <Typography variant="body2" sx={{ flex: 2, fontWeight: "bold", color: "#fff" }}>
            Image URL
          </Typography>
          <Box sx={{ flex: 0.8 }}></Box>
        </Box>

        <Box sx={{ maxHeight: "700px", overflowY: "auto", bgcolor: "#121212", borderRadius: 1 }}>
          <List>
            {filteredImages.map((image) => (
              <ListItem
                key={image.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  p: 1,
                  bgcolor: "#181818",
                  mb: 1,
                  borderRadius: 1,
                  borderBottom: "2px solid #333",
                }}
              >
                <Typography variant="body2" sx={{ flex: 0.5, color: "#fff" }}>
                  {image.id}
                </Typography>
                <Box
                  component="img"
                  src={image.img_url ?? "/placeholder.png"}
                  alt="Carousel Image"
                  sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1, flex: 1 }}
                />
                <Typography variant="body2" sx={{ flex: 2, color: "#fff" }}>
                  {image.img_url ?? "N/A"}
                </Typography>
                <Box sx={{ flex: 0.8, display: "flex", gap: 1 }}>
                  <Button variant="outlined" color="primary" onClick={() => handleOpenDialog(image)}>
                    <Edit /> Edit
                  </Button>
                  <Button variant="outlined" color="error" onClick={() => handleDeleteImage(image.id)}>
                    <Delete /> Delete
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      <SiteHomepageCarouselDialog
        openInsertion={openDialog}
        handleCloseModal={handleCloseDialog}
        handleSaveAndCloseModal={handleSaveAndCloseDialog}
        editFields={editFields}
        setEditFields={setEditFields}
        fetchImages={fetchImages}
      />
    </Box>
  );
};

export default SiteHomepageCarousel;