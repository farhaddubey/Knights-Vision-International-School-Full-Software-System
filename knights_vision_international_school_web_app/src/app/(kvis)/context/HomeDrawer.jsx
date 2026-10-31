"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  Box,
  Button,
  Divider,
  Typography,
  TextField,
} from '@mui/material';
import { ExpandLess, ExpandMore, School, Login, Person, Groups, AdminPanelSettings } from '@mui/icons-material';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';

const CustomDrawer = ({ drawerOpen, handleDrawerToggle }) => {
  const router = useRouter();
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [routerReady, setRouterReady] = useState(false);

  useEffect(() => {
    setRouterReady(true);
  }, []);

  const toggleSubMenu = (index) => {
    setOpenSubMenu(openSubMenu === index ? null : index);
  };

  // Menu structure with main titles, subtitles, and colors for modern look
  const menuItems = [
    {
      mainTitle: 'Courses & FEE',
      subTitles: ['Class KGI', 'Class KGII', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
      urls: ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
      colors: ['#4caf50', '#4caf50', '#2196f3', '#2196f3', '#2196f3', '#2196f3', '#2196f3', '#2196f3', '#2196f3', '#2196f3', '#2196f3', '#2196f3', '#2196f3', '#2196f3'],
    },
    {
      mainTitle: 'Generate Assignments',
      subTitles: ['Class KGI Format', 'Class KGII Format', 'Class 1 Format', 'Class 2', 'Class 3 Format', 'Class 4 Format', 'Class 5 Format', 'Class 6 Format', 'Class 7 Format', 'Class 8 Format', 'Class 9 Format', 'Class 10 Format', 'Class 11 Format', 'Class 12 Format'],
      urls: ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
      colors: ['#f9a825', '#f9a825', '#f9a825', '#f9a825', '#f9a825', '#f9a825', '#f9a825', '#f9a825', '#f9a825', '#f9a825', '#f9a825', '#f9a825', '#f9a825', '#f9a825'],
    },
    {
      mainTitle: 'Exam Admits',
      subTitles: ['Class KGI Admit', 'Class KGII Admit', 'Class 1 Admit', 'Class 2 Admit', 'Class 3 Admit', 'Class 4 Admit', 'Class 5 Admit', 'Class 6 Admit', 'Class 7 Admit', 'Class 8 Admit', 'Class 9 Admit', 'Class 10 Admit', 'Class 11 Admit', 'Class 12 Admit'],
      urls: ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
      colors: ['#e91e63', '#e91e63', '#e91e63', '#e91e63', '#e91e63', '#e91e63', '#e91e63', '#e91e63', '#e91e63', '#e91e63', '#e91e63', '#e91e63', '#e91e63', '#e91e63'],
    },
    {
      mainTitle: 'Exam Results',
      subTitles: ['Class KGI Result', 'Class KGII Result', 'Class 1 Result', 'Class 2 Result', 'Class 3 Result', 'Class 4 Result', 'Class 5 Result', 'Class 6 Result', 'Class 7 Result', 'Class 8 Result', 'Class 9 Result', 'Class 10 Result', 'Class S10 Result', 'Class 11 Result', 'Class 12 Result'],
      urls: ['/classKGI/checkResult', '/classKGII/checkResult', '/classI/checkResult', '/classII/checkResult', '/classIII/checkResult', '/classIV/checkResult', '/classV/checkResult', '/classVI/checkResult', '/classVII/checkResult', '/classVIII/checkResult', '/classIX/checkResult', '/classX/checkResult', '/classXS/checkResult', '#', '#'],
      colors: ['#1976d2', '#1976d2', '#1976d2', '#1976d2', '#1976d2', '#1976d2', '#1976d2', '#1976d2', '#1976d2', '#1976d2', '#1976d2', '#1976d2', '#1976d2', '#1976d2', '#1976d2'],
    },
    {
      mainTitle: 'Admissions',
      subTitles: ['Apply for Admission Test', 'Download Admit Card', 'Admission Test Result', 'Apply for Admission'],
      urls: ['/admission/applyForAdmissionTest', '/admission/admitCard', '/admission/checkResult', '/admission/applyForAdmission'],
      colors: ['#004d40', '#004d40', '#004d40', '#004d40'],
    },
    {
      mainTitle: 'Knights Edu System',
      subTitles: ['About US', 'Contact US', 'Multiboard Afflictions', 'Academic Programs', 'Faculty & Leadership Team', 'Curriculum & Syllabus', 'Our Students Success', 'Recognitions', 'Admission Process', 'Events & Articles', 'Student Life & Experience', 'Tech Integrated Edu', 'Newsroom'],
      urls: ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
      colors: ['#d81b60', '#d81b60', '#d81b60', '#d81b60', '#d81b60', '#d81b60', '#d81b60', '#d81b60', '#d81b60', '#d81b60', '#d81b60', '#d81b60', '#d81b60'],
    },
    {
      mainTitle: 'Knights Success',
      subTitles: ['Our Students Success'],
      urls: ['#'],
      colors: ['#000000'],
    },
    {
      mainTitle: 'Knights Prayers',
      subTitles: ['Knights Bengali', 'Knights English', 'Knights Hindi'],
      urls: ['https://www.wikigalaxy.in/explore/knights-prayers/knights-prayer-1/knights-prayer-bengali', 'https://www.wikigalaxy.in/explore/knights-prayers/knights-prayer-1/knights-prayer-english', 'https://www.wikigalaxy.in/explore/knights-prayers/knights-prayer-1/knights-prayer-hindi'],
      colors: ['#4a148c', '#4a148c', '#4a148c'],
    },
  ];

  // User menu items for login section
  const userMenuItems = [
    { title: 'Parents Login', url: '/knights-students-panel', icon: <Person /> },
    { title: 'Students Login', url: '/knights-students-panel', icon: <Person /> },
  ];

  return (
    <>
      <ToastContainer theme="dark" />
      <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle}>
        <Box
          sx={{
            backgroundColor: '#000',
            color: '#fff',
            width: 250,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            fontFamily: '"Roboto", sans-serif',
          }}
        >
          {/* Top Institutional Prayer Button */}
          <Box sx={{ p: 2, borderBottom: '1px solid #333' }}>
            <Button
              sx={{
                background: 'linear-gradient(to right, #4a148c, #e91e63, #f9a825)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                textTransform: 'none',
                justifyContent: 'flex-start',
                width: '100%',
              }}
              onClick={() => window.open('https://www.wikigalaxy.in/explore/knights-prayers/knights-prayer-1/knights-prayer-bengali', '_blank', 'noopener')}
            >
              <School sx={{ color: '#f9a825', mr: 1 }} /> Sure Success
            </Button>
          </Box>
          {/* Scrollable Main Menu */}
          <List
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {menuItems.map((item, index) => (
              <React.Fragment key={index}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => toggleSubMenu(index)}
                    sx={{
                      py: 1,
                      '&:hover': { backgroundColor: '#333', transition: 'all 0.2s' },
                    }}
                  >
                    <ListItemText
                      primary={item.mainTitle}
                      primaryTypographyProps={{ fontWeight: 'bold', fontSize: '1rem' }}
                    />
                    {openSubMenu === index ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={openSubMenu === index} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subTitles.map((subTitle, subIndex) => (
                      <Link href={item.urls[subIndex]} key={subIndex} passHref>
                        <ListItem
                          disablePadding
                          sx={{
                            pl: 4,
                            py: 0.3,
                            backgroundColor: item.colors[subIndex],
                            borderRadius: '0 6px 6px 0',
                            mb: 0.5,
                            '&:hover': {
                              backgroundColor: `${item.colors[subIndex]}cc`,
                              transition: 'all 0.2s',
                            },
                          }}
                        >
                          <ListItemButton onClick={handleDrawerToggle}>
                            <ListItemText
                              primary={subTitle}
                              primaryTypographyProps={{
                                fontSize: '0.9rem',
                                color: '#fff',
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      </Link>
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            ))}
          </List>
          {/* Admission Section */}
          <Box sx={{ p: 2, borderTop: '1px solid #333' }}>
            <Box sx={{display:"flex", flexDirection:"row"}}>
            <Typography
              variant="h6"
              sx={{ mb: 1, fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}
            >
              Download the App 
            </Typography>
              <Image width="32" height="32" src="https://img.icons8.com/fluency/48/google-play.png" alt="google-play"/>
              </Box>
                        <Link href={`https://play.google.com/store/apps/details?id=in.sspointschool.students.sure_success_point_school_students`} passHref>
                <Button
                  variant="contained"
                  fullWidth
                  size='small'
                  color='error'
                  sx={{
                    mb: 0.5,
                    backgroundColor: '#e91e63',
                    color: '#fff',
                    textTransform: 'none',
                    justifyContent: 'flex-start',
                    '&:hover': {
                      backgroundColor: `#00c853`,
                      transition: 'all 0.2s',
                    },
                  }}
                >Sure Success - Learn & Grow
                </Button>
              </Link>
            <Typography
              variant="h6"
              sx={{ mb: 1, fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}
            >
              Admissions
            </Typography>
            {[
              { title: 'Admission Test Form', url: '/admission/applyForAdmissionTest', color: '#4caf50' },
              { title: 'Download Admit Card', url: '/admission/admitCard', color: '#f9a825' },
              { title: 'Admission Test Result', url: '/admission/checkResult', color: '#e91e63' },
              { title: 'Apply for Admission', url: '/admission/applyForAdmission', color: '#4a148c' },
            ].map((item, index) => (
              <Link href={item.url} key={index} passHref>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    mb: 0.5,
                    py: 0.5,
                    backgroundColor: item.color,
                    color: '#fff',
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    justifyContent: 'flex-start',
                    '&:hover': {
                      backgroundColor: `${item.color}cc`,
                      transition: 'all 0.2s',
                    },
                  }}
                  onClick={handleDrawerToggle}
                >
                  {item.title}
                </Button>
              </Link>
            ))}
          </Box>
          {/* User Login Section */}
          <Box sx={{ p: 2, borderTop: '1px solid #333' }}>
            <Typography
              variant="h6"
              sx={{ mb: 1, fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}
            >
              Account
            </Typography>
    
            {userMenuItems.map((item, index) => (
              <Link href={item.url} key={index} passHref>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    mb: 0.5,
                    py: 0.5,
                    backgroundColor: '#000',
                    color: '#fff',
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    justifyContent: 'flex-start',
                    '&:hover': {
                      backgroundColor: '#333',
                      transition: 'all 0.2s',
                    },
                  }}
                  onClick={handleDrawerToggle}
                  startIcon={item.icon}
                >
                  {item.title}
                </Button>
              </Link>
            ))}
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default CustomDrawer;