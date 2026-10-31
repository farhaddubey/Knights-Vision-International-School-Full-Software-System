"use client";

// Shared visual identity for every Sure Success Point School panel.

import React from 'react';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { Typography, Box } from '@mui/material';
import Link from 'next/link';

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
  background: linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00e0);
  background-size: 400% 400%;
  animation: ${glow} 20s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  letter-spacing: -0.03em; /* Narrower text */
  transform: scaleX(1); /* Slightly compress horizontally */
  // Responsive font sizes
  font-size: 1.6rem;
`;


const SureSuccessIcon = () => {
  return (
    <Box
      sx={{
        textAlign: 'left',
        borderRadius: '12px',
        display: 'inline-block',
        // padding: { xs: '8px', sm: '12px', md: '16px' },
        background: 'rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(8px)',
        maxWidth: '100%',
      }}
    >
      <GlowingMainText
        variant="h5"
        sx={{
          display: 'block',
          paddingTop:.5,
          marginBottom: { xs: '-4px', sm: '-6px', md: '-8px' },
        }}
      >
        <Link href="https://www.sspointschool.in/" target="_blank" style={{ textDecoration: 'none' }}>
          Sure Success Point School
        </Link>
      </GlowingMainText>
    </Box>
  );
};

export default SureSuccessIcon;
