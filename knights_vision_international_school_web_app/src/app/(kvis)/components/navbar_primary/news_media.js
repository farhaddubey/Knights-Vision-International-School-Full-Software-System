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
import NewspaperIcon from "@mui/icons-material/Newspaper";
import ArticleIcon from "@mui/icons-material/Article";
import VideocamIcon from "@mui/icons-material/Videocam";
import PodcastsIcon from "@mui/icons-material/Podcasts";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import "./dropdown.css";

const newsSections = [
  {
    title: "News Overview",
    description: "Stay updated with the latest company announcements and industry insights.",
    icon: <NewspaperIcon />,
  },
  {
    title: "Press Releases",
    description: "Official statements and updates from our leadership team.",
    icon: <ArticleIcon />,
  },
  {
    title: "Media Coverage",
    description: "Explore articles and features about us in top publications.",
    icon: <VideocamIcon />,
  },
  {
    title: "Podcasts & Interviews",
    description: "Listen to our experts discuss trends and innovations.",
    icon: <PodcastsIcon />,
  },
  {
    title: "Media Inquiries",
    link: "/news/contact",
    description: "Connect with our media team for interviews and more.",
    icon: <ContactMailIcon />,
  },
];

const NewsDropdown = () => {
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
          <NewspaperIcon/>
        <Typography
          variant="caption"
          mx={{ xs: 1}}>
          News & Media
        </Typography>
        </Box>
      </IconButton>

      <Box
        className="dropdown-content"
        sx={{
          display: "none",
          position: "absolute",
          backgroundColor: theme.palette.background.paper,
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
          zIndex: 10,
          borderRadius: 2,
          padding: 2,
          top: "110%",
          left: "50%",
          transform: "translateX(-50%)",
          maxWidth: 400,
          width: { xs: "90vw", md: 360 },
          textAlign: "left",
          transition: "all 0.3s ease",
          opacity: 0,
          transformOrigin: "top center",
          border: `1px solid ${theme.palette.divider}`,
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
        <List sx={{ padding: 0 }}>
          {newsSections.map((section, index) => (
            <ListItem
              key={index}
              component={section.link ? Link : "div"}
              href={section.link || undefined}
              sx={{
                alignItems: "flex-start",
                mb: 0.5,
                borderRadius: 1,
                padding: 1.5,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.primary.main,
                  transform: "translateX(4px)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: theme.palette.primary.main,
                  minWidth: 40,
                  fontSize: 24,
                }}
              >
                {section.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="subtitle1"
                    fontWeight="600"
                    sx={{ fontSize: "1rem" }}
                  >
                    {section.title}
                  </Typography>
                }
                secondary={
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "0.85rem", lineHeight: 1.4 }}
                  >
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

export default NewsDropdown;