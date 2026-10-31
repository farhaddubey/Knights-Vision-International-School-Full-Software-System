import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  Grid,
  Paper,
  CardMedia,
  Box,
  Typography,
  Button,
  LinearProgress,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Add, Close } from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";
import ServicesByCategoryDialog from "./ExploreServicesByCategoryIdDialog";

const drawerWidth = 280;
const appBarHeight = 68;

const BrowseCategoriesDialog = ({
  openInsertion,
  handleCloseModal,
  editFields,
  handleExploreServices,
}) => {
  const [categories, setCategories] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [servicesDialogOpen, setServicesDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchCategories = async (departmentId) => {
    if (!departmentId) {
      setCategories([]);
      return;
    }
    setApiLoading(true);
    try {
      const response = await axios.get(
        `/api/departments/categories_by_department_id?departmentId=${departmentId}`
      );
      setCategories(response.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to fetch categories.");
      toast.error("Failed to fetch categories.");
    } finally {
      setApiLoading(false);
    }
  };
  const handleOpenServicesDialog = (category) => {
    setSelectedCategory(category);
    setServicesDialogOpen(true);
  };

  const handleCloseServicesDialog = () => {
    setServicesDialogOpen(false);
    setSelectedCategory(null);
  };

  useEffect(() => {
    fetchCategories(editFields?.id);
  }, [editFields?.id]);

  return (
    <>
    <Dialog
      sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        transform: "translate(0, 0)",
        background: "#000",
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
        <ListItemText primary={`Categories of Department ${editFields?.name}`} />
        <Button
          onClick={handleCloseModal}
          variant="outlined"
          sx={{ position: "absolute", right: 8, top: 8, color: "#f44336", borderColor: "#f44336" }}
          startIcon={<Close />}
        >
          Close
        </Button>
      </ListItem>
      <DialogContent sx={{ p: 2, background: "#000" }}>
        <Grid container spacing={3} sx={{ overflowY: "scroll", maxHeight: "85vh" }}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} lg={3} key={category.id}>
              <Paper
                elevation={3}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  backgroundColor: "#000",
                  borderRadius: 2,
                  overflow: "hidden",
                  width: "285px",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                  },
                }}
              >
                {category.image ? (
                  <CardMedia
                    component="img"
                    height="140"
                    image={category.image}
                    alt={category.name}
                    sx={{ objectFit: "cover" }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 140,
                      backgroundColor: "#333",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography color="#bbb">No Image</Typography>
                  </Box>
                )}
                <Box sx={{ p: 2, flexGrow: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600 }}>
                    {category.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#bbb" }}>
                    {category.description || "No description available"}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, display: "flex", gap: 1, justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => handleOpenServicesDialog(category)}
                  >
                    Explore Services
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
      {selectedCategory && (
        <ServicesByCategoryDialog
          open={servicesDialogOpen}
          handleClose={handleCloseServicesDialog}
          category={selectedCategory}
        />
      )}
    </>
  );
};

export default BrowseCategoriesDialog