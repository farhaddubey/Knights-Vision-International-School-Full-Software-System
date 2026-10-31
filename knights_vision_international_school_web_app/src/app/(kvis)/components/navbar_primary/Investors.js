// src/app/components/InvestorsDropdown.js
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
import BusinessIcon from "@mui/icons-material/Business";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import "./dropdown.css";
import { BusinessCenter } from "@mui/icons-material";

const investorSections = [
  {
    title: "Company Overview",
    description: "A global leader in innovative productivity tools driving digital transformation.",
    icon: <BusinessIcon />,
  },
  {
    title: "Financial Highlights",
    description: "Consistent growth with strong revenue streams and scalable operations.",
    icon: <TrendingUpIcon />,
  },
  {
    title: "Investment Opportunities",
    description: "Join our mission to revolutionize industries with high-growth potential.",
    icon: <MonetizationOnIcon />,
  },
  {
    title: "Growth Strategy",
    description: "Expanding globally with cutting-edge solutions for market leadership.",
    icon: <RocketLaunchIcon />,
  },
  {
    title: "Investor Contact",
    link: "/contact-investors",
    description: "Connect with our team to explore investment possibilities.",
    icon: <ContactMailIcon />,
  },
];

const InvestorsDropdown = () => {
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
          <BusinessCenter/>
        <Typography
          variant="caption"
          mx={{ xs: 1}}>
          Investors
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
          {investorSections.map((section, index) => (
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
                  minWidth: 36,
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
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    {section.description}
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

export default InvestorsDropdown;