// components/InstituteIntroWithFeatures.jsx
"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  keyframes,
  Alert,
  AlertTitle,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import styled from "@emotion/styled";
const titleAnimation = keyframes`
    0% {background-position: 0% 50%;}
    50% {background-position: 100% 50%;}
    100% {background-position: 0% 50%;}
`;
const GlowingTitle = styled(Typography)`
  font-size: 2rem;
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
const instituteFeatures = [
  {
    title: "🌟🎓 Highly Qualified and Experienced Faculty",
    description:
      "Our team consists of highly skilled educators with decades of experience in both academic and professional fields. They are deeply committed to providing a supportive, intellectually stimulating environment that fosters both academic excellence and personal growth, guiding students toward success at every step.",
  },
  {
    title: "📚💡 Innovative and Comprehensive Curriculum",
    description:
      "Our curriculum is thoughtfully crafted to combine theoretical knowledge with real-world applications. It takes a holistic approach, offering a rich blend of core academics, extracurricular activities, and vital life skills, ensuring students are fully prepared for global challenges and lifelong learning.",
  },
  {
    title: "🏫✨ Modern Infrastructure and Advanced Facilities",
    description:
      "Our state-of-the-art campus features smart classrooms, cutting-edge laboratories, a vast library, and advanced sports facilities. These modern amenities create a vibrant and interactive learning environment that promotes academic excellence while encouraging students to engage in co-curricular activities.",
  },
  {
    title: "🤝🌱 Focused and Personalized Student Development",
    description:
      "We provide personalized mentorship and career counseling to help each student identify and develop their unique talents and aspirations. Our comprehensive approach to student development nurtures confidence, creativity, and leadership skills, empowering students to excel in their chosen paths and beyond.",
  },
];

const InstituteIntroWithFeatures = () => {
  const [activeAccordion, setActiveAccordion] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);

  // Cycle through accordions every 5 seconds
  useEffect(() => {
    if (!userInteracted) {
      const interval = setInterval(() => {
        setActiveAccordion((prev) => (prev + 1) % instituteFeatures.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [userInteracted]);

  // Pause the cycle for 5 seconds when the user interacts
  useEffect(() => {
    if (userInteracted) {
      const timeout = setTimeout(() => setUserInteracted(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [userInteracted]);

  const handleAccordionChange = (index) => {
    setActiveAccordion(index);
    setUserInteracted(true);
  };

  return (
    <Box
      sx={{
        py: { xs: 0, md: 1 },
        px: { xs: 1, md: 4 },
        color: "#e0e0e0",
        borderRadius: 2,
      }}
    >
      <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={2}>
        {/* Left Section: Image with Hover Overlay */}
        <Box
          sx={{
            position: "relative",
            width: { xs: 360, md: 400 },
            height: "100%",
          }}
        >
          <Box
            component="img"
            src="https://firebasestorage.googleapis.com/v0/b/sspointnextflutterappadmin.firebasestorage.app/o/Screenshot_20241106_210309_Samsung%20Notes.jpg?alt=media&token=caf33d96-0b6a-4182-a1f9-3489b7bcaac8"
            alt="Institute"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: 2,
              boxShadow: "0px 8px 15px rgba(0,0,0,0.3)", // Shadow from the bottom
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              borderRadius: 2,
              bgcolor: "rgba(0, 0, 0, 0.5)", // Semi-transparent overlay
              display: "flex",
              alignItems: "flex-end", // Align content at the bottom
              justifyContent: "center", // Center horizontally
              color: "#fff",
              opacity: 0,
              transition: "opacity 0.3s",
              "&:hover": {
                opacity: 1,
              },
            }}
          ></Box>
          <Box
            sx={{
              width: "100%",
              bgcolor: "rgba(0, 0, 0, 0.87)",
              px: 2,
              borderRadius: 2,
              borderLeft: "5px solid #aa00ff",
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ textAlign: "flex-start" }}
            >
              Farida Yeasmin <br /> HOD, Sure Success Point School
            </Typography>
          </Box>
        </Box>

        {/* Right Section: Accordion with Features */}
        <Box flex={1}>
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Button variant="outlined" color="info" size="large">
              <Typography variant="h5" sx={{ fontSize: { xs: 20, md: 20 } }}>
                <GlowingTitle>Key Features & Strengths</GlowingTitle>
              </Typography>
            </Button>
          </Box>

          {instituteFeatures.map((feature, index) => (
            <Accordion
              key={index}
              expanded={activeAccordion === index}
              onChange={() => handleAccordionChange(index)}
              sx={{
                color: "#e0e0e0",
                borderRadius: 2,
                mb: 0.5,
                border: "2px solid #e91e63", // Red border for the accordion
                backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
                "&:hover": {
                  transition: "all 0.3s ease-in-out",
                },
              }}
            >
              {/* Header Area */}
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon
                    sx={{
                      color: "#00ffcc",
                      border: "2px solid #00ffcc", // Green border around expand icon
                      borderRadius: "50%",
                      "&:hover": {
                        backgroundColor: "rgba(0, 255, 204, 0.2)", // Subtle green glow on hover
                      },
                    }}
                  />
                }
                sx={{
                  color: "rgba(255, 0, 0, 0.2)", // Transparent red background for the header
                  borderBottom: "1px solid #e91e63", // Bottom border for separation
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "rgba(233, 30, 99, 0.4)", // Slightly darker red on hover
                  },
                }}
              >
                <Typography variant="h6" sx={{ color: "#fff" }}>
                  {feature.title}
                </Typography>
              </AccordionSummary>

              {/* Details Area */}
              <AccordionDetails
                sx={{
                  backgroundColor: "rgba(6, 0, 67, 0.8)", // Dark blue transparent background
                  borderTop: "1px solid #e91e63", // Matches the border for a cohesive look
                  borderRadius: 1,
                  paddingX: 2,
                }}
              >
                <Alert
                  severity="info"
                  sx={{ backgroundColor: "rgba(0, 255, 255, 0.2)" }}
                >
                  <Typography variant="body2" sx={{ color: "#fff" }}>
                    {feature.description}
                  </Typography>
                </Alert>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default InstituteIntroWithFeatures;
