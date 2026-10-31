"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconButton,
  Typography,
  Menu,
  MenuItem,
  useTheme,
  Divider,
  Box,
  Button
} from '@mui/material';
import { School} from '@mui/icons-material';

const AdmissionPanel = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const isUserMenuOpen = Boolean(userMenuAnchorEl);
  const theme = useTheme();
  const router = useRouter();

  const handleAdmissionMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenUserMenu = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const admissionOptions = [
    { label: 'Admission Test', href: '/admission/applyForAdmissionTest' },
    { label: 'Admit Card', href: '/admission/admitCard' },
    { label: 'Check Result', href: '/admission/checkResult' },
    { label: 'Apply for Admission', href: '/admission/applyForAdmission' },
    { label: 'KSAT Scheme - Economical+', href: '/admission/ksat/economical-plus' },
    { label: 'KSAT Scheme - Economical', href: '/admission/ksat/economical' },
    { label: 'KSAT Scheme - General', href: '/admission/ksat/general' },
    { label: 'KSAT Scheme - General Direct', href: '/admission/ksat/general-direct' },
    { label: 'Scholarship Application', href: '/admission/scholarship' },
    { label: 'Admission Status', href: '/admission/status' },
    { label: 'Fee Payment', href: '/admission/fee-payment' },
  ];

  const menuId = 'admission-menu';
  const userMenuId = 'user-settings-menu';
  const renderAdmissionMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
      PaperProps={{
        style: {
          width: '20vw',
          maxWidth: '300px',
          borderRadius: '10px',
          backgroundColor: '#000',
          color: '#fff',
        },
      }}
    >
      <Box sx={{ bgcolor: '#000' }}>
        <Typography variant="h6" sx={{ p: 2, textAlign: 'center' }}>
          Admission Options
        </Typography>
        <Divider sx={{ borderColor: '#333' }} />
        <Box
          sx={{
            maxHeight: '50vh',
            overflowY: 'auto',
            bgcolor: '#000',
            color: '#fff',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            '& .MuiMenuItem-root': {
              borderRadius: '8px',
              justifyContent: 'flex-start',
              '&:hover': {
                backgroundColor: '#111',
                color: '#0af',
              },
            },
          }}
        >
          {admissionOptions.map((option, index) => (
            <MenuItem
              key={index}
              onClick={() => {
                router.push(option.href);
                handleMenuClose();
              }}
            >
              <Typography variant="body2">{option.label}</Typography>
            </MenuItem>
          ))}
        </Box>
      </Box>
    </Menu>
  );

  const renderUserMenu = (
    <Menu
      anchorEl={userMenuAnchorEl}
      id={userMenuId}
      open={isUserMenuOpen}
      onClose={handleUserMenuClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      PaperProps={{
        style: {
          borderRadius: '10px',
          backgroundColor: '#000',
          color: '#fff',
        },
      }}
    >
      <MenuItem onClick={handleUserMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleUserMenuClose}>Settings</MenuItem>
      <MenuItem onClick={handleUserMenuClose}>Logout</MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
       <IconButton
        size="small"
        edge="end"
        aria-label="KiREAD Knights"
        aria-controls="kiread-menu"
        aria-haspopup="true"
        onClick={handleAdmissionMenuOpen}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'row', md: 'column' },
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: { xs: 'left', md: 'center' },
        
        }}
      >
    <Button color="#f50057" variant="outlined" sx={{ textDecoration: 'none', color: '#f50057' }}><School/>Admissions</Button>
      </IconButton>
    
      {renderAdmissionMenu}
      {renderUserMenu}
    </Box>
  );
};

export default AdmissionPanel;