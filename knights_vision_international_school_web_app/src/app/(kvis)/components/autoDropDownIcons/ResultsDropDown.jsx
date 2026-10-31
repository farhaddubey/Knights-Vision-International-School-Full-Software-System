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
import { School } from '@mui/icons-material';
import Image from 'next/image';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const tools = [
  { "name": "Lower KG-I Result", "link": "#", "imgSrc": "https://img.icons8.com/nolan/64/women-age-group-1--v2.png" },
  { "name": "Lower KG-II Result", "link": "#", "imgSrc": "https://img.icons8.com/office/40/baby--v2.png" },
  { "name": "Class I Result", "link": "#", "imgSrc": "https://img.icons8.com/color/48/sliding-child.png" },
  { "name": "Class II Result", "link": "#", "imgSrc": "https://img.icons8.com/emoji/48/family-.png" },
  { "name": "SAT Result", "link": "/sat", "imgSrc": "https://img.icons8.com/external-flaticons-lineal-color-flat-icons/64/external-result-marketing-agency-flaticons-lineal-color-flat-icons-3.png" },
  { "name": "ACT Result", "link": "/act", "imgSrc": "https://img.icons8.com/officel/16/athlete-female.png" },
  { "name": "Olympiads Result", "link": "/olympiads", "imgSrc": "https://img.icons8.com/color/48/contest.png" },
  { "name": "Civil Services Exams Result", "link": "/civil-services-exams", "imgSrc": "https://img.icons8.com/fluency/48/prize--v1.png" },
  { "name": "Class III Result", "link": "#", "imgSrc": "https://img.icons8.com/color/48/yours.png" },
  { "name": "Class IV Result", "link": "#", "imgSrc": "https://img.icons8.com/isometric/50/classroom.png" },
  { "name": "Class V Result", "link": "/classV/checkResult", "imgSrc": "https://img.icons8.com/color-glass/48/students.png" },
  { "name": "Class VI Result", "link": "/classVI/checkResult", "imgSrc": "https://img.icons8.com/3d-fluency/94/classroom.png" },
  { "name": "GRE Result", "link": "/gre", "imgSrc": "https://img.icons8.com/color-glass/48/test-cheating.png" },
  { "name": "GMAT Result", "link": "/gmat", "imgSrc": "https://img.icons8.com/color-glass/48/studying.png" },
  { "name": "TOEFL Result", "link": "/toefl", "imgSrc": "https://img.icons8.com/color/48/studying.png" },
  { "name": "SSC JE & state AE exams Result", "link": "/ssc-je-state-ae-exams", "imgSrc": "https://img.icons8.com/emoji/48/school-emoji.png" },
  { "name": "Class VII Result", "link": "/classVII/checkResult", "imgSrc": "https://img.icons8", "imgSrc": "https://img.icons8.com/3d-fluency/94/workstation.png" },
  { "name": "Class VIII Result", "link": "/classVIII/checkResult", "imgSrc": "https://img.icons8.com/emoji/48/person-judge.png" },
  { "name": "Class IX Result", "link": "/classIX/checkResult", "imgSrc": "https://img.icons8.com/bubbles/100/girl-with-chemical-test-tube.png" },
  { "name": "Class X Result", "link": "/classX/checkResult", "imgSrc": "https://img.icons8.com/3d-fluency/94/businesswoman-1.png" },
  { "name": "Class XS Result", "link": "/classXS/checkResult", "imgSrc": "https://img.icons8.com/3d-fluency/94/businesswoman-1.png" },
  { "name": "IELTS Result", "link": "#", "imgSrc": "https://img.icons8.com/avantgarde/100/test-passed.png" },
  { "name": "CBSE class 12 Result", "link": "#", "imgSrc": "https://img.icons8.com/arcade/64/noticeboard.png" },
  { "name": "CA Intermediate Result", "link": "#", "imgSrc": "https://img.icons8.com/color/48/test-passed.png" },
  { "name": "CAT & other MBA entrance tests Result", "link": "/cat-mba-entrance-tests", "imgSrc": "https://img.icons8.com/emoji/48/woman-student.png" },
  { "name": "Class XI Result", "link": "#", "imgSrc": "https://img.icons8.com/fluency/48/student-exchange.png" },
  { "name": "Class XII Result", "link": "#", "imgSrc": "https://img.icons8.com/emoji/48/school-emoji.png" },
  { "name": "UPSC CSE - GS Result", "link": "#", "imgSrc": "https://img.icons8.com/emoji/48/police-car-light.png" },
  { "name": "IIT JEE Result", "link": "#", "imgSrc": "https://img.icons8.com/nolan/64/engineering.png" },
  { "name": "NEET UG Result", "link": "#", "imgSrc": "https://img.icons8.com/color/48/doctor-female-skin-type-3.png" },
  { "name": "Bank exams Result", "link": "#", "imgSrc": "https://img.icons8.com/nolan/64/bank-building.png" },
];

const CoursesDropDown = () => {
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
       aria-label="Results"
        aria-controls="results-menu"
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
    <Button color="#1de9b6" variant="outlined" sx={{ textDecoration: 'none', color: '#1de9b6' }}><School/> Results</Button>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        id="results-menu"
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
          Results
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

export default CoursesDropDown;