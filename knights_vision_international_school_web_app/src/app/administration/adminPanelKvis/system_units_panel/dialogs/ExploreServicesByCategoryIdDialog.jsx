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
  Chip,
  Divider,
} from "@mui/material";
import { Add, Close } from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";

const drawerWidth = 280;
const appBarHeight = 68;

const ServicesByCategoryDialog = ({ open, handleClose, category }) => {
  const [services, setServices] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchServices = async (categoryId) => {
    if (!categoryId) {
      setServices([]);
      return;
    }
    setApiLoading(true);
    try {
      const response = await axios.get(
        `/api/categories/services_by_category_id?categoryId=${categoryId}`
      );
      setServices(response.data);
    } catch (err) {
      console.error("Error fetching services:", err);
      setError("Failed to fetch services.");
      toast.error("Failed to fetch services.");
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    fetchServices(category?.id);
  }, [category?.id]);

  return (
    <Dialog
      sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        transform: "translate(0, 0)",
        background: "#000",
      }}
      open={open}
      onClose={handleClose}
      fullScreen
    >
      {apiLoading && <LinearProgress sx={{ width: "100%", position: "absolute", top: 0 }} />}
      <ListItem sx={{ backgroundColor: "#009688", color: "#fff" }}>
        <ListItemIcon>
          <Add />
        </ListItemIcon>
        <ListItemText primary={`Services of Category ${category?.name}`} />
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{ position: "absolute", right: 8, top: 8, color: "#f44336", borderColor: "#f44336" }}
          startIcon={<Close />}
        >
          Close
        </Button>
      </ListItem>
      <DialogContent sx={{ p: 2, background: "#000" }}>
        <Grid container spacing={3} sx={{ overflowY: "scroll", maxHeight: "85vh" }}>
          {services.map((service) => (
            <Grid item xs={12} sm={6} lg={3} key={service.id}>
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
                {service.thumbnailUrl ? (
                  <CardMedia
                    component="img"
                    height="140"
                    image={service.thumbnailUrl}
                    alt={service.name}
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
                    {service.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#bbb" }}>
                    {service.description || "No description available"}
                  </Typography>
                  <Divider sx={{ my: 1, borderColor: "#333" }} />
                  <Typography variant="caption" sx={{ color: "#00c853", fontWeight: 500 }}>
                    Price: {service.currencyCode} {service.price?.toLocaleString() || "N/A"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#bbb" }}>
                    SLA: {service.slaDays ? `${service.slaDays} days` : "Not specified"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#bbb" }}>
                    Availability: {service.availability || "Not specified"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#bbb" }}>
                    Upload Mode: {service.uploadMode || "Not specified"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#bbb" }}>
                    AI Support: {service.aiSupportLevel || "None"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#bbb" }}>
                    Visibility: {service.visibilityScope || "Not specified"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#bbb" }}>
                    Created: {new Date(service.createdAt).toLocaleDateString() || "N/A"}
                  </Typography>
                  {service.isFeatured && (
                    <Chip label="Featured" size="small" color="primary" sx={{ mt: 1, width: "fit-content" }} />
                  )}
                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    {service.isOnlinePayEnabled && (
                      <Chip label="Online Payment" size="small" color="success" variant="outlined" />
                    )}
                    {service.isWhatsAppEnabled && (
                      <Chip label="WhatsApp Enabled" size="small" color="success" variant="outlined" />
                    )}
                    {service.isD2DEnabled && (
                      <Chip label="Door-to-Door" size="small" color="success" variant="outlined" />
                    )}
                  </Box>
                  {service.tags && (
                    <Typography variant="caption" sx={{ color: "#bbb", mt: 1 }}>
                      Tags: {service.tags.join(", ") || "None"}
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ color: "#bbb" }}>
                    Rating: {service.averageRating || 0} ({service.ratingCount || 0} reviews)
                  </Typography>
                  {service.introVideoUrl && (
                    <Typography variant="caption" sx={{ color: "#bbb" }}>
                      <a href={service.introVideoUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#00c853" }}>
                        Watch Intro Video
                      </a>
                    </Typography>
                  )}
                </Box>
                <Box sx={{ p: 2, display: "flex", gap: 1, justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => {
                      toast.info(`Selected service: ${service.name}`);
                    }}
                  >
                    Select Service
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default ServicesByCategoryDialog;