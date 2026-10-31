"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Divider,
  Box,
  useTheme,
  Grid,
  Button,
} from '@mui/material';
import { Whatshot } from '@mui/icons-material';
import Image from 'next/image';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const tools = [
  { "name": "About Us", "link": "#", "imgSrc": "https://img.icons8.com/emoji/48/police-car-light.png" },
  { "name": "Contact Us", "link": "#", "imgSrc": "https://img.icons8.com/color/48/contest.png" },
  { "name": "MultiBoard Affiliated", "link": "#", "imgSrc": "https://img.icons8.com/nolan/64/engineering.png" },
  { "name": "Academic Programs", "link": "#", "imgSrc": "https://img.icons8.com/color/48/doctor-female-skin-type-3.png" },
  { "name": "Faculty & Leadership Team", "link": "#", "imgSrc": "https://img.icons8.com/nolan/64/bank-building.png" },
  { "name": "Curriculum & Syllabus", "link": "#", "imgSrc": "https://img.icons8.com/emoji/48/school-emoji.png" },
  { "name": "Our Students Success", "link": "#", "imgSrc": "https://img.icons8.com/emoji/48/woman-student.png" },
  { "name": "Achievements & Recognition", "link": "#", "imgSrc": "https://img.icons8.com/arcade/64/noticeboard.png" },
  { "name": "Admission Process", "link": "#", "imgSrc": "https://img.icons8.com/color/48/test-passed.png" },
  { "name": "Events & Activities", "link": "#", "imgSrc": "https://img.icons8.com/color-glass/48/test-cheating.png" },
  { "name": "KiREAD Integrated Curriculum", "link": "#", "imgSrc": "https://img.icons8.com/color-glass/48/studying.png" },
  { "name": "Student Life & Experience", "link": "#", "imgSrc": "https://img.icons8.com/color/48/studying.png" },
  { "name": "Technology & Innovation", "link": "#", "imgSrc": "https://img.icons8.com/avantgarde/100/test-passed.png" },
  { "name": "Testimonials", "link": "#", "imgSrc": "https://img.icons8.com/external-flaticons-lineal-color-flat-icons/64/external-result-marketing-agency-flaticons-lineal-color-flat-icons-3.png" },
  { "name": "Newsroom", "link": "#", "imgSrc": "https://img.icons8.com/officel/16/athlete-female.png" },
  { "name": "Alumni Network", "link": "#", "imgSrc": "https://img.icons8.com/color/48/keyhole-shield.png" },
  { "name": "WikiGalaxy | Educating Platform", "link": "#", "imgSrc": "https://img.icons8.com/fluency/48/prize--v1.png" },
  { "name": "Career Opportunities", "link": "#", "imgSrc": "https://img.icons8.com/fluency/48/prize--v1.png" },
  { "name": "Sure Success Faculty -Privacy Policy", "link": "/privacy-policy/sure-success-connect-faculty-app", "imgSrc": "https://img.icons8.com/fluency/48/prize--v1.png" },
  { "name": "Sure Success Connect -Privacy Policy", "link": "/privacy-policy/sure-success-connect-student-app", "imgSrc": "https://img.icons8.com/fluency/48/prize--v1.png" },
];

const KiREADDropDown = () => {
  const theme = useTheme();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (link) => {
    router.push(link);
    handleMenuClose();
  };

  const chunkSize = 10; // Number of rows per column
  const chunkedTools = [];
  for (let i = 0; i < tools.length; i += chunkSize) {
    chunkedTools.push(tools.slice(i, i + chunkSize));
  }

  return (
    <>
      <ToastContainer theme="dark" />

            <IconButton
        size="small"
        edge="end"
        aria-label="KiREAD Knights"
        aria-controls="kiread-menu"
        aria-haspopup="true"
                onClick={handleMenuOpen}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'row', md: 'column' },
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: { xs: 'left', md: 'center' },
        
        }}
      >
    <Button color="#d81b60" variant="outlined" sx={{ textDecoration: 'none', color: '#ffc107' }}><Whatshot/>Knights</Button>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        id="kiread-menu"
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={isMenuOpen}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            bgcolor: '#000',
            color: '#fff',
            borderRadius: '10px',
            width: '90vw',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflow: 'hidden',
            p: 2,
          },
        }}
      >
        <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
          Knights International Group for Research, Education & Academic Development
        </Typography>
        <Divider sx={{ borderColor: '#333', mb: 2 }} />
        <Grid container spacing={2}>
          {chunkedTools.map((chunk, chunkIndex) => (
            <Grid item xs={12} sm={6} md={4} key={chunkIndex}>
              {chunk.map((tool, toolIndex) => (
                <MenuItem
                  key={toolIndex}
                  onClick={() => handleMenuItemClick(tool.link)}
                  sx={{
                    borderRadius: '8px',
                    '&:hover': { bgcolor: '#111', color: '#0af' },
                    display: 'flex',
                    alignItems: 'center',
                    py: 1,
                  }}
                >
                  <Image src={tool.imgSrc} width={24} height={24} alt={tool.name} style={{ marginRight: '8px' }} />
                  <Typography variant="body2">{tool.name}</Typography>
                </MenuItem>
              ))}
              {chunkIndex < chunkedTools.length - 1 && (
                <Divider orientation="vertical" flexItem sx={{ borderColor: '#333', mx: 2 }} />
              )}
            </Grid>
          ))}
        </Grid>
      </Menu>
    </>
  );
};

export default KiREADDropDown;