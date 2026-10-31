"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Chip, CircularProgress, Typography, Grid } from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";
import YouTubeIcon from "@mui/icons-material/YouTube";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export default function LegalKnowledgeBasePage() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/knowledge-topics")
      .then((res) => setTopics(res.data))
      .catch((err) => console.error("Failed to fetch topics:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
        📚 Legal Knowledge Base
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Learn the most important legal terms, processes, and rights. It'll be helpful for you to understand what's required for you.🧠
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {topics.map((topic) => (
            <Grid item key={topic.slug}>
              <a href={topic.wikigalaxy_link || "#"} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <Chip
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <GavelIcon sx={{ color: "#00e676" }} />
                      <Typography sx={{ color: "white" }}>{topic.title}</Typography>
                      {topic.youtube_link && (
                        <a href={topic.youtube_link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                          <YouTubeIcon sx={{ color: "#ff1744" }} fontSize="small" />
                        </a>
                      )}
                      <OpenInNewIcon fontSize="small" sx={{ color: "#999" }} />
                    </Box>
                  }
                  variant="outlined"
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: "20px",
                    background: "#1c1c1c",
                    borderColor: "#333",
                    color: "white",
                    '&:hover': {
                      background: "#333",
                    },
                    cursor: "pointer",
                  }}
                />
              </a>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
