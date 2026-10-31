// src/app/components/CareersDropdown.js
"use client";

import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import WorkIcon from "@mui/icons-material/Work";
import ComputerIcon from "@mui/icons-material/Computer";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ScienceIcon from "@mui/icons-material/Science";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import "./dropdown.css";
import { Computer, Engineering, SystemUpdateTwoTone } from "@mui/icons-material";

const careerSections = [
  {
    title: "Careers Overview",
    description: "Join a global team shaping the future of digital productivity and innovation.",
    icon: <WorkIcon />,
  },
  {
    title: "IT Careers",
    description: "Build cutting-edge tech solutions in software development, AI, and more.",
    icon: <ComputerIcon />,
  },
  {
    title: "Non-IT Careers",
    description: "Drive impact in marketing, HR, finance, and other dynamic roles.",
    icon: <BusinessCenterIcon />,
  },
  {
    title: "Delivery Careers",
    description: "Lead seamless project execution and client success worldwide.",
    icon: <LocalShippingIcon />,
  },
  {
    title: "Research Careers",
    description: "Innovate and explore new frontiers in technology and solutions.",
    icon: <ScienceIcon />,
  },
];

const CareersDropdown = () => {
  const theme = useTheme();

  return (
    <Box className="dropdown" sx={{ position: "relative", display: "inline-block" }}>
          <IconButton
        size="small"
        edge="end"
        aria-label="News & Media Info"
        className="dropdown-btn"
        sx={{
          display: "flex",
          pt: 1,
          flexDirection: { xs: "row", md: "column" },
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          textAlign: { xs: "left", md: "center" },
          borderRadius: 2,
          transition: "all 0.5s ease",
          "&:hover": {
            color: theme.palette.primary.main,
            backgroundColor: theme.palette.action.hover,
            transform: "scale(1.15)",
          },
        }}
      >
        <Box  sx={{
              color: "white",
              fontSize: { xs: 24, md: 30 },
              "&:hover": { color: theme.palette.primary.main },
              display:"flex", 
              flexDirection:"column",
              alignItems:'center'
            }}>
          <Engineering/>
        <Typography
          variant="caption"
          mx={{ xs: 1}}>
          Careers
        </Typography>
        </Box>
      </IconButton>

      <Box
        className="dropdown-content"
        sx={{
          display: "none",
          position: "absolute",
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[5],
          zIndex: 2,
          borderRadius: 2,
          padding: 2,
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          maxWidth: 400,
          width: { xs: "90vw", md: "auto" },
          textAlign: "left",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          opacity: 0,
          transformOrigin: "top center",
          "&:hover": {
            display: "block",
            opacity: 1,
            transform: "translateX(-50%) scale(1.02)",
          },
          ".dropdown:hover &": {
            display: "block",
            opacity: 1,
            transform: "translateX(-50%) scale(1.02)",
          },
          "@media (max-width: 600px)": {
            left: "50%",
            transform: "translateX(-50%)",
            width: "90vw",
            maxWidth: "none",
          },
        }}
      >
        <List>
          {careerSections.map((section, index) => (
            <ListItem
              key={index}
              component={section.link ? Link : "div"}
              href={section.link || undefined}
              sx={{
                alignItems: "flex-start",
                mb: 1,
                borderRadius: 1,
                transition: "background-color 0.2s ease",
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.primary.main,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: theme.palette.primary.main,
                }}
              >
                {section.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" fontWeight="bold">
                    {section.title}
                  </Typography>
                }
     
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default CareersDropdown;