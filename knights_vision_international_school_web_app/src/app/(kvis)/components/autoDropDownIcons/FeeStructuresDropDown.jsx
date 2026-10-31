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
import { AssuredWorkload } from '@mui/icons-material';
import Image from 'next/image';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const tools = [
  { "name": "Lower KG-I", "link": "/upsc-cse-gs", "imgSrc": "https://img.icons8.com/nolan/64/women-age-group-1--v2.png" },
  { "name": "Lower KG-II", "link": "/upsc-cse-gs", "imgSrc": "https://img.icons8.com/office/40/baby--v2.png" },
  { "name": "Class I", "link": "/upsc-cse-gs", "imgSrc": "https://img.icons8.com/color/48/sliding-child.png" },
  { "name": "Class II", "link": "/upsc-cse-gs", "imgSrc": "https://img.icons8.com/emoji/48/family-.png" },
  { "name": "SAT", "link": "/sat", "imgSrc": "https://img.icons8.com/external-flaticons-lineal-color-flat-icons/64/external-result-marketing-agency-flaticons-lineal-color-flat-icons-3.png" },
  { "name": "ACT", "link": "/act", "imgSrc": "https://img.icons8.com/officel/16/athlete-female.png" },
  { "name": "Olympiads", "link": "/olympiads", "imgSrc": "https://img.icons8.com/color/48/contest.png" },
  { "name": "Civil Services Exams", "link": "/civil-services-exams", "imgSrc": "https://img.icons8.com/fluency/48/prize--v1.png" },
  { "name": "Class III", "link": "/upsc-cse-gs", "imgSrc": "https://img.icons8.com/color/48/yours.png" },
  { "name": "Class IV", "link": "/upsc-cse-gs", "imgSrc": "https://img.icons8.com/isometric/50/classroom.png" },
  { "name": "Class V", "link": "/classV/checkResult", "imgSrc": "https://img.icons8.com/color-glass/48/students.png" },
  { "name": "Class VI", "link": "/classVI/checkResult", "imgSrc": "https://img.icons8.com/3d-fluency/94/classroom.png" },
  { "name": "GRE", "link": "/gre", "imgSrc": "https://img.icons8.com/color-glass/48/test-cheating.png" },
  { "name": "GMAT", "link": "/gmat", "imgSrc": "https://img.icons8.com/color-glass/48/studying.png" },
  { "name": "TOEFL", "link": "/toefl", "imgSrc": "https://img.icons8.com/color/48/studying.png" },
  { "name": "SSC JE & state AE exams", "link": "/ssc-je-state-ae-exams", "imgSrc": "https://img.icons8.com/emoji/48/school-emoji.png" },
  { "name": "Class VII", "link": "/classVII/checkResult", "imgSrc": "https://img.icons8.com/3d-fluency/94/workstation.png" },
  { "name": "Class VIII", "link": "/classVIII/checkResult", "imgSrc": "https://img.icons8.com/emoji/48/person-judge.png" },
  { "name": "Class IX", "link": "/classIX/checkResult", "imgSrc": "https://img.icons8.com/bubbles/100/girl-with-chemical-test-tube.png" },
  { "name": "Class X", "link": "/classX/checkResult", "imgSrc": "https://img.icons8.com/3d-fluency/94/businesswoman-1.png" },
  { "name": "IELTS", "link": "/ielts", "imgSrc": "https://img.icons8.com/avantgarde/100/test-passed.png" },
  { "name": "CBSE class 12", "link": "/cbse-class-12", "imgSrc": "https://img.icons8.com/arcade/64/noticeboard.png" },
  { "name": "CA Intermediate", "link": "/ca-intermediate", "imgSrc": "https://img.icons8.com/color/48/test-passed.png" },
  { "name": "CAT & other MBA entrance tests", "link": "/cat-mba-entrance-tests", "imgSrc": "https://img.icons8.com/emoji/48/woman-student.png" },
  { "name": "Class XI", "link": "/upsc-cse-gs", "imgSrc": "https://img.icons8.com/fluency/48/student-exchange.png" },
  { "name": "Class XII", "link": "/upsc-cse-gs", "imgSrc": "https://img.icons8.com/emoji/48/school-emoji.png" },
  { "name": "UPSC CSE - GS", "link": "/upsc-cse-gs", "imgSrc": "https://img.icons8.com/emoji/48/police-car-light.png" },
  { "name": "IIT JEE", "link": "/iit-jee", "imgSrc": "https://img.icons8.com/nolan/64/engineering.png" },
  { "name": "NEET UG", "link": "/neet-ug", "imgSrc": "https://img.icons8.com/color/48/doctor-female-skin-type-3.png" },
  { "name": "Bank exams", "link": "/bank-exams", "imgSrc": "https://img.icons8.com/nolan/64/bank-building.png" },
];

const FeeStructuresDropDown = () => {
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
        aria-label="Courses & FEE"
        aria-controls="fee-menu"
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

    <Button color="#00c853" variant="outlined" sx={{ textDecoration: 'none', color: '#00c853' }}><AssuredWorkload/>Courses & FEE</Button>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        id="fee-menu"
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
          Courses & FEE
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
                  <Image
                    src="https://img.icons8.com/emoji/48/books-emoji.png"
                    width={16}
                    height={16}
                    alt="Books"
                    style={{ marginRight: '8px' }}
                  />
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

export default FeeStructuresDropDown;