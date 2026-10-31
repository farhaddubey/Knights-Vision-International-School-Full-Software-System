// components/ExamCategories.jsx
"use client";
import React from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CategoryIcon from "@mui/icons-material/Category"; // Icon next to subcategories
import { ArrowCircleRight, School } from "@mui/icons-material";
import Link from "next/link"; // Assuming React Router is being used for navigation
import { keyframes, width } from "@mui/system";
import styled from "@emotion/styled";
const titleAnimation = keyframes`
    0% {background-position: 0% 50%;}
    50% {background-position: 100% 50%;}
    100% {background-position: 0% 50%;}
`;
const glow = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;
const GlowingSubTitle = styled(Typography)`
  font-size: 1.5rem;
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
const GlowingTitle = styled(Typography)`
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(
    90deg,
    rgb(72, 0, 255),
    #c800ff,
    rgb(255, 0, 0),
    #ff00f0
  );
  background-size: 200% 200%;
  animation: ${titleAnimation} 5s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;
const categories = [
  {
    title: "Nursury School Preparation",
    subcategories: [
      "Class KGI",
      "Class KGII",
      "Class I",
      "Class II",
      "Class III",
      "Class IV",
    ],
    link: "/school-prep",
  },
  {
    title: "Secondary School Preparation",
    subcategories: [
      "Class V",
      "Class VI",
      "Class VII",
      "Class VIII",
      "Class IX",
      "Class X",
    ],
    link: "/school-prep",
  },
  {
    title: "Higher Seconday School Preparation",
    subcategories: ["Class XI", "Class XII"],
    link: "/school-prep",
  },
  {
    title: "NEET",
    subcategories: ["Class 11", "Class 12", "Dropper"],
    link: "/neet", // Add the actual category link
  },
  {
    title: "IIT JEE",
    subcategories: ["Class 11", "Class 12", "Dropper"],
    link: "/iit-jee",
  },
  {
    title: "Govt Job Exams",
    subcategories: ["SSC", "Banking", "Teaching", "Judiciary"],
    link: "/govt-job-exams",
  },
  {
    title: "Defence",
    subcategories: ["NDA", "CDS", "AFCAT", "Agniveer"],
    link: "/defence",
  },
  {
    title: "UPSC",
    subcategories: ["IAS", "IPS", "IFS"],
    link: "/defence-2",
  },
  {
    title: "State PSC",
    subcategories: ["SI", "DM"],
    link: "/defence-2",
  },
  {
    title: "Gate, Olympiad",
    subcategories: ["PSU", "PhD"],
    link: "/defence-2",
  },
  {
    title: "Law",
    subcategories: ["Lawer"],
    link: "/defence-2",
  },
];

const ExamCategories = () => {
  return (
    <Box
      sx={{
        my: 5,
        px: 1,
        color: "#e0e0e0",
        minHeight: "100vh",
        maxWidth: "100vw",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          textAlign: "center",
          alignItems: "center",
          alignContent: "center",
          mb: 1,
        }}
      >
        <GlowingTitle variant="h4" align="center" sx={{ mb: 0 }}>
          Exam Categories
        </GlowingTitle>
        <GlowingSubTitle
          variant="h4"
          align="center"
          sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}
        >
          <b>
            Sure Success Point School
            <School /> is preparing students for 18 exam categories.
          </b>
        </GlowingSubTitle>
      </Box>

      <Grid container spacing={1.2} justifyContent="center">
        {categories.map((category, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                background:
                  "linear-gradient(135deg, rgba(0, 0, 93, 0.39) 10%, rgb(0, 0, 0) 80%)",
                minWidth: "358px",
                color: "#e0e0e0",
                borderRadius: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                // boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.7)',
                "&:hover": {
                  transform: "scale(1.15)",
                  boxShadow: "0px 2px 2px rgba(255, 255, 255, 255)",
                  transition: "all 0.4s ease",
                  zIndex: 50,
                },
              }}
            >
              <CardContent>
                {/* Title with Glowing Effect */}
                <GlowingSubTitle
                  sx={{
                    display: "inline-block",
                    textDecoration: "none",
                    color: "#e0e0e0",
                    fontSize: ".25rem",
                  }}
                >
                  {category.title}
                </GlowingSubTitle>

                {/* Subcategories */}
                <Grid container spacing={1} alignItems="center" sx={{ mt: 1 }}>
                  {category.subcategories.map((subcat, i) => (
                    <Grid item xs={12} key={i}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <CategoryIcon sx={{ color: "#9e9e9e", mr: 1 }} />{" "}
                        {/* Subcategory Icon */}
                        <Chip
                          label={subcat}
                          sx={{
                            backgroundColor: "#2c2c2c",
                            color: "#f5f5f5",
                            borderRadius: 2,
                            fontWeight: "medium",
                            py: 0.5,
                            px: 2,
                            width: "fit-content",
                            "&:hover": {
                              backgroundColor: "#ff4081",
                              color: "#fff",
                              transition: "0.3s",
                            },
                          }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>

              {/* Explore Button */}
              <Box sx={{ py: 2, px: 3, textAlign: "left" }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ArrowForwardIcon />}
                  sx={{
                    color: "#fff",
                    backgroundColor: "#6200ea",
                    textTransform: "none",
                  }}
                >
                  Explore Category
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}

        {/* Explore All Button */}
        <Button
          sx={{
            alignSelf: "flex-end", // Aligns button to the right within its container
            marginLeft: "auto", // Pushes button to the right edge
            marginRight: 2, // Optional: Adds some space from the right edge
            color: "#fff",
          }}
          variant="contained"
          endIcon={<ArrowCircleRight />}
        >
          Explore All
        </Button>
      </Grid>
    </Box>
  );
};

export default ExamCategories;
