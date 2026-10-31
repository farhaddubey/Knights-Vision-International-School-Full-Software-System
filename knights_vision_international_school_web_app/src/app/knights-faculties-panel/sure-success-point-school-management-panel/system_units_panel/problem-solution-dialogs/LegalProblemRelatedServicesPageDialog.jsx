import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  CardMedia,
  LinearProgress,
  Divider,
} from "@mui/material";
import { RotateRight, Close } from "@mui/icons-material";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useParams, useRouter } from "next/navigation";


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
  const { id } = useParams();
  const navigate = useRouter();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/legal-problems/${id}/related-services`);
      setServices(response.data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching related services:", err);
      setError("Failed to fetch related services.");
      toast.error("Failed to fetch related services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [id]);

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `${drawerWidth}px`,
        width: `calc(100vw - ${drawerWidth}px)`,
        height: `calc(100vh - ${appBarHeight}px)`,
        backgroundColor: "#000",
        color: "#fff",
        p: 1,
        overflowY: "auto",
      }}
    >
      <ToastContainer theme="dark" position="bottom-center" autoClose={5000} />
      {loading && <LinearProgress sx={{ width: "100%", position: "absolute", top: 0, backgroundColor: "#1e1e1e" }} />}
      <Box sx={{ bgcolor: "#1a237e", color: "#fff", p: 1, display: "flex", alignItems: "center" }}>
        <Typography variant="h6">Related Services for Legal Problem</Typography>
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

      <Box sx={{ display: "flex", flexDirection: "row", p: 1 }}>
        <Box sx={{ flex: 1, pr: 1, maxHeight: "80vh", overflowY: "auto" }}>
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Related Services</Typography>
          <Divider sx={{ mb: 2, bgcolor: "#fff" }} />
          {error && <Typography sx={{ mt: 2, color: "#ff5252" }}>{error}</Typography>}
          {services.length > 0 ? (
            <Grid container spacing={3}>
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
                      maxWidth: "285px",
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
                      <Typography variant="caption" sx={{ color: "#00c853", fontWeight: 500 }}>
                        {service.visibilityScope || "PUBLIC"}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#888" }}>
                        Price: {service.price ? `${service.currencyCode} ${service.price}` : "N/A"}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography>No related services found.</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default RelatedServicesPage;