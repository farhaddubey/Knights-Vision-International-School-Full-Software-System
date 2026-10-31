"use client";

import React from "react";
import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import { Typography, Box } from "@mui/material";
import Link from "next/link";

// Glow animation keyframes
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

// Styled Typography for the main title with responsive glow effect
const GlowingMainText = styled(Typography)`
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
  background-size: 400% 400%;
  animation: ${glow} 20s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
  line-height: 1.2;
  letter-spacing: -0.01em; /* Narrower text */
  transform: scaleX(0.95); /* Slightly compress horizontally */

  // Responsive font sizes
  font-size: 2rem;
  @media (max-width: 1200px) {
    font-size: 1.8rem;
  }
  @media (max-width: 900px) {
    font-size: 1.5rem;
  }
  @media (max-width: 600px) {
    font-size: 1.8rem;
  }
`;

// Styled Typography for the subtitle with responsive glow effect
const GlowingSubText = styled(Typography)`
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
  background-size: 400% 400%;
  animation: ${glow} 20s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: -0.02em; /* Narrower text */
  transform: scaleX(0.95); /* Slightly compress horizontally */

  // Responsive font sizes
  font-size: 1.2rem;
  @media (max-width: 1200px) {
    font-size: 0.9rem;
  }
  @media (max-width: 900px) {
    font-size: 0.85rem;
  }
  @media (max-width: 600px) {
    font-size: 0rem;
  }
`;

const SureSuccessIcon = () => {
  return (
    <Box
      sx={{
        textAlign: "left",
        borderRadius: "12px",
        display: "inline-block",
        // padding: { xs: '8px', sm: '12px', md: '16px' },
        background: "rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(8px)",
        maxWidth: "100%",
      }}
    >
      <GlowingMainText
        variant="h5"
        sx={{
          display: "block",
          marginBottom: { xs: "-4px", sm: "-6px", md: "-8px" },
        }}
      >
        <Link
          href="https://kvis.knightsnexus.com/"
          target="_blank"
          style={{ textDecoration: "none" }}
        >
          Sure Success Point School
        </Link>
      </GlowingMainText>
      <GlowingSubText
        variant="body2"
        sx={{
          display: "block",
        }}
      >
        Institution of Humanism, Hardwork, Discipline, Technology & Excellence
      </GlowingSubText>
    </Box>
  );
};

export default SureSuccessIcon;
