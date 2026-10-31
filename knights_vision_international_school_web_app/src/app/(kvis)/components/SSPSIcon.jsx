import React from 'react';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { Typography } from '@mui/material';
import Link from 'next/link';

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

// Responsive GlowingText styled component
const GlowingText = styled(Typography)`
  background: linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00e0);
  background-size: 400% 400%;
  animation: ${glow} 12s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  // Define font-size adjustments based on screen size
  font-size: 2.2rem; /* Default for larger screens */
  
  @media (max-width: 1200px) {
    font-size: 2rem; /* Medium screens (e.g., tablets) */
  }

  @media (max-width: 900px) {
    font-size: 1.6rem; /* Small screens */
  }

  @media (max-width: 600px) {
    font-size: 1.5rem; /* Extra-small screens (e.g., mobile) */
  }
`;

const SSPSIcon = () => {
  return (
    <GlowingText variant="h3" sx={{ display: { xs: 'block', sm: 'block', md: 'block'} }}>
      <Link href="https://www.sspointschool.in/" target="_blank">
        Sure Success Point School 
      </Link>
    </GlowingText>
    // | Instition of Humanism, HardWork, Discipline, Technology & Science
  );
};

export default SSPSIcon;
