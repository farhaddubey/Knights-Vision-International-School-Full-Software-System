"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography, Grid } from "@mui/material";
import { useInView } from "react-intersection-observer";
import CelebrationIcon from "@mui/icons-material/Celebration";
import SchoolIcon from "@mui/icons-material/School";
import PlayCircleIcon from "@mui/icons-material/PlayCircleFilled";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PeopleIcon from "@mui/icons-material/People";
import {
  Checklist,
  Computer,
  DeviceHub,
  EmojiEmotions,
  Psychology,
  SmartToy,
  TabletMac,
  Timer as TimerIcon,
  Translate,
} from "@mui/icons-material";
// Top 8 Key Educational Stats – Unique, Colorful, Real
const statsData = [
  {
    label: "Happy Students",
    count: 90,
    unit: "Million+",
    icon: <SchoolIcon fontSize="large" />,
    color: "#a31545",
    calculation: "90M+ students enrolled across our global learning network",
  },
  {
    label: "Tests Conducted Annually",
    count: 2080,
    unit: "+",
    icon: <AssessmentIcon fontSize="large" />,
    color: "#330e62",
    calculation: "10 subjects × 4 weekly tests × 52 weeks = 2080+ tests/year",
  },
  {
    label: "Video Lectures (Annual)",
    count: 1920,
    unit: "+",
    icon: <PlayCircleIcon fontSize="large" />,
    color: "#00695c",
    calculation: "1 lecture/hr × 8 hrs/day × 6 days/week × 40 weeks",
  },
  {
    label: "Practice Sheets Distributed",
    count: 120,
    unit: "+",
    icon: <Checklist fontSize="large" />,
    color: "#1e88e5",
    calculation: "120+ practice sheets provided per academic year",
  },
  {
    label: "Expert Teachers",
    count: 270,
    unit: "+",
    icon: <PeopleIcon fontSize="large" />,
    color: "#2e7d32",
    calculation: "270+ educators across Math, Science, English & other fields",
  },
  {
    label: "Weekly Active Learning Hours",
    count: 48,
    unit: "+",
    icon: <TimerIcon fontSize="large" />,
    color: "#8e24aa",
    calculation: "8 hours/day × 6 days/week = 48+ learning hours/week",
  },
  {
    label: "Smart Classrooms",
    count: 180,
    unit: "+",
    icon: <TabletMac fontSize="large" />,
    color: "#ff8f00",
    calculation: "Smart boards & digital aids in 180+ classrooms",
  },
  {
    label: "Knights SCTP Classes",
    count: 104,
    unit: "+",
    icon: <EmojiEmotions fontSize="large" />,
    color: "#c62828",
    calculation: "75+ seminars via Knights Special Career Training Programs",
  },
  {
    label: "Educational Software Systems",
    count: 40,
    unit: "+",
    icon: <DeviceHub fontSize="large" />,
    color: "#1565c0",
    calculation: "In-house software systems aiding learning & tracking",
  },
  {
    label: "Skill & Personality Workshops",
    count: 60,
    unit: "+",
    icon: <Psychology fontSize="large" />,
    color: "#4e342e",
    calculation: "60+ workshops annually to boost confidence & skills",
  },
  {
    label: "Computer Literacy Program",
    count: 200,
    unit: "Hrs+",
    icon: <Computer fontSize="large" />,
    color: "#0d47a1",
    calculation:
      "200+ hours of foundational & advanced computer classes yearly",
  },
  {
    label: "Spoken English (International)",
    count: 120,
    unit: "Sessions+",
    icon: <Translate fontSize="large" />,
    color: "#3e2723",
    calculation:
      "120+ guided sessions focusing on global English fluency & accent",
  },
];

const StatsShowcase = () => {
  const { ref: viewportRef, inView } = useInView({
    triggerOnce: false,
    threshold: 0.2,
  });
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [counts, setCounts] = useState(statsData.map(() => 0));

  useEffect(() => {
    if (inView || hoveredIndex !== null) {
      statsData.forEach((stat, index) => {
        if (inView || hoveredIndex === index) {
          let increment = Math.ceil(stat.count / 30);
          let currentCount = 0;

          const updateCount = () => {
            if (currentCount >= stat.count) {
              setCounts((prev) => {
                const newCounts = [...prev];
                newCounts[index] = stat.count;
                return newCounts;
              });
              return;
            }

            currentCount += increment;
            setCounts((prev) => {
              const newCounts = [...prev];
              newCounts[index] = Math.min(currentCount, stat.count);
              return newCounts;
            });

            setTimeout(updateCount, 50);
          };

          updateCount();
        }
      });
    }
  }, [inView, hoveredIndex]);

  return (
    <Box
      ref={viewportRef}
      sx={{
        py: 4,
        px: { xs: 1, md: 4 },
        backgroundColor: "#1c1c1c",
        color: "#e0e0e0",
      }}
    >
      <Typography
        variant="h4"
        align="center"
        fontWeight="bold"
        sx={{ mb: 2, fontSize: { xs: 18, md: 35 } }}
      >
        A Platform Trusted by Students Worldwide
      </Typography>
      <Typography
        variant="body1"
        align="center"
        sx={{ mb: 4, color: "#b0b0b0" }}
      >
        Sure Success Point School, a unit of KiREAD Group, delivers
        excellence. Explore the numbers!
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        {statsData.map((stat, index) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={2.4} // Adjusted to fit 5 items
            key={index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <Box
              sx={{
                position: "relative",
                p: 4,
                px: 5,
                backgroundColor: stat.color,
                borderRadius: 2,
                textAlign: "center",
                overflow: "hidden",
                border: "2px solid transparent",
                transition: "transform 0.3s, border-color 0.3s",
                width: "320px", // Adjusted for 5 items
                "&:hover": {
                  borderColor: "#ffffff",
                  transform: "translateY(-5px)",
                },
                "&:hover .celebration": {
                  opacity: 1,
                  animation: "spin 0.5s ease-in-out",
                },
              }}
            >
              <Box
                className="celebration"
                sx={{
                  position: "absolute",
                  top: "-20px",
                  right: "-20px",
                  color: "#ffd54f",
                  opacity: 0,
                  transition: "opacity 0.3s",
                }}
              >
                <CelebrationIcon fontSize="large" />
              </Box>
              <Box
                className="icon"
                sx={{
                  fontSize: "3rem",
                  color: "#fff",
                  transition: "transform 0.3s",
                  transform: "translateY(-30px)",
                  mb: 2,
                }}
              >
                {stat.icon}
              </Box>
              <Typography
                variant="h2"
                fontWeight="bold"
                sx={{ color: "#fff", mb: 1 }}
              >
                {counts[index]}
                <Typography
                  variant="h5"
                  component="span"
                  fontWeight="medium"
                  sx={{ ml: 0.5, color: "#a0a0a0" }}
                >
                  {stat.unit}
                </Typography>
              </Typography>
              <Typography variant="body1" sx={{ color: "#b0b0b0" }}>
                {stat.label}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#b0b0b0", mt: 1, fontStyle: "italic" }}
              >
                {stat.calculation}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StatsShowcase;
