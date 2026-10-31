"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  LinearProgress,
  Fade,
  Chip,
} from "@mui/material";
import { RotateRight, LocationOn, Verified } from "@mui/icons-material";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dynamic from "next/dynamic";
import Link from "next/link";

// Dynamically import Leaflet to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

import "leaflet/dist/leaflet.css";

const drawerWidth = 280;
const appBarHeight = 64;
const greenAccent = "#00c853";

const LegalServiceCentersMapPage = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCenters = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/legal-service-centers");
      setCenters(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching centers:", err);
      setError("Failed to fetch legal service centers.");
      toast.error("Failed to fetch legal service centers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  // Default center for map (India)
  const mapCenter = [20.5937, 78.9629];
  const zoomLevel = 5;

  return (
    <Box
      sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `${drawerWidth}px`,
        width: `calc(100vw - ${drawerWidth}px)`,
        height: `calc(100vh - ${appBarHeight}px)`,
        background: "#121212",
        color: "#fff",
        p: 3,
        overflowY: "auto",
      }}
    >
      <ToastContainer theme="dark" position="bottom-center" autoClose={5000} />
      {loading && (
        <LinearProgress
          sx={{
            width: "100%",
            position: "absolute",
            top: 0,
            bgcolor: "#1e1e1e",
            "& .MuiLinearProgress-bar": { bgcolor: greenAccent },
          }}
        />
      )}
      <Fade in timeout={1000}>
        <Box
          sx={{
            bgcolor: "rgba(30, 30, 30, 0.8)",
            backdropFilter: "blur(8px)",
            color: "#fff",
            p: 3,
            borderRadius: 3,
            mb: 4,
            display: "flex",
            alignItems: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            border: "1px solid #444",
          }}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, flexGrow: 1, letterSpacing: 0.5 }}
          >
            Legal Service Centers Map
          </Typography>
          <Button
            onClick={fetchCenters}
            variant="outlined"
            sx={{
              color: greenAccent,
              borderColor: greenAccent,
              "&:hover": { bgcolor: "rgba(0,200,83,0.1)", borderColor: greenAccent },
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
            }}
            startIcon={<RotateRight sx={{ color: greenAccent }} />}
          >
            Refresh
          </Button>
        </Box>
      </Fade>

      <Grid container spacing={4}>
        <Grid item xs={12} lg={6}>
          <Paper
            elevation={6}
            sx={{
              height: 400,
              borderRadius: 3,
              overflow: "hidden",
              border: "1px solid #444",
            }}
          >
            <MapContainer
              center={mapCenter}
              zoom={zoomLevel}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {centers
                .filter((c) => c.latitude && c.longitude)
                .map((center) => (
                  <Marker key={center.id} position={[center.latitude, center.longitude]}>
                    <Popup>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {center.name}
                      </Typography>
                      <Typography variant="body2">
                        {center.city}, {center.state}
                      </Typography>
                      <Button
                        component={Link}
                        href={`/legal-service-centers/${center.id}`}
                        size="small"
                        sx={{ color: greenAccent, mt: 1 }}
                      >
                        View Details
                      </Button>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Box sx={{ maxHeight: "80vh", overflowY: "auto" }}>
            {error && (
              <Typography sx={{ mt: 2, color: "#ff5252", fontWeight: 600, textAlign: "center" }}>
                {error}
              </Typography>
            )}
            {centers.length > 0 ? (
              <Grid container spacing={3}>
                {centers.map((center) => (
                  <Grid item xs={12} key={center.id}>
                    <Paper
                      elevation={6}
                      sx={{
                        background: "linear-gradient(145deg, #1e1e1e, #121212)",
                        borderRadius: 3,
                        border: "1px solid #444",
                        p: 3,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.02)",
                          boxShadow: "0 8px 16px rgba(0,0,0,0.4)",
                          borderColor: greenAccent,
                        },
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ color: "#fff", fontWeight: 700, mb: 2 }}
                      >
                        {center.name}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <LocationOn sx={{ color: "#bbb", fontSize: 18, mr: 0.5 }} />
                        <Typography variant="body2" sx={{ color: "#bbb" }}>
                          {center.city}, {center.state}, {center.country}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                        {center.isVerified && (
                          <Chip
                            label="Verified"
                            icon={<Verified />}
                            sx={{ bgcolor: greenAccent, color: "#121212", fontWeight: 600 }}
                          />
                        )}
                        <Chip
                          label={center.isOperational ? "Operational" : "Closed"}
                          sx={{
                            bgcolor: center.isOperational ? "#1e1e1e" : "#ff5252",
                            color: "#fff",
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                      {center.services?.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ color: "#fff", mb: 1 }}>
                            Available Services:
                          </Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {center.services.map((s) => (
                              <Chip
                                key={s.service.id}
                                label={s.service.name}
                                sx={{ bgcolor: "#1e1e1e", color: "#fff", fontWeight: 500 }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                      <Button
                        component={Link}
                        href={`/legal-service-centers/${center.id}`}
                        variant="outlined"
                        sx={{
                          color: greenAccent,
                          borderColor: greenAccent,
                          "&:hover": { bgcolor: "rgba(0,200,83,0.1)" },
                          width: "100%",
                        }}
                      >
                        View Details
                      </Button>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography
                variant="h6"
                sx={{ color: "#888", textAlign: "center", mt: 6, fontWeight: 500 }}
              >
                No legal service centers found.
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LegalServiceCentersMapPage;