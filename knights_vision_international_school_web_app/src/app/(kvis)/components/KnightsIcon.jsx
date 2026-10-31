import { Typography, Box } from '@mui/material';
import React from 'react';

const TDILIcon = () => {
  return (
    <Box sx={{ 
      textAlign: 'left',
      borderRadius: '8px', // Rounded corners for style
      display: 'inline-block', // Keeps box size to content
    }}>
      <Typography
        variant="h5"
        sx={{
          fontSize: '2.3rem',
          fontWeight: 'bold',
          display: 'block',
          lineHeight: '1.3',
          background: 'linear-gradient(37deg, #0016ff, #ff0000, #fff100)', // Blue to pink to purple gradient
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent', // Makes text transparent to show gradient
          WebkitTextStroke: '1px #000', // Dark pink stroke
          textStroke: '1px #000', // Standard property for future compatibility
          marginBottom:"-10px"
        }}
      >
        Knights (KiREAD) Group
      </Typography>
      <Typography
        sx={{
          fontSize: '.9rem',
          fontWeight: 'bold',
          display: 'block',
          lineHeight: '1.1',
          background: 'linear-gradient(37deg, #0016ff, #ff0000, #fff100)', // Blue to pink to purple gradient
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent', // Makes text transparent to show gradient
          textStroke: '.2px #fff', // Standard property for future compatibility
        }}
      >
        Knights International Group for  Research Education & Academic Development
      </Typography>
    </Box>
  );
};

export default TDILIcon;