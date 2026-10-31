"use client";
import * as React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const ScrollingStrip = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        // top: '58px', // Adjust to sit below the AppBar
        width: '100%',
        background: "rgba(0, 0, 0, .7)",
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
        zIndex: 1100,
        pt:1,
        py: 1,
        boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
      }}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: '-100%' }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: 30, // Adjust speed of scroll
            ease: 'linear',
          },
        }}
      >
        <Typography
          component="span"
          sx={{
            display: 'inline-block',
            whiteSpace: 'nowrap',
            fontFamily: '"Inter", sans-serif',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'rgba(255,255,255,1)',
          }}
        >
          <span>🌌 </span>
          <span style={{ color: '#4fc3f7', fontWeight: 700 }}>TDIL-Hexagons: The Galactic Crest of Administrative Sovereignty</span>: that builds Empires and Empowers Galaxies. —{' '}
          <span style={{ color: '#42a5f5' }}>Universal Trust 🔷</span> |{' '}
          <span style={{ color: '#ffca28' }}>Supreme Quality 🟡</span> |{' '}
          <span style={{ color: '#f06292' }}>Absolute Safety 💗</span> |{' '}
          <span style={{ color: '#4db6ac' }}>Galactic Intellect 🧠</span> |{' '}
          Multi-Industry Leader in{' '}
          <span style={{ color: '#4fc3f7' }}>FMCG, AI, Aerospace, Energy, Healthcare, Space</span>, and More{' '}
          <span>🚀</span> |{' '}
          <span style={{ color: '#ffffff', fontWeight: 700 }}>P.A.C.E. Protocol</span>: Precision, Accountability, Creativity, Excellence{' '}
          <span>🛡️</span> |{' '}
          <span style={{ color: '#4fc3f7' }}>#WeAreTDIL #GalacticTDILLegacy</span>
        </Typography>
      </motion.div>
    </Box>
  );
};

export default ScrollingStrip;