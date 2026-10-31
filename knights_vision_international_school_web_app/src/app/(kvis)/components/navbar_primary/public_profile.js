"use client";
import React, { useState } from 'react';
import { IconButton, Typography, Menu, MenuItem, useTheme } from '@mui/material';
import { LockPerson } from '@mui/icons-material';
import Link from 'next/link';

const PublicProfile = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuId = 'primary-search-account-menu';

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      open={isMenuOpen}
      onClose={handleMenuClose}
      disableAutoFocusItem
      PaperProps={{
        sx: {
          zIndex: 9999,
          mt: 1,
        },
      }}
    >
      {[
        "Factory Workers",
        "Factory Manager",
        "Sales Officials",
        "Admin Officials",
        "Employee TDIL"
      ].map((label, idx) => (
        <MenuItem key={idx} onClick={handleMenuClose}>
          <Link href="/administration" passHref legacyBehavior>
            <a style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>{label} Login</a>
          </Link>
        </MenuItem>
      ))}
    </Menu>
  );

  return (
    <>
      <IconButton
        size="large"
        edge="end"
        aria-controls={menuId}
        aria-haspopup="true"
        onClick={handleProfileMenuOpen}
        color="inherit"
        sx={{
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minWidth: '64px', // prevent size change
        }}
      >
        <LockPerson />
        <Typography variant="caption">AdminLogin</Typography>
      </IconButton>
      {renderMenu}
    </>
  );
};

export default PublicProfile;
