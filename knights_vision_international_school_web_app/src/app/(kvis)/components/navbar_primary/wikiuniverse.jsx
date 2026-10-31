"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconButton,
  Typography,
  Menu,
  MenuItem,
  useTheme,
  Paper,
  MenuList,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
} from '@mui/material';
import { School, Widgets } from '@mui/icons-material';
import Image from 'next/image';
import axios from 'axios';

const PublicProfile = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [featureItems, setFeatureItems] = useState([]);
  const isMenuOpen = Boolean(anchorEl);
  const theme = useTheme();
  const router = useRouter();

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const fetchFeatureItems = async () => {
      try {
        const response = await axios.get('/api/site-feature-platforms');
        setFeatureItems(response.data);
      } catch (error) {
        console.error('Failed to fetch feature items:', error);
      }
    };
    fetchFeatureItems();
  }, []);

  const menuId = 'admission-features-menu';
  const renderMenu = (
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
          width: '30vw',
          maxWidth: '400px',
          borderRadius: '10px',
          backgroundColor: '#000',
          color: '#fff',
        },
      }}
    >
      <Box sx={{ bgcolor: '#000' }}>
        <Typography variant="h6" sx={{ p: 2, textAlign: 'center' }}>
          Admission Features
        </Typography>
        <Divider sx={{ borderColor: '#333' }} />
        <MenuList
          sx={{
            maxHeight: '60vh',
            overflowY: 'auto',
            bgcolor: '#000',
            color: '#fff',
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#333',
              borderRadius: '4px',
            },
            '& .MuiMenuItem-root': {
              borderRadius: '8px',
              alignItems: 'flex-start',
              padding: '12px',
              '&:hover': {
                backgroundColor: '#111',
                '& .MuiTypography-root': {
                  color: '#0af',
                },
              },
            },
            '& .MuiListItemIcon-root': {
              minWidth: 'unset',
              marginRight: '12px',
            },
            '& .MuiTypography-root': {
              color: '#ccc',
            },
          }}
        >
          {featureItems.length > 0 ? (
            featureItems.map((item) => (
              <MenuItem
                key={item.id}
                onClick={() => {
                  router.push(item.page_link || '/');
                  handleMenuClose();
                }}
              >
                <ListItemIcon>
                  <Image
                    src={item.img_url || 'https://img.icons8.com/neon/96/school.png'}
                    width={36}
                    height={36}
                    alt={item.title}
                    style={{ borderRadius: '4px' }}
                  />
                </ListItemIcon>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body1" sx={{ fontSize: '0.9rem', color: '#fff' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#999' }}>
                    {item.description || 'No description available'}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>
              <Typography variant="body2" sx={{ textAlign: 'center', width: '100%' }}>
                No features available
              </Typography>
            </MenuItem>
          )}
        </MenuList>
      </Box>
    </Menu>
  );

  return (
    <>
      <IconButton
        size="large"
        edge="end"
        aria-label="admission features"
        aria-controls={menuId}
        aria-haspopup="true"
        onClick={handleProfileMenuOpen}
        color="inherit"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          cursor: 'pointer',
          '&:hover': {
            color: theme.palette.primary.main,
          },
        }}
      >
        <Widgets/>
        <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'none', xl: 'flex' } }}>
          Explore
        </Typography>
      </IconButton>
      {renderMenu}
    </>
  );
};

export default PublicProfile;