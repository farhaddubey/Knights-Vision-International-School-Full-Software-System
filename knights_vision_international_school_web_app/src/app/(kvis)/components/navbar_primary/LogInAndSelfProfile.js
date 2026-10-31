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
} from '@mui/material';
import { AccountCircle } from '@mui/icons-material';

const AuthDropdown = () => {
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

  const handleNavigation = (path) => {
    router.push(path);
    handleMenuClose();
  };

  const authSections = [
    { title: 'Student Login', action: () => handleNavigation('/knights-students-panel'), icon: <AccountCircle /> },
    { title: 'Guardian Login', action: () => handleNavigation('/knights-students-panel'), icon: <AccountCircle /> },
    { title: 'Institutional Login', action: () => handleNavigation('/knights-faculties-panel'), icon: <AccountCircle /> },
    { title: 'Administrative Login', action: () => handleNavigation('/administration'), icon: <AccountCircle /> },
  ];

  return (
    <>
      <IconButton
        size="large"
        aria-label="auth menu"
        aria-controls="auth-menu"
        aria-haspopup="true"
        onClick={handleMenuOpen}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          cursor: 'pointer',
          color: '#fff',
          '&:hover': { color: theme.palette.primary.main },
        }}
      >
        <AccountCircle />
        <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'none', xl: 'flex' } }}>
          Login
        </Typography>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        id="auth-menu"
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={isMenuOpen}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            bgcolor: '#000',
            color: '#fff',
            borderRadius: '10px',
            width: '30vw',
            maxWidth: '400px',
            maxHeight: '90vh',
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ textAlign: 'center' }}>
            Account
          </Typography>
          <Divider sx={{ borderColor: '#333', my: 1 }} />
          {authSections.map((section, index) => (
            <MenuItem
              key={index}
              onClick={section.action}
              sx={{
                borderRadius: '8px',
                '&:hover': { bgcolor: '#111', color: '#0af' },
              }}
            >
              {section.icon}
              <Typography variant="body2" sx={{ ml: 1 }}>
                {section.title}
              </Typography>
            </MenuItem>
          ))}
        </Box>
      </Menu>
    </>
  );
};

export default AuthDropdown;