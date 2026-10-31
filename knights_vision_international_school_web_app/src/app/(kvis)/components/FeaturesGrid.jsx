// FeaturesGrid2.jsx

'use client';
import React from 'react';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { School, Quiz, Help, LocationOn } from '@mui/icons-material';

// Define the glowing animation using keyframes
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

// Styled GlowingText component with animated gradient effect
const GlowingText = styled(Typography)`
  background: linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00e0);
  background-size: 400% 400%;
  animation: ${glow} 5s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-top: -10px;
`;

// Feature data
const features = [
  { icon: <School fontSize="large" />, title: 'Daily Live', subtitle: 'Interactive classes' },
  { icon: <Quiz fontSize="large" />, title: '10 Million+', subtitle: 'Tests, sample papers & notes' },
  { icon: <Help fontSize="large" />, title: '24 x 7', subtitle: 'Doubt solving sessions' },
  { icon: <LocationOn fontSize="large" />, title: '100+', subtitle: 'Offline centres' },
];

const FeaturesGrid2 = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        pt: 5,
        px: isMobile ? 2 : 5,
        color: '#ffffff',
        textAlign: 'center',
        marginTop: '-80px',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: 3,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {features.map((feature, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: 3,
              padding: {xs:2,md:4},
              zIndex:50,
              backgroundColor: 'rgba(0, 0, 0, 0.1)', // Set background color with opacity
              borderRadius: 2,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                cursor: 'pointer',
                backgroundColor: 'rgba(0, 0, 0, 0.5)', // Background color for outer area
              },
            }}
          >
            <Box
              sx={{
                color: 'rgb(8, 0, 255)',
                backgroundColor: '#2e2e2e',
                padding: 2,
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 2,
                opacity:1
              }}
            >
              {feature.icon}
            </Box>

            {/* GlowingText with responsive font size */}
            <GlowingText variant="h6" fontSize={isMobile ? '1.2rem' : '1.5rem'} fontWeight="bold">
              {feature.title}
            </GlowingText>

            <Typography variant="body2" sx={{ color: '#fff', fontSize: isMobile ? '0.9rem' : '1rem' }}>
              {feature.subtitle}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default FeaturesGrid2;
