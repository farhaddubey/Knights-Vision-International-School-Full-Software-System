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
} from '@mui/material';
import { ContactPhone as ContactPhoneIcon } from '@mui/icons-material';
import Link from 'next/link';

const contactSections = [
  {
    title: "Contact Overview",
    description: "Reach out to us for support, inquiries, or partnerships.",
    icon: <ContactPhoneIcon />,
    link: "/contact-overview",
  },
  {
    title: "Customer Support",
    description: "Get help from our dedicated support team.",
    icon: <ContactPhoneIcon />,
    link: "/customer-support",
  },
  {
    title: "Media Inquiries",
    description: "Connect with our media team for press-related questions.",
    icon: <ContactPhoneIcon />,
    link: "/media-inquiries",
  },
  {
    title: "Business Inquiries",
    description: "Explore partnership and collaboration opportunities.",
    icon: <ContactPhoneIcon />,
    link: "/business-inquiries",
  },
  {
    title: "Get in Touch",
    description: "Send us a message or find our contact details.",
    icon: <ContactPhoneIcon />,
    link: "/contact",
  },
];

const ContactUsDropdown = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const theme = useTheme();
  const router = useRouter();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuId = 'contact-us-menu';
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
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'hidden',
          borderRadius: '10px',
          backgroundColor: '#000',
          color: '#fff',
        },
      }}
    >
      <Box sx={{ bgcolor: '#000' }}>
        <Typography variant="h6" sx={{ p: 2, textAlign: 'center' }}>
          Contact Us
        </Typography>
        <Divider sx={{ borderColor: '#333' }} />
        <Box
          sx={{
            maxHeight: 'calc(90vh - 100px)',
            overflowY: 'auto',
            bgcolor: '#000',
            color: '#fff',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            '& .MuiTypography-root': {
              color: '#ccc',
              fontSize: '0.9rem',
            },
            '& .MuiMenuItem-root': {
              borderRadius: '8px',
              alignItems: 'center',
              '&:hover': {
                backgroundColor: '#111',
                color: '#0af',
              },
            },
          }}
        >
          {contactSections.map((section, index) => (
            <MenuItem
              key={index}
              component={Link}
              href={section.link}
              onClick={handleMenuClose}
              sx={{ display: 'flex', alignItems: 'center', p: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box sx={{ color: theme.palette.primary.main, mr: 2 }}>
                  {section.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {section.title}
                  </Typography>
                  <Typography variant="body2" color="#ccc">
                    {section.description}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          ))}
        </Box>
      </Box>
    </Menu>
  );

  return (
    <>
      <IconButton
        size="large"
        edge="end"
        aria-label="contact us menu"
        aria-controls={menuId}
        aria-haspopup="true"
        onClick={handleMenuOpen}
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
        <ContactPhoneIcon sx={{ color: '#fff' }} />
        <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'none', xl: 'flex' }, color: '#fff' }}>
          Contact Us
        </Typography>
      </IconButton>
      {renderMenu}
    </>
  );
};

export default ContactUsDropdown;