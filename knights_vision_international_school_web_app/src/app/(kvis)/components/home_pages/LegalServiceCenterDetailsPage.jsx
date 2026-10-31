"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  LinearProgress,
  Grid,
  Chip,
} from "@mui/material";
import { LocationOn, Phone, Email, Language, AccessTime, Verified } from "@mui/icons-material";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";

const drawerWidth = 280;
const appBarHeight = 64;
const greenAccent = "#00c853";

const LegalServiceCenterDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCenter = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/legal-service-centers/${id}`);
      setCenter(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching center:", err);
      setError("Failed to fetch legal service center.");
      toast.error("Failed to fetch legal service center.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCenter();
  }, [id]);

  if (!center && !loading) {
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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h6" sx={{ color: "#888" }}>
          {error || "Legal service center not found."}
        </Typography>
      </Box>
    );
  }

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
      {center && (
        <Paper
          elevation={6}
          sx={{
            maxWidth: 1200,
            mx: "auto",
            background: "linear-gradient(145deg, #1e1e1e, #121212)",
            borderRadius: 3,
            border: "1px solid #444",
            p: 4,
          }}
        >
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: 300,
                  borderRadius: 2,
                  overflow: "hidden",
                  mb: 2,
                }}
              >
                <img
                  src={center.coverImageUrl || "/images/center-placeholder.png"}
                  alt={center.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  overflow: "hidden",
                  mx: "auto",
                  mb: 2,
                  border: "1px solid #444",
                }}
              >
                <img
                  src={center.logoUrl || "/images/logo-placeholder.png"}
                  alt={`${center.name} logo`}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                {center.name}
              </Typography>
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
              <Typography variant="body1" sx={{ color: "#bbb", mb: 2, lineHeight: 1.8 }}>
                {center.description || "No description available."}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <LocationOn sx={{ color: "#bbb", mr: 1 }} />
                  <Typography variant="body2" sx={{ color: "#bbb" }}>
                    {center.address}, {center.city}, {center.state}, {center.country} {center.postalCode}
                  </Typography>
                </Box>
                {center.phoneNumber && (
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Phone sx={{ color: "#bbb", mr: 1 }} />
                    <Typography variant="body2" sx={{ color: "#bbb" }}>
                      {center.phoneCode} {center.phoneNumber}
                    </Typography>
                  </Box>
                )}
                {center.email && (
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Email sx={{ color: "#bbb", mr: 1 }} />
                    <Typography variant="body2" sx={{ color: "#bbb" }}>
                      {center.email}
                    </Typography>
                  </Box>
                )}
                {center.websiteUrl && (
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Language sx={{ color: "#bbb", mr: 1 }} />
                    <Typography
                      variant="body2"
                      sx={{ color: "#bbb", textDecoration: "underline", cursor: "pointer" }}
                      onClick={() => window.open(center.websiteUrl, "_blank")}
                    >
                      {center.websiteUrl}
                    </Typography>
                  </Box>
                )}
              </Box>
              {center.operatingHours?.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ color: "#fff", mb: 1 }}>
                    Operating Hours
                  </Typography>
                  {center.operatingHours.map((hour) => (
                    <Box key={hour.id} sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                      <AccessTime sx={{ color: "#bbb", mr: 1, fontSize: 18 }} />
                      <Typography variant="body2" sx={{ color: "#bbb" }}>
                        {hour.day}: {hour.openTime} - {hour.closeTime}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
              {center.services?.length > 0 && (
                <Box>
                  <Typography variant="h6" sx={{ color: "#fff", mb: 1 }}>
                    Available Services
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
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default LegalServiceCenterDetailsPage;