"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  useTheme,
} from "@mui/material";
import { keyframes } from "@mui/system";
import styled from "@emotion/styled";
import axios from "axios";

// Animation for glowing text
const glow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const GlowingSubTitle = styled(Typography)`
  font-size: 1rem;
  font-weight: bold;
  background: linear-gradient(
    45deg,
    #ff0000,
    #ff7300,
    #fffb00,
    #48ff00,
    #00ffd5,
    #002bff,
    #7a00ff,
    #ff00e0
  );
  background-size: 200% 200%;
  animation: ${glow} 10s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const GlowingMainTitle = styled(Typography)`
  font-weight: 900;
  background: linear-gradient(
    45deg,
    #ff0000,
    #ff7300,
    #fffb00,
    #48ff00,
    #00ffd5,
    #002bff,
    #7a00ff,
    #ff00e0
  );
  background-size: 200% 200%;
  animation: ${glow} 8s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const defaultCities = [
  {
    id: 1,
    img_url:
      "https://firebasestorage.googleapis.com/v0/b/sspointnextflutterappadmin.firebasestorage.app/o/images%2Fcity-delhi.avif?alt=media",
    title: "Delhi",
  },
  {
    id: 2,
    img_url:
      "https://firebasestorage.googleapis.com/v0/b/sspointnextflutterappadmin.firebasestorage.app/o/images%2Fcity-mumbai.avif?alt=media",
    title: "Mumbai",
  },
];

// Functional component for individual City Cards
const CityCard = ({ city }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "#000",
        color: "#ffffff",
        borderRadius: 5,
        paddingX: theme.spacing(1),
        paddingY: theme.spacing(0.2),
        margin: theme.spacing(0.5),
        minWidth: 130,
        width: "fit-content",
        transition: "transform 0.5s, backgroundColor 0.3s",
        "&:hover": {
          transform: "scale(1.15)",
        },
        fontSize: { xs: "0.12rem" },
      }}
    >
      <CardMedia
        component="img"
        image={city.url || "https://via.placeholder.com/50"}
        alt={city.title}
        sx={{
          width: { xs: 30, md: 50 },
          height: { xs: 30, md: 50 },
          borderRadius: "100%",
        }}
      />
      <CardContent
        sx={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <GlowingSubTitle>{city.title}</GlowingSubTitle>
      </CardContent>
    </Card>
  );
};

// Main Component
const CityGrid = () => {
  const [cities, setCities] = useState(defaultCities);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get("/api/feature-school-center-cities");
        const cityData = response.data.map((item) => ({
          id: item.id,
          url: item.img_url,
          title: item.title || "Sure Success Point School",
        }));
        setCities(cityData.length > 0 ? cityData : defaultCities);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load city data:", err);
        setError("Failed to load city data");
        setCities(defaultCities);
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  if (loading) return <Typography align="center">Loading cities...</Typography>;
  if (error && cities.length === 0)
    return (
      <Typography align="center" color="error">
        {error}
      </Typography>
    );

  return (
    <Box sx={{ py: 3, color: "#e0e0e0", backgroundColor: "#000" }}>
      <Box sx={{ px: { xs: 0.3, md: 2 } }}>
        <Typography
          variant="h4"
          align="center"
          fontWeight="bold"
          sx={{
            mb: 2,
            fontSize: {
              xs: "1rem",
              sm: "1.8rem",
              md: "1.8rem",
              lg: "2.5rem",
            },
          }}
        >
          Find Sure Success Point School Education Centres in Your
          City
        </Typography>
        <GlowingMainTitle
          variant="h6"
          align="center"
          fontWeight="bold"
          sx={{
            mb: 4,
            fontSize: {
              xs: "1.2rem",
              sm: "1.8rem",
              md: "1.8rem",
              lg: "2.8rem",
            },
            backgroundColor: "#000000", // Black background for stronger vibe
            padding: "4px 8px", // Add padding for better contrast
            borderRadius: "4px", // Subtle rounding for aesthetics
          }}
        >
          A Unit of Knights International Group for Research, Education &
          Academic Development
        </GlowingMainTitle>
      </Box>
      <Box
        sx={{
          display: "flex",
          backgroundColor: "#101010",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 1,
          width: "100vw",
          paddingX: 2,
          py: 2,
          maxHeight: { xs: "240px", md: "345px" }, // Height for 3 rows
          overflowY: "auto", // Enable vertical scrolling
          scrollbarWidth: "none", // Hide scrollbar for Firefox
          "&::-webkit-scrollbar": { display: "none" }, // Hide scrollbar for WebKit
        }}
      >
        {cities.map((city) => (
          <CityCard key={city.id} city={city} />
        ))}
      </Box>
      <Box sx={{ px: { xs: 0.3, md: 2 }, pt: 3 }}>
        <GlowingMainTitle
          variant="h3"
          align="center"
          fontWeight="bold"
          sx={{
            mb: 4,
            fontSize: {
              xs: "1.2rem",
              sm: "1.8rem",
              md: "1.8rem",
              lg: "3.3rem",
            },
            backgroundColor: "#000000", // Black background for stronger vibe
            padding: "4px 8px", // Add padding for better contrast
            borderRadius: "4px", // Subtle rounding for aesthetics
          }}
        >
          Knights i READ - KiREAD Group - Knights Group
        </GlowingMainTitle>
      </Box>
    </Box>
  );
};

export default CityGrid;
